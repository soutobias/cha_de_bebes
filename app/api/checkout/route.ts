import { MercadoPagoConfig, Preference } from "mercadopago";
import giftsData from "@/data/presentes.json";
import { MAX_ITEM_QUANTITY, type CartItem, type Gift } from "@/lib/cart";

export const runtime = "nodejs";

const gifts = giftsData as Gift[];
const giftCatalog = new Map(gifts.map((gift) => [gift.id, gift]));

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

  const preferenceItems = Array.from(quantities, ([id, quantity]) => {
    const gift = giftCatalog.get(id)!;
    return {
      id: String(gift.id),
      title: gift.title,
      description: gift.description,
      quantity,
      currency_id: "BRL",
      unit_price: gift.price,
    };
  });

  const configuredSiteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  const siteUrl = configuredSiteUrl || new URL(request.url).origin;
  const notificationUrl = process.env.MERCADO_PAGO_WEBHOOK_URL;

  try {
    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 8000 },
    });
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: preferenceItems,
        external_reference: crypto.randomUUID(),
        statement_descriptor: "CHA DOS GEMEOS",
        back_urls: {
          success: `${siteUrl}/carrinho?status=success`,
          pending: `${siteUrl}/carrinho?status=pending`,
          failure: `${siteUrl}/carrinho?status=failure`,
        },
        auto_return: "approved",
        ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      },
      requestOptions: { idempotencyKey: crypto.randomUUID() },
    });

    if (!result.init_point) {
      throw new Error("Mercado Pago did not return an init_point");
    }

    return Response.json({ initPoint: result.init_point });
  } catch (error) {
    console.error("Failed to create Mercado Pago preference", error);
    return Response.json(
      { error: "Não foi possível iniciar o pagamento. Tente novamente." },
      { status: 502 },
    );
  }
}
