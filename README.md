# 📚 CEFR Placement Test System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [CAT (Computer Adaptive Testing) Methodology](#cat-methodology)
3. [Architecture & Technology](#architecture--technology)
4. [Core Algorithm](#core-algorithm)
5. [Test Flow](#test-flow)
6. [Data Storage & Security](#data-storage--security)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## System Overview

### **What is This System?**

The CEFR Placement Test is a **Computer Adaptive Testing (CAT)** system designed to assess English language proficiency and assign appropriate CEFR levels (A1-C2) to students.

**Key Features:**
- ✅ **Adaptive Difficulty** - Questions adjust to student ability in real-time
- ✅ **30-Question Test** - Always exactly 30 questions per student
- ✅ **Professional Results** - Email notifications with detailed breakdown
- ✅ **Teacher Dashboard** - Approve results, manage question bank, track analytics
- ✅ **Anti-Cheating Measures** - Disable copy-paste, disable Chrome translation
- ✅ **Real-time Analytics** - Time tracking, reaction time, difficulty metrics

### **Who Uses It?**

- **Students**: Take the CEFR placement test
- **Teachers**: Review results, approve/reject, manage question bank
- **Admins**: Monitor test administration

---

## CAT Methodology

### **What is Computer Adaptive Testing?**

CAT is an intelligent assessment method where:
1. **Question difficulty adjusts** based on student performance
2. **Each answer influences** the next question's difficulty
3. **No two students** get exactly the same questions
4. **Fair assessment** - Everyone challenged at their level

### **Advantages of CAT**

✅ **Efficient** - 30 questions instead of 100+ (saves time)
✅ **Accurate** - Pinpoints exact proficiency level
✅ **Engaging** - Always appropriate challenge
✅ **Fair** - No ceiling/floor effects
✅ **Personalized** - Adapts to each student

### **Real-World Examples**

**Example 1: Fast Learner**
```
Q1: Easy (difficulty 4)     → Correct
Q2: Medium (difficulty 5)   → Correct
Q3: Hard (difficulty 7)     → Correct
Q4: Very Hard (difficulty 8) → Correct
→ Gets increasingly harder questions
→ Final level: B2/C1
```

**Example 2: Struggling Student**
```
Q1: Medium (difficulty 5)   → Wrong
Q2: Easy (difficulty 4)     → Wrong
Q3: Very Easy (difficulty 2) → Correct
Q4: Easy (difficulty 3)     → Correct
→ Gets easier questions
→ Final level: A1/A2
```

### **CEFR Reference**

The **Common European Framework of Reference (CEFR)** has 6 levels:

| Level | Proficiency | Score Range | Description |
|-------|-------------|-------------|-------------|
| A1 | Beginner | 0-39% | Can introduce themselves, basic sentences |
| A2 | Elementary | 40-54% | Can handle simple interactions |
| B1 | Intermediate | 55-64% | Can discuss familiar topics |
| B2 | Upper Intermediate | 65-74% | Fluent in most situations |
| C1 | Proficiency | 75-84% | Near-native speaker level |
| C2 | Mastery | 85-100% | Complete mastery of English |

---

## Architecture & Technology

### **System Stack**

```
┌─────────────────────────────────────┐
│    Frontend (React/Single Page)      │
│    - Student Test Interface          │
│    - Teacher Dashboard               │
│    - Login/Registration              │
└──────────────┬──────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────┐
│   Vercel Deployment (Node.js/API)   │
│   - Email Function (api/send-email) │
│   - Serverless Functions            │
└──────────────┬──────────────────────┘
               │ REST API
┌──────────────▼──────────────────────┐
│   Supabase (PostgreSQL)              │
│   - users, students, questions       │
│   - test_results, test_responses     │
│   - Authentication (Supabase Auth)   │
└──────────────────────────────────────┘
```

### **Technology Choices**

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | React | Fast, interactive, single-page app |
| Backend | Vercel Functions | Serverless, auto-scaling, free tier |
| Database | PostgreSQL (Supabase) | Reliable, real-time, easy to query |
| Email | Resend API | Clean API, high deliverability |
| Hosting | Vercel | GitHub integration, auto-deploy |
| Auth | Supabase Auth | Built-in JWT, secure, simple |

### **Database Schema**

**users** table:
```sql
id (UUID)           -- Auth user ID
email (VARCHAR)     -- Login email
role (VARCHAR)      -- 'student', 'teacher', 'admin'
full_name (VARCHAR) -- Display name
```

**students** table:
```sql
id (UUID)              -- Student record ID
user_id (UUID FK)      -- Links to users table
email (VARCHAR)        -- Student email
full_name (VARCHAR)    -- Full name
passport_id (VARCHAR)  -- ID/Passport
country (VARCHAR)      -- Country of origin
created_at (TIMESTAMP) -- Registration date
```

**questions** table:
```sql
id (UUID)
question_text (TEXT)        -- The question
question_type (VARCHAR)     -- 'multiple_choice', 'fill_blank', etc.
skill (VARCHAR)             -- 'grammar', 'vocabulary', 'reading', 'listening'
cefr_level (VARCHAR)        -- A1, A2, B1, B2 (hint for difficulty)
difficulty_score (FLOAT)    -- 1-10 scale
options (JSONB)             -- ["Option A", "Option B", ...]
correct_answers (JSONB)     -- ["Option A"] or ["Option B"]
audio_url (VARCHAR NULL)    -- Link to MP3 for listening
passage (TEXT NULL)         -- Article text for reading
explanation (TEXT)          -- Why this is correct
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**test_results** table:
```sql
id (UUID)
student_id (UUID FK)        -- Links to students table
student_name (VARCHAR)      -- Copy of student name
student_passport (VARCHAR)  -- Copy of passport ID
overall_score (FLOAT)       -- 0-100 percentage
determined_cefr_level (VARCHAR) -- A1 through C2
completed_at (TIMESTAMP)    -- When test finished
is_approved (BOOLEAN)       -- Teacher approved?
teacher_comment (TEXT)      -- Optional comment
approved_at (TIMESTAMP)     -- When approved
approved_by (UUID FK)       -- Which teacher approved
student_responses (TEXT)    -- JSON array of responses
notes (TEXT)               -- Additional notes
created_at (TIMESTAMP)
```

**test_responses** table:
```sql
id (UUID)
test_result_id (UUID FK)    -- Links to test_results
question_id (UUID FK)       -- Links to questions
student_answer (VARCHAR)    -- What student chose
is_correct (BOOLEAN)        -- Right or wrong?
time_spent_seconds (INT)    -- How long spent (seconds)
reaction_time_ms (INT)      -- Initial response latency
difficulty_at_time (FLOAT)  -- Question difficulty level
created_at (TIMESTAMP)
```

---

## Core Algorithm

### **The Adaptive Difficulty Algorithm**

**Step 1: Initialize**
```
Starting difficulty = 5 (scale 1-10, middle value)
Select random question at difficulty ~5
```

**Step 2: Student Answers**
```
IF answer is correct:
    difficulty += 0.8    (easier → harder)
    (encourages progression to harder material)

IF answer is wrong:
    difficulty -= 0.6    (harder → easier)
    (penalizes less to recover faster)
```

**Why asymmetric (+0.8 vs -0.6)?**
- Correct answers are harder to achieve
- Wrong answers deserve less penalty
- Promotes learning without excessive struggle

**Step 3: Select Next Question**
```
Acceptable range = [current_difficulty - 1.5, current_difficulty + 1.5]

Find all unanswered questions within this range
IF suitable questions exist:
    Return random question from suitable list
ELSE:
    Return any unanswered question

This prevents:
- Questions too easy (discourages)
- Questions too hard (frustrates)
```

**Step 4: Repeat for 30 Questions**
```
For each of 30 questions:
    Display question
    Student answers
    Calculate new difficulty
    Select next question
    Move to next

After 30 questions:
    Calculate final score = (correct answers / 30) * 100
    Determine CEFR level based on score
    Save results
    Notify teacher for review
```

### **Score Calculation**

```javascript
Final Score = (Number of Correct Answers / 30) × 100

Examples:
- 12 correct out of 30 = 40% = A2 level
- 18 correct out of 30 = 60% = B1 level
- 24 correct out of 30 = 80% = C1 level
```

### **CEFR Level Mapping**

```javascript
if (percentage >= 85) → C2 (Mastery)
if (percentage >= 75) → C1 (Proficiency)
if (percentage >= 65) → B2 (Upper Intermediate)
if (percentage >= 55) → B1 (Intermediate)
if (percentage >= 40) → A2 (Elementary)
else                  → A1 (Beginner)
```

### **Timing Metrics**

**Time Spent Per Question**
```
Measured: Date.now() when question loads → Date.now() when answered
Stored: In seconds, rounded
Use: Identify fast/slow responders
```

**Reaction Time**
```
Estimated: ~15% of total time spent
Capped at: 5 seconds
Use: Measure cognitive load/confidence
```

---

## Test Flow

### **Complete Student Journey**

```
1. REGISTRATION
   ├─ Email & Password
   ├─ Full Name
   ├─ Passport/ID
   ├─ Country
   └─ Registration Code (PREMIUM2024)

2. LOGIN
   ├─ Email & Password
   └─ Lands on test intro page

3. TEST INITIALIZATION
   ├─ Start button → Test begins
   ├─ Set difficulty = 5
   ├─ Load random question at difficulty ~5
   └─ Start elapsed time timer

4. TEST QUESTIONS (30 total)
   For each question:
   ├─ Display question (with audio/passage if applicable)
   ├─ Student clicks answer
   ├─ Calculate: time spent, reaction time
   ├─ Calculate: new difficulty
   ├─ Select next question
   └─ Auto-advance to next

5. TEST COMPLETION
   ├─ After 30 questions
   ├─ Calculate score (%)
   ├─ Determine CEFR level
   ├─ Set status: "Pending Teacher Approval"
   └─ Display confirmation message

6. TEACHER REVIEW
   ├─ Teacher sees result in "Pending" tab
   ├─ Click "Review" to see details
   ├─ View: Name, Passport, Country, Score, Level
   ├─ View: Question-by-question breakdown
   ├─ Optional: Add comment
   └─ Click "Approve & Send Email"

7. EMAIL SENT
   ├─ Student receives email with results
   ├─ Email shows: CEFR level, score, breakdown
   ├─ Email includes: Teacher's comment (if any)
   └─ Result moved to "Approved" tab

8. RESULT STORAGE
   ├─ Saved in test_results table
   ├─ All responses saved in test_responses
   ├─ Timing metrics stored
   ├─ Difficulty at time of answer stored
   └─ Teacher comment stored
```

### **Safety Features**

During the test, students CANNOT:
- ❌ Copy question text (disabled copy-paste)
- ❌ Select text (user-select: none)
- ❌ Right-click (context menu disabled)
- ❌ Use Chrome translation (meta tag prevents it)

Students CAN:
- ✅ Click answer buttons
- ✅ Listen to audio
- ✅ Read passages
- ✅ See progress/timer

---

## Data Storage & Security

### **How Data is Stored**

```
Test Response Object (stored as JSON):
{
  question_id: "uuid-123",
  student_answer: "Option B",
  is_correct: true,
  time_spent_seconds: 45,
  reaction_time_ms: 1250,
  difficulty_at_time: 6.8,
  timestamp: "2024-01-15T10:30:00Z"
}

All 30 responses stored in test_results.student_responses (TEXT/JSON)
```

### **Security & Privacy**

✅ **Supabase Row Level Security (RLS)** - Disabled for simplicity (single institution)
✅ **HTTPS Only** - All communication encrypted
✅ **Password Hashing** - Supabase handles securely
✅ **JWT Tokens** - Session management
✅ **No PII in Logs** - Passwords never logged
✅ **Email Privacy** - Results sent only to approved email
✅ **Teacher Authorization** - Only approved teachers can approve results

### **Data Retention**

- ✅ Student accounts: Kept indefinitely
- ✅ Test results: Kept indefinitely (historical record)
- ✅ Test responses: Kept indefinitely (audit trail)
- ✅ Deleted accounts: Data soft-deleted (privacy)

---

## Deployment Guide

### **Prerequisites**

- GitHub account
- Vercel account (free)
- Supabase account (free)
- Resend account (free tier)

### **Initial Setup (One-Time)**

1. **Create Supabase Project**
   ```
   1. Go to https://supabase.com
   2. Create new project
   3. Get Project URL and Anon Key
   4. Run SQL migrations to create tables
   ```

2. **Create Vercel Project**
   ```
   1. Go to https://vercel.com
   2. Connect GitHub repository
   3. Auto-deploy on push
   4. Add environment variables:
      - SUPABASE_URL
      - SUPABASE_ANON_KEY
      - RESEND_API_KEY
   ```

3. **Configure Resend**
   ```
   1. Go to https://resend.com
   2. Get API key
   3. Verify sender email (test@premium.edu.my)
   4. Add environment variable in Vercel
   ```

### **GitHub Workflow**

```
1. Clone repository:
   git clone https://github.com/tankkagemaru/premiumPlacementTest.git

2. Make changes locally:
   Edit src/App.jsx
   Edit api/send-email.js
   etc.

3. Commit and push:
   git add .
   git commit -m "Description of changes"
   git push

4. Vercel auto-deploys:
   GitHub push → Vercel webhook → Build & Deploy
   Live update in 2-3 minutes
```

### **Environment Variables**

Create `.env.local` in project root:

```
REACT_APP_SUPABASE_URL=https://nitxboxvkktcgkkkbrec.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
RESEND_API_KEY=re_C62P4y...
```

In Vercel, set these in Project Settings → Environment Variables.

---

## Troubleshooting & FAQ

### **Q: Email not sending**

**A:** Check these in order:
1. Is Resend API key in Vercel environment variables?
2. Is the sender email verified in Resend dashboard?
3. Is student email being passed correctly?
4. Check Vercel logs for error messages

**Fix:**
```bash
# Check Vercel logs
vercel logs

# Test email sending manually
curl -X POST https://premium-placement-test.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"studentEmail":"test@example.com",...}'
```

---

### **Q: Questions loading slowly**

**A:** Likely causes:
1. Supabase query slow (too many questions)
2. Poor network connection
3. Filter/sort taking too long

**Fix:**
```javascript
// Add pagination:
// Load questions in batches of 100
// Only fetch when needed

// Or add caching:
// localStorage to cache questions locally
// Reduce database queries
```

---

### **Q: Student stuck on question**

**A:** Refresh page doesn't restart test (browser-side state lost).

**Fix:**
```
1. Close test page completely
2. Login again
3. Start fresh test

Data from incomplete test not saved (good for students)
```

---

### **Q: Results showing wrong CEFR level**

**A:** Check score calculation:
```
1. Open test result review modal
2. Count "✓" correct answers
3. Calculate: correct / 30 * 100
4. Match against CEFR ranges

If still wrong, check determineCEFRLevel function:
  if (score >= 85) return 'C2'  // Is this correct?
  if (score >= 75) return 'C1'  // Adjust if needed
  ...
```

---

### **Q: Can I customize the questions?**

**A:** Yes! Two methods:

**Method 1: Upload via Python Script**
```bash
python upload_questions.py --csv questions.csv
```

**Method 2: Use Question Manager in Teacher Dashboard**
```
Teacher → Questions tab → + Add New Question
Edit form appears → Fill in details → Save
```

Questions are stored in Supabase `questions` table.

---

### **Q: How do I back up data?**

**A:** Supabase provides:
```
1. Automatic daily backups (free)
2. Manual backups via Supabase dashboard
3. Export to CSV/JSON via CLI

Command to export:
supabase db dump --file backup.sql
```

---

### **Q: Can students retake the test?**

**A:** Currently: Once per account
```
Why? Prevents gaming the system

To allow retakes:
1. Remove the check: if (testState === 'pending')
2. Let students click "Start New Test"
3. Keep all results for historical record
```

---

### **Q: How do I change the test length (30 questions)?**

**A:** Edit `App.jsx`:

```javascript
// Find this line in StudentTest component:
if (newResponses.length >= 30) {  // Change 30 to desired number

// Example: 50 question test
if (newResponses.length >= 50) {

// Then update progress display:
<div className="progress-text">{userResponses.length} of 50 Questions</div>
```

---

### **Q: How do I adjust difficulty scaling?**

**A:** Edit `calculateDifficulty` function:

```javascript
// Current: +0.8 correct, -0.6 wrong
difficulty += r.is_correct ? 0.8 : -0.6;

// More aggressive adaptation:
difficulty += r.is_correct ? 1.0 : -0.5;  // Climb faster, fall slower

// Less aggressive:
difficulty += r.is_correct ? 0.5 : -0.5;  // Symmetric
```

---

### **Q: What if Supabase is down?**

**A:** System goes offline:
```
- Students see: "Connection error"
- Cannot save test results
- Results lost if not saved

Recovery:
1. Wait for Supabase to recover
2. Students retake test
3. Use Supabase backup if available
```

**Mitigation:**
- Switch to another database provider
- Implement local caching
- Use database replication

---

### **Q: Can I use this for other exams?**

**A:** Yes! System is modular:

**To adapt for TOEFL:**
1. Change CEFR levels to TOEFL scores
2. Adjust question ranges
3. Update level determination logic
4. Update result email template

**To adapt for other languages:**
1. Change UI language strings
2. Keep algorithm the same
3. Load different question bank

---

## API Endpoints

### **Authentication**

```
POST /auth/v1/signup
  Body: {email, password, data: {full_name, passport_id, country}}
  Returns: user

POST /auth/v1/token
  Body: {email, password, grant_type: "password"}
  Returns: access_token, session
```

### **Questions**

```
GET /rest/v1/questions
  Returns: Array of all questions

POST /rest/v1/questions
  Body: {question_text, skill, cefr_level, ...}
  Returns: Created question
```

### **Test Results**

```
POST /rest/v1/test_results
  Body: {student_id, overall_score, determined_cefr_level, ...}
  Returns: Created result

GET /rest/v1/test_results?student_id=eq.UUID
  Returns: Student's test results
```

### **Email**

```
POST /api/send-email
  Body: {studentEmail, cefrLevel, score, comment, responses}
  Returns: {success: true, message: "Email sent"}
```

---

## Performance & Monitoring

### **Typical Performance**

- Page load: <1 second
- Question display: <500ms
- Test completion: <2 seconds
- Email send: 2-5 seconds

### **Database Performance**

- Query questions: <100ms
- Save test result: <200ms
- List results: <300ms

### **Monitoring**

```
Vercel Analytics:
- https://vercel.com/dashboard
- View: Response times, build times, errors

Supabase Logs:
- https://supabase.com/dashboard
- View: Query performance, auth logs

Browser Console:
- F12 → Console tab
- Check for errors, warnings, logs
```

---

## Contributing & Customization

### **How to Add a Feature**

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Edit relevant files**
   ```
   Frontend: src/App.jsx
   Backend: api/send-email.js (or create new)
   Database: Run migrations in Supabase
   ```

3. **Test locally**
   ```bash
   npm start
   # Test at http://localhost:3000
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Add feature: description"
   git push origin feature/new-feature
   ```

5. **Create pull request on GitHub**

6. **Vercel auto-builds preview**

7. **After approval, merge to main**

8. **Vercel deploys to production**

---

## Support & Resources

### **Documentation**
- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
- Resend docs: https://resend.com/docs
- React docs: https://react.dev

### **Getting Help**
- GitHub Issues: https://github.com/tankkagemaru/premiumPlacementTest/issues
- Email support: support@premium.edu.my
- For Supabase: support@supabase.io
- For Vercel: support@vercel.com

---

## License & Credits

- **System**: CEFR Placement Test v1.0
- **Institution**: Premium Language Centre
- **Developed**: 2024
- **Framework**: React
- **Database**: PostgreSQL (Supabase)
- **Hosting**: Vercel

---

## Changelog

### **v1.0 - Initial Release**
- ✅ Adaptive difficulty algorithm (CAT)
- ✅ 30-question test format
- ✅ Student registration & login
- ✅ Teacher dashboard
- ✅ Email notifications
- ✅ Question management
- ✅ Anti-cheating measures
- ✅ Real-time timing metrics

---

**Last Updated: April 2024**
**Status: Production Ready** ✅
