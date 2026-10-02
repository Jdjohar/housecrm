import connectToDatabase from './mongodb';
import Customer from '@/models/Customer';
import Estimate from '@/models/Estimate';
import Job from '@/models/Job';
import Invoice from '@/models/Invoice';
import CommunicationLog from '@/models/CommunicationLog';
import Review from '@/models/Review';
import SeasonalCampaign from '@/models/SeasonalCampaign';
import Setting from '@/models/Setting';

export async function clearAllData() {
  await connectToDatabase();

  // Completely wipe all customer and transactional collections
  await Promise.all([
    Customer.deleteMany({}),
    Estimate.deleteMany({}),
    Job.deleteMany({}),
    Invoice.deleteMany({}),
    CommunicationLog.deleteMany({}),
    Review.deleteMany({}),
    SeasonalCampaign.deleteMany({}),
  ]);

  // Ensure default clean campaign definitions exist
  await SeasonalCampaign.create([
    {
      season: 'Spring',
      title: 'Spring Exterior Revival Campaign',
      description: 'Annual spring home prep targeting post-winter gutter cleaning, moss rinse, vinyl wash & driveway restoration.',
      recommendedServices: ['Gutter cleaning', 'House wash', 'Driveway', 'Window cleaning'],
      suggestedMonths: 'March - May',
      discountOffer: '10% Spring Early Bird Special',
      defaultSmsTemplate: 'Hi {{name}}, spring is here! Time to clear winter debris. Book your H&H Gutter Cleaning, House Wash & Driveway power washing before slots fill up: (604) 555-0199',
      defaultEmailTemplate: 'Hi {{name}},\n\nSpring has arrived, and it is time to refresh your home exterior!\n\nOur top spring services:\n• Gutter Cleaning\n• Vinyl House Wash\n• Driveway Power Washing\n• Exterior Window Cleaning\n\nCall (604) 555-0199 to claim your 10% Early Bird discount.\n\nH&H House Maintenance (hnhpros.ca)',
      targetCount: 0,
      sentCount: 0,
      responseCount: 0,
      status: 'active',
    },
    {
      season: 'Summer',
      title: 'Summer Patio & Exterior Deep Wash',
      description: 'Targeting summer outdoor living spaces, patio power washing, fence cleaning, and spotless sunny windows.',
      recommendedServices: ['Pressure washing', 'Lawn care', 'Fence', 'Deck restoration'],
      suggestedMonths: 'June - August',
      discountOffer: 'Complimentary Walkway Scrub with Patio Wash',
      defaultSmsTemplate: 'Hi {{name}}, get your patio & outdoor areas shining for summer! H&H Pressure washing, fence & deck care: (604) 555-0199',
      defaultEmailTemplate: 'Hi {{name}},\n\nGet ready for barbecue season! H&H House Maintenance is offering full pressure washing & deck revitalization packages.\n\nBook your slot today: (604) 555-0199\n\nTeam H&H',
      targetCount: 0,
      sentCount: 0,
      responseCount: 0,
      status: 'scheduled',
    },
    {
      season: 'Fall',
      title: 'Fall Storm & Moss Defense Campaign',
      description: 'Critical pre-winter gutter clearing, downspout flushing, and roof moss treatment before BC rains set in.',
      recommendedServices: ['Gutter cleaning', 'Roof cleaning', 'Moss treatment'],
      suggestedMonths: 'September - November',
      discountOffer: '15% Off Roof De-Mossing with Gutter Package',
      defaultSmsTemplate: 'Hi {{name}}, fall leaves are falling! Protect your roof and gutters with H&H Gutter Cleaning & Moss treatment: (604) 555-0199',
      defaultEmailTemplate: 'Hi {{name}},\n\nHeavy BC rain is coming! Avoid costly overflows and roof leaks with our Fall Gutter & Roof Moss Treatment.\n\nReserve your priority date: (604) 555-0199\n\nH&H House Maintenance (hnhpros.ca)',
      targetCount: 0,
      sentCount: 0,
      responseCount: 0,
      status: 'active',
    },
  ]);

  // Ensure clean company settings exist
  let setting = await Setting.findOne();
  if (!setting) {
    await Setting.create({
      companyName: 'H&H House Maintenance',
      website: 'https://hnhpros.ca/',
      phone: '(604) 555-0199',
      email: 'info@hnhpros.ca',
      address: '12888 80th Ave, Surrey / Vancouver, BC',
      googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      autoEstimateSentSms: true,
      autoEstimateReminderSms: true,
      autoDayBeforeJobSms: true,
      autoCrewLeavingSms: true,
      autoJobCompletedSms: true,
      autoInvoiceSentSms: true,
      autoPaymentReceivedSms: true,
      autoReviewRequestSms: true,
      autoSeasonalReminderSms: true,
    });
  }

  return {
    success: true,
    message: 'All data cleared. Database is clean.',
  };
}
