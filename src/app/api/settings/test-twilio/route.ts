import { NextRequest, NextResponse } from 'next/server';
import { verifyTwilioCredentials, sendTwilioSms } from '@/lib/twilioService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountSid, authToken, phoneNumber, messagingServiceSid, testRecipientPhone } = body;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { success: false, error: 'Twilio Account SID and Auth Token are required.' },
        { status: 400 }
      );
    }

    const config = {
      accountSid: accountSid.trim(),
      authToken: authToken.trim(),
      phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
      messagingServiceSid: messagingServiceSid ? messagingServiceSid.trim() : undefined,
      enabled: true,
    };

    // 1. Verify Twilio Credentials
    const verifyResult = await verifyTwilioCredentials(config);
    if (!verifyResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: verifyResult.error || 'Could not authenticate with Twilio API. Please check your SID and Token.',
        },
        { status: 400 }
      );
    }

    // 2. If test recipient phone is provided, send a live test SMS
    if (testRecipientPhone && testRecipientPhone.trim().length >= 10) {
      if (!config.phoneNumber && !config.messagingServiceSid) {
        return NextResponse.json(
          {
            success: false,
            error: 'To send a live test SMS, please also provide a Twilio Phone Number or Messaging Service SID.',
          },
          { status: 400 }
        );
      }

      // Temporarily use the provided client config to send test SMS
      try {
        const twilio = (await import('twilio')).default;
        const client = twilio(config.accountSid, config.authToken);
        const { formatToE164 } = await import('@/lib/twilioService');
        const formattedTo = formatToE164(testRecipientPhone);

        const payload: any = {
          to: formattedTo,
          body: `[H&H House Maintenance] ✅ Twilio SMS Integration Verified Successfully! Time: ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/Vancouver' })} PST`,
        };

        if (config.messagingServiceSid) {
          payload.messagingServiceSid = config.messagingServiceSid;
        } else {
          payload.from = formatToE164(config.phoneNumber || '');
        }

        const msgRes = await client.messages.create(payload);

        return NextResponse.json({
          success: true,
          sid: msgRes.sid,
          message: `Twilio Account "${verifyResult.friendlyName}" connected! Test SMS successfully sent to ${formattedTo} (SID: ${msgRes.sid.substring(0, 10)}...).`,
        });
      } catch (smsErr: any) {
        return NextResponse.json(
          {
            success: false,
            error: `Twilio credentials valid, but failed to send test SMS: ${smsErr.message}`,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Twilio API connection verified successfully for Account: ${verifyResult.friendlyName || 'Active'}!`,
    });
  } catch (error: any) {
    console.error('Test Twilio API route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error while verifying Twilio API.' },
      { status: 500 }
    );
  }
}
