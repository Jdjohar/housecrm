import { NextRequest, NextResponse } from 'next/server';
import { verifySmtpConnection, sendEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { host, port, user, pass, secure, fromName, fromEmail, testRecipient } = body;

    if (!host || !user) {
      return NextResponse.json(
        { success: false, error: 'SMTP Host and Username/Email are required.' },
        { status: 400 }
      );
    }

    const config = {
      host: host.trim(),
      port: Number(port) || 587,
      user: user.trim(),
      pass: pass || '',
      secure: Boolean(secure || Number(port) === 465),
      fromName: fromName?.trim() || 'H&H House Maintenance',
      fromEmail: fromEmail?.trim() || user.trim(),
    };

    // 1. Verify connection
    const verifyResult = await verifySmtpConnection(config);
    if (!verifyResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: verifyResult.error || 'Could not connect to SMTP server. Please verify Host, Port, and Password.',
        },
        { status: 400 }
      );
    }

    // 2. If testRecipient is provided, attempt to send a test email
    if (testRecipient && testRecipient.includes('@')) {
      const emailRes = await sendEmail({
        to: testRecipient.trim(),
        subject: `[Test] H&H House Maintenance SMTP Connection Verified ✅`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 800;">H&H House Maintenance</h1>
              <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">System SMTP Verification</p>
            </div>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <p style="color: #166534; font-weight: 700; margin: 0 0 4px 0; font-size: 14px;">✅ SMTP Connection Successful!</p>
              <p style="color: #15803d; font-size: 13px; margin: 0;">
                Your outgoing email server has been configured and is ready to deliver estimates, invoices, review requests, and seasonal marketing offers.
              </p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #475569; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 120px;">SMTP Host:</td>
                <td style="padding: 6px 0; font-family: monospace;">${config.host}:${config.port}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Sender Address:</td>
                <td style="padding: 6px 0;">${config.fromName} &lt;${config.fromEmail}&gt;</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Time:</td>
                <td style="padding: 6px 0;">${new Date().toLocaleString('en-CA', { timeZone: 'America/Vancouver' })} (PST)</td>
              </tr>
            </table>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
              H&H House Maintenance Ltd. • 12888 80th Ave, Surrey / Vancouver, BC • (604) 555-0199
            </div>
          </div>
        `,
        fromName: config.fromName,
        fromEmail: config.fromEmail,
      });

      if (!emailRes.success) {
        return NextResponse.json(
          {
            success: false,
            error: `Connected to SMTP but failed to send test email: ${emailRes.error}`,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: testRecipient
        ? `SMTP Connected successfully! Test email dispatched to ${testRecipient}.`
        : 'SMTP Connection credentials verified successfully!',
    });
  } catch (error: any) {
    console.error('Test SMTP route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error while testing SMTP.' },
      { status: 500 }
    );
  }
}
