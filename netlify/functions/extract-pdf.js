// netlify/functions/extract-pdf.js
// يستخرج النص من PDF المرفوع

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { pdfBase64 } = JSON.parse(event.body || '{}');
    if (!pdfBase64) return { statusCode: 400, headers, body: JSON.stringify({ error: 'No PDF provided' }) };

    // استخدم Groq لاستخراج النص من PDF
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `The following is base64-encoded PDF content. Extract all the text from it and return ONLY the extracted text, nothing else. If you cannot read it, return the text "CANNOT_READ_PDF".

Base64 PDF (first 10000 chars): ${pdfBase64.substring(0, 10000)}`
          }
        ],
        temperature: 0,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    if (text === 'CANNOT_READ_PDF' || text.length < 50) {
      return { statusCode: 422, headers, body: JSON.stringify({ error: 'Could not extract text from PDF. Please paste the text manually.' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ text }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
