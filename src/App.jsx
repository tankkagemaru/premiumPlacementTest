import React, { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://nitxboxvkktcgkkkbrec.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdHhib3h2a2t0Y2dra2ticmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTE4MjgsImV4cCI6MjA5MTc4NzgyOH0.wFhjlAvvFG92JGT2Pb-KhHwRnas89ZjPB46h1RIwdJ0';
const REGISTRATION_CODE = 'PREMIUM2024';
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
  async request(method, path, body = null) {
    const token = localStorage.getItem('sb-token');
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
  async signup(email, password, fullName, passportId, country) {
    const result = await this.request('POST', '/auth/v1/signup', { email, password });
    
    // Create student record
    if (result?.user?.id) {
      try {
        await this.request('POST', '/rest/v1/students', {
          user_id: result.user.id,
          email: email,
          full_name: fullName,
          passport_id: passportId,
          country: country
        });
      } catch (err) {
        console.error('Error creating student record:', err);
      }
    }
    
    return result;
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
  }
};

// Helper Functions
function selectNextQuestion(questionsBank, currentDifficulty, userResponses) {
  const answeredIds = new Set(userResponses.map(r => r.question_id));
  const minDiff = Math.max(1, currentDifficulty - 1.5);
  const maxDiff = Math.min(10, currentDifficulty + 1.5);
  const suitable = questionsBank.filter(q => {
    if (!q.id || answeredIds.has(q.id)) return false;
    const qDiff = q.difficulty_score || 5;
    return qDiff >= minDiff && qDiff <= maxDiff;
  });
  if (suitable.length === 0) {
    const remaining = questionsBank.filter(q => q.id && !answeredIds.has(q.id));
    if (remaining.length === 0) return null;
    return remaining[Math.floor(Math.random() * remaining.length)];
  }
  return suitable[Math.floor(Math.random() * suitable.length)];
}

function calculateDifficulty(responses) {
  if (responses.length === 0) return 5;
  let difficulty = 5;
  for (const r of responses) difficulty += r.is_correct ? 0.8 : -0.6;
  return Math.max(1, Math.min(10, difficulty));
}

function determineCEFRLevel(percentage) {
  if (percentage >= 85) return 'C2';
  if (percentage >= 75) return 'C1';
  if (percentage >= 65) return 'B2';
  if (percentage >= 55) return 'B1';
  if (percentage >= 40) return 'A2';
  return 'A1';
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
        if (registrationCode.trim() !== REGISTRATION_CODE) {
          setError('Invalid registration code.');
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

      const result = isSignup 
        ? await api.signup(email, password, fullName, passportId, country)
        : await api.login(email, password);

      if (!result?.access_token) {
        setError('Authentication failed.');
        setLoading(false);
        return;
      }

      localStorage.setItem('sb-token', result.access_token);
      const role = await api.getUserRole(result.user.id);
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
    <div className="login-container">
      <div className="login-box">
        <h1>CEFR Placement</h1>
        <p className="subtitle">{COMPANY_NAME}</p>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <div className="form-section">
                <div className="form-section-title">Personal Information</div>
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
            <div className="form-section-title">Login Information</div>
            <input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password (min 6 characters) *" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {isSignup && (
            <div className="form-section">
              <div className="form-section-title">Registration Code</div>
              <label className="code-label">Enter code provided by your instructor</label>
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
  );
}

// ============ STUDENT TEST ============
function StudentTest({ user, onComplete }) {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
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
      setCurrentDifficulty(randomStart.difficulty_score || 5);
      setTestState('testing');
    } catch (err) {
      setError('Error loading questions.');
      setTestStarted(false);
    }
    setLoading(false);
  };

  const handleAnswer = async (selectedAnswer) => {
    if (!currentQuestion) return;
    const isCorrect = currentQuestion.correct_answers?.includes(selectedAnswer);
    const newResponses = [...userResponses, {
      question_id: currentQuestion.id,
      student_answer: selectedAnswer,
      is_correct: isCorrect,
      time_spent_seconds: 0,
      difficulty_at_time: currentDifficulty,
      reaction_time_ms: 0
    }];
    setUserResponses(newResponses);
    if (newResponses.length >= 30) {
      completeTest(newResponses);
    } else {
      const newDifficulty = calculateDifficulty(newResponses);
      setCurrentDifficulty(newDifficulty);
      const nextQ = selectNextQuestion(questionsBank, newDifficulty, newResponses);
      setCurrentQuestion(nextQ);
      setTimeout(() => document.activeElement?.blur?.(), 50);
    }
  };

  const completeTest = async (responses) => {
    const correctCount = responses.filter(r => r.is_correct).length;
    const score = (correctCount / responses.length) * 100;
    const cefrLevel = determineCEFRLevel(score);
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
    <div className="test-screen">
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

      <div className="question-box">
        <h3>{currentQuestion.question_text}</h3>
        {currentQuestion.audio_url && (
          <audio controls style={{ width: '100%', marginBottom: '20px' }}>
            <source src={currentQuestion.audio_url} type="audio/wav" />
          </audio>
        )}
        {currentQuestion.passage && <div className="passage"><p>{currentQuestion.passage}</p></div>}
        <div className="options">
          {currentQuestion.options?.map((option, idx) => (
            <button key={idx} className="option-button" onClick={() => handleAnswer(option)}>
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
  const [comment, setComment] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [res, q] = await Promise.all([api.getAllResults(), api.getQuestionBank()]);
      setResults(res || []);
      setQuestions(q || []);
    } catch (err) {
      console.error('Error loading:', err);
    }
    setLoading(false);
  };

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
            const response = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                studentEmail: studentEmail,
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="header-actions">
          <span>{user.email}</span>
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
      </div>

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
                            const studentEmail = r.students?.email;
                            if (!studentEmail) {
                              alert('Student email not found');
                              return;
                            }

                            const response = await fetch('/api/send-email', {
                              method: 'POST',
                              headers: { 
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                studentEmail: studentEmail,
                                cefrLevel: r.determined_cefr_level,
                                score: r.overall_score,
                                comment: r.teacher_comment || '',
                                responses: r.student_responses ? JSON.parse(r.student_responses) : [],
                                questions: questions
                              })
                            });

                            const result = await response.json();
                            alert(`Email resent to ${studentEmail}`);
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
            <h3>Question Bank Management</h3>
            <button 
              onClick={() => {
                const newQ = prompt('Enter question text:');
                if (newQ) {
                  prompt('CEFR Level (A1/A2/B1/B2):');
                  prompt('Difficulty Score (1-10):');
                  alert('Question added! You can manage questions in your database.');
                }
              }}
              style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Add New Question
            </button>
          </div>

          <p><strong>Total Questions: {questions.length}</strong></p>
          
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            {['A1', 'A2', 'B1', 'B2'].map(level => (
              <div key={level} style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', cursor: 'pointer' }} 
                   onClick={() => alert(`${level} Questions:\n${questions.filter(q => q.cefr_level === level).length} total`)}>
                <div style={{ fontSize: '20px', color: '#CC0000', marginBottom: '5px' }}>
                  {questions.filter(q => q.cefr_level === level).length}
                </div>
                <div>{level} Level</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Recent Questions</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Question Text</th>
                  <th>Type</th>
                  <th>CEFR Level</th>
                  <th>Difficulty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {questions.slice(0, 10).map((q, idx) => (
                  <tr key={idx}>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.question_text?.substring(0, 50)}...</td>
                    <td>{q.question_type || 'N/A'}</td>
                    <td style={{ fontWeight: 'bold', color: '#CC0000' }}>{q.cefr_level}</td>
                    <td>{q.difficulty_score || 'N/A'}</td>
                    <td>
                      <button 
                        onClick={() => alert(`Edit Feature Coming Soon\n\nQuestion: ${q.question_text}`)}
                        style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '3px' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
            📝 To manage questions programmatically, use the <strong>upload_questions.py</strong> script in your repository.
          </p>
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
      ) : user.role === 'teacher' ? (
        <TeacherDashboard user={user} onLogout={() => setUser(null)} />
      ) : (
        <StudentTest user={user} onComplete={() => setUser(null)} />
      )}
    </div>
  );
}
