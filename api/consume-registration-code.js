// /api/consume-registration-code
//
// Called by the client AFTER Supabase Auth signup has successfully created
// the user. Atomically increments used_count (race-safe via filtered PATCH)
// and writes a usage record. If the code became invalid between validation
// and this call (e.g., another concurrent signup tipped it over max_uses),
// returns 409 — the caller already has a created auth user and should
// surface a helpful "code ran out" message.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function headers(extra = {}) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ ok: false, error: 'Missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY on server.' });
  }

  try {
    const { registrationCode, email } = req.body || {};
    const code = String(registrationCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ ok: false, error: 'Registration code is required.' });

    // Look up current state of the code.
    const check = await fetch(`${SUPABASE_URL}/rest/v1/registration_codes?select=id,code,max_uses,used_count,is_active,expires_at&code=eq.${encodeURIComponent(code)}&is_active=eq.true&limit=1`, { headers: headers() });
    const data = await readBody(check);
    const row = Array.isArray(data) ? data[0] : null;
    if (!check.ok || !row) return res.status(403).json({ ok: false, error: 'Invalid registration code.' });

    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
      return res.status(403).json({ ok: false, error: 'Registration code has expired.' });
    }

    // Atomic increment via filtered PATCH. If max_uses > 0, the filter
    // used_count.lt.${max_uses} ensures we only increment if there's still
    // room. PostgREST returns the updated row(s) via Prefer:
    // return=representation; an empty array means the filter excluded the row
    // (concurrent signup just exhausted the code).
    const filterParts = [`id=eq.${row.id}`, 'is_active=eq.true'];
    if (typeof row.max_uses === 'number' && row.max_uses > 0) {
      filterParts.push(`used_count=lt.${row.max_uses}`);
    }
    const filterQS = filterParts.join('&');

    const patch = await fetch(`${SUPABASE_URL}/rest/v1/registration_codes?${filterQS}`, {
      method: 'PATCH',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify({
        used_count: (row.used_count || 0) + 1,
        last_used_at: new Date().toISOString()
      })
    });
    const updated = await readBody(patch);
    const updatedRow = Array.isArray(updated) ? updated[0] : null;

    if (!patch.ok || !updatedRow) {
      return res.status(409).json({ ok: false, error: 'Registration code usage limit reached.' });
    }

    // Best-effort usage audit; do NOT roll back the increment if this fails.
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/registration_code_usage`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ code_id: row.id, used_email: email || null, used_at: new Date().toISOString() })
      });
    } catch (err) {
      console.error('consume-registration-code: usage audit insert failed', err);
    }

    return res.status(200).json({ ok: true, used_count: updatedRow.used_count });
  } catch (error) {
    console.error('consume-registration-code error:', error);
    return res.status(500).json({ ok: false, error: 'Unable to record registration code usage.' });
  }
}
