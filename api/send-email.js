// api/send-email.js
// Vercel serverless function to send emails via Resend

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    studentEmail,
    studentName,
    cefrLevel,
    grammarScore,
    vocabularyScore,
    listeningScore,
    readingScore,
    overallScore
  } = req.body;

  // Validate inputs
  if (!studentEmail || !cefrLevel) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'placement@premium.edu.my',
        to: process.env.TEACHER_EMAIL || 'instructor@premium.edu.my',
        subject: `Student Placement Test Complete: ${studentEmail}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { border-bottom: 3px solid #CC0000; padding-bottom: 20px; margin-bottom: 20px; }
                .header h1 { color: #CC0000; margin: 0; font-size: 24px; }
                .result-card { background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .level { font-size: 48px; color: #CC0000; font-weight: bold; margin: 10px 0; }
                .scores { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                .score-item { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #CC0000; }
                .score-label { font-size: 12px; color: #888; text-transform: uppercase; font-weight: 600; }
                .score-value { font-size: 24px; color: #CC0000; font-weight: bold; margin-top: 5px; }
                .button { display: inline-block; background: #CC0000; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
                .footer { font-size: 12px; color: #888; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎯 Placement Test Complete</h1>
                </div>

                <p>A new student has completed the CEFR placement test.</p>

                <div class="result-card">
                  <h2 style="margin-top: 0; color: #333;">Student Results</h2>
                  <p><strong>Student Email:</strong> ${studentEmail}</p>
                  <p><strong>Student Name:</strong> ${studentName || 'Not provided'}</p>
                  
                  <div style="text-align: center; background: white; padding: 20px; border-radius: 6px; margin: 15px 0;">
                    <p style="margin: 0; color: #888; font-size: 13px; text-transform: uppercase;">CEFR Level</p>
                    <div class="level">${cefrLevel}</div>
                    <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">This student has been placed in Level ${cefrLevel}</p>
                  </div>

                  <h3 style="margin-top: 20px; color: #333;">Score Breakdown</h3>
                  <div class="scores">
                    <div class="score-item">
                      <div class="score-label">Grammar</div>
                      <div class="score-value">${Math.round(grammarScore * 100)}%</div>
                    </div>
                    <div class="score-item">
                      <div class="score-label">Vocabulary</div>
                      <div class="score-value">${Math.round(vocabularyScore * 100)}%</div>
                    </div>
                    <div class="score-item">
                      <div class="score-label">Listening</div>
                      <div class="score-value">${Math.round(listeningScore * 100)}%</div>
                    </div>
                    <div class="score-item">
                      <div class="score-label">Reading</div>
                      <div class="score-value">${Math.round(readingScore * 100)}%</div>
                    </div>
                  </div>

                  <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #CC0000;">
                    <div class="score-label">Overall Score</div>
                    <div style="font-size: 32px; color: #CC0000; font-weight: bold; margin-top: 5px;">
                      ${Math.round(overallScore * 100)}%
                    </div>
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="https://placementtest.premium.edu.my/dashboard" class="button">
                    View in Dashboard →
                  </a>
                </div>

                <div class="footer">
                  <p>This is an automated notification from the CEFR Placement Test System.</p>
                  <p>Premium Language Centre © 2024</p>
                </div>
              </div>
            </body>
          </html>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(400).json({ error: 'Failed to send email', details: data });
    }

    return res.status(200).json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
