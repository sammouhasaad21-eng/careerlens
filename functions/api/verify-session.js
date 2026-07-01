// functions/api/verify-session.js
// يُستدعى من صفحة "شكرًا للاشتراك" بعد رجوع العميل من Stripe Payment Link.
// المسار: GET /api/verify-session?session_id=cs_xxx
// يتأكد من نجاح الدفع فعليًا (لا نثق بمجرد وجود المستخدم على الصفحة) ويسجّله كمشترك.

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    return json({ error: 'Missing session_id' }, 400);
  }
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Server configuration error: Stripe key missing' }, 500);
  }

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=customer`,
      { headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` } }
    );

    if (!res.ok) {
      return json({ active: false, error: 'Could not verify session' }, 400);
    }

    const session = await res.json();
    const paid = session.payment_status === 'paid' || session.status === 'complete';
    const email = (session.customer_details?.email || session.customer_email || '').toLowerCase();
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

    if (paid && email && customerId) {
      await env.SUBSCRIBERS.put(`cus:${customerId}`, JSON.stringify({
        email, customerId, status: 'active', updatedAt: Date.now()
      }));
      await env.SUBSCRIBERS.put(`email:${email}`, customerId);
      return json({ active: true, email }, 200);
    }

    return json({ active: false }, 200);

  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
