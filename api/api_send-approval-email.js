import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const TEACHER_EMAIL = process.env.TEACHER_EMAIL || 'instructor@premium.edu.my';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentEmail, cefrLevel, score, comment, responses = [], questions = [] } = req.body;

    if (!studentEmail || !cefrLevel || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate skill scores
    const skillScores = {};
    ['grammar', 'vocabulary', 'reading', 'listening'].forEach(skill => {
      const skillResponses = responses.filter(r => {
        const q = questions.find(q => q.id === r.question_id);
        return q && q.skill === skill;
      });
      if (skillResponses.length > 0) {
        const correct = skillResponses.filter(r => r.is_correct).length;
        skillScores[skill] = ((correct / skillResponses.length) * 100).toFixed(1);
      } else {
        skillScores[skill] = 0;
      }
    });

    // Build question breakdown
    let questionBreakdown = '';
    responses.forEach((response, idx) => {
      const question = questions.find(q => q.id === response.question_id);
      if (question) {
        const correct = response.is_correct ? '✓' : '✗';
        questionBreakdown += `
${correct} Q${idx + 1}: ${question.question_text.substring(0, 80)}...
   Your answer: ${response.student_answer}
   Correct: ${question.correct_answers?.[0]}
`;
      }
    });

    const emailContent = `
CEFR Placement Test - Results Approved
=====================================

Dear Student,

Your English placement test has been reviewed and approved by your instructor.

YOUR RESULTS
============

Overall CEFR Level: ${cefrLevel}
Overall Score: ${score.toFixed(1)}% (${Math.round(responses.filter(r => r.is_correct).length)}/30 correct)

BREAKDOWN BY SKILL
==================
${Object.entries(skillScores).map(([skill, score]) => `${skill.toUpperCase()}: ${score}%`).join('\n')}

${comment ? `TEACHER'S COMMENT:\n"${comment}"` : ''}

DETAILED ANSWER BREAKDOWN
=========================
${questionBreakdown}

Next Steps:
===========
Your instructor will place you in the appropriate level class based on these results.

Best regards,
Premium Language Centre
`;

    // Send email
    const response = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: studentEmail,
      subject: `Your CEFR Placement Test Results - ${cefrLevel} Level`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #CC0000;">CEFR Placement Test - Results Approved</h1>
          <p>Dear Student,</p>
          <p>Your English placement test has been reviewed and approved by your instructor.</p>
          
          <h2 style="color: #CC0000; margin-top: 30px;">Your Results</h2>
          <p style="font-size: 24px; color: #CC0000; font-weight: bold;">Level: ${cefrLevel}</p>
          <p><strong>Overall Score:</strong> ${score.toFixed(1)}% (${Math.round(responses.filter(r => r.is_correct).length)}/30 correct)</p>
          
          <h2 style="color: #CC0000; margin-top: 30px;">Breakdown by Skill</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Grammar & Vocabulary</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${skillScores.grammar}%</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Reading Comprehension</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${skillScores.reading}%</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Listening Comprehension</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${skillScores.listening}%</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Vocabulary</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${skillScores.vocabulary}%</td>
            </tr>
          </table>
          
          ${comment ? `
          <h2 style="color: #CC0000; margin-top: 30px;">Teacher's Comment</h2>
          <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #CC0000; border-radius: 4px;">
            "${comment}"
          </p>
          ` : ''}
          
          <h2 style="color: #CC0000; margin-top: 30px;">Detailed Answer Breakdown</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; max-height: 400px; overflow-y: auto;">
            ${responses.map((response, idx) => {
              const question = questions.find(q => q.id === response.question_id);
              const correct = response.is_correct;
              return `
              <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-left: 4px solid ${correct ? '#4caf50' : '#f44336'}; border-radius: 4px;">
                <strong>Q${idx + 1}: ${question?.question_text.substring(0, 80) || 'Unknown question'}...</strong>
                <p style="margin: 5px 0; color: ${correct ? '#4caf50' : '#f44336'}; font-weight: bold;">
                  ${correct ? '✓ Correct' : '✗ Incorrect'}
                </p>
                <p style="margin: 5px 0;"><strong>Your answer:</strong> ${response.student_answer}</p>
                <p style="margin: 5px 0;"><strong>Correct answer:</strong> ${question?.correct_answers?.[0]}</p>
              </div>
              `;
            }).join('')}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>Next Steps: Your instructor will place you in the appropriate level class based on these results.</p>
            <p>Best regards,<br/>Premium Language Centre</p>
          </div>
        </div>
      `
    });

    if (response.error) {
      console.error('Email send error:', response.error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully', id: response.id });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
