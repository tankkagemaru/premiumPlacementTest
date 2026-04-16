import React, { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://nitxboxvkktcgkkkbrec.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdHhib3h2a2t0Y2dra2ticmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTE4MjgsImV4cCI6MjA5MTc4NzgyOH0.wFhjlAvvFG92JGT2Pb-KhHwRnas89ZjPB46h1RIwdJ0';

// REGISTRATION CODE - Change this to control who can sign up
const REGISTRATION_CODE = 'PREMIUM2024';

// Styles embedded in component
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    background-color: #f5f5f5;
  }

  .app {
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .header {
    background: linear-gradient(135deg, #CC0000 0%, #990000 100%);
    color: white;
    padding: 40px 20px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .header h1 {
    font-size: 32px;
    margin-bottom: 10px;
  }

  .subtitle {
    font-size: 14px;
    opacity: 0.9;
  }

  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 120px);
    padding: 20px;
  }

  .login-box {
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 400px;
  }

  .login-box h1 {
    color: #CC0000;
    font-size: 24px;
    margin-bottom: 10px;
  }

  .login-box input {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .login-box input:focus {
    outline: none;
    border-color: #CC0000;
    box-shadow: 0 0 5px rgba(204, 0, 0, 0.2);
  }

  .primary-button {
    width: 100%;
    padding: 12px;
    background-color: #CC0000;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .primary-button:hover {
    background-color: #990000;
  }

  .primary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    background-color: #fee;
    color: #c00;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 14px;
  }

  .toggle-auth {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
  }

  .link-button {
    background: none;
    border: none;
    color: #CC0000;
    cursor: pointer;
    text-decoration: underline;
    margin-left: 5px;
  }

  .code-input {
    background-color: #fff9e6 !important;
    border-color: #ffc107 !important;
  }

  .code-label {
    font-size: 12px;
    color: #ff9800;
    margin-bottom: 5px;
    display: block;
  }

  .test-screen {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .test-intro {
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
  }

  .test-intro h1 {
    color: #CC0000;
    margin-bottom: 20px;
  }

  .description {
    color: #666;
    margin-bottom: 30px;
    line-height: 1.6;
  }

  .test-info {
    background-color: #f9f9f9;
    border: 2px dashed #CC0000;
    padding: 20px;
    margin-bottom: 30px;
    border-radius: 4px;
  }

  .test-info h3 {
    color: #CC0000;
    margin-bottom: 15px;
    text-align: left;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    text-align: left;
  }

  .info-grid div {
    padding: 8px;
    font-size: 14px;
  }

  .disclaimer {
    color: #999;
    font-size: 12px;
    margin-top: 20px;
  }

  .test-progress {
    text-align: center;
    margin-bottom: 20px;
    color: #666;
    font-size: 14px;
  }

  .question-box {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .question-box h3 {
    margin-bottom: 20px;
    color: #333;
    line-height: 1.6;
  }

  .passage {
    background-color: #f9f9f9;
    padding: 15px;
    border-left: 4px solid #CC0000;
    margin-bottom: 20px;
    font-size: 14px;
    line-height: 1.6;
  }

  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .option-button {
    padding: 12px;
    border: 2px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
  }

  .option-button:hover {
    border-color: #CC0000;
    background-color: #fff5f5;
  }

  .results {
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
  }

  .results h2 {
    margin-bottom: 30px;
    color: #333;
  }

  .pending-box {
    background-color: #fff9e6;
    border: 2px solid #ffc107;
    padding: 30px;
    border-radius: 4px;
    margin-bottom: 30px;
  }

  .pending-box h3 {
    color: #ff9800;
    margin-bottom: 15px;
    font-size: 20px;
  }

  .pending-box p {
    color: #666;
    margin-bottom: 10px;
    line-height: 1.6;
  }

  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .dashboard-header h1 {
    color: #CC0000;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .logout-button {
    padding: 10px 20px;
    background-color: #CC0000;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .logout-button:hover {
    background-color: #990000;
  }

  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .tab {
    padding: 10px 20px;
    background: white;
    border: 2px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s;
  }

  .tab.active {
    background-color: #CC0000;
    color: white;
    border-color: #CC0000;
  }

  .tab-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .results-actions {
    margin-bottom: 20px;
  }

  .results-table {
    width: 100%;
    border-collapse: collapse;
  }

  .results-table th {
    background-color: #f5f5f5;
    padding: 12px;
    text-align: left;
    font-weight: bold;
    border-bottom: 2px solid #ddd;
  }

  .results-table td {
    padding: 12px;
    border-bottom: 1px solid #ddd;
  }

  .results-table tr:hover {
    background-color: #f9f9f9;
  }

  .question-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .stat {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
  }

  @media (max-width: 600px) {
    .options {
      grid-template-columns: 1fr;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .header h1 {
      font-size: 24px;
    }

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }
  }
`;

// API Helper
const api = {
  async request(method, path, body = null) {
    const token = localStorage.getItem('sb-token');
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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

  signup(email, password) {
    return this.request('POST', '/auth/v1/signup', { email, password });
  },

  login(email, password) {
    return this.request('POST', '/auth/v1/token?grant_type=password', { email, password });
  },

  async getUserRole(userId) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=role`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${localStorage.getItem('sb-token')}`
          }
        }
      );
      if (!response.ok) return 'student';
      const data = await response.json();
      return data?.[0]?.role || 'student';
    } catch {
      return 'student';
    }
  },

  getAllQuestions() {
    return fetch(`${SUPABASE_URL}/rest/v1/questions?select=*&limit=500`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${localStorage.getItem('sb-token')}`
      }
    }).then(r => r.json()).catch(() => []);
  },

  saveTestResult(result) {
    console.log('Saving test result:', result);
    return this.request('POST', '/rest/v1/test_results', result);
  },

  getAllResults() {
    return this.request('GET', '/rest/v1/test_results?select=*');
  },

  getQuestionBank() {
    return this.request('GET', '/rest/v1/questions?select=*');
  }
};

