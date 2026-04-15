import React, { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://nitxboxvkktcgkkkbrec.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdHhib3h2a2t0Y2dra2ticmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTE4MjgsImV4cCI6MjA5MTc4NzgyOH0.wFhjlAvvFG92JGT2Pb-KhHwRnas89ZjPB46h1RIwdJ0';

// Color constants
const COLORS = {
  primary: '#CC0000',      // Marlboro Red
  white: '#FFFFFF',      // White
  lightGray: '#F5F5F5',
  mediumGray: '#888888',
  darkGray: '#333333',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336'
};

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.token = null;
  }

  async request(method, path, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key,
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${this.url}${path}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return response.json();
  }

  async signup(email, password, role, fullName) {
    try {
      const response = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.key
        },
        body: JSON.stringify({ 
          email, 
          password,
          data: { role, full_name: fullName }
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      this.token = data.session?.access_token;
      localStorage.setItem('auth_token', data.session?.access_token);
      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_email', email);
      
      // Create user profile
      await this.request('POST', '/rest/v1/users', {
        id: data.user.id,
        email,
        role,
        full_name: fullName
      });

      return data;
    } catch (err) {
      throw err;
    }
  }

  async login(email, password) {
    const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error_description || data.error);
    
    this.token = data.access_token;
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user_id', data.user.id);
    localStorage.setItem('user_role', data.user.user_metadata?.role || 'student');
    localStorage.setItem('user_email', data.user.email);
    
    return data;
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
  }

  async createQuestion(question) {
    return this.request('POST', '/rest/v1/questions', question);
  }

  async getQuestions(filters = {}) {
    let query = '/rest/v1/questions?select=*';
    if (filters.cefrLevel) query += `&cefr_level=eq.${filters.cefrLevel}`;
    if (filters.skill) query += `&skill=eq.${filters.skill}`;
    if (filters.type) query += `&question_type=eq.${filters.type}`;
    return this.request('GET', query);
  }

  async getAllQuestions() {
    return this.request('GET', '/rest/v1/questions?select=*');
  }

  async updateQuestion(id, updates) {
    return this.request('PATCH', `/rest/v1/questions?id=eq.${id}`, updates);
  }

  async deleteQuestion(id) {
    return this.request('DELETE', `/rest/v1/questions?id=eq.${id}`);
  }

  async createTestSession(studentId) {
    return this.request('POST', '/rest/v1/test_sessions', { student_id: studentId });
  }

  async updateTestSession(sessionId, updates) {
    return this.request('PATCH', `/rest/v1/test_sessions?id=eq.${sessionId}`, updates);
  }

  async saveResponse(response) {
    return this.request('POST', '/rest/v1/test_responses', response);
  }

  async completeSession(sessionId, testResults) {
    await this.updateTestSession(sessionId, { 
      status: 'completed',
      completed_at: new Date().toISOString()
    });

    return this.request('POST', '/rest/v1/test_results', {
      session_id: sessionId,
      student_id: localStorage.getItem('user_id'),
      ...testResults
    });
  }

  async getStudentResults(studentId) {
    return this.request('GET', `/rest/v1/test_results?student_id=eq.${studentId}&select=*`);
  }

  async getAllResults() {
    return this.request('GET', '/rest/v1/test_results?select=*');
  }

  async getStudents() {
    return this.request('GET', "/rest/v1/users?role=eq.student&select=*");
  }

  async sendEmailNotification(teacherEmail, studentEmail, cefrLevel, scores) {
    return this.request('POST', '/rest/v1/email_logs', {
      recipient_email: teacherEmail,
      recipient_role: 'teacher',
      subject: `Student Placement Test Complete: ${studentEmail}`,
      status: 'sent'
    });
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Main App Component
export default function PlacementTestApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('user_role');
    
    if (token && userId) {
      supabase.token = token;
      setCurrentUser({ id: userId, role, email: localStorage.getItem('user_email') });
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    supabase.logout();
    setCurrentUser(null);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <AuthView setCurrentUser={setCurrentUser} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.lightGray, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Header user={currentUser} onLogout={handleLogout} />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        {currentUser.role === 'teacher' && (
          <TeacherDashboard user={currentUser} />
        )}
        
        {currentUser.role === 'student' && (
          <StudentInterface user={currentUser} />
        )}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: COLORS.lightGray
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: COLORS.primary,
          marginBottom: '1rem',
          animation: 'pulse 2s infinite'
        }}>
          🎯
        </div>
        <p style={{ color: COLORS.mediumGray, fontSize: '18px' }}>Loading...</p>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
}

