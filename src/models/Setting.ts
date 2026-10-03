import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICrewMember {
  name: string;
  phone?: string;
  hourlyRate: number;
  role?: string;
}

export interface IRoofPricingRow {
  oneStory: number;
  twoStory: number;
  threeStory: number;
}

export interface IRoofPricingMatrix {
  small: IRoofPricingRow; // under 1,500 sq ft
  medium: IRoofPricingRow; // 1,500 to 2,500 sq ft
  large: IRoofPricingRow; // 2,500 to 3,500 sq ft
  xLarge: IRoofPricingRow; // 3,500 sq ft and up
}

export interface ICustomServiceRow {
  name: string;
  price: number;
  unit: string;
}

export interface ISetting extends Document {
  companyName: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  gstRate: number;
  defaultJobLengthHours: number;
  defaultStartTime: string;
  googleReviewUrl: string;
  crewMembers: ICrewMember[];
  roofPricingMatrix: IRoofPricingMatrix;
  customServices: ICustomServiceRow[];
  autoEstimateSentSms: boolean;
  autoEstimateReminderSms: boolean;
  autoDayBeforeJobSms: boolean;
  autoCrewLeavingSms: boolean;
  autoJobCompletedSms: boolean;
  autoInvoiceSentSms: boolean;
  autoPaymentReceivedSms: boolean;
  autoReviewRequestSms: boolean;
  autoSeasonalReminderSms: boolean;
  autoSeasonalReminderEmail?: boolean;
  // SMTP Email Settings
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
  smtpFromName?: string;
  smtpFromEmail?: string;
  smtpEnabled?: boolean;
  // Twilio SMS Settings
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  twilioMessagingServiceSid?: string;
  twilioEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    companyName: { type: String, default: 'H&H House Maintenance Ltd.' },
    website: { type: String, default: 'https://hnhpros.ca/' },
    phone: { type: String, default: '(604) 555-0199' },
    email: { type: String, default: 'info@hnhpros.ca' },
    address: { type: String, default: '12888 80th Ave, Surrey / Vancouver, BC' },
    gstRate: { type: Number, default: 5 },
    defaultJobLengthHours: { type: Number, default: 3 },
    defaultStartTime: { type: String, default: '09:00 AM' },
    googleReviewUrl: {
      type: String,
      default: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    },
    crewMembers: {
      type: [
        {
          name: { type: String, required: true },
          phone: { type: String, default: '' },
          hourlyRate: { type: Number, default: 28 },
          role: { type: String, default: 'Technician' },
        },
      ],
      default: [
        { name: 'Mike Johnson', phone: '(604) 555-1201', hourlyRate: 32, role: 'Lead Tech' },
        { name: 'Dave Miller', phone: '(604) 555-1202', hourlyRate: 28, role: 'Technician' },
      ],
    },
    roofPricingMatrix: {
      small: {
        oneStory: { type: Number, default: 400 },
        twoStory: { type: Number, default: 450 },
        threeStory: { type: Number, default: 475 },
      },
      medium: {
        oneStory: { type: Number, default: 425 },
        twoStory: { type: Number, default: 500 },
        threeStory: { type: Number, default: 550 },
      },
      large: {
        oneStory: { type: Number, default: 550 },
        twoStory: { type: Number, default: 575 },
        threeStory: { type: Number, default: 625 },
      },
      xLarge: {
        oneStory: { type: Number, default: 700 },
        twoStory: { type: Number, default: 750 },
        threeStory: { type: Number, default: 800 },
      },
    },
    customServices: {
      type: [
        {
          name: { type: String, required: true },
          price: { type: Number, default: 200 },
          unit: { type: String, default: 'per job' },
        },
      ],
      default: [
        { name: 'House soft wash', price: 280, unit: 'per job' },
        { name: 'Gutter cleaning only', price: 220, unit: 'per job' },
        { name: 'Window cleaning', price: 160, unit: 'per job' },
        { name: 'Driveway and concrete', price: 180, unit: 'per job' },
        { name: 'Deck and patio', price: 200, unit: 'per job' },
        { name: 'Siding wash', price: 250, unit: 'per job' },
        { name: 'Commercial wash', price: 450, unit: 'per job' },
        { name: 'Lawn mowing', price: 85, unit: 'per job' },
        { name: 'Hedge and bush trimming', price: 140, unit: 'per job' },
        { name: 'Tree trimming', price: 250, unit: 'per job' },
        { name: 'Yard cleanup', price: 190, unit: 'per job' },
        { name: 'Fence installation', price: 1200, unit: 'per job' },
        { name: 'Fence repair', price: 350, unit: 'per job' },
        { name: 'Gate installation', price: 400, unit: 'per job' },
      ],
    },
    autoEstimateSentSms: { type: Boolean, default: true },
    autoEstimateReminderSms: { type: Boolean, default: true },
    autoDayBeforeJobSms: { type: Boolean, default: true },
    autoCrewLeavingSms: { type: Boolean, default: true },
    autoJobCompletedSms: { type: Boolean, default: true },
    autoInvoiceSentSms: { type: Boolean, default: true },
    autoPaymentReceivedSms: { type: Boolean, default: true },
    autoReviewRequestSms: { type: Boolean, default: true },
    autoSeasonalReminderSms: { type: Boolean, default: true },
    autoSeasonalReminderEmail: { type: Boolean, default: true },
    // SMTP Configuration
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    smtpSecure: { type: Boolean, default: false },
    smtpFromName: { type: String, default: 'H&H House Maintenance' },
    smtpFromEmail: { type: String, default: 'info@hnhpros.ca' },
    smtpEnabled: { type: Boolean, default: false },
    // Twilio Configuration
    twilioAccountSid: { type: String, default: '' },
    twilioAuthToken: { type: String, default: '' },
    twilioPhoneNumber: { type: String, default: '' },
    twilioMessagingServiceSid: { type: String, default: '' },
    twilioEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;