// Adaptive algorithm - FIXED to prevent duplicates
function selectNextQuestion(questionsBank, currentDifficulty, userResponses) {
  // Get IDs of already answered questions
  const answeredIds = new Set(userResponses.map(r => r.question_id));
  
  const minDiff = Math.max(1, currentDifficulty - 1.5);
  const maxDiff = Math.min(10, currentDifficulty + 1.5);

  // Filter: correct difficulty AND not already answered AND not null id
  const suitable = questionsBank.filter(q => {
    if (!q.id || answeredIds.has(q.id)) return false; // Skip if no ID or already answered
    const qDiff = q.difficulty_score || 5;
    return qDiff >= minDiff && qDiff <= maxDiff;
  });

  if (suitable.length === 0) {
    // Fallback: find any unanswered question
    const remaining = questionsBank.filter(q => q.id && !answeredIds.has(q.id));
    if (remaining.length === 0) return null;
    return remaining[Math.floor(Math.random() * remaining.length)];
  }

  return suitable[Math.floor(Math.random() * suitable.length)];
}

function calculateDifficulty(responses) {
  if (responses.length === 0) return 5;
  let difficulty = 5;
  for (const r of responses) {
    difficulty += r.is_correct ? 0.8 : -0.6;
  }
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

// ============ LOGIN SCREEN WITH REGISTRATION CODE ============
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // CHECK REGISTRATION CODE FOR SIGNUP
      if (isSignup) {
        if (!registrationCode || registrationCode.trim() === '') {
          setError('Registration code is required to sign up.');
          setLoading(false);
          return;
        }
        
        if (registrationCode.trim() !== REGISTRATION_CODE) {
          setError(`Invalid registration code. Please check with your instructor.`);
          setLoading(false);
          return;
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      // Validate password length
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      const result = isSignup 
        ? await api.signup(email, password) 
        : await api.login(email, password);

      if (!result?.access_token) {
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('sb-token', result.access_token);
      const role = await api.getUserRole(result.user.id);
      onLogin({ ...result.user, role });
    } catch (err) {
      const errorMsg = err.message || 'An error occurred';
      if (errorMsg.includes('already registered')) {
        setError('This email is already registered. Please log in instead.');
      } else if (errorMsg.includes('Invalid login')) {
        setError('Invalid email or password.');
      } else {
        setError(errorMsg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>CEFR Placement</h1>
        <p className="subtitle">Premium Language Centre</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isSignup && (
            <>
              <label className="code-label">Registration Code (required to sign up)</label>
              <input
                type="text"
                placeholder="Registration Code"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value)}
                className="code-input"
                required
              />
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <p className="toggle-auth">
          {isSignup ? 'Have an account?' : "Don't have an account?"}
          <button type="button" onClick={() => setIsSignup(!isSignup)} className="link-button">
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
  const [testState, setTestState] = useState('intro'); // 'intro', 'testing', 'pending'
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (testStarted && questionsBank.length === 0) {
      loadQuestions();
    }
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
      
      // FIXED: Randomize starting question instead of always B1
      // Pick a random question for starting point (varied by student)
      const randomStart = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(randomStart);
      
      // Set initial difficulty based on starting question's level
      const startingDifficulty = randomStart.difficulty_score || 5;
      setCurrentDifficulty(startingDifficulty);
      
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
    const newResponses = [
      ...userResponses,
      {
        question_id: currentQuestion.id,
        student_answer: selectedAnswer,
        is_correct: isCorrect,
        time_spent_seconds: 0,
        difficulty_at_time: currentDifficulty,
        reaction_time_ms: 0
      }
    ];

    setUserResponses(newResponses);

    if (newResponses.length >= 30) {
      completeTest(newResponses);
    } else {
      const newDifficulty = calculateDifficulty(newResponses);
      setCurrentDifficulty(newDifficulty);
      const nextQ = selectNextQuestion(questionsBank, newDifficulty, newResponses);
      setCurrentQuestion(nextQ);
      
      // FIXED: Clear touch highlight on mobile/tablet
      // Remove active state by blurring and clearing focus
      setTimeout(() => {
        document.activeElement?.blur?.();
      }, 50);
    }
  };

  const completeTest = async (responses) => {
    const correctCount = responses.filter(r => r.is_correct).length;
    const score = (correctCount / responses.length) * 100;
    const cefrLevel = determineCEFRLevel(score);

    setTestResults({ cefrLevel, score, totalQuestions: responses.length });
    setTestState('pending');

    // FIXED: Better error handling and retry for result saving
    const saveTestResult = async (retries = 3) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const resultData = {
            student_id: user.id,
            overall_score: score,
            determined_cefr_level: cefrLevel,
            completed_at: new Date().toISOString(),
            notes: `Completed 30 questions. Score: ${score.toFixed(1)}%`
          };
          
          console.log(`[Attempt ${attempt}/${retries}] Saving test result:`, resultData);
          
          await api.saveTestResult(resultData);
          
          console.log('✓ Results saved successfully');
          return true;
        } catch (err) {
          console.error(`[Attempt ${attempt}/${retries}] Error saving results:`, err);
          
          if (attempt < retries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      
      console.error('✗ Failed to save results after all retries');
      return false;
    };

    // Save in background
    saveTestResult();
  };

  if (!testStarted) {
    return (
      <div className="test-screen">
        <div className="test-intro">
          <h1>English Level Assessment</h1>
          <p className="description">
            Discover your CEFR level with our adaptive placement test.
            The test adjusts to your ability level and typically takes 15-20 minutes.
          </p>

          <div className="test-info">
            <h3>What you'll be tested on:</h3>
            <div className="info-grid">
              <div>✓ Grammar & Vocabulary</div>
              <div>✓ Listening Comprehension</div>
              <div>✓ Reading Comprehension</div>
              <div>✓ Adaptive Difficulty</div>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={() => setTestStarted(true)}
            disabled={loading}
          >
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
            <p>Your results have been submitted and are pending approval from your instructor.</p>
            <p style={{ marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>
              Assessed Level: <span style={{ color: '#CC0000' }}>{testResults.cefrLevel}</span>
            </p>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              Score: {testResults.score.toFixed(1)}%
            </p>
            <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
              Your instructor will review and approve your results shortly. You will be notified once approved.
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
      <div className="test-progress">Question {userResponses.length + 1} of 30</div>
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
  const [activeTab, setActiveTab] = useState('results');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh every 5 seconds to show new results
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

  const exportCSV = () => {
    if (results.length === 0) return;
    const headers = ['Student', 'CEFR Level', 'Score', 'Date'];
    const rows = results.map(r => [
      r.student_id,
      r.determined_cefr_level,
      `${r.overall_score?.toFixed(1)}%`,
      new Date(r.completed_at).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    a.click();
  };

  if (loading) return <div className="dashboard"><p>Loading...</p></div>;

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
        <button className={`tab ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
          Results ({results.length})
        </button>
        <button className={`tab ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>
          Question Bank ({questions.length})
        </button>
      </div>

      {activeTab === 'results' && (
        <div className="tab-content">
          <div className="results-actions">
            <button className="primary-button" onClick={exportCSV}>Export CSV</button>
          </div>
          {results.length === 0 ? (
            <p>No results yet. Students will appear here after completing tests.</p>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student Email</th>
                  <th>CEFR Level</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id}>
                    <td>{r.student_id}</td>
                    <td style={{ fontWeight: 'bold', color: '#CC0000' }}>{r.determined_cefr_level}</td>
                    <td>{r.overall_score?.toFixed(1)}%</td>
                    <td>{new Date(r.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="tab-content">
          <p>Total Questions in Database: {questions.length}</p>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Ready for {questions.length > 0 ? '✓' : '✗'} student testing
          </p>
          <div className="question-stats">
            {['A1', 'A2', 'B1', 'B2'].map(level => (
              <div key={level} className="stat">
                <div style={{ fontSize: '20px', color: '#CC0000', marginBottom: '5px' }}>
                  {questions.filter(q => q.cefr_level === level).length}
                </div>
                <div>{level} Level</div>
              </div>
            ))}
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
        <h1>CEFR Placement</h1>
        <p className="subtitle">Premium Language Centre</p>
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
