import {
  MercadoPagoConfig,
  Order,
  WebhookSignatureValidator,
} from "mercadopago";
import { Resend } from "resend";

export const runtime = "nodejs";

type WebhookPayload = {
  type?: unknown;
  live_mode?: unknown;
  data?: { id?: unknown };
};

type EmailItem = {
  title: string;
  quantity: number;
  unitPrice: number;
};

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
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  const testEmailRecipient = process.env.EMAIL_TEST_RECIPIENT?.trim();
  const isConfiguredTestMode = process.env.MERCADO_PAGO_TEST_MODE === "true";

  if (
    !accessToken ||
    !webhookSecret ||
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
  const queryDataId = requestUrl.searchParams.get("data.id");
  const bodyDataId =
    typeof payload.data?.id === "string" ? payload.data.id : null;
  const orderId = queryDataId || bodyDataId;

  if (!orderId) {
    return Response.json({ error: "Missing order ID" }, { status: 400 });
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId: orderId,
      secret: webhookSecret,
    });
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!orderId.startsWith("ORD")) {
    return Response.json({ received: true });
  }

  try {
    const mercadoPago = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 8000 },
    });
    const order = await new Order(mercadoPago).get({ id: orderId });
    const approvedPayment = order.transactions?.payments?.some(
      (payment) => payment.status === "approved",
    );
    const totalInCents = moneyToCents(order.total_amount);
    const paidInCents = moneyToCents(order.total_paid_amount);

    if (!approvedPayment || totalInCents <= 0 || paidInCents < totalInCents) {
      console.info("Mercado Pago order is not fully paid yet", {
        orderId,
        orderStatus: order.status,
        approvedPayment: Boolean(approvedPayment),
        totalInCents,
        paidInCents,
      });
      return Response.json({ received: true, emailSent: false });
    }

    const buyerEmail = order.payer?.email?.trim().toLowerCase();
    const items = (order.items ?? []).flatMap((item) => {
      const quantity = item.quantity ?? 0;
      const unitPrice = Number(item.unit_price);

      if (!item.title || quantity < 1 || !Number.isFinite(unitPrice)) return [];
      return [{ title: item.title, quantity, unitPrice }];
    });

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
