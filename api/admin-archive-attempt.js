// /api/admin-archive-attempt
//
// Sets test_results.archived for a single attempt. Used by the teacher
// dashboard's row-level Archive / Unarchive action. Requires
// teacher/admin/superadmin role on the caller. Returns the updated archived
// state on success so the client can update its row state without a refetch.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function serviceHeaders(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

async function readBody(response) {
  const raw = await response.text();
  try { return raw ? JSON.parse(raw) : {}; } catch { return { raw }; }
}

async function getSessionUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;
  return readBody(response);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY on server.' });
  }

  const sessionUser = await getSessionUser(req);
  if (!sessionUser?.id) return res.status(401).json({ error: 'Unauthorized.' });
  const roleRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${sessionUser.id}&select=role,email&limit=1`, { headers: serviceHeaders() });
  const roleData = await readBody(roleRes);
  const role = Array.isArray(roleData) ? roleData[0]?.role : null;
  if (!['teacher', 'admin', 'superadmin'].includes(String(role || '').toLowerCase())) {
    return res.status(403).json({ error: 'Teacher/admin access required.' });
  }

  const { attemptId, archived } = req.body || {};
  if (!attemptId || typeof attemptId !== 'string') {
    return res.status(400).json({ error: 'attemptId (UUID) is required.' });
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attemptId)) {
    return res.status(400).json({ error: 'attemptId is not a valid UUID.' });
  }
  if (typeof archived !== 'boolean') {
    return res.status(400).json({ error: 'archived must be a boolean.' });
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/test_results?id=eq.${attemptId}`, {
    method: 'PATCH',
    headers: serviceHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify({ archived })
  });
  const data = await readBody(response);

  if (!response.ok) {
    return res.status(response.status).json({ error: data?.message || data?.details || `HTTP ${response.status}` });
  }
  const updated = Array.isArray(data) ? data[0] : null;
  if (!updated) return res.status(404).json({ error: 'No attempt with that id.' });

  return res.status(200).json({ ok: true, archived: updated.archived });
}
