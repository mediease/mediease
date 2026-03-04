import QRCode from 'qrcode';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const getSecret = () => process.env.QR_SECRET || process.env.JWT_SECRET;
const getAppUrl = () => process.env.APP_URL || 'http://localhost:5000';

/**
 * Generate a signed JWT verification token for a prescription.
 * Expires in 1 year — prescriptions are long-lived documents.
 */
export function generateVerificationToken(prescriptionId) {
  return jwt.sign(
    { prescriptionId, purpose: 'prescription-verify' },
    getSecret(),
    { expiresIn: '365d' }
  );
}

/**
 * Verify a prescription verification token.
 * @returns {{ valid: boolean, prescriptionId?: string, reason?: string }}
 */
export function verifyQRToken(token) {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (decoded.purpose !== 'prescription-verify') {
      return { valid: false, reason: 'Invalid token purpose' };
    }
    return { valid: true, prescriptionId: decoded.prescriptionId };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}

/**
 * Generate a QR code for a prescription.
 * QR content = signed verification URL so pharmacists/patients can scan
 * and see the prescription status.
 *
 * @param {string} prescriptionId  e.g. "PR00001"
 * @returns {{ dataUrl: string, hash: string, verifyUrl: string }}
 */
export async function generatePrescriptionQR(prescriptionId) {
  const token = generateVerificationToken(prescriptionId);
  const verifyUrl = `${getAppUrl()}/verify-prescription/${prescriptionId}?token=${token}`;

  const dataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  // HMAC-SHA256 of prescriptionId — stored for future integrity checks
  const hash = crypto
    .createHmac('sha256', getSecret())
    .update(prescriptionId)
    .digest('hex');

  return { dataUrl, hash, verifyUrl };
}
