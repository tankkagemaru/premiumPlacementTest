// /api/admin-student-preview
//
// Returns everything a teacher/admin needs to render a preview of a specific
// student's placement portal — their public.users row, their public.students
// row, and their full attempt history. Read-only.
//
// Auth: teacher / admin / superadmin.
// Body: { studentUserId } (auth.users.id / public.users.id — same UUID)

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function serviceHeaders() {
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
  const roleRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${sessionUser.id}&select=role&limit=1`, { headers: serviceHeaders() });
  const roleData = await readBody(roleRes);
  const role = Array.isArray(roleData) ? roleData[0]?.role : null;
  if (!['teacher', 'admin', 'superadmin'].includes(String(role || '').toLowerCase())) {
    return res.status(403).json({ error: 'Teacher/admin access required.' });
  }

  const { studentUserId } = req.body || {};
  if (!studentUserId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(studentUserId))) {
    return res.status(400).json({ error: 'studentUserId (UUID) is required.' });
  }

  // Fetch users + students row for this student
  const [userRowRes, studentRowRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${studentUserId}&select=id,email,role,full_name&limit=1`, { headers: serviceHeaders() }),
    fetch(`${SUPABASE_URL}/rest/v1/students?user_id=eq.${studentUserId}&select=id,user_id,email,full_name,passport_id,country&limit=1`, { headers: serviceHeaders() })
  ]);
  const userRow = (await readBody(userRowRes))?.[0] || null;
  const studentRow = (await readBody(studentRowRes))?.[0] || null;

  if (!userRow) return res.status(404).json({ error: 'User not found.' });

  // Fetch attempts. Prefer students.id join; fall back to user_id for legacy rows.
  const attemptSelect = 'id,student_id,attempt_no,status,overall_score,determined_cefr_level,ability_estimate,submitted_at,reviewed_at,reviewed_by,teacher_comment,official_for_placement,retake_granted,retake_granted_at,archived';
  const attemptsRes = studentRow
    ? await fetch(`${SUPABASE_URL}/rest/v1/test_results?student_id=eq.${studentRow.id}&select=${attemptSelect}&order=attempt_no.desc`, { headers: serviceHeaders() })
    : await fetch(`${SUPABASE_URL}/rest/v1/test_results?student_id=eq.${studentUserId}&select=${attemptSelect}&order=attempt_no.desc`, { headers: serviceHeaders() });
  const attempts = (await readBody(attemptsRes)) || [];

  return res.status(200).json({
    user: userRow,
    student: studentRow,
    attempts: Array.isArray(attempts) ? attempts : []
  });
}
