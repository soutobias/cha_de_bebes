This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Mercado Pago Checkout Pro

Copy `.env.example` to `.env.local` and configure:

```bash
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-your-private-access-token
MERCADO_PAGO_TEST_MODE=false
MERCADO_PAGO_WEBHOOK_SECRET=your-webhook-secret
MERCADO_PAGO_WEBHOOK_SECRET_TEST=your-test-webhook-secret
RESEND_API_KEY=re_your-resend-api-key
EMAIL_FROM=Cha de Bebe <presentes@tonessa.baby>
NOTIFICATION_EMAIL=your-email@example.com
EMAIL_TEST_RECIPIENT=your-email@example.com
SITE_URL=http://localhost:3000
```

For Vercel, add the same variables in **Project Settings → Environment Variables** and set `SITE_URL` to the production URL. `MERCADO_PAGO_ACCESS_TOKEN` is private and must never use the `NEXT_PUBLIC_` prefix.

The browser stores the buyer name and email in local storage, then sends only the email with the product IDs and quantities to `/api/checkout`. The server validates the email, reads product names and prices from `data/presentes.json`, creates a Checkout Pro Order with the private access token, and returns only Mercado Pago's checkout URL. The buyer name remains only in the browser. When using sandbox credentials, enter the exact email of the Mercado Pago test buyer account in the cart.

Configure the Mercado Pago **Order (Mercado Pago)** production webhook as `https://tonessa.baby/api/mercadopago/webhook`, then copy its secret to `MERCADO_PAGO_WEBHOOK_SECRET`. The endpoint validates Mercado Pago's signature, retrieves the Order from Mercado Pago, and sends confirmations only for a fully paid, approved Order. Resend receives separate idempotency keys for the buyer and owner messages so webhook retries do not normally produce duplicate emails.

If Mercado Pago shows a separate secret for the test environment, store it as `MERCADO_PAGO_WEBHOOK_SECRET_TEST`. Notifications with `live_mode: false` use this test secret, while production notifications use `MERCADO_PAGO_WEBHOOK_SECRET`.

Webhook signature validation lowercases the alphanumeric Mercado Pago Order ID before calculating the HMAC, as required for IDs returned in uppercase such as `ORDTST...`. The original uppercase ID is preserved when retrieving the Order from the API.

In Resend, verify `tonessa.baby` and add the requested DNS records before using the `EMAIL_FROM` address. All payment and email credentials are server-only and must never use the `NEXT_PUBLIC_` prefix.

For sandbox tests, set `MERCADO_PAGO_TEST_MODE=true`. The checkout will not send `payer.email`, since current Mercado Pago test buyer accounts expose only a username, password, User ID, and verification code. Log in to Mercado Pago with that test username. Also set `EMAIL_TEST_RECIPIENT` to a real inbox: notifications with `live_mode: false` will send the buyer copy there instead. In production, remove `MERCADO_PAGO_TEST_MODE` or set it to `false`; the buyer email entered in the cart will then be sent to Mercado Pago and used for the confirmation.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
