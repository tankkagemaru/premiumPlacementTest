import React, { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://nitxboxvkktcgkkkbrec.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdHhib3h2a2t0Y2dra2ticmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTE4MjgsImV4cCI6MjA5MTc4NzgyOH0.wFhjlAvvFG92JGT2Pb-KhHwRnas89ZjPB46h1RIwdJ0';

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

  .result-box {
    background-color: #f9f9f9;
    padding: 30px;
    border-radius: 4px;
    margin-bottom: 30px;
  }

  .cefr-level {
    font-size: 48px;
    font-weight: bold;
    color: #CC0000;
    margin-bottom: 15px;
  }

  .result-box p {
    font-size: 16px;
    color: #666;
    margin-bottom: 10px;
  }

  .questions-completed {
    font-size: 14px;
    color: #999;
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
    return this.request('POST', '/rest/v1/test_results', result);
  },

  getAllResults() {
    return this.request('GET', '/rest/v1/test_results?select=*');
  },

  getQuestionBank() {
    return this.request('GET', '/rest/v1/questions?select=*');
  }
};

// Adaptive algorithm
function selectNextQuestion(questionsBank, currentDifficulty, userResponses) {
  const minDiff = Math.max(1, currentDifficulty - 1.5);
  const maxDiff = Math.min(10, currentDifficulty + 1.5);

  const suitable = questionsBank.filter(q => {
    const qDiff = q.difficulty_score || 5;
    const alreadyAnswered = userResponses.some(r => r.question_id === q.id);
    return qDiff >= minDiff && qDiff <= maxDiff && !alreadyAnswered;
  });

  if (suitable.length === 0) {
    return questionsBank.find(q => !userResponses.some(r => r.question_id === q.id));
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

// Components
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isSignup ? await api.signup(email, password) : await api.login(email, password);

      if (!result?.access_token) {
        setError('Login failed. Please try again.');
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

function StudentTest({ user, onComplete }) {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionsBank, setQuestionsBank] = useState([]);
  const [userResponses, setUserResponses] = useState([]);
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
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
      const firstQ = questions.find(q => q.cefr_level === 'B1') || questions[0];
      setCurrentQuestion(firstQ);
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
    }
  };

  const completeTest = async (responses) => {
    const correctCount = responses.filter(r => r.is_correct).length;
    const score = (correctCount / responses.length) * 100;
    const cefrLevel = determineCEFRLevel(score);

    try {
      await api.saveTestResult({
        student_id: user.id,
        overall_score: score,
        determined_cefr_level: cefrLevel,
        completed_at: new Date().toISOString(),
        notes: `Completed 30 questions. Score: ${score.toFixed(1)}%`
      });
    } catch (err) {
      console.error('Error saving results:', err);
    }

    setTestResults({ cefrLevel, score, totalQuestions: responses.length });
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

  if (testResults) {
    return (
      <div className="test-screen">
        <div className="results">
          <h2>Your Results</h2>
          <div className="result-box">
            <div className="cefr-level">{testResults.cefrLevel}</div>
            <p>Score: {testResults.score.toFixed(1)}%</p>
            <p className="questions-completed">{testResults.totalQuestions} questions completed</p>
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
            <source src={currentQuestion.audio_url} type="audio/mpeg" />
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

function TeacherDashboard({ user, onLogout }) {
  const [results, setResults] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('results');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
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
          Results
        </button>
        <button className={`tab ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>
          Question Bank
        </button>
      </div>

      {activeTab === 'results' && (
        <div className="tab-content">
          <div className="results-actions">
            <button className="primary-button" onClick={exportCSV}>Export CSV</button>
          </div>
          <table className="results-table">
            <thead>
              <tr>
                <th>Student</th>
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
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="tab-content">
          <p>Total Questions: {questions.length}</p>
          <div className="question-stats">
            {['A1', 'A2', 'B1', 'B2'].map(level => (
              <div key={level} className="stat">
                <span>{level}: {questions.filter(q => q.cefr_level === level).length}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main App
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
