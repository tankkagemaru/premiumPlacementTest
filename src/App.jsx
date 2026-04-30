import React, { useState, useEffect, useCallback } from 'react';

const SUPABASE_URL = 'https://nitxboxvkktcgkkkbrec.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdHhib3h2a2t0Y2dra2ticmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTE4MjgsImV4cCI6MjA5MTc4NzgyOH0.wFhjlAvvFG92JGT2Pb-KhHwRnas89ZjPB46h1RIwdJ0';
const SUPERADMIN_EMAIL = 'mrosani22@premium.edu.my';
const COMPANY_NAME = 'Premium Language Centre';
const LOGO_URL = 'https://nitxboxvkktcgkkkbrec.supabase.co/storage/v1/object/public/pictures/plc-logo.png';

const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f5f5f5; }
  .app { min-height: 100vh; background-color: #f5f5f5; }
  .header { background: linear-gradient(135deg, #CC0000 0%, #990000 100%); color: white; padding: 10px 20px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 70px; }
  .header-logo { height: 40px; width: auto; object-fit: contain; flex-shrink: 0; margin-top: 0; }
  .header-content { flex: 1; text-align: center; padding: 0; }
  .header h1 { font-size: 26px; margin: 0; margin-bottom: 2px; }
  .subtitle { font-size: 12px; opacity: 0.95; margin: 0; }
  .login-container { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 120px); padding: 20px; }
  .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 100%; max-width: 500px; max-height: 80vh; overflow-y: auto; }
  .login-box h1 { color: #CC0000; font-size: 24px; margin-bottom: 10px; }
  .login-box input, .login-box select { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
  .login-box input:focus, .login-box select:focus { outline: none; border-color: #CC0000; box-shadow: 0 0 5px rgba(204, 0, 0, 0.2); }
  .primary-button { width: 100%; padding: 12px; background-color: #CC0000; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background-color 0.3s; }
  .primary-button:hover { background-color: #990000; }
  .primary-button:disabled { opacity: 0.6; cursor: not-allowed; }
  .error-message { background-color: #fee; color: #c00; padding: 12px; border-radius: 4px; margin-bottom: 15px; font-size: 14px; }
  .code-label { font-size: 12px; color: #ff9800; margin-bottom: 5px; display: block; }
  .code-input { background-color: #fff9e6 !important; border-color: #ffc107 !important; }
  .form-section { margin-bottom: 20px; }
  .form-section-title { font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
  .toggle-auth { text-align: center; margin-top: 20px; font-size: 14px; }
  .link-button { background: none; border: none; color: #CC0000; cursor: pointer; text-decoration: underline; margin-left: 5px; }
  .test-screen { max-width: 900px; margin: 0 auto; padding: 20px; }
  .test-header { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .progress-tracker { flex: 1; }
  .progress-title { font-size: 12px; color: #666; font-weight: bold; margin-bottom: 8px; }
  .progress-bar { background-color: #e0e0e0; border-radius: 10px; height: 30px; overflow: hidden; margin-bottom: 5px; }
  .progress-fill { background: linear-gradient(90deg, #4caf50 0%, #45a049 100%); height: 100%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
  .progress-text { font-size: 13px; color: #333; font-weight: bold; }
  .timer-box { background-color: #fff9e6; border: 2px solid #ffc107; padding: 12px 20px; border-radius: 6px; text-align: center; }
  .timer-label { font-size: 11px; color: #ff9800; font-weight: bold; margin-bottom: 3px; }
  .timer-display { font-size: 24px; font-weight: bold; color: #cc6600; font-family: 'Courier New', monospace; }
  .test-intro { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
  .test-intro h1 { color: #CC0000; margin-bottom: 20px; }
  .description { color: #666; margin-bottom: 30px; line-height: 1.6; }
  .test-info { background-color: #f9f9f9; border: 2px dashed #CC0000; padding: 20px; margin-bottom: 30px; border-radius: 4px; }
  .test-info h3 { color: #CC0000; margin-bottom: 15px; text-align: left; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; }
  .info-grid div { padding: 8px; font-size: 14px; }
  .disclaimer { color: #999; font-size: 12px; margin-top: 20px; }
  .question-box { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .question-box h3 { margin-bottom: 20px; color: #333; line-height: 1.6; }
  .passage { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #CC0000; margin-bottom: 20px; font-size: 14px; line-height: 1.6; }
  .options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .option-button { padding: 12px; border: 2px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.3s; }
  .option-button:hover { border-color: #CC0000; background-color: #fff5f5; }
  .results { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
  .results h2 { margin-bottom: 30px; color: #333; }
  .pending-box { background-color: #fff9e6; border: 2px solid #ffc107; padding: 30px; border-radius: 4px; margin-bottom: 30px; }
  .pending-box h3 { color: #ff9800; margin-bottom: 15px; font-size: 20px; }
  .pending-box p { color: #666; margin-bottom: 10px; line-height: 1.6; }
  .dashboard { max-width: 1200px; margin: 0 auto; padding: 20px; }
  .dashboard-header { display: flex; justify-content: space-between; align-items: center; background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .dashboard-header h1 { color: #CC0000; margin: 0; }
  .header-actions { display: flex; gap: 20px; align-items: center; }
  .logout-button { padding: 10px 20px; background-color: #CC0000; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
  .logout-button:hover { background-color: #990000; }
  .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
  .tab { padding: 10px 20px; background: white; border: 2px solid #ddd; border-radius: 4px; cursor: pointer; font-weight: bold; transition: all 0.3s; }
  .tab.active { background-color: #CC0000; color: white; border-color: #CC0000; }
  .tab-content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .results-table { width: 100%; border-collapse: collapse; }
  .results-table th { background-color: #f5f5f5; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
  .results-table td { padding: 12px; border-bottom: 1px solid #ddd; }
  .results-table tr:hover { background-color: #f9f9f9; }
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
  .modal { background: white; padding: 30px; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative; }
  .modal h2 { color: #CC0000; margin-bottom: 20px; }
  .modal-section { margin-bottom: 20px; }
  .modal-section h3 { color: #333; margin-bottom: 10px; font-size: 16px; }
  .modal-close { position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }
  .question-item { background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 10px; font-size: 13px; }
  .question-correct { border-left: 4px solid #4caf50; }
  .question-wrong { border-left: 4px solid #f44336; }
  .correct-badge { color: #4caf50; font-weight: bold; }
  .wrong-badge { color: #f44336; font-weight: bold; }
  .notranslate { translate: no; }
  .approve-button { padding: 10px 20px; background-color: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
  .approve-button:hover { background-color: #45a049; }
  .textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: inherit; min-height: 80px; }
  @media (max-width: 600px) { 
    .options { grid-template-columns: 1fr; }
    .info-grid { grid-template-columns: 1fr; }
    .test-header { flex-direction: column; gap: 15px; }
    .dashboard-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  }
`;

// API Helper
const api = {
  async request(method, path, body = null, authToken = null) {
    const token = authToken || localStorage.getItem('sb-token');
    const headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    try {
      const response = await fetch(`${SUPABASE_URL}${path}`, options);
      if (!response.ok) {
        const error = await response.text();
        console.error('API Error:', response.status, error);
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  async signup(email, password, role, fullName, passportId, country) {
    const result = await this.request('POST', '/auth/v1/signup', { email, password });
    
    if (result?.user?.id && result?.access_token) {
      try {
        await this.request('POST', '/rest/v1/users', {
          id: result.user.id,
          email: email,
          role,
          full_name: fullName
        }, result.access_token);
      } catch (err) {
        console.error('Error creating user role record:', err);
      }

      // Create student record only for student role
      if (role === 'student') {
        try {
          await this.request('POST', '/rest/v1/students', {
            user_id: result.user.id,
            email: email,
            full_name: fullName,
            passport_id: passportId,
            country: country
          }, result.access_token);
        } catch (err) {
          console.error('Error creating student record:', err);
        }
      }
    }
    
    return result;
  },
  async validateRegistration(role, registrationCode, email, country, passportId) {
    const response = await fetch('/api/validate-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, registrationCode, email, country, passportId })
    });
    const data = await response.json();
    if (!response.ok || !data?.valid) {
      throw new Error(data?.error || 'Registration is not allowed.');
    }
    return data;
  },
  login(email, password) { return this.request('POST', '/auth/v1/token?grant_type=password', { email, password }); },
  async getUserRole(userId) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=role`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
      });
      if (!response.ok) return 'student';
      const data = await response.json();
      return data?.[0]?.role || 'student';
    } catch { return 'student'; }
  },
  getAllQuestions() {
    return fetch(`${SUPABASE_URL}/rest/v1/questions?select=*&limit=500`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${localStorage.getItem('sb-token')}` }
    }).then(r => r.json()).catch(() => []);
  },
  saveTestResult(result) {
    return this.request('POST', '/rest/v1/test_results', result);
  },
  updateTestResult(id, updates) {
    return this.request('PATCH', `/rest/v1/test_results?id=eq.${id}`, updates);
  },
  getAllResults() {
    return this.request('GET', '/rest/v1/test_results?select=*,students(id,email,full_name,passport_id,country)&order=completed_at.desc');
  },
  getQuestionBank() {
    return this.request('GET', '/rest/v1/questions?select=*');
  },
  createQuestion(payload) {
    return this.request('POST', '/rest/v1/questions', payload);
  },
  updateQuestion(id, payload) {
    return this.request('PATCH', `/rest/v1/questions?id=eq.${id}`, payload);
  },
  async getManagedUsers() {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-users', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Unable to load users');
    return data.users || [];
  },
  async updateManagedUserRole(userId, role, fullName, passportId, country) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, role, fullName, passportId, country })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Unable to update role');
    return data;
  },
  async createManagedUser(payload) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Unable to create user');
    return data;
  },
  async sendUserResetLink(email) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'send_reset', email })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Unable to generate reset link');
    return data;
  },
  async deleteManagedUser(userId) {
    const token = localStorage.getItem('sb-token');
    const response = await fetch('/api/admin-users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Unable to delete user');
    return data;
  }
};

// Helper Functions
function selectNextQuestion(questionsBank, currentDifficulty, userResponses) {
  const answeredIds = new Set(userResponses.map(r => r.question_id));
  const askedQuestionTexts = new Set(
    userResponses
      .map((r) => questionsBank.find(qb => qb.id === r.question_id)?.question_text?.trim())
      .filter(Boolean)
  );
  const skillTargets = { grammar: 8, vocabulary: 7, reading: 8, listening: 7 };
  const skillCounts = { grammar: 0, vocabulary: 0, reading: 0, listening: 0 };
  userResponses.forEach((r) => {
    const q = questionsBank.find(qb => qb.id === r.question_id);
    const skill = q?.skill;
    if (skill && skillCounts[skill] !== undefined) skillCounts[skill] += 1;
  });
  const underTargetSkills = Object.keys(skillTargets).filter(skill => skillCounts[skill] < skillTargets[skill]);

  const minDiff = Math.max(1, currentDifficulty - 1.5);
  const maxDiff = Math.min(10, currentDifficulty + 1.5);
  const suitable = questionsBank.filter(q => {
    if (!q.id || answeredIds.has(q.id)) return false;
    if (q.question_text && askedQuestionTexts.has(q.question_text.trim())) return false;
    const qDiff = q.difficulty_score || 5;
    return qDiff >= minDiff && qDiff <= maxDiff;
  });

  // Priority 1: in-band and under-target skills
  const inBandUnderTarget = suitable.filter(q => underTargetSkills.includes(q.skill));
  if (inBandUnderTarget.length > 0) {
    return inBandUnderTarget[Math.floor(Math.random() * inBandUnderTarget.length)];
  }

  // Priority 2: under-target skills regardless of difficulty band
  const underTargetAnyBand = questionsBank.filter(q =>
    q.id &&
    !answeredIds.has(q.id) &&
    underTargetSkills.includes(q.skill) &&
    (!q.question_text || !askedQuestionTexts.has(q.question_text.trim()))
  );
  if (underTargetAnyBand.length > 0) {
    return underTargetAnyBand[Math.floor(Math.random() * underTargetAnyBand.length)];
  }

  // Priority 3: any remaining in-band
  if (suitable.length > 0) {
    return suitable[Math.floor(Math.random() * suitable.length)];
  }

  // Priority 4: any remaining question
  const remaining = questionsBank.filter(q =>
    q.id &&
    !answeredIds.has(q.id) &&
    (!q.question_text || !askedQuestionTexts.has(q.question_text.trim()))
  );
  if (remaining.length === 0) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}

function calculateDifficulty(responses) {
  if (responses.length === 0) return 5;
  let difficulty = 5;
  for (const r of responses) difficulty += r.is_correct ? 0.8 : -0.6;
  return Math.max(1, Math.min(10, difficulty));
}

function determineCEFRLevel(responses) {
  const totalCorrect = responses.filter(r => r.is_correct).length;
  const fallback = { cefrLevel: 'A1', abilityEstimate: 1, needsTeacherReview: true };
  if (!responses?.length) return fallback;

  const avgDifficulty = (items) => {
    if (!items.length) return 1;
    const total = items.reduce((sum, r) => sum + (Number(r.difficulty_at_time) || 1), 0);
    return total / items.length;
  };

  const lastTen = responses.slice(-10);
  const lastTenCorrect = lastTen.filter(r => r.is_correct);
  const allCorrect = responses.filter(r => r.is_correct);
  const abilityEstimate = lastTenCorrect.length >= 4 ? avgDifficulty(lastTenCorrect) : avgDifficulty(allCorrect);

  if (totalCorrect < 8) {
    return { cefrLevel: 'A1', abilityEstimate, needsTeacherReview: true };
  }

  if (abilityEstimate < 2.5) return { cefrLevel: 'A1', abilityEstimate, needsTeacherReview: false };
  if (abilityEstimate < 4.0) return { cefrLevel: 'A2', abilityEstimate, needsTeacherReview: false };
  if (abilityEstimate < 5.5) return { cefrLevel: 'B1', abilityEstimate, needsTeacherReview: false };
  if (abilityEstimate < 7.5) return { cefrLevel: 'B2', abilityEstimate, needsTeacherReview: false };
  if (abilityEstimate < 8.5) return { cefrLevel: 'C1', abilityEstimate, needsTeacherReview: false };
  return { cefrLevel: 'C2', abilityEstimate, needsTeacherReview: false };
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============ LOGIN SCREEN WITH FULL REGISTRATION ============
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passportId, setPassportId] = useState('');
  const [country, setCountry] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!registrationCode || registrationCode.trim() === '') {
          setError('Registration code is required.');
          setLoading(false);
          return;
        }
        if (!fullName.trim()) {
          setError('Full name is required.');
          setLoading(false);
          return;
        }
        if (!passportId.trim()) {
          setError('Passport/ID number is required.');
          setLoading(false);
          return;
        }
        if (!country) {
          setError('Country is required.');
          setLoading(false);
          return;
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      if (isSignup) {
        await api.validateRegistration('student', registrationCode.trim(), email.trim(), country, passportId);
      }

      const result = isSignup 
        ? await api.signup(email, password, 'student', fullName, passportId, country)
        : await api.login(email, password);

      if (!result?.access_token) {
        setError('Authentication failed.');
        setLoading(false);
        return;
      }

      localStorage.setItem('sb-token', result.access_token);
      const normalizedLoginEmail = email.trim().toLowerCase();
      const normalizedSuperAdminEmail = SUPERADMIN_EMAIL.trim().toLowerCase();
      const role = normalizedLoginEmail === normalizedSuperAdminEmail
        ? 'superadmin'
        : await api.getUserRole(result.user.id);
      onLogin({ ...result.user, role });
    } catch (err) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const countries = [
    'Malaysia', 'Singapore', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar', 'Brunei',
    'China', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'Australia', 'New Zealand', 'USA', 'Canada', 'UK', 'Other'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          {/* Logo - Centered at top */}
          <div style={{ marginBottom: '30px' }}>
            <img 
              src="https://nitxboxvkktcgkkkbrec.supabase.co/storage/v1/object/public/pictures/plc-logo.png" 
              alt="Premium Language Centre" 
              style={{ height: '80px', width: 'auto', marginBottom: '20px' }}
            />
            <h1 style={{ fontSize: '32px', color: '#CC0000', margin: '0 0 5px 0' }}>CEFR Placement Test</h1>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Premium Language Centre</p>
          </div>

          {/* Login Box */}
          <div className="login-box" style={{ marginTop: '20px' }}>
            <form onSubmit={handleSubmit}>
              {isSignup && (
                <>
                  <div className="form-section">
                    <div className="form-section-title">Account Setup</div>
                    <input type="text" placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} required={isSignup} />
                    <input type="text" placeholder="Passport/ID Number *" value={passportId} onChange={(e) => setPassportId(e.target.value)} required={isSignup} />
                    <select value={country} onChange={(e) => setCountry(e.target.value)} required={isSignup}>
                      <option value="">Select Country *</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="form-section">
                <div className="form-section-title">{isSignup ? 'Create Account' : 'Login'}</div>
                <input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password (minimum 6 characters) *" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {isSignup && (
                <div className="form-section">
                  <div className="form-section-title">Registration Code</div>
                  <label className="code-label">
                    Student code format: PREMIUM + first 2 letters of country + last 2 digits of Passport/ID.
                  </label>
                  <input type="text" placeholder="Registration Code *" value={registrationCode} onChange={(e) => setRegistrationCode(e.target.value)} className="code-input" required={isSignup} />
                </div>
              )}

                  {error && <div className="error-message">{error}</div>}

              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Login'}
              </button>
            </form>

            <p className="toggle-auth">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <button type="button" onClick={() => { setIsSignup(!isSignup); setError(''); }} className="link-button">
                {isSignup ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Copyright & Disclaimer */}
      <footer style={{ backgroundColor: '#f0f0f0', borderTop: '1px solid #ddd', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '10px 0' }}>
            <strong>© 2024 Premium Language Centre. All rights reserved.</strong>
          </p>
          <p style={{ margin: '10px 0', lineHeight: '1.6' }}>
            This CEFR Placement Test is designed to assess English language proficiency and determine appropriate course levels. Results are confidential and used solely for educational placement purposes. By using this platform, you agree to maintain the integrity of the assessment and not share test content with others.
          </p>
          <p style={{ margin: '10px 0', fontSize: '11px', color: '#999' }}>
            For questions or technical support, please contact: <strong>support@premium.edu.my</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============ STUDENT TEST ============
function StudentTest({ user, onComplete }) {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questionsBank, setQuestionsBank] = useState([]);
  const [userResponses, setUserResponses] = useState([]);
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  const [testState, setTestState] = useState('intro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (testState !== 'testing') return;
    const interval = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [testState]);

  useEffect(() => {
    if (testStarted && questionsBank.length === 0) loadQuestions();
  }, [testStarted, questionsBank.length]);

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const questions = await api.getAllQuestions();
      if (!questions || questions.length === 0) {
        setError('No questions available.');
        setTestStarted(false);
        setLoading(false);
        return;
      }
      setQuestionsBank(questions);
      const randomStart = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(randomStart);
      setQuestionStartTime(Date.now()); // Start timing this question
      setCurrentDifficulty(randomStart.difficulty_score || 5);
      setTestState('testing');
    } catch (err) {
      setError('Error loading questions.');
      setTestStarted(false);
    }
    setLoading(false);
  };

  const handleAnswer = async (selectedAnswer) => {
    if (!currentQuestion || !questionStartTime) return;
    
    const isCorrect = currentQuestion.correct_answers?.includes(selectedAnswer);
    const now = Date.now();
    const timeSpentMs = now - questionStartTime;
    const timeSpentSeconds = Math.round(timeSpentMs / 1000);
    
    const newResponses = [...userResponses, {
      question_id: currentQuestion.id,
      student_answer: selectedAnswer,
      is_correct: isCorrect,
      time_spent_seconds: timeSpentSeconds,
      difficulty_at_time: currentDifficulty
    }];
    
    setUserResponses(newResponses);
    
    if (newResponses.length >= 30) {
      completeTest(newResponses);
    } else {
      const newDifficulty = calculateDifficulty(newResponses);
      setCurrentDifficulty(newDifficulty);
      const nextQ = selectNextQuestion(questionsBank, newDifficulty, newResponses);
      setCurrentQuestion(nextQ);
      setQuestionStartTime(Date.now()); // Reset timer for next question
      setTimeout(() => document.activeElement?.blur?.(), 50);
    }
  };

  const completeTest = async (responses) => {
    const correctCount = responses.filter(r => r.is_correct).length;
    const score = (correctCount / responses.length) * 100;
    const { cefrLevel, abilityEstimate, needsTeacherReview } = determineCEFRLevel(responses);
    setTestState('pending');

    const saveTestResult = async (retries = 3) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          // Get the correct student_id from students table
          const studentData = await api.request('GET', `/rest/v1/students?user_id=eq.${user.id}&select=id`);
          const studentId = studentData?.[0]?.id || user.id;

          const resultData = {
            student_id: studentId,
            student_name: user.email,
            student_passport: 'N/A',
            overall_score: score,
            determined_cefr_level: cefrLevel,
            ability_estimate: abilityEstimate,
            needs_teacher_review: needsTeacherReview,
            completed_at: new Date().toISOString(),
            notes: `Completed 30 questions. Score: ${score.toFixed(1)}%. Time: ${formatTime(elapsedTime)}`,
            is_approved: false,
            student_responses: JSON.stringify(responses)
          };
          await api.saveTestResult(resultData);
          return true;
        } catch (err) {
          console.error(`Attempt ${attempt} failed:`, err);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      return false;
    };

    saveTestResult();
  };

  const progressPercentage = (userResponses.length / 30) * 100;

  if (!testStarted) {
    return (
      <div className="test-screen">
        <div className="test-intro">
          <h1>English Level Assessment</h1>
          <p className="description">Discover your CEFR level with our adaptive placement test. The test adjusts to your ability level and typically takes 15-20 minutes.</p>
          <div className="test-info">
            <h3>What you'll be tested on:</h3>
            <div className="info-grid">
              <div>✓ Grammar & Vocabulary</div>
              <div>✓ Listening Comprehension</div>
              <div>✓ Reading Comprehension</div>
              <div>✓ Adaptive Difficulty</div>
            </div>
          </div>
          <button className="primary-button" onClick={() => setTestStarted(true)} disabled={loading}>
            {loading ? 'Loading...' : 'BEGIN ASSESSMENT →'}
          </button>
          {error && <div className="error-message">{error}</div>}
          <p className="disclaimer">You can't retake this assessment. Take your time and answer honestly.</p>
        </div>
      </div>
    );
  }

  if (testState === 'pending') {
    return (
      <div className="test-screen">
        <div className="results">
          <h2>Assessment Complete</h2>
          <div className="pending-box">
            <h3>⏳ Pending Teacher Approval</h3>
            <p>Your test has been submitted and is awaiting review from your instructor.</p>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
              Your instructor will review your answers and send you detailed results via email once approved.
            </p>
          </div>
          <button className="primary-button" onClick={() => onComplete()}>Exit</button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="test-screen"><p>Loading question...</p></div>;
  }

  return (
    <div className="test-screen" onContextMenu={(e) => { e.preventDefault(); return false; }}>
      <div className="test-header">
        <div className="progress-tracker">
          <div className="progress-title">PROGRESS</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}>
              {progressPercentage > 5 && `${Math.round(progressPercentage)}%`}
            </div>
          </div>
          <div className="progress-text">{userResponses.length} of 30 Questions</div>
        </div>
        <div className="timer-box">
          <div className="timer-label">⏱ TIME ELAPSED</div>
          <div className="timer-display">{formatTime(elapsedTime)}</div>
        </div>
      </div>

      <div className="question-box notranslate" translate="no" onCopy={(e) => { e.preventDefault(); return false; }} onCut={(e) => { e.preventDefault(); return false; }} style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
        <h3 style={{ pointerEvents: 'none' }} className="notranslate" translate="no">{currentQuestion.question_text}</h3>
        {currentQuestion.audio_url && (
          <audio controls style={{ width: '100%', marginBottom: '20px' }}>
            <source src={currentQuestion.audio_url} type="audio/wav" />
          </audio>
        )}
        {currentQuestion.passage && <div className="passage notranslate" translate="no" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', pointerEvents: 'none' }}><p>{currentQuestion.passage}</p></div>}
        <div className="options">
          {currentQuestion.options?.map((option, idx) => (
            <button key={idx} className="option-button notranslate" translate="no" onClick={() => handleAnswer(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ TEACHER DASHBOARD ============
function TeacherDashboard({ user, onLogout }) {
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [comment, setComment] = useState('');
  const [approving, setApproving] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSkillFilter, setQuestionSkillFilter] = useState('');
  const [questionCefrFilter, setQuestionCefrFilter] = useState('');
  const [questionSort, setQuestionSort] = useState('recent');
  const [managedUsers, setManagedUsers] = useState([]);
  const [userMgmtLoading, setUserMgmtLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserRole, setEditingUserRole] = useState('student');
  const [editingUserName, setEditingUserName] = useState('');
  const [editingPassportId, setEditingPassportId] = useState('');
  const [editingCountry, setEditingCountry] = useState('');
  const [newUser, setNewUser] = useState({ email: '', fullName: '', role: 'student', passportId: '', country: '' });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const normalizedDashboardEmail = (user.email || '').trim().toLowerCase();
  const normalizedSuperAdminEmail = SUPERADMIN_EMAIL.trim().toLowerCase();
  const isSuperAdmin = normalizedDashboardEmail === normalizedSuperAdminEmail || user.role === 'superadmin';
  const passwordStrength = newUserPassword.length >= 12 && /[A-Z]/.test(newUserPassword) && /[a-z]/.test(newUserPassword) && /\d/.test(newUserPassword) && /[^A-Za-z0-9]/.test(newUserPassword)
    ? 'Strong'
    : newUserPassword.length >= 8
      ? 'Medium'
      : newUserPassword.length > 0
        ? 'Weak'
        : 'Not set';

  const loadData = useCallback(async () => {
    try {
      const [res, q] = await Promise.all([api.getAllResults(), api.getQuestionBank()]);
      setResults(res || []);
      setQuestions(q || []);
      if (isSuperAdmin) {
        try {
          const users = await api.getManagedUsers();
          setManagedUsers(users);
          setAdminError('');
        } catch (err) {
          setManagedUsers([]);
          setAdminError(err.message || 'Unable to load users from Supabase.');
        }
      }
    } catch (err) {
      console.error('Error loading:', err);
    }
    setLoading(false);
  }, [isSuperAdmin]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleApprove = async () => {
    if (!selectedResult) return;
    setApproving(true);
    try {
      await api.updateTestResult(selectedResult.id, {
        is_approved: true,
        teacher_comment: comment || null,
        approved_at: new Date().toISOString(),
        approved_by: user.id
      });

      // Send email via Vercel API endpoint (no CORS issues!)
      const studentEmail = selectedResult.students?.email;
      if (!studentEmail) {
        console.error('Student email not found in results');
      } else {
        const sendEmail = async () => {
          try {
            // For testing: send to your own email instead
            // Once Resend is verified, change back to studentEmail
            const recipientEmail = 'shiro@premium.edu.my'; // Change this back to studentEmail later
            
            const response = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                studentEmail: recipientEmail,
                cefrLevel: selectedResult.determined_cefr_level,
                score: selectedResult.overall_score,
                comment: comment,
                responses: selectedResult.student_responses ? JSON.parse(selectedResult.student_responses) : [],
                questions: questions
              })
            });
            const result = await response.json();
            console.log('Email sent successfully:', result);
          } catch (err) {
            console.error('Email error:', err);
          }
        };
        sendEmail();
      }

      setSelectedResult(null);
      setComment('');
      loadData();
    } catch (err) {
      console.error('Error approving:', err);
    }
    setApproving(false);
  };

  if (loading) return <div className="dashboard"><p>Loading...</p></div>;

  const pendingResults = results.filter(r => !r.is_approved);
  const approvedResults = results.filter(r => r.is_approved);
  
  // Filter and sort questions
  const filteredQuestions = questions
    .filter(q => {
      const matchesSearch = q.question_text?.toLowerCase().includes(questionSearch.toLowerCase());
      const matchesSkill = !questionSkillFilter || q.skill === questionSkillFilter;
      const matchesCefr = !questionCefrFilter || q.cefr_level === questionCefrFilter;
      return matchesSearch && matchesSkill && matchesCefr;
    })
    .sort((a, b) => {
      if (questionSort === 'recent') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (questionSort === 'difficulty') {
        return (a.difficulty_score || 0) - (b.difficulty_score || 0);
      } else if (questionSort === 'difficulty-desc') {
        return (b.difficulty_score || 0) - (a.difficulty_score || 0);
      } else if (questionSort === 'level') {
        const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4 };
        return (levelOrder[a.cefr_level] || 0) - (levelOrder[b.cefr_level] || 0);
      }
      return 0;
    });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="header-actions">
          <span>{user.email} ({isSuperAdmin ? 'superadmin' : (user.role || 'student')})</span>
          <button className="logout-button" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          Pending ({pendingResults.length})
        </button>
        <button className={`tab ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
          Approved ({approvedResults.length})
        </button>
        <button className={`tab ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>
          Questions
        </button>
        {isSuperAdmin && (
          <button className={`tab ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}>
            Admin Management
          </button>
        )}
      </div>

      {!isSuperAdmin && ['teacher', 'admin'].includes(user.role) && (
        <div className="tab-content" style={{ marginBottom: '20px', backgroundColor: '#fff9e6', border: '1px solid #ffc107' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#8a6d3b' }}>
            Admin Management is only visible for superadmin ({SUPERADMIN_EMAIL}).
          </p>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="tab-content">
          {pendingResults.length === 0 ? (
            <p>No pending approvals.</p>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Score</th>
                  <th>CEFR Level</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingResults.map(r => (
                  <tr key={r.id}>
                    <td>{r.students?.full_name || r.student_name || 'N/A'} {r.students?.country ? `(${r.students.country})` : ''}</td>
                    <td>{r.overall_score?.toFixed(1)}%</td>
                    <td style={{ fontWeight: 'bold', color: '#CC0000' }}>{r.determined_cefr_level}</td>
                    <td>{new Date(r.completed_at).toLocaleDateString()}</td>
                    <td>
                      <button className="approve-button" onClick={() => { setSelectedResult(r); setComment(''); }}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'approved' && (
        <div className="tab-content">
          {approvedResults.length === 0 ? (
            <p>No approved results yet.</p>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Passport/ID</th>
                  <th>Score</th>
                  <th>CEFR Level</th>
                  <th>Approved</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvedResults.map(r => (
                  <tr key={r.id}>
                    <td>{r.students?.full_name || r.student_name || 'N/A'}</td>
                    <td>{r.students?.passport_id || r.student_passport || 'N/A'}</td>
                    <td>{r.overall_score?.toFixed(1)}%</td>
                    <td style={{ fontWeight: 'bold', color: '#CC0000' }}>{r.determined_cefr_level}</td>
                    <td>{new Date(r.approved_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="approve-button" 
                        onClick={async () => {
                          try {
                            // For testing: send to your own email instead
                            // Once Resend is verified, change back to student email
                            const recipientEmail = 'shiro@premium.edu.my';

                            const response = await fetch('/api/send-email', {
                              method: 'POST',
                              headers: { 
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                studentEmail: recipientEmail,
                                cefrLevel: r.determined_cefr_level,
                                score: r.overall_score,
                                comment: r.teacher_comment || '',
                                responses: r.student_responses ? JSON.parse(r.student_responses) : [],
                                questions: questions
                              })
                            });

                            const result = await response.json();
                            alert(`Email resent to ${recipientEmail}`);
                            console.log('Email sent:', result);
                          } catch (err) {
                            alert('Error sending email. Check console.');
                            console.error('Email error:', err);
                          }
                        }}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Resend Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="tab-content">
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Question Bank Management</h3>
            <button 
              onClick={() => setSelectedQuestion({ new: true })}
              style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Add New Question
            </button>
          </div>

          <div style={{ marginTop: '15px', marginBottom: '20px' }}>
            <p><strong>Total Questions: {questions.length}</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
              {['A1', 'A2', 'B1', 'B2'].map(level => (
                <div key={level} style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                  <div style={{ fontSize: '20px', color: '#CC0000', marginBottom: '5px' }}>
                    {questions.filter(q => q.cefr_level === level).length}
                  </div>
                  <div>{level} Level</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Search Questions:</label>
              <input 
                type="text"
                placeholder="Search by question text..."
                onChange={(e) => setQuestionSearch(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Filter by Skill:</label>
              <select 
                onChange={(e) => setQuestionSkillFilter(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">All Skills</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Filter by CEFR Level:</label>
              <select 
                onChange={(e) => setQuestionCefrFilter(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">All Levels</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Sort By:</label>
              <select 
                onChange={(e) => setQuestionSort(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="recent">Most Recent</option>
                <option value="difficulty">Difficulty (Low to High)</option>
                <option value="difficulty-desc">Difficulty (High to Low)</option>
                <option value="level">CEFR Level</option>
              </select>
            </div>
          </div>

          <h3>Questions ({filteredQuestions.length})</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
            <table className="results-table">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th>Question Text</th>
                  <th>Type</th>
                  <th>Skill</th>
                  <th>CEFR</th>
                  <th>Difficulty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((q, idx) => (
                  <tr key={idx}>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question_text?.substring(0, 60) || 'N/A'}...</td>
                    <td style={{ fontSize: '12px' }}>{q.question_type || 'N/A'}</td>
                    <td style={{ fontSize: '12px' }}>{q.skill || 'N/A'}</td>
                    <td style={{ fontWeight: 'bold', color: '#CC0000', fontSize: '12px' }}>{q.cefr_level}</td>
                    <td style={{ textAlign: 'center' }}>{q.difficulty_score || 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => setSelectedQuestion(q)}
                        style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '3px' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'admins' && isSuperAdmin && (
        <div className="tab-content">
          <h3>Super Admin User Role Management</h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
            Promote users to admin or revert to student. Admin self-signup remains disabled.
          </p>
          {adminError && (
            <div className="error-message" style={{ marginBottom: '12px' }}>
              {adminError} Please verify `SUPABASE_SERVICE_ROLE_KEY` in Vercel and redeploy.
            </div>
          )}
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="approve-button" onClick={() => setShowAddUserModal(true)}>+ Add User</button>
          </div>
          <table className="results-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Passport/ID</th>
                <th>Country</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {managedUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#666', padding: '16px' }}>
                    No users loaded. Check Admin API configuration or Supabase permissions.
                  </td>
                </tr>
              )}
              {managedUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    {editingUserId === u.id ? (
                      <input
                        value={editingUserName}
                        onChange={(e) => setEditingUserName(e.target.value)}
                        style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                      />
                    ) : (u.full_name || 'N/A')}
                  </td>
                  <td style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                    {editingUserId === u.id ? (
                      <select value={editingUserRole} onChange={(e) => setEditingUserRole(e.target.value)} style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (u.role || 'student')}
                  </td>
                  <td>{editingUserId === u.id ? <input value={editingPassportId} onChange={(e) => setEditingPassportId(e.target.value)} /> : (u.passport_id || '-')}</td>
                  <td>{editingUserId === u.id ? <input value={editingCountry} onChange={(e) => setEditingCountry(e.target.value)} /> : (u.country || '-')}</td>
                  <td>
                    {editingUserId === u.id ? (
                      <>
                        <button className="approve-button" disabled={userMgmtLoading} onClick={async () => {
                          try {
                            setUserMgmtLoading(true);
                            await api.updateManagedUserRole(u.id, editingUserRole, editingUserName, editingPassportId, editingCountry);
                            setEditingUserId(null);
                            await loadData();
                          } catch (err) {
                            alert(err.message || 'Failed to update user');
                          } finally {
                            setUserMgmtLoading(false);
                          }
                        }} style={{ fontSize: '12px', padding: '6px 12px', marginRight: '8px' }}>Save</button>
                        <button className="logout-button" onClick={() => setEditingUserId(null)} style={{ fontSize: '12px', padding: '6px 12px' }}>Cancel</button>
                      </>
                    ) : (
                      <button
                        className="approve-button"
                        disabled={userMgmtLoading || u.email?.toLowerCase() === SUPERADMIN_EMAIL}
                        onClick={() => {
                          setEditingUserId(u.id);
                          setEditingUserRole(u.role || 'student');
                          setEditingUserName(u.full_name || '');
                          setEditingPassportId(u.passport_id || '');
                          setEditingCountry(u.country || '');
                        }}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Edit
                      </button>
                      
                    )}
                    <button
                      className="logout-button"
                      disabled={userMgmtLoading || u.email?.toLowerCase() === SUPERADMIN_EMAIL}
                      onClick={async () => {
                        if (!window.confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
                        try {
                          setUserMgmtLoading(true);
                          await api.deleteManagedUser(u.id);
                          await loadData();
                        } catch (err) {
                          alert(err.message || 'Failed to delete user');
                        } finally {
                          setUserMgmtLoading(false);
                        }
                      }}
                      style={{ fontSize: '12px', padding: '6px 12px', marginLeft: '8px', backgroundColor: '#b00020' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <button className="modal-close" onClick={() => setShowAddUserModal(false)}>×</button>
            <h2>Add User</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input placeholder="Email *" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              <input placeholder="Full Name *" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} />
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}><option value="student">student</option><option value="teacher">teacher</option><option value="admin">admin</option></select>
              <input placeholder="Passport/ID (student only)" value={newUser.passportId} onChange={(e) => setNewUser({ ...newUser, passportId: e.target.value })} />
              <input placeholder="Country (student only)" value={newUser.country} onChange={(e) => setNewUser({ ...newUser, country: e.target.value })} />
              <div />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password (leave blank = auto)" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" value={newUserPasswordConfirm} onChange={(e) => setNewUserPasswordConfirm(e.target.value)} />
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                Show passwords
              </label>
              <span>Password strength: <strong>{passwordStrength}</strong></span>
            </div>
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="logout-button" onClick={() => setShowAddUserModal(false)}>Cancel</button>
              <button className="approve-button" onClick={async () => {
                try {
                  if (newUserPassword && newUserPassword !== newUserPasswordConfirm) {
                    alert('Password and confirmation do not match.');
                    return;
                  }
                  const result = await api.createManagedUser({ ...newUser, password: newUserPassword || undefined });
                  alert(newUserPassword ? 'User created successfully.' : `User created. Temporary password: ${result.tempPassword}`);
                  if (!newUserPassword) {
                    const shouldGenerateReset = window.confirm('Generate reset link now for this user?');
                    if (shouldGenerateReset) {
                      const resetData = await api.sendUserResetLink(newUser.email);
                      if (resetData?.resetLink) window.prompt('Copy and send this reset link:', resetData.resetLink);
                    }
                  }
                  setNewUser({ email: '', fullName: '', role: 'student', passportId: '', country: '' });
                  setNewUserPassword('');
                  setNewUserPasswordConfirm('');
                  setShowAddUserModal(false);
                  await loadData();
                } catch (err) {
                  alert(err.message || 'Failed to create user');
                }
              }}>Create User</button>
            </div>
          </div>
        </div>
      )}

      {selectedQuestion && (
        <div className="modal-overlay" onClick={() => setSelectedQuestion(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-close" onClick={() => setSelectedQuestion(null)}>×</button>
            <h2>{selectedQuestion.new ? 'Add New Question' : 'Edit Question'}</h2>
            
            <div className="modal-section">
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Question Text:</label>
                <textarea 
                  id="question-text"
                  ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.question_text || ''}}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px', fontFamily: 'inherit' }}
                  placeholder="Enter question text..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Question Type:</label>
                  <select 
                    id="question-type"
                    ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.question_type || 'multiple_choice'}}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option>multiple_choice</option>
                    <option>fill_blank</option>
                    <option>matching</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Skill:</label>
                  <select 
                    id="skill-select"
                    value={selectedQuestion.skill || 'reading'}
                    onChange={(e) => setSelectedQuestion({ ...selectedQuestion, skill: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="grammar">grammar</option>
                    <option value="vocabulary">vocabulary</option>
                    <option value="reading">reading</option>
                    <option value="listening">listening</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CEFR Level:</label>
                  <select 
                    id="question-cefr"
                    ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.cefr_level || 'A1'}}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option>A1</option>
                    <option>A2</option>
                    <option>B1</option>
                    <option>B2</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Difficulty Score (1-10):</label>
                  <input 
                    id="question-difficulty"
                    type="number" 
                    min="1" 
                    max="10" 
                    ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.difficulty_score || 5}}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Conditional: Show Audio URL for Listening */}
              {selectedQuestion.skill === 'listening' && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', border: '1px solid #90caf9' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>🎵 Audio URL (Listening):</label>
                  <input 
                    id="question-audio"
                    type="text"
                    ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.audio_url || ''}}
                    style={{ width: '100%', padding: '8px', border: '1px solid #90caf9', borderRadius: '4px' }}
                    placeholder="https://example.com/audio.mp3"
                  />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Link to the audio file for this listening question</p>
                </div>
              )}

              {/* Conditional: Show Passage for Reading ONLY */}
              {selectedQuestion.skill === 'reading' && (
                <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f3e5f5', borderRadius: '4px', border: '1px solid #ce93d8' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>📖 Reading Passage:</label>
                  <textarea 
                    id="question-passage"
                    ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.passage || ''}}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ce93d8', borderRadius: '4px', minHeight: '120px', fontFamily: 'inherit' }}
                    placeholder="Paste the article or passage here for reading comprehension questions..."
                  />
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Answer Options (comma-separated):</label>
                <input 
                  id="question-options"
                  type="text"
                  ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.options?.join(', ') || ''}}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="Option 1, Option 2, Option 3, Option 4"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correct Answer:</label>
                <input 
                  id="question-correct"
                  type="text"
                  ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.correct_answers?.[0] || ''}}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  placeholder="Enter correct answer"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Explanation:</label>
                <textarea 
                  id="question-explanation"
                  ref={(ref) => {if(ref) ref.defaultValue = selectedQuestion.explanation || ''}}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }}
                  placeholder="Explain why this is the correct answer..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  onClick={() => setSelectedQuestion(null)}
                  style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#f5f5f5' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const payload = {
                        question_text: document.getElementById('question-text')?.value?.trim(),
                        question_type: document.getElementById('question-type')?.value || 'multiple_choice',
                        skill: selectedQuestion.skill || 'reading',
                        cefr_level: document.getElementById('question-cefr')?.value || 'A1',
                        difficulty_score: Number(document.getElementById('question-difficulty')?.value || 5),
                        audio_url: document.getElementById('question-audio')?.value?.trim() || null,
                        passage: document.getElementById('question-passage')?.value?.trim() || null,
                        options: (document.getElementById('question-options')?.value || '').split(',').map(v => v.trim()).filter(Boolean),
                        correct_answers: [(document.getElementById('question-correct')?.value || '').trim()].filter(Boolean),
                        explanation: document.getElementById('question-explanation')?.value?.trim() || ''
                      };

                      if (!payload.question_text || payload.options.length === 0 || payload.correct_answers.length === 0) {
                        alert('Please fill Question Text, Options, and Correct Answer.');
                        return;
                      }

                      if (selectedQuestion.new) {
                        await api.createQuestion(payload);
                      } else {
                        await api.updateQuestion(selectedQuestion.id, payload);
                      }
                      await loadData();
                      setSelectedQuestion(null);
                      alert('Question saved to database successfully.');
                    } catch (err) {
                      alert(err.message || 'Failed to save question.');
                    }
                  }}
                  style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Save Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedResult && (
        <div className="modal-overlay" onClick={() => setSelectedResult(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedResult(null)}>×</button>
            <h2>Review Student Result</h2>
            
            <div className="modal-section">
              <h3>Student Information</h3>
              <p><strong>Name:</strong> {selectedResult.students?.full_name || selectedResult.student_name || 'N/A'}</p>
              <p><strong>Passport/ID:</strong> {selectedResult.students?.passport_id || selectedResult.student_passport || 'N/A'}</p>
              <p><strong>Country:</strong> {selectedResult.students?.country || 'N/A'}</p>
              <p><strong>Score:</strong> {selectedResult.overall_score?.toFixed(1)}%</p>
              <p><strong>CEFR Level:</strong> <span style={{ color: '#CC0000', fontWeight: 'bold', fontSize: '18px' }}>{selectedResult.determined_cefr_level}</span></p>
              <p><strong>Date:</strong> {new Date(selectedResult.completed_at).toLocaleString()}</p>
            </div>

            {selectedResult.student_responses && (
              <div className="modal-section">
                <h3>Question Breakdown</h3>
                {JSON.parse(selectedResult.student_responses).map((response, idx) => {
                  const question = questions.find(q => q.id === response.question_id);
                  return (
                    <div key={idx} className={`question-item ${response.is_correct ? 'question-correct' : 'question-wrong'}`}>
                      <p><strong>Q{idx + 1}:</strong> {question?.question_text.substring(0, 100)}...</p>
                      <p><span className={response.is_correct ? 'correct-badge' : 'wrong-badge'}>
                        {response.is_correct ? '✓ Correct' : '✗ Wrong'}
                      </span></p>
                      <p><strong>Student:</strong> {response.student_answer}</p>
                      <p><strong>Correct:</strong> {question?.correct_answers?.[0]}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="modal-section">
              <h3>Teacher Comment</h3>
              <textarea
                className="textarea"
                placeholder="Enter comment to send to student..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="approve-button" onClick={handleApprove} disabled={approving}>
                {approving ? 'Approving...' : 'Approve & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);

    // Disable Chrome translation
    const meta = document.createElement('meta');
    meta.name = 'google';
    meta.content = 'notranslate';
    document.head.appendChild(meta);

    document.documentElement.setAttribute('translate', 'no');
    document.body.setAttribute('translate', 'no');
    document.body.classList.add('notranslate');
  }, []);

  return (
    <div className="app">
      <div className="header">
        <img 
          src={LOGO_URL} 
          alt="PLC Logo" 
          className="header-logo" 
          onError={(e) => {
            e.target.style.display = 'none';
            console.log('Logo failed to load from:', LOGO_URL);
          }} 
        />
        <div className="header-content">
          <h1>CEFR Placement</h1>
          <p className="subtitle">{COMPANY_NAME}</p>
        </div>
      </div>

      {!user ? (
        <LoginScreen onLogin={setUser} />
      ) : ['teacher', 'admin', 'superadmin'].includes(user.role) ? (
        <TeacherDashboard user={user} onLogout={() => setUser(null)} />
      ) : (
        <StudentTest user={user} onComplete={() => setUser(null)} />
      )}
    </div>
  );
}
