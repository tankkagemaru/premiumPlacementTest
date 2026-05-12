export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      error: 'Missing server env vars: SUPABASE_URL and/or SUPABASE_ANON_KEY'
    });
  }

  return res.status(200).json({ supabaseUrl, supabaseAnonKey });
}
