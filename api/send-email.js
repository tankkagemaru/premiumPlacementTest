// Vercel Serverless Function - /api/send-email.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentEmail, cefrLevel, score, comment, responses, questions } = req.body;

    if (!studentEmail) {
      return res.status(400).json({ error: 'studentEmail is required' });
    }

    const resultHtml = responses.map((r, idx) => {
      const q = questions.find(q => q.id === r.question_id);
      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px;">Q${idx + 1}</td>
          <td style="padding: 8px;">${r.is_correct ? '✓ Correct' : '✗ Wrong'}</td>
          <td style="padding: 8px; color: #666;">${r.student_answer}</td>
          <td style="padding: 8px; color: green;">${q?.correct_answers?.[0] || 'N/A'}</td>
        </tr>
      `;
    }).join('');

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .header { background: linear-gradient(135deg, #CC0000 0%, #990000 100%); color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; max-width: 600px; margin: 0 auto; }
    .score { font-size: 24px; font-weight: bold; color: #CC0000; margin: 20px 0; }
    .level { font-size: 32px; font-weight: bold; color: #CC0000; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f5f5f5; padding: 10px; text-align: left; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CEFR Placement Test Results</h1>
    <p>Premium Language Centre</p>
  </div>
  <div class="content">
    <h2>Your CEFR Level: <span class="level">${cefrLevel}</span></h2>
    <p class="score">Score: ${score.toFixed(1)}% (${Math.round(score * 30 / 100)}/30 correct)</p>
    ${comment ? `<div style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <strong>Teacher's Comment:</strong><br>${comment}
    </div>` : ''}
    <h3>Question Breakdown</h3>
    <table>
      <tr style="background: #f5f5f5;">
        <th>Question</th>
        <th>Result</th>
        <th>Your Answer</th>
        <th>Correct Answer</th>
      </tr>
      ${resultHtml}
    </table>
  </div>
</body>
</html>
    `;

    // Call Resend API from server-side (no CORS issues!)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@resend.dev',
        to: studentEmail,
        subject: `Your CEFR Placement Test Results - ${cefrLevel} Level`,
        html: emailBody,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ success: true, message: 'Email sent', data });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
}
