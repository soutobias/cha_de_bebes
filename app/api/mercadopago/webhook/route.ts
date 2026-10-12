import {
  InvalidWebhookSignatureError,
  MercadoPagoConfig,
  Order,
  WebhookSignatureValidator,
} from "mercadopago";
import { Resend } from "resend";
import giftsData from "@/data/presentes.json";
import type { Gift } from "@/lib/cart";

export const runtime = "nodejs";

type WebhookPayload = {
  type?: unknown;
  live_mode?: unknown;
  data?: {
    id?: unknown;
    items?: Array<{ external_code?: unknown; quantity?: unknown }>;
  };
};

type EmailItem = {
  title: string;
  quantity: number;
  unitPrice: number;
};

const giftCatalog = new Map(
  (giftsData as Gift[]).map((gift) => [String(gift.id), gift]),
);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function moneyToCents(value: string | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function validateWebhookSignature({
  xSignature,
  xRequestId,
  queryDataId,
  bodyDataId,
  secret,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  queryDataId: string | null;
  bodyDataId: string | null;
  secret: string;
}) {
  const candidates = [
    ...(queryDataId ? [queryDataId.toLowerCase(), queryDataId] : []),
    undefined,
    ...(bodyDataId ? [bodyDataId.toLowerCase(), bodyDataId] : []),
  ];
  const uniqueCandidates = [...new Set(candidates)];
  let lastError: unknown;

  for (const dataId of uniqueCandidates) {
    try {
      WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId,
        secret,
      });
      return dataId === undefined
        ? "without-data-id"
        : dataId === dataId.toLowerCase()
          ? "lowercase-data-id"
          : "original-data-id";
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function createEmailContent({
  heading,
  introduction,
  orderId,
  buyerEmail,
  items,
  total,
}: {
  heading: string;
  introduction: string;
  orderId: string;
  buyerEmail?: string;
  items: EmailItem[];
  total: number;
}) {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #dfe5d4;color:#29462f">
            ${escapeHtml(item.title)}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #dfe5d4;text-align:center;color:#29462f">
            ${item.quantity}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #dfe5d4;text-align:right;color:#29462f">
            ${formatBRL(item.unitPrice * item.quantity)}
          </td>
        </tr>`,
    )
    .join("");

  const textItems = items
    .map(
      (item) =>
        `${item.quantity}x ${item.title} — ${formatBRL(
          item.unitPrice * item.quantity,
        )}`,
    )
    .join("\n");

  const buyerLine = buyerEmail
    ? `<p style="margin:8px 0;color:#596b59"><strong>Comprador:</strong> ${escapeHtml(
        buyerEmail,
      )}</p>`
    : "";

  return {
    html: `<!doctype html>
      <html lang="pt-BR">
        <body style="margin:0;background:#f7f5e9;font-family:Arial,sans-serif;color:#29462f">
          <div style="max-width:620px;margin:0 auto;padding:32px 18px">
            <div style="border:1px solid #dfe5d4;border-radius:20px;background:#fffdf5;padding:28px">
              <h1 style="margin:0 0 12px;font-size:28px;color:#36543b">${escapeHtml(
                heading,
              )}</h1>
              <p style="margin:0 0 20px;line-height:1.6;color:#596b59">${escapeHtml(
                introduction,
              )}</p>
              ${buyerLine}
              <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:18px">
                <thead>
                  <tr>
                    <th style="padding:10px 8px;text-align:left;color:#36543b">Presente</th>
                    <th style="padding:10px 8px;text-align:center;color:#36543b">Qtd.</th>
                    <th style="padding:10px 8px;text-align:right;color:#36543b">Subtotal</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>
              <p style="margin:22px 0 0;text-align:right;font-size:20px;color:#36543b">
                <strong>Total: ${formatBRL(total)}</strong>
              </p>
              <p style="margin:24px 0 0;font-size:12px;color:#829082">
                Referência do pagamento: ${escapeHtml(orderId)}
              </p>
            </div>
          </div>
        </body>
      </html>`,
    text: `${heading}\n\n${introduction}\n${
      buyerEmail ? `Comprador: ${buyerEmail}\n` : ""
    }\n${textItems}\n\nTotal: ${formatBRL(
      total,
    )}\nReferência do pagamento: ${orderId}`,
  };
}

export async function POST(request: Request) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const productionWebhookSecret =
    process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim();
  const testWebhookSecret =
    process.env.MERCADO_PAGO_WEBHOOK_SECRET_TEST?.trim();
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  const testEmailRecipient = process.env.EMAIL_TEST_RECIPIENT?.trim();
  const isConfiguredTestMode = process.env.MERCADO_PAGO_TEST_MODE === "true";
  if (
    !accessToken ||
    (!productionWebhookSecret && !testWebhookSecret) ||
    !resendApiKey ||
    !emailFrom ||
    !notificationEmail
  ) {
    console.error("Payment email integration is not fully configured");
    return Response.json(
      { error: "Integration not configured" },
      { status: 503 },
    );
  }

  let payload: WebhookPayload;

  try {
    payload = (await request.json()) as WebhookPayload;
  } catch {
    return Response.json({ error: "Invalid notification" }, { status: 400 });
  }

  const requestUrl = new URL(request.url);
  const queryDataId =
    requestUrl.searchParams.get("data.id") ??
    requestUrl.searchParams.get("data_id");
  const bodyDataId =
    typeof payload.data?.id === "string" ? payload.data.id : null;
  const orderId = queryDataId || bodyDataId;
  const secretCandidates = [
    ...(productionWebhookSecret
      ? [{ source: "primary", value: productionWebhookSecret }]
      : []),
    ...(testWebhookSecret && testWebhookSecret !== productionWebhookSecret
      ? [{ source: "test", value: testWebhookSecret }]
      : []),
  ];

  if (!orderId) {
    return Response.json({ error: "Missing order ID" }, { status: 400 });
  }

  if (secretCandidates.length === 0) {
    console.error("Webhook secret is not configured for this environment", {
      liveMode: payload.live_mode,
    });
    return Response.json(
      { error: "Webhook secret not configured" },
      { status: 503 },
    );
  }

  let signatureStrategy: string | undefined;
  let signatureSecretSource: string | undefined;
  let signatureError: unknown;

  for (const secret of secretCandidates) {
    try {
      signatureStrategy = validateWebhookSignature({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        queryDataId,
        bodyDataId,
        secret: secret.value,
      });
      signatureSecretSource = secret.source;
      break;
    } catch (error) {
      signatureError = error;
    }
  }

  if (!signatureStrategy || !signatureSecretSource) {
    const canVerifyTestOrderWithApi =
      isConfiguredTestMode &&
      payload.live_mode === false &&
      orderId.startsWith("ORDTST");
    const signatureDetails = {
      orderId,
      liveMode: payload.live_mode,
      reason:
        signatureError instanceof InvalidWebhookSignatureError
          ? signatureError.reason
          : "unknown",
      hasSignature: Boolean(request.headers.get("x-signature")),
      hasRequestId: Boolean(request.headers.get("x-request-id")),
      hasQueryDataId: Boolean(queryDataId),
      testedSecretSources: secretCandidates.map((secret) => secret.source),
    };

    if (!canVerifyTestOrderWithApi) {
      console.error("Invalid Mercado Pago webhook signature", signatureDetails);
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Mercado Pago sandbox notifications can occasionally be signed with a
    // secret different from the one exposed by the test Webhooks panel. This
    // fallback is deliberately limited to ORDTST orders while the deployment
    // is explicitly in test mode. The order is still authenticated below by
    // retrieving it directly from Mercado Pago with the server-side token.
    console.warn(
      "Sandbox signature mismatch; verifying test order through Mercado Pago API",
      signatureDetails,
    );
    signatureStrategy = "sandbox-api-verification";
    signatureSecretSource = "none";
  }

  if (!orderId.startsWith("ORD")) {
    return Response.json({ received: true });
  }

  console.info("Mercado Pago webhook accepted", {
    orderId,
    signatureStrategy,
    signatureSecretSource,
  });

  try {
    const mercadoPago = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 8000 },
    });
    const order = await new Order(mercadoPago).get({ id: orderId });
    const successfulPayment = order.transactions?.payments?.some(
      (payment) =>
        payment.status === "approved" ||
        (payment.status === "processed" &&
          payment.status_detail === "accredited"),
    );
    const totalInCents = moneyToCents(order.total_amount);
    const paidInCents = moneyToCents(order.total_paid_amount);

    if (!successfulPayment || totalInCents <= 0 || paidInCents < totalInCents) {
      console.info("Mercado Pago order is not fully paid yet", {
        orderId,
        orderStatus: order.status,
        successfulPayment: Boolean(successfulPayment),
        totalInCents,
        paidInCents,
      });
      return Response.json({ received: true, emailSent: false });
    }

    const buyerEmail = order.payer?.email?.trim().toLowerCase();
    const orderItems = (order.items ?? []).flatMap((item) => {
      const quantity = item.quantity ?? 0;
      const unitPrice = Number(item.unit_price);
      const catalogGift = item.external_code
        ? giftCatalog.get(String(item.external_code))
        : undefined;
      const title = item.title || catalogGift?.title;
      const resolvedUnitPrice = Number.isFinite(unitPrice)
        ? unitPrice
        : catalogGift?.price;

      if (!title || quantity < 1 || resolvedUnitPrice === undefined) return [];
      return [{ title, quantity, unitPrice: resolvedUnitPrice }];
    });
    const notificationItems = (payload.data?.items ?? []).flatMap((item) => {
      const externalCode =
        typeof item.external_code === "string" ||
        typeof item.external_code === "number"
          ? String(item.external_code)
          : "";
      const quantity = Number(item.quantity);
      const gift = giftCatalog.get(externalCode);

      if (!gift || !Number.isInteger(quantity) || quantity < 1) return [];
      return [{ title: gift.title, quantity, unitPrice: gift.price }];
    });
    const items = orderItems.length > 0 ? orderItems : notificationItems;

    const isTestNotification =
      isConfiguredTestMode || payload.live_mode === false;

    if (
      (!buyerEmail && !(isTestNotification && testEmailRecipient)) ||
      items.length === 0 ||
      !order.id
    ) {
      console.error(
        "Approved Mercado Pago order is missing recipient or items",
        {
          orderId,
          hasOrderId: Boolean(order.id),
          hasBuyerEmail: Boolean(buyerEmail),
          orderItemCount: orderItems.length,
          notificationItemCount: notificationItems.length,
        },
      );
      return Response.json({ error: "Incomplete order" }, { status: 502 });
    }

    const buyerRecipient =
      isTestNotification && testEmailRecipient
        ? testEmailRecipient
        : buyerEmail!;
    const total = totalInCents / 100;
    const buyerContent = createEmailContent({
      heading: "Pagamento confirmado 💚",
      introduction:
        "Recebemos seu presente para as duas ervilhinhas. Muito obrigado pelo carinho!",
      orderId: order.id,
      items,
      total,
    });
    const ownerContent = createEmailContent({
      heading: "Um novo presente foi recebido",
      introduction:
        "O Mercado Pago confirmou um novo pagamento da lista de presentes.",
      orderId: order.id,
      buyerEmail: buyerEmail ?? "Comprador de teste do Mercado Pago",
      items,
      total,
    });
    const resend = new Resend(resendApiKey);

    const [buyerResult, ownerResult] = await Promise.all([
      resend.emails.send(
        {
          from: emailFrom,
          to: buyerRecipient,
          subject: "Pagamento confirmado — Chá das duas ervilhinhas",
          ...buyerContent,
        },
        { idempotencyKey: `mercadopago/${order.id}/buyer` },
      ),
      resend.emails.send(
        {
          from: emailFrom,
          to: notificationEmail,
          subject: `Novo presente recebido — ${formatBRL(total)}`,
          ...ownerContent,
        },
        { idempotencyKey: `mercadopago/${order.id}/owner` },
      ),
    ]);

    if (buyerResult.error || ownerResult.error) {
      console.error("Resend failed to send payment confirmation", {
        orderId,
        buyerError: buyerResult.error?.name,
        ownerError: ownerResult.error?.name,
      });
      return Response.json({ error: "Email delivery failed" }, { status: 502 });
    }

    return Response.json({ received: true, emailSent: true });
  } catch (error) {
    console.error("Failed to process Mercado Pago webhook", {
      orderId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 502 },
    );
  }
}
