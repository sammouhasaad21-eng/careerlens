// netlify/functions/analyze.js
// يستخدم Gemini API بدلاً من Claude — مجاني تماماً

exports.handler = async function (event) {

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let cv, jd;
  try {
    const body = JSON.parse(event.body || '{}');
    cv = (body.cv || '').trim();
    jd = (body.jd || '').trim();
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ungültiges Format' }) };
  }

  if (!cv || cv.length < 100) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'CV ist zu kurz.' }) };
  }
  if (!jd || jd.length < 100) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Stellenbeschreibung ist zu kurz.' }) };
  }

  const prompt = `You are a senior software engineering hiring manager with 15 years of IT recruitment experience. You give honest, specific, actionable feedback.

Analyze the CV and Job Description below.

Return ONLY a valid JSON object — no preamble, no markdown, no extra text, no backticks. Use this exact structure:
{
  "match_score": <integer 0-100>,
  "score_explanation": "<2 clear sentences explaining the score>",
  "matched_skills": ["<skill that appears in both CV and JD>"],
  "missing_skills": [
    {"skill": "<skill name>", "priority": "high|medium|low", "why": "<specific reason from the JD>"}
  ],
  "cv_improvements": [
    {"section": "<CV section>", "current": "<current text>", "improved": "<better version>", "reason": "<why stronger>"}
  ],
  "interview_questions": [
    "<question 1>", "<question 2>", "<question 3>", "<question 4>", "<question 5>"
  ],
  "learning_roadmap": [
    {"skill": "<skill>", "weeks": <1-8>, "resources": ["<resource 1>", "<resource 2>", "<resource 3>"]}
  ],
  "portfolio_projects": [
    "<detailed project idea 1>",
    "<detailed project idea 2>"
  ],
  "overall_advice": "<3 honest, specific sentences: assessment, most important fix, concrete next step>"
}

CV:
${cv.substring(0, 4000)}

Job Description:
${jd.substring(0, 3000)}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 3000,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Fehler:', response.status, errText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Gemini API Fehler: ' + response.status }),
      };
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // JSON aus der Antwort extrahieren
    let result;
    try {
      // Entferne Markdown-Backticks falls vorhanden
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch {
          return { statusCode: 500, headers, body: JSON.stringify({ error: 'Antwort konnte nicht verarbeitet werden.' }) };
        }
      } else {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Keine gültige Antwort erhalten.' }) };
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify(result) };

  } catch (err) {
    console.error('Fehler:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Serverfehler: ' + err.message }),
    };
  }
};
