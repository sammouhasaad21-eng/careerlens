// functions/api/check-subscription.js
// المسار: GET /api/check-subscription?email=someone@example.com
// يستخدمه المتصفح للتحقق أن هذا البريد لا يزال مشتركًا فعّالًا (عند العودة لاحقًا).

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const email = (url.searchParams.get('email') || '').toLowerCase().trim();

  if (!email) return json({ active: false }, 400);

  try {
    const customerId = await env.SUBSCRIBERS.get(`email:${email}`);
    if (!customerId) return json({ active: false }, 200);

    const raw = await env.SUBSCRIBERS.get(`cus:${customerId}`);
    if (!raw) return json({ active: false }, 200);

    const record = JSON.parse(raw);
    return json({ active: record.status === 'active' }, 200);

  } catch (err) {
    return json({ active: false, error: err.message }, 500);
  }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
