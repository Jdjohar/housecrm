import twilio from 'twilio';
import connectToDatabase from './mongodb';
import Setting from '@/models/Setting';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber?: string;
  messagingServiceSid?: string;
  enabled?: boolean;
}

export interface SendSmsOptions {
  to: string;
  body: string;
}

/**
 * Format any North American / Canadian phone number into E.164 format (+16045550199)
 */
export function formatToE164(phone: string): string {
  if (!phone) return '';
  // Remove all non-digit characters except leading plus
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;

  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return cleaned.length > 0 ? `+${cleaned}` : '';
}

/**
 * Retrieve active Twilio configuration from database or env variables
 */
export async function getActiveTwilioConfig(): Promise<TwilioConfig | null> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne().lean();

    if (setting?.twilioAccountSid && setting?.twilioAuthToken) {
      return {
        accountSid: setting.twilioAccountSid.trim(),
        authToken: setting.twilioAuthToken.trim(),
        phoneNumber: setting.twilioPhoneNumber ? formatToE164(setting.twilioPhoneNumber.trim()) : undefined,
        messagingServiceSid: setting.twilioMessagingServiceSid?.trim() || undefined,
        enabled: setting.twilioEnabled !== false,
      };
    }

    // Fallback to environment variables
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      return {
        accountSid: process.env.TWILIO_ACCOUNT_SID.trim(),
        authToken: process.env.TWILIO_AUTH_TOKEN.trim(),
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
          ? formatToE164(process.env.TWILIO_PHONE_NUMBER.trim())
          : undefined,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID?.trim() || undefined,
        enabled: true,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching Twilio config:', error);
    return null;
  }
}

/**
 * Test Twilio credentials against Twilio API
 */
export async function verifyTwilioCredentials(customConfig?: TwilioConfig): Promise<{
  success: boolean;
  friendlyName?: string;
  error?: string;
}> {
  try {
    const config = customConfig || (await getActiveTwilioConfig());
    if (!config || !config.accountSid || !config.authToken) {
      return {
        success: false,
        error: 'Twilio Account SID and Auth Token are required.',
      };
    }

    const client = twilio(config.accountSid, config.authToken);
    const account = await client.api.v2010.accounts(config.accountSid).fetch();

    return {
      success: true,
      friendlyName: account.friendlyName,
    };
  } catch (err: any) {
    console.error('Twilio verification error:', err);
    return {
      success: false,
      error: err?.message || 'Invalid Twilio Account SID or Auth Token.',
    };
  }
}

/**
 * Dispatch real SMS using Twilio API (or gracefully simulate if not configured)
 */
export async function sendTwilioSms(options: SendSmsOptions): Promise<{
  success: boolean;
  sid?: string;
  error?: string;
  simulated?: boolean;
}> {
  try {
    const config = await getActiveTwilioConfig();

    if (!config || !config.accountSid || !config.authToken || !config.enabled) {
      console.log(`[Twilio SMS Simulated] To: ${options.to} | Message: ${options.body}`);
      return {
        success: true,
        simulated: true,
        sid: `sim-sms-${Date.now()}`,
      };
    }

    const client = twilio(config.accountSid, config.authToken);
    const recipientFormatted = formatToE164(options.to);

    if (!recipientFormatted) {
      return {
        success: false,
        error: 'Invalid recipient phone number format.',
      };
    }

    // Build dispatch payload
    const payload: any = {
      to: recipientFormatted,
      body: options.body,
    };

    if (config.messagingServiceSid) {
      payload.messagingServiceSid = config.messagingServiceSid;
    } else if (config.phoneNumber) {
      payload.from = config.phoneNumber;
    } else {
      return {
        success: false,
        error: 'Twilio Phone Number or Messaging Service SID must be provided in Settings.',
      };
    }

    const message = await client.messages.create(payload);

    return {
      success: true,
      sid: message.sid,
      simulated: false,
    };
  } catch (err: any) {
    console.error('Twilio SMS dispatch failed:', err);
    return {
      success: false,
      error: err?.message || 'Twilio SMS dispatch error',
    };
  }
}