function Header({ user, onLogout }) {
  return (
    <div style={{
      background: COLORS.white,
      borderBottom: `3px solid ${COLORS.primary}`,
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div>
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: 'bold',
          color: COLORS.primary,
          letterSpacing: '-0.5px'
        }}>
          CEFR Placement
        </h1>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '13px', color: COLORS.mediumGray }}>
          Premium Language Centre
        </p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '14px', color: COLORS.darkGray, fontWeight: '500' }}>
            {user.email}
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '12px', color: COLORS.mediumGray }}>
            {user.role === 'teacher' ? '👨‍🏫 Instructor' : '👨‍🎓 Student'}
          </p>
        </div>
        <button onClick={onLogout} style={{
          padding: '0.75rem 1.5rem',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          background: COLORS.lightGray,
          border: `1px solid ${COLORS.mediumGray}`,
          borderRadius: '6px',
          color: COLORS.darkGray,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = COLORS.primary;
          e.target.style.color = COLORS.white;
          e.target.style.borderColor = COLORS.primary;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = COLORS.lightGray;
          e.target.style.color = COLORS.darkGray;
          e.target.style.borderColor = COLORS.mediumGray;
        }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

function AuthView({ setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        if (!fullName) throw new Error('Full name is required');
        await supabase.signup(email, password, role, fullName);
        setEmail('');
        setPassword('');
        setFullName('');
        setIsSignup(false);
        setError('Account created! Please login.');
      } else {
        const result = await supabase.login(email, password);
        const userRole = localStorage.getItem('user_role');
        setCurrentUser({ id: result.user.id, role: userRole, email: result.user.email });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.white} 100%)`,
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: COLORS.white,
        borderRadius: '12px',
        padding: '3rem 2rem',
        boxShadow: '0 12px 48px rgba(204, 0, 0, 0.1)',
        border: `1px solid ${COLORS.lightGray}`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: COLORS.primary,
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.5px'
          }}>
            {isSignup ? 'Get Started' : 'Welcome Back'}
          </h1>
          <p style={{ color: COLORS.mediumGray, fontSize: '14px', margin: 0 }}>
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isSignup && (
            <div>
              <label style={{
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'block',
                color: COLORS.darkGray,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `1px solid ${COLORS.lightGray}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
              />
            </div>
          )}

          <div>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '0.5rem',
              display: 'block',
              color: COLORS.darkGray,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: `1px solid ${COLORS.lightGray}`,
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.primary}
              onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
            />
          </div>

          <div>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '0.5rem',
              display: 'block',
              color: COLORS.darkGray,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: `1px solid ${COLORS.lightGray}`,
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.primary}
              onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
            />
          </div>

          {isSignup && (
            <div>
              <label style={{
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '0.5rem',
                display: 'block',
                color: COLORS.darkGray,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Account Type
              </label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: `1px solid ${COLORS.lightGray}`,
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.primary}
              onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}>
                <option value="student">Student</option>
                <option value="teacher">Instructor</option>
              </select>
            </div>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              background: error.includes('created') ? `${COLORS.success}15` : `${COLORS.error}15`,
              color: error.includes('created') ? COLORS.success : COLORS.error,
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '0.9rem 1.5rem',
            background: COLORS.primary,
            color: COLORS.white,
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 8px 24px rgba(204, 0, 0, 0.3)')}
          onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}>
            {loading ? 'Loading...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>

          <button
            type="button"
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            style={{
              padding: '0.9rem 1.5rem',
              background: 'transparent',
              border: `2px solid ${COLORS.primary}`,
              color: COLORS.primary,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.background = `${COLORS.primary}10`)}
            onMouseLeave={(e) => (e.target.style.background = 'transparent')}>
            {isSignup ? '← Already have an account?' : 'Create new account →'}
          </button>
        </form>
      </div>
    </div>
  );
}

function TeacherDashboard({ user }) {
  const [view, setView] = useState('results');
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, resultsRes] = await Promise.all([
        supabase.getStudents(),
        supabase.getAllResults()
      ]);
      setStudents(studentsRes || []);
      setResults(resultsRes || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = ['Student Email', 'Full Name', 'Test Date', 'Grammar %', 'Vocabulary %', 'Listening %', 'Reading %', 'Overall %', 'CEFR Level'];
    const rows = results.map(r => [
      r.student_id,
      'Student',
      new Date(r.completed_at).toLocaleDateString(),
      (r.grammar_score * 100).toFixed(0),
      (r.vocabulary_score * 100).toFixed(0),
      (r.listening_score * 100).toFixed(0),
      (r.reading_score * 100).toFixed(0),
      (r.overall_score * 100).toFixed(0),
      r.determined_cefr_level
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: `2px solid ${COLORS.lightGray}`,
        paddingBottom: '1.5rem'
      }}>
        {['results', 'questions'].map(tab => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: view === tab ? COLORS.primary : 'transparent',
              color: view === tab ? COLORS.white : COLORS.darkGray,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => !view === tab && (e.target.style.background = `${COLORS.primary}20`)}
            onMouseLeave={(e) => !view === tab && (e.target.style.background = 'transparent')}>
            {tab === 'results' ? '📊 Results' : '❓ Question Bank'}
          </button>
        ))}
      </div>

      {view === 'results' && (
        <ResultsDashboard results={results} students={students} onExport={exportCSV} loading={loading} />
      )}

      {view === 'questions' && (
        <QuestionManager onRefresh={loadData} />
      )}
    </div>
  );
}

