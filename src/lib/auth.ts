import connectToDatabase from './mongodb';
import User from '@/models/User';

export const SESSION_COOKIE_NAME = 'housecrm_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'housecrm-secure-admin-secret-key-2026';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp: number; // timestamp in ms
}

/**
 * Sign session payload into a signed URL-safe token using Web Crypto API (works in Edge & Node)
 */
export async function signSessionToken(payload: Omit<SessionPayload, 'exp'>, expiresInDays = 7): Promise<string> {
  const exp = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const fullPayload: SessionPayload = { ...payload, exp };
  
  const payloadStr = JSON.stringify(fullPayload);
  const payloadBase64 = Buffer.from(payloadStr).toString('base64url');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadBase64));
  const signatureBase64 = Buffer.from(signature).toString('base64url');

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verify signed session token and return payload if valid and not expired
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    if (!token || !token.includes('.')) return null;
    const [payloadBase64, signatureBase64] = token.split('.');
    if (!payloadBase64 || !signatureBase64) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = Buffer.from(signatureBase64, 'base64url');
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(payloadBase64)
    );

    if (!isValid) return null;

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload: SessionPayload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Seed or ensure default admin account exists
 */
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    await connectToDatabase();
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('No admin found. Creating default admin account: admin@hnhpros.ca');
      const defaultAdmin = new User({
        name: 'H&H Admin',
        email: 'admin@hnhpros.ca',
        password: 'Admin@123', // Will be automatically hashed by UserSchema pre-save hook
        role: 'admin',
      });
      await defaultAdmin.save();
    }
  } catch (e) {
    console.error('Error ensuring default admin:', e);
  }
}
