// functions/api/stripe-webhook.js
// يستقبل أحداث Stripe (اشتراك جديد، تجديد، إلغاء، فشل دفع) ويحدّث Cloudflare KV.
//
// إعداد مطلوب في Cloudflare Pages → Settings → Functions → KV namespace bindings:
//   المتغيّر: SUBSCRIBERS  (أنشئ KV namespace جديد بهذا الاسم واربطه هنا)
//
// إعداد مطلوب في Environment variables:
//   STRIPE_SECRET_KEY      ← من Stripe Dashboard → Developers → API keys
//   STRIPE_WEBHOOK_SECRET  ← من Stripe Dashboard → Developers → Webhooks → (بعد إنشاء الـ endpoint)

export async function onRequestPost(context) {
  const { request, env } = context;

  const signature = request.headers.get('stripe-signature');
  const payload = await request.text();

  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Missing signature or webhook secret', { status: 400 });
  }

  const isValid = await verifyStripeSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!isValid) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(payload);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = (session.customer_details?.email || session.customer_email || '').toLowerCase();
        const customerId = session.customer;
        if (email && customerId) {
          await saveSubscriber(env, email, customerId, 'active');
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object;
        const status = ['active', 'trialing'].includes(sub.status) ? 'active' : 'inactive';
        await updateSubscriberStatus(env, sub.customer, status);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await updateSubscriberStatus(env, sub.customer, 'inactive');
        break;
      }

      default:
        break; // نتجاهل أي حدث آخر لا يهمنا
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Webhook handling error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

/* ── تخزين مشترك جديد: نحفظ سجلّين — بالبريد وبمعرّف العميل ─────────────── */
async function saveSubscriber(env, email, customerId, status) {
  const record = { email, customerId, status, updatedAt: Date.now() };
  await env.SUBSCRIBERS.put(`cus:${customerId}`, JSON.stringify(record));
  await env.SUBSCRIBERS.put(`email:${email}`, customerId);
}

/* ── تحديث حالة مشترك موجود عبر معرّف العميل فقط (بدون الحاجة لبريده مجددًا) ─ */
async function updateSubscriberStatus(env, customerId, status) {
  const existingRaw = await env.SUBSCRIBERS.get(`cus:${customerId}`);
  const existing = existingRaw ? JSON.parse(existingRaw) : { customerId };
  existing.status = status;
  existing.updatedAt = Date.now();
  await env.SUBSCRIBERS.put(`cus:${customerId}`, JSON.stringify(existing));
}

/* ── تحقق من توقيع Stripe (HMAC-SHA256) باستخدام Web Crypto ──────────────── */
async function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(signedPayload));
  const expected = [...new Uint8Array(sigBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  return expected === signature;
}
