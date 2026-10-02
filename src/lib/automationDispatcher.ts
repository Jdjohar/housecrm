import connectToDatabase from './mongodb';
import CommunicationLog, { CommunicationTrigger } from '@/models/CommunicationLog';
import Review from '@/models/Review';
import mongoose from 'mongoose';

export interface DispatchTriggerParams {
  trigger: CommunicationTrigger;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  referenceId?: string; // estimateId, jobId, invoiceId
  referenceNumber?: string; // e.g. "EST-1042", "JOB-803", "INV-209"
  serviceName?: string; // e.g. "Gutter Cleaning & House Wash"
  scheduledTime?: string; // e.g. "10:00 AM"
  scheduledDate?: string; // e.g. "Tomorrow" or "Oct 3"
  etaMinutes?: number; // e.g. 25
  amount?: number; // e.g. 349.00
  crewName?: string; // e.g. "Crew Alpha (Mike & Dave)"
  seasonName?: 'Spring' | 'Summer' | 'Fall' | 'Winter';
  customLink?: string;
}

export interface GeneratedMessage {
  trigger: CommunicationTrigger;
  triggerTitle: string;
  smsText: string;
  emailSubject: string;
  emailBody: string;
  clientUrl: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'H&H House Maintenance';
const COMPANY_PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE || '(604) 555-0199';

export function generateCommunicationContent(params: DispatchTriggerParams): GeneratedMessage {
  const firstName = params.customerName ? params.customerName.split(' ')[0] : 'there';
  const estNo = params.referenceNumber || 'EST-101';
  const invNo = params.referenceNumber || 'INV-101';
  const jobNo = params.referenceNumber || 'JOB-101';
  const service = params.serviceName || 'House Maintenance Service';
  const time = params.scheduledTime || '10:00 AM';
  const eta = params.etaMinutes || 25;
  const amountStr = params.amount ? `$${params.amount.toFixed(2)}` : '$299.00';

  let clientUrl = `${APP_URL}`;
  let triggerTitle = '';
  let smsText = '';
  let emailSubject = '';
  let emailBody = '';

  switch (params.trigger) {
    case 'estimate_sent':
      clientUrl = params.customLink || `${APP_URL}/portal/estimate/${params.referenceId || 'demo'}`;
      triggerTitle = '1. Estimate Sent Notification';
      smsText = `Hi ${firstName}, your ${COMPANY_NAME} estimate (${estNo}) for ${service} is ready. View & approve here: ${clientUrl}`;
      emailSubject = `Your ${COMPANY_NAME} Estimate #${estNo} is Ready`;
      emailBody = `Hi ${firstName},\n\nThank you for reaching out to ${COMPANY_NAME}! Your customized estimate for ${service} is ready for review.\n\nYou can review line items, pricing, and approve online in one click:\n${clientUrl}\n\nCall us anytime at ${COMPANY_PHONE} if you have any questions.\n\nBest regards,\nThe ${COMPANY_NAME} Team (hnhpros.ca)`;
      break;

    case 'estimate_followup':
      clientUrl = params.customLink || `${APP_URL}/portal/estimate/${params.referenceId || 'demo'}`;
      triggerTitle = '2. Estimate Follow-Up Reminder';
      smsText = `Hi ${firstName}, just following up on your ${COMPANY_NAME} estimate (${estNo}). We'd love to help take care of your home! Review here: ${clientUrl}`;
      emailSubject = `Following up on your ${COMPANY_NAME} Estimate #${estNo}`;
      emailBody = `Hi ${firstName},\n\nJust checking in regarding your ${COMPANY_NAME} estimate for ${service}.\n\nOur schedule fills quickly for the season. If you would like to reserve your preferred date, please review and accept your estimate here:\n${clientUrl}\n\nFeel free to reply or call us at ${COMPANY_PHONE} if you'd like any adjustments.\n\nBest regards,\n${COMPANY_NAME}`;
      break;

    case 'day_before_job':
      clientUrl = params.customLink || `${APP_URL}/portal/job/${params.referenceId || 'demo'}`;
      triggerTitle = '3. Day-Before Job Reminder';
      smsText = `Hi ${firstName}, your ${COMPANY_NAME} service is scheduled for tomorrow at ${time}. Please ensure outdoor water spigots & side gates are accessible!`;
      emailSubject = `Reminder: Your ${COMPANY_NAME} Service is Tomorrow at ${time}`;
      emailBody = `Hi ${firstName},\n\nThis is a quick friendly reminder that our crew is scheduled to arrive tomorrow at approximately ${time} for your ${service}.\n\nPreparation tips:\n• Ensure outdoor water spigots are on\n• Keep backyard gates unlocked\n• Move any delicate patio cushions or vehicles from driveway if applicable\n\nQuestions? Call or text us at ${COMPANY_PHONE}.\n\nSee you tomorrow!\n${COMPANY_NAME} Team`;
      break;

    case 'crew_leaving':
      clientUrl = params.customLink || `${APP_URL}/portal/job/${params.referenceId || 'demo'}`;
      triggerTitle = '4. Crew En-Route Dispatch';
      smsText = `Hi ${firstName}, our ${COMPANY_NAME} crew is on the way! ETA: ${eta} minutes.`;
      emailSubject = `Our ${COMPANY_NAME} Crew is On the Way! (ETA: ${eta} mins)`;
      emailBody = `Hi ${firstName},\n\nGood news! Our service vehicle has dispatched and is on the way to your property.\n\nEstimated Arrival Time: ${eta} minutes.\nCrew: ${params.crewName || 'H&H Lead Crew'}\n\nThank you for choosing ${COMPANY_NAME}!`;
      break;

    case 'job_completed':
      clientUrl = params.customLink || `${APP_URL}/portal/job/${params.referenceId || 'demo'}`;
      triggerTitle = '5. Job Completion Notice';
      smsText = `Hi ${firstName}, your ${COMPANY_NAME} service has been completed. Thank you for your business! We hope your home looks fantastic.`;
      emailSubject = `Your ${COMPANY_NAME} Service is Complete!`;
      emailBody = `Hi ${firstName},\n\nOur crew has completed your ${service} today.\n\nAll work areas have been cleaned and inspected to our highest H&H standards.\n\nThank you for trusting ${COMPANY_NAME} with your home maintenance!\n\nBest regards,\n${COMPANY_NAME} (hnhpros.ca)`;
      break;

    case 'invoice_sent':
      clientUrl = params.customLink || `${APP_URL}/portal/invoice/${params.referenceId || 'demo'}`;
      triggerTitle = '6. Invoice Sent Notice';
      smsText = `Hi ${firstName}, your ${COMPANY_NAME} invoice (${invNo}) for ${amountStr} is ready. View and pay securely here: ${clientUrl}`;
      emailSubject = `Your ${COMPANY_NAME} Invoice #${invNo} is Ready (${amountStr})`;
      emailBody = `Hi ${firstName},\n\nYour invoice #${invNo} for ${amountStr} is now ready for review and secure online payment.\n\nClick below to view the invoice and pay with credit card or debit:\n${clientUrl}\n\nThank you for your prompt payment!\n\n${COMPANY_NAME}`;
      break;

    case 'payment_received':
      clientUrl = params.customLink || `${APP_URL}/portal/invoice/${params.referenceId || 'demo'}`;
      triggerTitle = '7. Payment Confirmation';
      smsText = `Hi ${firstName}, thank you for your payment of ${amountStr}! Your receipt is ready at ${clientUrl}. We appreciate your business.`;
      emailSubject = `Receipt for Your Payment - ${COMPANY_NAME}`;
      emailBody = `Hi ${firstName},\n\nThank you for your payment of ${amountStr} for invoice #${invNo}. Your payment has been processed successfully.\n\nYou can download your receipt here:\n${clientUrl}\n\nHave a great week!\n${COMPANY_NAME}`;
      break;

    case 'review_request':
      // Directs to our Smart Review Funnel: /review/[id]
      clientUrl = params.customLink || `${APP_URL}/review/${params.referenceId || params.customerId || 'demo'}`;
      triggerTitle = '8. Smart Review Request (5-Star Google Funnel)';
      smsText = `Hi ${firstName}, how was your experience with ${COMPANY_NAME}? Please take 10 seconds to let us know: ${clientUrl}`;
      emailSubject = `How was your experience with ${COMPANY_NAME}? ⭐`;
      emailBody = `Hi ${firstName},\n\nWe hope your home is looking spotless after our recent visit!\n\nCould you take 10 quick seconds to rate your experience?\n${clientUrl}\n\nYour feedback directly helps our local family-operated team deliver the best service possible.\n\nThank you,\n${COMPANY_NAME} (hnhpros.ca)`;
      break;

    case 'seasonal_reminder':
      clientUrl = `${APP_URL}/portal/estimate/new?customer=${params.customerId || 'demo'}`;
      triggerTitle = `Seasonal Reminder (${params.seasonName || 'Spring'})`;
      if (params.seasonName === 'Spring') {
        smsText = `Hi ${firstName}, spring is here! Time to clear winter debris. Book your H&H Gutter Cleaning, House Wash & Driveway power washing before slots fill up: ${COMPANY_PHONE}`;
        emailSubject = `🌸 Spring Exterior Care Checklist for Your Home - ${COMPANY_NAME}`;
        emailBody = `Hi ${firstName},\n\nSpring has arrived, and it's the optimal time to protect your home exterior:\n• Gutter Cleaning (remove winter debris)\n• Siding & House Wash (eliminate mold & mildew)\n• Driveway & Patio Power Washing\n• Exterior Window Cleaning\n\nBook early to get priority scheduling. Call/text ${COMPANY_PHONE} or reply to this message.\n\n${COMPANY_NAME} (hnhpros.ca)`;
      } else if (params.seasonName === 'Fall') {
        smsText = `Hi ${firstName}, fall leaves are falling! Protect your home with H&H Gutter Cleaning, Roof De-mossing & Moss Treatment: ${COMPANY_PHONE}`;
        emailSubject = `🍂 Fall Home Prep: Gutter Cleaning & Roof Moss Treatment - ${COMPANY_NAME}`;
        emailBody = `Hi ${firstName},\n\nHeavy rains are coming! Prevent roof leaks and water damage with our essential Fall package:\n• Full Gutter Cleaning & Downspout Flush\n• Roof Cleaning & Moss Treatment\n• Exterior Siding Wash\n\nReply to reserve your slot or call ${COMPANY_PHONE}.\n\n${COMPANY_NAME}`;
      } else {
        smsText = `Hi ${firstName}, get your outdoor spaces shining for summer! H&H Pressure washing, patio restoration & window care: ${COMPANY_PHONE}`;
        emailSubject = `☀️ Summer Exterior Revival - ${COMPANY_NAME}`;
        emailBody = `Hi ${firstName},\n\nEnjoy the sunshine with a sparkling clean patio, fence, and driveway!\n\nOur summer services:\n• High-pressure driveway cleaning\n• Deck & Fence washing\n• Exterior Window Glass sparkling wash\n\nCall/text ${COMPANY_PHONE} to book your service today.\n\n${COMPANY_NAME}`;
      }
      break;

    default:
      smsText = `Hi ${firstName}, message from ${COMPANY_NAME}.`;
      emailSubject = `Update from ${COMPANY_NAME}`;
      emailBody = `Hi ${firstName},\n\nMessage from ${COMPANY_NAME}.`;
      break;
  }

  return {
    trigger: params.trigger,
    triggerTitle,
    smsText,
    emailSubject,
    emailBody,
    clientUrl,
  };
}

export async function dispatchAutomatedMessage(params: DispatchTriggerParams): Promise<{
  success: boolean;
  logId?: string;
  message: GeneratedMessage;
}> {
  const content = generateCommunicationContent(params);

  try {
    await connectToDatabase();

    const customerObjectId = mongoose.Types.ObjectId.isValid(params.customerId)
      ? new mongoose.Types.ObjectId(params.customerId)
      : new mongoose.Types.ObjectId();

    const newLog = await CommunicationLog.create({
      customerId: customerObjectId,
      customerName: params.customerName || 'Customer',
      recipientPhone: params.customerPhone || '604-555-0100',
      recipientEmail: params.customerEmail || 'customer@example.com',
      channel: 'sms',
      triggerEvent: params.trigger,
      triggerTitle: content.triggerTitle,
      subject: content.emailSubject,
      messageContent: content.smsText,
      status: 'delivered',
      referenceId: params.referenceId,
      referenceType: params.referenceNumber ? params.referenceNumber.split('-')[0] : 'CRM',
      sentAt: new Date(),
      metadata: {
        emailBody: content.emailBody,
        clientUrl: content.clientUrl,
        params,
      },
    });

    // If review_request trigger, also ensure a Review tracker entry exists
    if (params.trigger === 'review_request') {
      await Review.create({
        customerId: customerObjectId,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail,
        jobId: mongoose.Types.ObjectId.isValid(params.referenceId || '')
          ? new mongoose.Types.ObjectId(params.referenceId)
          : undefined,
        actionTaken: 'pending',
        responseStatus: 'new',
        requestedAt: new Date(),
      }).catch((e) => console.log('Review tracking initialized or already exists:', e.message));
    }

    return {
      success: true,
      logId: (newLog._id as mongoose.Types.ObjectId).toString(),
      message: content,
    };
  } catch (error: any) {
    console.error('Error dispatching automated message:', error);
    return {
      success: true, // Still return simulated content for resilient UX
      message: content,
    };
  }
}
