const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

function serviceHeaders() {
  return { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' };
}

async function readBody(response) {
  const raw = await response.text();
  try { return raw ? JSON.parse(raw) : {}; } catch { return { raw }; }
}

async function getSessionUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` } });
  if (!response.ok) return null;
  return readBody(response);
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Missing server Supabase env.' });
  const sessionUser = await getSessionUser(req);
  if (!sessionUser?.id) return res.status(401).json({ error: 'Unauthorized.' });

  const roleRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${sessionUser.id}&select=role,full_name,email&limit=1`, { headers: serviceHeaders() });
  const roleData = await readBody(roleRes);
  const role = Array.isArray(roleData) ? roleData[0]?.role : null;
  if (!['teacher', 'admin', 'superadmin'].includes(String(role || '').toLowerCase())) return res.status(403).json({ error: 'Teacher/admin access required.' });

  if (req.method === 'GET') {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/registration_codes?select=*,creator:users!registration_codes_created_by_fkey(full_name,email)&order=created_at.desc`, { headers: serviceHeaders() });
    const data = await readBody(response);
    if (!response.ok) return res.status(response.status).json({ error: data?.message || 'Failed to load codes.' });
    return res.status(200).json({ codes: Array.isArray(data) ? data : [] });
  }

  if (req.method === 'POST') {
    const { code, maxUses = 0, expiresAt = null, notes = '' } = req.body || {};
    const cleaned = String(code || '').trim().toUpperCase();
    if (!cleaned || cleaned.length < 6) return res.status(400).json({ error: 'Code must be at least 6 characters.' });
    const payload = {
      code: cleaned,
      created_by: sessionUser.id,
      max_uses: Number(maxUses) || 0,
      used_count: 0,
      is_active: true,
      expires_at: expiresAt || null,
      notes: notes || null
    };
    const response = await fetch(`${SUPABASE_URL}/rest/v1/registration_codes`, { method: 'POST', headers: { ...serviceHeaders(), Prefer: 'return=representation' }, body: JSON.stringify(payload) });
    const data = await readBody(response);
    if (!response.ok) return res.status(response.status).json({ error: data?.message || data?.details || 'Failed to create code.' });
    return res.status(200).json({ success: true, code: Array.isArray(data) ? data[0] : data });
  }

  if (req.method === 'PATCH') {
    const { id, isActive } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required.' });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/registration_codes?id=eq.${id}`, { method: 'PATCH', headers: serviceHeaders(), body: JSON.stringify({ is_active: !!isActive }) });
    if (!response.ok) {
      const data = await readBody(response);
      return res.status(response.status).json({ error: data?.message || 'Failed to update code.' });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
