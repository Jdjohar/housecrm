import nodemailer from 'nodemailer';
import connectToDatabase from './mongodb';
import Setting from '@/models/Setting';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure?: boolean;
  fromName?: string;
  fromEmail?: string;
}

/**
 * Get active SMTP configuration from database or env variables
 */
export async function getActiveSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne().lean();

    if (setting?.smtpHost && setting?.smtpUser) {
      return {
        host: setting.smtpHost,
        port: setting.smtpPort || (setting.smtpSecure ? 465 : 587),
        user: setting.smtpUser,
        pass: setting.smtpPass || '',
        secure: Boolean(setting.smtpSecure || setting.smtpPort === 465),
        fromName: setting.smtpFromName || setting.companyName || 'H&H House Maintenance',
        fromEmail: setting.smtpFromEmail || setting.email || 'info@hnhpros.ca',
      };
    }

    // Fallback to environment variables if set
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      return {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || '',
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        fromName: process.env.SMTP_FROM_NAME || 'H&H House Maintenance',
        fromEmail: process.env.SMTP_FROM_EMAIL || 'info@hnhpros.ca',
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching SMTP config:', error);
    return null;
  }
}

/**
 * Verify SMTP connection and credentials
 */
export async function verifySmtpConnection(customConfig?: SmtpConfig): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const config = customConfig || (await getActiveSmtpConfig());
    if (!config || !config.host || !config.user) {
      return {
        success: false,
        error: 'SMTP host and username/email are required.',
      };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed cert blocks on custom domains
      },
    });

    await transporter.verify();
    return { success: true };
  } catch (err: any) {
    console.error('SMTP Verification failed:', err);
    return {
      success: false,
      error: err?.message || 'Failed to authenticate with SMTP server.',
    };
  }
}

/**
 * Send an email using configured SMTP
 */
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}> {
  try {
    const config = await getActiveSmtpConfig();

    if (!config || !config.host || !config.user) {
      console.log('No SMTP configured. Simulating email send to:', options.to);
      return {
        success: true,
        simulated: true,
        messageId: `sim-${Date.now()}`,
      };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const fromAddress = `"${options.fromName || config.fromName || 'H&H House Maintenance'}" <${
      options.fromEmail || config.fromEmail || config.user
    }>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
      html: options.html,
    });

    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (err: any) {
    console.error('Failed to send email via SMTP:', err);
    return {
      success: false,
      error: err?.message || 'SMTP transmission error',
    };
  }
}
