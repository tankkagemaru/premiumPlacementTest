const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function headers() {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };
}

async function readBody(response) {
  const raw = await response.text();
  try { return raw ? JSON.parse(raw) : {}; } catch { return { raw }; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ valid: false, error: 'Method not allowed' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ valid: false, error: 'Missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY on server.' });
  }

  try {
    const { role, registrationCode, email } = req.body || {};
    if (String(role || '').toLowerCase() !== 'student') {
      return res.status(403).json({ valid: false, error: 'Admin self-signup is disabled. Please contact superadmin.' });
    }
    const code = String(registrationCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ valid: false, error: 'Registration code is required.' });

    const check = await fetch(`${SUPABASE_URL}/rest/v1/registration_codes?select=id,code,created_by,email_hint,max_uses,used_count,is_active,expires_at&code=eq.${encodeURIComponent(code)}&is_active=eq.true&limit=1`, { headers: headers() });
    const data = await readBody(check);
    const row = Array.isArray(data) ? data[0] : null;
    if (!check.ok || !row) return res.status(403).json({ valid: false, error: 'Invalid registration code.' });

    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
      return res.status(403).json({ valid: false, error: 'Registration code has expired.' });
    }
    if (typeof row.max_uses === 'number' && row.max_uses > 0 && (row.used_count || 0) >= row.max_uses) {
      return res.status(403).json({ valid: false, error: 'Registration code usage limit reached.' });
    }

    await fetch(`${SUPABASE_URL}/rest/v1/registration_codes?id=eq.${row.id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ used_count: (row.used_count || 0) + 1, last_used_at: new Date().toISOString() })
    });

    await fetch(`${SUPABASE_URL}/rest/v1/registration_code_usage`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ code_id: row.id, used_email: email || null, used_at: new Date().toISOString() })
    });

    return res.status(200).json({ valid: true, codeMeta: { id: row.id, code: row.code } });
  } catch (error) {
    console.error('validate-registration error:', error);
    return res.status(500).json({ valid: false, error: 'Unable to validate registration.' });
  }
}
