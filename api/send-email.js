// Vercel Serverless Function - /api/send-email.js
//
// Sends approval or rejection emails to a student via Resend.
// If EMAIL_OVERRIDE_TO env is set, every outbound email is redirected to that
// address (used during Resend domain verification / testing). The original
// intended recipient is preserved in the subject for traceability.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      studentEmail,
      studentName,
      kind = 'approved',
      cefrLevel,
      score,
      comment,
      responses = [],
      questions = []
    } = req.body || {};

    if (!studentEmail) {
      return res.status(400).json({ error: 'studentEmail is required' });
    }
    if (kind !== 'approved' && kind !== 'rejected') {
      return res.status(400).json({ error: 'kind must be approved or rejected' });
    }
    if (kind === 'rejected' && !comment) {
      return res.status(400).json({ error: 'comment (rejection reason) is required when kind=rejected' });
    }

    const override = process.env.EMAIL_OVERRIDE_TO;
    const recipient = override || studentEmail;
    const greetingName = studentName || 'Student';
    const scoreText = typeof score === 'number' ? `${score.toFixed(1)}% (${Math.round(score * 30 / 100)}/30 correct)` : 'N/A';

    let subject;
    let emailBody;

    const isC1Plus = cefrLevel === 'C1+' || cefrLevel === 'C1' || cefrLevel === 'C2';

    if (kind === 'approved') {
      subject = `Your CEFR Placement Test Results - ${cefrLevel} Level`;
      const resultRows = responses.map((r, idx) => {
        const q = questions.find(qq => qq.id === r.question_id);
        return `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;">Q${idx + 1}</td>
            <td style="padding: 8px;">${r.is_correct ? '✓ Correct' : '✗ Wrong'}</td>
            <td style="padding: 8px; color: #666;">${r.student_answer ?? ''}</td>
            <td style="padding: 8px; color: green;">${q?.correct_answers?.[0] || 'N/A'}</td>
          </tr>
        `;
      }).join('');

      emailBody = `
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
    <p>Dear ${greetingName},</p>
    <p>Your English placement test has been reviewed and approved.</p>
    <h2>Your CEFR Level: <span class="level">${cefrLevel}</span></h2>
    <p class="score">Score: ${scoreText}</p>
    ${isC1Plus ? `<div style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <strong>Next step: short oral interview.</strong><br>
      Premium Language Centre reports a soft ceiling at C1+ and confirms placements at this level with a brief oral interview before assigning your course. The Academic Office will be in touch to arrange this.
    </div>` : ''}
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
      ${resultRows}
    </table>
  </div>
</body>
</html>
      `;
    } else {
      subject = 'Your CEFR Placement Test - Attempt Not Approved';
      emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .header { background: #b91c1c; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; max-width: 600px; margin: 0 auto; line-height: 1.6; }
    .reason { background: #fef2f2; border-left: 4px solid #b91c1c; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Placement Attempt Not Approved</h1>
    <p>Premium Language Centre</p>
  </div>
  <div class="content">
    <p>Dear ${greetingName},</p>
    <p>Your recent placement attempt has been reviewed and was not approved by your instructor.</p>
    <div class="reason">
      <strong>Teacher's note:</strong><br>${comment}
    </div>
    <p>You are welcome to take a new attempt at any time. Please log back into the platform and start a fresh assessment when you are ready.</p>
    <p>Best regards,<br/>Premium Language Centre</p>
  </div>
</body>
</html>
      `;
    }

    const finalSubject = override
      ? `[TEST → ${studentEmail}] ${subject}`
      : subject;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Premium CEFR <noreply@resend.dev>',
        to: recipient,
        subject: finalSubject,
        html: emailBody,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent',
      sentTo: recipient,
      overrideActive: Boolean(override),
      data
    });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
}
