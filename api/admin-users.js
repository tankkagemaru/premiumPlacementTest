const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nitxboxvkktcgkkkbrec.supabase.co';
const SUPERADMIN_EMAIL = 'mrosani22@premium.edu.my';

async function getSessionUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) return null;
  return response.json();
}

function getServiceHeaders() {
  return {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };
}

export default async function handler(req, res) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.email?.toLowerCase() !== SUPERADMIN_EMAIL) {
      return res.status(403).json({ error: 'Superadmin access required.' });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Server is missing Supabase environment configuration.' });
    }

    if (req.method === 'GET') {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,email,full_name,role&order=email.asc`, {
        headers: getServiceHeaders()
      });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data?.message || 'Failed to load users.' });
      return res.status(200).json({ users: data || [] });
    }

    if (req.method === 'PATCH') {
      const { userId, role } = req.body || {};
      if (!userId || !['student', 'admin', 'teacher'].includes(role)) {
        return res.status(400).json({ error: 'userId and valid role are required.' });
      }

      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=id,email`, {
        headers: getServiceHeaders()
      });
      const existing = await checkResponse.json();
      if (!checkResponse.ok || !existing?.length) {
        return res.status(404).json({ error: 'User not found.' });
      }
      if (existing[0].email?.toLowerCase() === SUPERADMIN_EMAIL) {
        return res.status(400).json({ error: 'Superadmin role cannot be modified.' });
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          ...getServiceHeaders(),
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ role })
      });

      const updated = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: updated?.message || 'Failed to update role.' });
      return res.status(200).json({ success: true, user: updated?.[0] || null });
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('admin-users error:', error);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
}
