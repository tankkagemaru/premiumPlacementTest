const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'https://nitxboxvkktcgkkkbrec.supabase.co';
const SUPERADMIN_EMAIL = 'mrosani22@premium.edu.my';

async function getSessionUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY,
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

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !(process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY)) {
      return res.status(500).json({ error: 'Server is missing Supabase environment configuration.' });
    }

    if (req.method === 'GET') {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,email,full_name,role&order=email.asc`, {
        headers: getServiceHeaders()
      });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data?.message || 'Failed to load users.' });
      const studentsResponse = await fetch(`${SUPABASE_URL}/rest/v1/students?select=user_id,passport_id,country,full_name,email`, {
        headers: getServiceHeaders()
      });
      const students = studentsResponse.ok ? await studentsResponse.json() : [];
      const studentMap = new Map((students || []).map(s => [s.user_id, s]));
      const merged = (data || []).map(u => ({
        ...u,
        passport_id: studentMap.get(u.id)?.passport_id || '',
        country: studentMap.get(u.id)?.country || ''
      }));
      return res.status(200).json({ users: merged });
    }

    if (req.method === 'POST') {
      const { action, userId, email, fullName, role = 'student', passportId = '', country = '', password = '' } = req.body || {};
      if (action === 'send_reset') {
        const resetResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
          method: 'POST',
          headers: getServiceHeaders(),
          body: JSON.stringify({ type: 'recovery', email })
        });
        const resetData = await resetResponse.json();
        if (!resetResponse.ok) return res.status(resetResponse.status).json({ error: resetData?.msg || 'Failed to generate reset link.' });
        return res.status(200).json({ success: true, resetLink: resetData?.action_link || null, userId });
      }
      if (!email || !fullName || !role) {
        return res.status(400).json({ error: 'email, fullName and role are required.' });
      }
      if (!['student', 'admin', 'teacher'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role.' });
      }
      const tempPassword = password || `Temp${Math.random().toString(36).slice(-8)}!`;
      const createAuthResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: getServiceHeaders(),
        body: JSON.stringify({ email, password: tempPassword, email_confirm: true, user_metadata: { full_name: fullName } })
      });
      const authUser = await createAuthResponse.json();
      if (!createAuthResponse.ok) return res.status(createAuthResponse.status).json({ error: authUser?.msg || 'Failed to create auth user.' });
      const userId = authUser?.id || authUser?.user?.id;
      if (!userId) return res.status(500).json({ error: 'Missing new user ID.' });

      await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: getServiceHeaders(),
        body: JSON.stringify({ id: userId, email, full_name: fullName, role })
      });
      if (role === 'student') {
        await fetch(`${SUPABASE_URL}/rest/v1/students`, {
          method: 'POST',
          headers: getServiceHeaders(),
          body: JSON.stringify({ user_id: userId, email, full_name: fullName, passport_id: passportId || null, country: country || null })
        });
      }
      return res.status(200).json({ success: true, tempPassword });
    }

    if (req.method === 'DELETE') {
      const { userId } = req.body || {};
      if (!userId) return res.status(400).json({ error: 'userId is required.' });

      const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=id,email`, { headers: getServiceHeaders() });
      const existing = await checkResponse.json();
      if (!checkResponse.ok || !existing?.length) return res.status(404).json({ error: 'User not found.' });
      if (existing[0].email?.toLowerCase() === SUPERADMIN_EMAIL) return res.status(400).json({ error: 'Superadmin cannot be deleted.' });

      await fetch(`${SUPABASE_URL}/rest/v1/students?user_id=eq.${userId}`, { method: 'DELETE', headers: getServiceHeaders() });
      await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, { method: 'DELETE', headers: getServiceHeaders() });
      const authDelete = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: getServiceHeaders() });
      if (!authDelete.ok) {
        const err = await authDelete.json().catch(() => ({}));
        return res.status(authDelete.status).json({ error: err?.msg || 'Failed to delete auth user.' });
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'PATCH') {
      const { userId, role, fullName, passportId, country } = req.body || {};
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
        body: JSON.stringify({ role, ...(fullName !== undefined ? { full_name: fullName } : {}) })
      });

      const updated = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: updated?.message || 'Failed to update role.' });

      if (fullName !== undefined) {
        await fetch(`${SUPABASE_URL}/rest/v1/students?user_id=eq.${userId}`, {
          method: 'PATCH',
          headers: getServiceHeaders(),
          body: JSON.stringify({ full_name: fullName, ...(passportId !== undefined ? { passport_id: passportId } : {}), ...(country !== undefined ? { country } : {}) })
        });
      }
      return res.status(200).json({ success: true, user: updated?.[0] || null });
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('admin-users error:', error);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
}
