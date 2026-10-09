import Job from '@/models/Job';
import Estimate from '@/models/Estimate';
import Invoice from '@/models/Invoice';

/**
 * Safely generates the next unique Job Number (e.g. JOB-4001, JOB-4002...)
 * Prevents E11000 duplicate key errors if previous jobs were deleted.
 */
export async function getNextJobNumber(preferred?: string): Promise<string> {
  if (preferred && preferred.trim()) {
    const exists = await Job.exists({ jobNumber: preferred.trim() });
    if (!exists) return preferred.trim();
  }

  const jobs = await Job.find({ jobNumber: { $regex: /^JOB-\d+$/i } }, { jobNumber: 1 }).lean();
  let maxNum = 4000;
  for (const j of jobs) {
    const match = j.jobNumber?.match(/^JOB-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  let counter = maxNum + 1;
  let candidate = `JOB-${counter}`;
  while (await Job.exists({ jobNumber: candidate })) {
    counter++;
    candidate = `JOB-${counter}`;
  }
  return candidate;
}

/**
 * Safely generates the next unique Estimate Number (e.g. EST-2026-101...)
 */
export async function getNextEstimateNumber(preferred?: string): Promise<string> {
  if (preferred && preferred.trim()) {
    const exists = await Estimate.exists({ estimateNumber: preferred.trim() });
    if (!exists) return preferred.trim();
  }

  const currentYear = new Date().getFullYear();
  const prefix = `EST-${currentYear}-`;
  const estimates = await Estimate.find(
    { estimateNumber: { $regex: new RegExp(`^${prefix}\\d+$`, 'i') } },
    { estimateNumber: 1 }
  ).lean();

  let maxNum = 100;
  for (const e of estimates) {
    const match = e.estimateNumber?.match(new RegExp(`^${prefix}(\\d+)$`, 'i'));
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  let counter = maxNum + 1;
  let candidate = `${prefix}${String(counter).padStart(3, '0')}`;
  while (await Estimate.exists({ estimateNumber: candidate })) {
    counter++;
    candidate = `${prefix}${String(counter).padStart(3, '0')}`;
  }
  return candidate;
}

/**
 * Safely generates the next unique Invoice Number (e.g. INV-2026-301...)
 */
export async function getNextInvoiceNumber(preferred?: string): Promise<string> {
  if (preferred && preferred.trim()) {
    const exists = await Invoice.exists({ invoiceNumber: preferred.trim() });
    if (!exists) return preferred.trim();
  }

  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;
  const invoices = await Invoice.find(
    { invoiceNumber: { $regex: new RegExp(`^${prefix}\\d+$`, 'i') } },
    { invoiceNumber: 1 }
  ).lean();

  let maxNum = 300;
  for (const inv of invoices) {
    const match = inv.invoiceNumber?.match(new RegExp(`^${prefix}(\\d+)$`, 'i'));
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  let counter = maxNum + 1;
  let candidate = `${prefix}${counter}`;
  while (await Invoice.exists({ invoiceNumber: candidate })) {
    counter++;
    candidate = `${prefix}${counter}`;
  }
  return candidate;
}
