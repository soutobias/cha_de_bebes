import { MercadoPagoConfig, Order } from "mercadopago";
import giftsData from "@/data/presentes.json";
import { MAX_ITEM_QUANTITY, type CartItem, type Gift } from "@/lib/cart";

export const runtime = "nodejs";

const gifts = giftsData as Gift[];
const giftCatalog = new Map(gifts.map((gift) => [gift.id, gift]));
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;

  const item = value as Partial<CartItem>;
  return (
    Number.isInteger(item.id) &&
    Number.isInteger(item.quantity) &&
    Number(item.quantity) >= 1 &&
    Number(item.quantity) <= MAX_ITEM_QUANTITY
  );
}

export async function POST(request: Request) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return Response.json(
      { error: "O pagamento ainda não foi configurado." },
      { status: 503 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const submittedItems =
    typeof payload === "object" && payload !== null
      ? (payload as { items?: unknown }).items
      : null;
  const submittedEmail =
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { email?: unknown }).email === "string"
      ? (payload as { email: string }).email.trim().toLowerCase()
      : "";

  if (submittedEmail.length > 254 || !EMAIL_PATTERN.test(submittedEmail)) {
    return Response.json(
      { error: "Informe um e-mail válido para continuar." },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(submittedItems) ||
    submittedItems.length === 0 ||
    submittedItems.length > 50 ||
    !submittedItems.every(isCartItem)
  ) {
    return Response.json({ error: "Carrinho inválido." }, { status: 400 });
  }

  const quantities = new Map<number, number>();

  for (const item of submittedItems) {
    if (!giftCatalog.has(item.id)) {
      return Response.json(
        { error: "Um dos presentes não está disponível." },
        { status: 400 },
      );
    }

    const quantity = (quantities.get(item.id) ?? 0) + item.quantity;
    if (quantity > MAX_ITEM_QUANTITY) {
      return Response.json(
        { error: "Quantidade acima do limite permitido." },
        { status: 400 },
      );
    }
    quantities.set(item.id, quantity);
  }

  const orderItems = Array.from(quantities, ([id, quantity]) => {
    const gift = giftCatalog.get(id)!;
    return {
      title: gift.title,
      description: gift.description,
      quantity,
      unit_price: gift.price.toFixed(2),
      external_code: String(gift.id),
    };
  });

  const totalAmount = Array.from(quantities).reduce((total, [id, quantity]) => {
    const gift = giftCatalog.get(id)!;
    return total + gift.price * quantity;
  }, 0);

  const configuredSiteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  const siteUrl = configuredSiteUrl || new URL(request.url).origin;
  const isTestMode = process.env.MERCADO_PAGO_TEST_MODE === "true";

  try {
    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 8000 },
    });
    const order = new Order(client);
    const result = await order.create({
      body: {
        type: "online",
        processing_mode: "manual",
        capture_mode: "automatic_async",
        currency: "BRL",
        total_amount: totalAmount.toFixed(2),
        items: orderItems,
        external_reference: crypto.randomUUID(),
        description: "Presentes para o chá de bebê",
        ...(!isTestMode ? { payer: { email: submittedEmail } } : {}),
        config: {
          statement_descriptor: "CHA GEMEOS",
          online: {
            callback_url: `${siteUrl}/api/mercadopago/webhook`,
            success_url: `${siteUrl}/carrinho?status=success`,
            pending_url: `${siteUrl}/carrinho?status=pending`,
            failure_url: `${siteUrl}/carrinho?status=failure`,
            auto_return: "approved",
          },
        },
      },
      requestOptions: { idempotencyKey: crypto.randomUUID() },
    });

    if (!result.checkout_url) {
      throw new Error("Mercado Pago did not return a checkout_url");
    }

    return Response.json({ checkoutUrl: result.checkout_url });
  } catch (error) {
    console.error("Failed to create Mercado Pago order", error);
    return Response.json(
      { error: "Não foi possível iniciar o pagamento. Tente novamente." },
      { status: 502 },
    );
  }
}
