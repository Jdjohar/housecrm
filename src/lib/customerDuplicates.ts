import Customer from '@/models/Customer';

/**
 * Normalizes phone numbers for matching (e.g., "(604) 781-0546" -> "6047810546")
 */
export function getPhoneDigits(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits.slice(-10);
}

/**
 * Finds an existing customer by phone number or email to prevent duplicate customer records.
 * Excludes placeholder @example.com auto-generated emails.
 */
export async function findExistingCustomer(params: {
  phone?: string;
  email?: string;
  excludeCustomerId?: string;
}) {
  const { phone, email, excludeCustomerId } = params;
  const phoneDigits = getPhoneDigits(phone);
  const cleanEmail = (email || '').trim().toLowerCase();

  const conditions: any[] = [];

  // Match phone if we have at least 7 digits (allowing any formatting differences: dashes, parens, spaces)
  if (phoneDigits.length >= 7) {
    const pattern = phoneDigits.split('').join('\\D*');
    conditions.push({ phone: { $regex: pattern, $options: 'i' } });
  }

  // Match real email (case-insensitive exact match)
  if (cleanEmail && !cleanEmail.endsWith('@example.com')) {
    conditions.push({
      email: { $regex: `^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
  }

  if (conditions.length === 0) return null;

  const query: any = { $or: conditions };
  if (excludeCustomerId) {
    query._id = { $ne: excludeCustomerId };
  }

  return await Customer.findOne(query);
}
