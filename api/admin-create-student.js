// /api/admin-create-student
//
// Lets a teacher/admin/superadmin create student accounts directly from the
// admin dashboard. Replaces the "open student-self-signup in a browser and
// click through it many times" workflow, which is vulnerable to stale
// browser caches skipping registration-code consumption.
//
// Flow per student:
//   1. POST /auth/v1/admin/users with email_confirm: true and
//      user_metadata.registration_code = code. The migration-005 trigger
//      then atomically consumes the code and writes the audit row in the
//      same transaction as the auth.users INSERT. If the code is invalid
//      or exhausted, the trigger RAISES and the user is NOT created.
//   2. INSERT into public.users (role='student').
//   3. INSERT into public.students.
//
// Body shape:
//   {
//     registrationCode: 'CODE',
//     students: [
//       { email, password, fullName, passportId, country }
//     ]
//   }
//
// Response shape (always 200 unless auth/structural failure):
//   {
//     results: [
//       { email, ok: true,  userId: '...' },
//       { email, ok: false, error: 'duplicate', message: '...' }
//     ]
//   }

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

  // Auth: must be teacher/admin/superadmin.
  const sessionUser = await getSessionUser(req);
  if (!sessionUser?.id) return res.status(401).json({ error: 'Unauthorized.' });
  const roleRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${sessionUser.id}&select=role&limit=1`, { headers: serviceHeaders() });
  const roleData = await readBody(roleRes);
  const role = Array.isArray(roleData) ? roleData[0]?.role : null;
  if (!['teacher', 'admin', 'superadmin'].includes(String(role || '').toLowerCase())) {
    return res.status(403).json({ error: 'Teacher/admin access required.' });
  }

  const { registrationCode, students } = req.body || {};
  const code = String(registrationCode || '').trim();
  if (!code) return res.status(400).json({ error: 'registrationCode is required.' });
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'students must be a non-empty array.' });
  }

  const results = [];
  // Sequential creation — easier error reporting and the trigger's atomic
  // increment serialises correctly per row anyway.
  for (const s of students) {
    const email = String(s?.email || '').trim().toLowerCase();
    const password = String(s?.password || '');
    const fullName = String(s?.fullName || '').trim();
    const passportId = String(s?.passportId || '').trim();
    const country = String(s?.country || '').trim();

    if (!email || !password || !fullName || !passportId || !country) {
      results.push({ email, ok: false, error: 'missing_field', message: 'email, password, fullName, passportId, country are all required.' });
      continue;
    }
    if (password.length < 6) {
      results.push({ email, ok: false, error: 'weak_password', message: 'Password must be at least 6 characters.' });
      continue;
    }

    // 1. Create auth user via admin API. Trigger consumes registration code
    //    in the same transaction; if the code is invalid the INSERT fails
    //    with a P0001 error and Supabase returns a 4xx here.
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: serviceHeaders(),
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          registration_code: code,
          full_name: fullName
        }
      })
    });
    const createBody = await readBody(createRes);
    if (!createRes.ok) {
      const msg = createBody?.msg || createBody?.message || createBody?.error_description || `HTTP ${createRes.status}`;
      // Surface the most common cases by tag so the UI can colour them.
      let tag = 'create_failed';
      if (/registration_code/i.test(msg) || /P0001/i.test(msg)) tag = 'code_exhausted_or_invalid';
      else if (/already.*registered/i.test(msg) || /duplicate/i.test(msg) || createRes.status === 422) tag = 'duplicate_email';
      results.push({ email, ok: false, error: tag, message: msg });
      continue;
    }

    const userId = createBody?.id || createBody?.user?.id;
    if (!userId) {
      results.push({ email, ok: false, error: 'create_failed', message: 'Auth admin API returned no user id.' });
      continue;
    }

    // 2. Insert public.users (role='student').
    const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: serviceHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ id: userId, email, role: 'student', full_name: fullName })
    });
    if (!usersRes.ok) {
      const errBody = await readBody(usersRes);
      results.push({ email, ok: false, error: 'users_insert_failed', message: errBody?.message || errBody?.details || `HTTP ${usersRes.status}`, userId });
      continue;
    }

    // 3. Insert public.students.
    const studentsRes = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
      method: 'POST',
      headers: serviceHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ user_id: userId, email, full_name: fullName, passport_id: passportId, country })
    });
    if (!studentsRes.ok) {
      const errBody = await readBody(studentsRes);
      results.push({ email, ok: false, error: 'students_insert_failed', message: errBody?.message || errBody?.details || `HTTP ${studentsRes.status}`, userId });
      continue;
    }

    results.push({ email, ok: true, userId });
  }

  return res.status(200).json({ results });
}
