import crypto from 'crypto';

function timingSafeEquals(a = '', b = '') {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function countryPrefix(country = '') {
  return String(country)
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 2);
}

function passportSuffix(passportId = '') {
  const digits = String(passportId).replace(/\D/g, '');
  return digits.slice(-2);
}

function buildStudentCode(country, passportId) {
  const prefix = countryPrefix(country);
  const suffix = passportSuffix(passportId);
  if (prefix.length < 2 || suffix.length < 2) return null;
  return `PREMIUM${prefix}${suffix}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  try {
    const { role, registrationCode, country, passportId } = req.body || {};
    const normalizedRole = String(role || '').toLowerCase();

    // Public signup is student-only. Admin creation should be done by superadmin internally.
    if (normalizedRole !== 'student') {
      return res.status(403).json({ valid: false, error: 'Admin self-signup is disabled. Please contact superadmin.' });
    }

    if (!registrationCode || typeof registrationCode !== 'string') {
      return res.status(400).json({ valid: false, error: 'Registration code is required.' });
    }

    const expectedStudentCode = buildStudentCode(country, passportId);
    if (!expectedStudentCode) {
      return res.status(400).json({ valid: false, error: 'Invalid country or passport format for code validation.' });
    }

    if (!timingSafeEquals(registrationCode.trim().toUpperCase(), expectedStudentCode)) {
      return res.status(403).json({ valid: false, error: 'Invalid registration code.' });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error('validate-registration error:', error);
    return res.status(500).json({ valid: false, error: 'Unable to validate registration.' });
  }
}