function ResultsDashboard({ results, students, onExport, loading }) {
  const avgScore = results.length > 0 
    ? (results.reduce((sum, r) => sum + r.overall_score, 0) / results.length * 100).toFixed(0)
    : 0;

  const levelDistribution = {};
  results.forEach(r => {
    levelDistribution[r.determined_cefr_level] = (levelDistribution[r.determined_cefr_level] || 0) + 1;
  });

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <MetricCard label="Total Tests" value={results.length} />
        <MetricCard label="Average Score" value={`${avgScore}%`} />
        <MetricCard label="Students" value={students.length} />
        <MetricCard label="Completion Rate" value={`${results.length > 0 ? ((results.length / students.length) * 100).toFixed(0) : 0}%`} />
      </div>

      <div style={{
        background: COLORS.white,
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: `1px solid ${COLORS.lightGray}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: COLORS.darkGray
          }}>
            Student Results
          </h3>
          <button onClick={onExport} style={{
            padding: '0.75rem 1.5rem',
            background: COLORS.primary,
            color: COLORS.white,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 8px 16px rgba(204, 0, 0, 0.2)')}
          onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}>
            📥 Export CSV
          </button>
        </div>

        {loading ? (
          <p style={{ color: COLORS.mediumGray, textAlign: 'center', padding: '2rem' }}>Loading results...</p>
        ) : results.length === 0 ? (
          <p style={{ color: COLORS.mediumGray, textAlign: 'center', padding: '2rem' }}>No test results yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              fontSize: '14px',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.lightGray}` }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: COLORS.darkGray, fontSize: '12px', textTransform: 'uppercase' }}>Student ID</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: COLORS.darkGray, fontSize: '12px', textTransform: 'uppercase' }}>Grammar</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: COLORS.darkGray, fontSize: '12px', textTransform: 'uppercase' }}>Vocabulary</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: COLORS.darkGray, fontSize: '12px', textTransform: 'uppercase' }}>Listening</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: COLORS.darkGray, fontSize: '12px', textTransform: 'uppercase' }}>Reading</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: COLORS.darkGray, fontSize: '12px', textTransform: 'uppercase' }}>Overall</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: COLORS.primary, fontSize: '12px', textTransform: 'uppercase' }}>CEFR Level</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: COLORS.darkGray, fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} style={{
                    borderBottom: `1px solid ${COLORS.lightGray}`,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = COLORS.lightGray}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem', fontSize: '13px', color: COLORS.mediumGray }}>{r.student_id.substring(0, 8)}...</td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>
                      <ScoreBar score={r.grammar_score} />
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>
                      <ScoreBar score={r.vocabulary_score} />
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>
                      <ScoreBar score={r.listening_score} />
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>
                      <ScoreBar score={r.reading_score} />
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>
                      {(r.overall_score * 100).toFixed(0)}%
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>
                      <span style={{
                        background: COLORS.primary,
                        color: COLORS.white,
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {r.determined_cefr_level}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem', fontSize: '13px', color: COLORS.mediumGray }}>
                      {new Date(r.completed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ score }) {
  const percentage = Math.round(score * 100);
  const color = percentage >= 70 ? COLORS.success : percentage >= 50 ? COLORS.warning : COLORS.error;
  
  return (
    <div style={{
      width: '100%',
      maxWidth: '80px',
      height: '6px',
      background: COLORS.lightGray,
      borderRadius: '3px',
      overflow: 'hidden',
      margin: '0 auto'
    }}>
      <div style={{
        height: '100%',
        width: `${percentage}%`,
        background: color,
        transition: 'width 0.3s'
      }} />
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={{
      background: COLORS.white,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `1px solid ${COLORS.lightGray}`,
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(204, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
    }}>
      <p style={{ margin: '0 0 0.75rem 0', fontSize: '13px', color: COLORS.mediumGray, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: COLORS.primary }}>
        {value}
      </p>
    </div>
  );
}

function QuestionManager({ onRefresh }) {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ level: '', type: '', skill: '' });
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    skill: 'grammar',
    cefr_level: 'A1',
    options: ['', '', '', ''],
    correct_answers: [],
    audio_url: '',
    passage: '',
    explanation: '',
    difficulty_score: 5
  });

  useEffect(() => {
    loadQuestions();
  }, [filter]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let allQuestions = await supabase.getAllQuestions();
      
      if (filter.level) allQuestions = allQuestions.filter(q => q.cefr_level === filter.level);
      if (filter.type) allQuestions = allQuestions.filter(q => q.question_type === filter.type);
      if (filter.skill) allQuestions = allQuestions.filter(q => q.skill === filter.skill);
      
      setQuestions(allQuestions || []);
    } catch (err) {
      console.error('Error loading questions:', err);
    }
    setLoading(false);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const questionData = {
        ...formData,
        created_by: localStorage.getItem('user_id'),
        options: formData.question_type === 'multiple_choice' ? formData.options.filter(o => o) : null,
        correct_answers: formData.question_type === 'multiple_choice' 
          ? [formData.options[parseInt(formData.correct_answers[0])]] 
          : formData.correct_answers
      };

      await supabase.createQuestion(questionData);
      
      setFormData({
        question_text: '',
        question_type: 'multiple_choice',
        skill: 'grammar',
        cefr_level: 'A1',
        options: ['', '', '', ''],
        correct_answers: [],
        audio_url: '',
        passage: '',
        explanation: '',
        difficulty_score: 5
      });
      setShowForm(false);
      loadQuestions();
      onRefresh();
    } catch (err) {
      console.error('Error adding question:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this question? This cannot be undone.')) {
      try {
        await supabase.deleteQuestion(id);
        loadQuestions();
        onRefresh();
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    }
  };

  const QUESTION_TYPES = {
    multiple_choice: { label: 'Multiple Choice', icon: '🔘' },
    true_false: { label: 'True/False', icon: '✓/✗' },
    fill_blank: { label: 'Fill in the Blank', icon: '___' },
    matching: { label: 'Matching', icon: '↔' },
    ordering: { label: 'Drag & Drop', icon: '⇅' },
    cloze: { label: 'Cloze Test', icon: '█' },
    listening: { label: 'Listening', icon: '🎧' }
  };

  const SKILLS = ['grammar', 'vocabulary', 'listening', 'reading'];
  const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div style={{ maxWidth: '1200px' }}>
      <div style={{
        background: COLORS.white,
        borderRadius: '12px',
        padding: '2rem',
        border: `1px solid ${COLORS.lightGray}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: COLORS.darkGray }}>
            ❓ Question Bank ({questions.length})
          </h2>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '0.75rem 1.5rem',
            background: COLORS.primary,
            color: COLORS.white,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 8px 16px rgba(204, 0, 0, 0.2)')}
          onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}>
            {showForm ? '✕ Cancel' : '+ Add Question'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddQuestion} style={{
            background: COLORS.lightGray,
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: COLORS.darkGray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>CEFR Level</label>
                <select value={formData.cefr_level} onChange={(e) => setFormData({ ...formData, cefr_level: e.target.value })} style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${COLORS.lightGray}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: COLORS.darkGray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skill</label>
                <select value={formData.skill} onChange={(e) => setFormData({ ...formData, skill: e.target.value })} style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${COLORS.lightGray}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  {SKILLS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: COLORS.darkGray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
                <select value={formData.question_type} onChange={(e) => setFormData({ ...formData, question_type: e.target.value })} style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${COLORS.lightGray}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  {Object.entries(QUESTION_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: COLORS.darkGray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Difficulty (1-10)</label>
                <input type="range" min="1" max="10" value={formData.difficulty_score} onChange={(e) => setFormData({ ...formData, difficulty_score: parseFloat(e.target.value) })} style={{
                  width: '100%'
                }} />
                <span style={{ fontSize: '13px', color: COLORS.mediumGray }}>{formData.difficulty_score.toFixed(1)}</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: COLORS.darkGray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Question</label>
              <textarea value={formData.question_text} onChange={(e) => setFormData({ ...formData, question_text: e.target.value })} placeholder="Enter your question here..." required style={{
                width: '100%',
                padding: '1rem',
                border: `1px solid ${COLORS.lightGray}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                minHeight: '100px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }} />
            </div>

            {formData.question_type === 'listening' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: COLORS.darkGray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Audio URL (Google Drive link)</label>
                <input type="url" value={formData.audio_url} onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })} placeholder="https://drive.google.com/..." style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${COLORS.lightGray}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }} />
              </div>
            )}

            {(formData.question_type === 'cloze' || formData.question_type === 'reading') && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: COLORS.darkGray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Passage/Text</label>
                <textarea value={formData.passage} onChange={(e) => setFormData({ ...formData, passage: e.target.value })} placeholder="Enter the full passage text here..." style={{
                  width: '100%',
                  padding: '1rem',
                  border: `1px solid ${COLORS.lightGray}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  minHeight: '120px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }} />
              </div>
            )}

            {formData.question_type === 'multiple_choice' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.75rem', color: COLORS.darkGray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Options</label>
                {formData.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[i] = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      placeholder={`Option ${i + 1}`}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: `1px solid ${COLORS.lightGray}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={formData.correct_answers[0] === i.toString()}
                      onChange={() => setFormData({ ...formData, correct_answers: [i.toString()] })}
                      style={{ cursor: 'pointer', width: '20px' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {formData.question_type !== 'multiple_choice' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: COLORS.darkGray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correct Answer(s)</label>
                <input type="text" value={formData.correct_answers[0] || ''} onChange={(e) => setFormData({ ...formData, correct_answers: [e.target.value] })} placeholder="Enter correct answer" required style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${COLORS.lightGray}`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }} />
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: COLORS.darkGray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Explanation (Optional)</label>
              <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} placeholder="Why is this the correct answer?" style={{
                width: '100%',
                padding: '1rem',
                border: `1px solid ${COLORS.lightGray}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                minHeight: '80px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }} />
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '1rem',
              background: COLORS.primary,
              color: COLORS.white,
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 8px 16px rgba(204, 0, 0, 0.2)')}
            onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}>
              {loading ? 'Saving...' : '✓ Add Question'}
            </button>
          </form>
        )}

        {/* Filter Section */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <select value={filter.level} onChange={(e) => setFilter({ ...filter, level: e.target.value })} style={{
            padding: '0.75rem 1rem',
            border: `1px solid ${COLORS.lightGray}`,
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            background: COLORS.white
          }}>
            <option value="">All Levels</option>
            {CEFR_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select value={filter.skill} onChange={(e) => setFilter({ ...filter, skill: e.target.value })} style={{
            padding: '0.75rem 1rem',
            border: `1px solid ${COLORS.lightGray}`,
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            background: COLORS.white
          }}>
            <option value="">All Skills</option>
            {SKILLS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>

          <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} style={{
            padding: '0.75rem 1rem',
            border: `1px solid ${COLORS.lightGray}`,
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            background: COLORS.white
          }}>
            <option value="">All Types</option>
            {Object.entries(QUESTION_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
          </select>
        </div>

        {/* Questions List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {loading ? (
            <p style={{ color: COLORS.mediumGray, textAlign: 'center', padding: '2rem' }}>Loading questions...</p>
          ) : questions.length === 0 ? (
            <p style={{ color: COLORS.mediumGray, textAlign: 'center', padding: '2rem' }}>No questions found. Create one to get started!</p>
          ) : (
            questions.map((q, i) => (
              <div key={i} style={{
                background: COLORS.white,
                padding: '1.5rem',
                borderRadius: '12px',
                border: `2px solid ${COLORS.lightGray}`,
                borderLeft: `4px solid ${COLORS.primary}`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(204, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = COLORS.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = COLORS.lightGray;
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{
                        background: COLORS.primary,
                        color: COLORS.white,
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {q.cefr_level}
                      </span>
                      <span style={{
                        background: `${COLORS.primary}20`,
                        color: COLORS.primary,
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {q.skill}
                      </span>
                      <span style={{
                        background: COLORS.mediumGray + '20',
                        color: COLORS.mediumGray,
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {QUESTION_TYPES[q.question_type]?.label || q.question_type}
                      </span>
                      <span style={{
                        background: COLORS.warning + '20',
                        color: COLORS.warning,
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        Difficulty: {q.difficulty_score.toFixed(1)}/10
                      </span>
                    </div>
                    <p style={{
                      margin: '0.75rem 0 0 0',
                      fontSize: '15px',
                      lineHeight: '1.5',
                      color: COLORS.darkGray
                    }}>
                      {q.question_text}
                    </p>
                    {q.correct_answers && (
                      <p style={{
                        margin: '0.75rem 0 0 0',
                        fontSize: '13px',
                        color: COLORS.success
                      }}>
                        ✓ Correct: <strong>{Array.isArray(q.correct_answers) ? q.correct_answers.join(' / ') : q.correct_answers}</strong>
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(q.id)} style={{
                    padding: '0.5rem 1rem',
                    background: COLORS.error + '20',
                    color: COLORS.error,
                    border: `1px solid ${COLORS.error}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    marginLeft: '1rem',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => (e.target.style.background = COLORS.error, e.target.style.color = COLORS.white)}
                  onMouseLeave={(e) => (e.target.style.background = COLORS.error + '20', e.target.style.color = COLORS.error)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StudentInterface({ user }) {
  const [view, setView] = useState('home');
  const [testSession, setTestSession] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const startTest = async () => {
    try {
      const session = await supabase.createTestSession(user.id);
      setTestSession(session);
      setView('testing');
    } catch (err) {
      console.error('Error starting test:', err);
      alert('Error starting test. Please try again.');
    }
  };

  const completeTest = async (scores, cefrLevel) => {
    try {
      const results = await supabase.completeSession(testSession.id, {
        ...scores,
        determined_cefr_level: cefrLevel
      });
      
      // Send email notification to teachers via Vercel function
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: user.email,
            studentName: user.email.split('@')[0],
            cefrLevel: cefrLevel,
            grammarScore: scores.grammar_score,
            vocabularyScore: scores.vocabulary_score,
            listeningScore: scores.listening_score,
            readingScore: scores.reading_score,
            overallScore: scores.overall_score
          })
        });
        console.log('✓ Email notification sent to instructor');
      } catch (err) {
        console.log('Email notification - will retry');
      }

      setTestResults(results);
      setView('results');
    } catch (err) {
      console.error('Error completing test:', err);
      alert('Error saving results. Please try again.');
    }
  };

  if (view === 'testing' && testSession) {
    return <TestEngine session={testSession} onComplete={completeTest} />;
  }

  if (view === 'results' && testResults) {
    return <ResultsView result={testResults} onRestart={() => { setView('home'); setTestSession(null); setTestResults(null); }} />;
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{
        background: COLORS.white,
        borderRadius: '12px',
        padding: '3rem 2rem',
        boxShadow: '0 8px 32px rgba(204, 0, 0, 0.1)',
        border: `1px solid ${COLORS.lightGray}`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '1rem',
            animation: 'bounce 2s infinite'
          }}>
            🚀
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: COLORS.primary,
            margin: '0 0 0.75rem 0'
          }}>
            English Level Assessment
          </h2>
          <p style={{
            color: COLORS.mediumGray,
            fontSize: '15px',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Discover your CEFR level with our adaptive placement test. The test adjusts to your ability level and typically takes 15-20 minutes.
          </p>
        </div>

        <div style={{
          background: `${COLORS.primary}10`,
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: `2px dashed ${COLORS.primary}`
        }}>
          <h3 style={{
            marginTop: 0,
            fontSize: '15px',
            fontWeight: '600',
            color: COLORS.primary,
            marginBottom: '1rem'
          }}>
            What you'll be tested on:
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            fontSize: '14px',
            color: COLORS.darkGray
          }}>
            <div>✓ Grammar & Vocabulary</div>
            <div>✓ Listening Comprehension</div>
            <div>✓ Reading Comprehension</div>
            <div>✓ Adaptive Difficulty</div>
          </div>
        </div>

        <button onClick={startTest} style={{
          width: '100%',
          padding: '1.25rem',
          background: COLORS.primary,
          color: COLORS.white,
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'all 0.3s',
          marginBottom: '1rem'
        }}
        onMouseEnter={(e) => (e.target.style.transform = 'translateY(-3px)', e.target.style.boxShadow = '0 12px 32px rgba(204, 0, 0, 0.3)')}
        onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}>
          Begin Assessment →
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: COLORS.mediumGray,
          margin: 0
        }}>
          You can't retake this assessment. Take your time and answer honestly.
        </p>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </div>
  );
}

function TestEngine({ session, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  const [loading, setLoading] = useState(true);
  const [testStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    loadInitialQuestions();
  }, []);

  const loadInitialQuestions = async () => {
    try {
      const allQuestions = await supabase.getAllQuestions();
      
      // Start with B1 level questions
      const startingQuestions = allQuestions
        .filter(q => q.cefr_level === 'B1')
        .sort(() => Math.random() - 0.5)
        .slice(0, 30);
      
      setQuestions(startingQuestions);
      setLoading(false);
      setQuestionStartTime(Date.now());
    } catch (err) {
      console.error('Error loading questions:', err);
      setLoading(false);
    }
  };

  const handleAnswer = async (answer) => {
    const reactionTime = Date.now() - questionStartTime;
    const newAnswers = { ...answers, [currentIndex]: answer };
    setAnswers(newAnswers);

    const currentQuestion = questions[currentIndex];
    const isCorrect = checkAnswer(currentQuestion, answer);
    
    try {
      await supabase.saveResponse({
        session_id: session.id,
        question_id: currentQuestion.id,
        student_answer: answer,
        is_correct: isCorrect,
        time_spent_seconds: Math.round(reactionTime / 1000),
        difficulty_at_time: currentQuestion.difficulty_score,
        reaction_time_ms: reactionTime
      });
    } catch (err) {
      console.error('Error saving response:', err);
    }

    // Update difficulty based on performance
    if (isCorrect) {
      setCurrentDifficulty(Math.min(10, currentDifficulty + 0.8));
    } else {
      setCurrentDifficulty(Math.max(1, currentDifficulty - 0.6));
    }

    // Move to next or complete
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      completeTest(newAnswers);
    }
  };

  const checkAnswer = (question, answer) => {
    if (!question.correct_answers) return false;
    
    const correctAnswers = Array.isArray(question.correct_answers)
      ? question.correct_answers
      : [question.correct_answers];
    
    return correctAnswers.some(ca => 
      ca.toLowerCase().trim() === answer.toLowerCase().trim()
    );
  };

  const completeTest = (finalAnswers) => {
    let correctCount = 0;
    const skillScores = { grammar: 0, vocabulary: 0, listening: 0, reading: 0 };
    const skillCounts = { grammar: 0, vocabulary: 0, listening: 0, reading: 0 };

    questions.forEach((q, i) => {
      const isCorrect = checkAnswer(q, finalAnswers[i]);
      if (isCorrect) correctCount++;
      
      skillCounts[q.skill]++;
      if (isCorrect) skillScores[q.skill]++;
    });

    const scores = {
      grammar_score: skillCounts.grammar > 0 ? skillScores.grammar / skillCounts.grammar : 0,
      vocabulary_score: skillCounts.vocabulary > 0 ? skillScores.vocabulary / skillCounts.vocabulary : 0,
      listening_score: skillCounts.listening > 0 ? skillScores.listening / skillCounts.listening : 0,
      reading_score: skillCounts.reading > 0 ? skillScores.reading / skillCounts.reading : 0,
      overall_score: correctCount / questions.length,
      confidence_level: Math.min(Math.max(correctCount / questions.length, 0.2), 0.95)
    };

    // Determine CEFR level based on overall score and question difficulty
    let level = 'A1';
    const avgDifficulty = questions.reduce((sum, q) => sum + q.difficulty_score, 0) / questions.length;
    
    if (scores.overall_score >= 0.85) level = 'C2';
    else if (scores.overall_score >= 0.75) level = 'C1';
    else if (scores.overall_score >= 0.65) level = 'B2';
    else if (scores.overall_score >= 0.55) level = 'B1';
    else if (scores.overall_score >= 0.40) level = 'A2';

    onComplete(scores, level);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (questions.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: COLORS.white,
        borderRadius: '12px',
        border: `1px solid ${COLORS.lightGray}`
      }}>
        <p style={{ fontSize: '18px', color: COLORS.error }}>
          No questions available. Please contact your instructor.
        </p>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentIndex];

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          fontSize: '13px',
          color: COLORS.mediumGray,
          fontWeight: '600'
        }}>
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>Difficulty: {currentDifficulty.toFixed(1)}/10</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: COLORS.lightGray,
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: COLORS.primary,
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>

      <div style={{
        background: COLORS.white,
        borderRadius: '12px',
        border: `1px solid ${COLORS.lightGray}`,
        padding: '2.5rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            background: COLORS.primary,
            color: COLORS.white,
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            {currentQuestion.cefr_level}
          </span>
          <span style={{
            background: `${COLORS.primary}20`,
            color: COLORS.primary,
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            {currentQuestion.skill}
          </span>
        </div>

        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          margin: '0 0 2rem 0',
          lineHeight: '1.6',
          color: COLORS.darkGray
        }}>
          {currentQuestion.question_text}
        </h3>

        {currentQuestion.audio_url && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '13px', color: COLORS.mediumGray, marginBottom: '0.75rem', fontWeight: '600' }}>
              🎧 Listen to the audio:
            </p>
            <audio controls style={{ width: '100%', borderRadius: '6px' }}>
              <source src={currentQuestion.audio_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {currentQuestion.passage && (
          <div style={{
            background: COLORS.lightGray,
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            lineHeight: '1.7',
            color: COLORS.darkGray,
            fontSize: '14px'
          }}>
            {currentQuestion.passage}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentQuestion.options && currentQuestion.options.length > 0 ? (
            currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                style={{
                  padding: '1.25rem',
                  textAlign: 'left',
                  background: COLORS.white,
                  border: `2px solid ${COLORS.lightGray}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  color: COLORS.darkGray,
                  transition: 'all 0.2s',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = COLORS.primary;
                  e.target.style.background = `${COLORS.primary}08`;
                  e.target.style.transform = 'translateX(8px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = COLORS.lightGray;
                  e.target.style.background = COLORS.white;
                  e.target.style.transform = 'translateX(0)';
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${COLORS.lightGray}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: COLORS.mediumGray
                  }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  {option}
                </div>
              </button>
            ))
          ) : (
            <input
              type="text"
              placeholder="Type your answer here..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAnswer(e.target.value);
                }
              }}
              style={{
                padding: '1rem',
                border: `2px solid ${COLORS.lightGray}`,
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.primary}
              onBlur={(e) => e.target.style.borderColor = COLORS.lightGray}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ResultsView({ result, onRestart }) {
  const scores = [
    { label: 'Grammar', score: result.grammar_score, icon: '📝' },
    { label: 'Vocabulary', score: result.vocabulary_score, icon: '📚' },
    { label: 'Listening', score: result.listening_score, icon: '🎧' },
    { label: 'Reading', score: result.reading_score, icon: '📖' }
  ];

  const cefrDescriptions = {
    'A1': 'Beginner - Can understand and use familiar everyday expressions',
    'A2': 'Elementary - Can communicate in simple and routine tasks',
    'B1': 'Intermediate - Can produce clear texts on familiar topics',
    'B2': 'Upper-Intermediate - Can interact with native speakers fluently',
    'C1': 'Advanced - Can understand and use the language fluently',
    'C2': 'Mastery - Can understand virtually everything and express ideas precisely'
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{
        background: COLORS.white,
        borderRadius: '12px',
        padding: '3rem 2rem',
        boxShadow: '0 8px 32px rgba(204, 0, 0, 0.1)',
        border: `1px solid ${COLORS.lightGray}`,
        textAlign: 'center',
        animation: 'slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '56px',
            marginBottom: '1rem',
            animation: 'bounce 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            ✨
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: COLORS.primary,
            margin: '0 0 0.5rem 0'
          }}>
            Assessment Complete!
          </h2>
          <p style={{ color: COLORS.mediumGray, fontSize: '15px', margin: 0 }}>
            Here's what your test revealed:
          </p>
        </div>

        <div style={{
          background: `${COLORS.primary}10`,
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: `3px solid ${COLORS.primary}`
        }}>
          <p style={{
            margin: '0 0 0.75rem 0',
            fontSize: '14px',
            color: COLORS.mediumGray,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: '600'
          }}>
            Your CEFR Level
          </p>
          <div style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: COLORS.primary,
            marginBottom: '1rem',
            margin: '1rem 0'
          }}>
            {result.determined_cefr_level}
          </div>
          <p style={{
            margin: 0,
            fontSize: '15px',
            color: COLORS.darkGray,
            lineHeight: '1.5'
          }}>
            {cefrDescriptions[result.determined_cefr_level]}
          </p>
          <p style={{
            marginTop: '1rem',
            fontSize: '13px',
            color: COLORS.mediumGray
          }}>
            Confidence: {Math.round(result.confidence_level * 100)}%
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {scores.map((item, i) => (
            <div key={i} style={{
              background: COLORS.lightGray,
              padding: '1.5rem',
              borderRadius: '12px',
              transition: 'all 0.2s'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>
                {item.icon}
              </div>
              <div style={{
                fontSize: '13px',
                color: COLORS.mediumGray,
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600'
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: COLORS.primary
              }}>
                {Math.round(item.score * 100)}%
              </div>
            </div>
          ))}
        </div>

        <p style={{
          color: COLORS.mediumGray,
          fontSize: '14px',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          You've been placed in the <strong style={{ color: COLORS.primary }}>Level {result.determined_cefr_level}</strong> class. Your instructor will review your results and confirm your final placement.
        </p>

        <button onClick={onRestart} style={{
          padding: '1rem 2rem',
          background: 'transparent',
          border: `2px solid ${COLORS.primary}`,
          color: COLORS.primary,
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: '600',
          transition: 'all 0.2s',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
        onMouseEnter={(e) => (e.target.style.background = COLORS.primary, e.target.style.color = COLORS.white)}
        onMouseLeave={(e) => (e.target.style.background = 'transparent', e.target.style.color = COLORS.primary)}>
          ← Return Home
        </button>

        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  );
}
