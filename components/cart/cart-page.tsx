"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import giftsData from "@/data/presentes.json";
import {
  formatBRL,
  MAX_ITEM_QUANTITY,
  type CartItem,
  type Gift,
} from "@/lib/cart";
import { useCart } from "./cart-provider";

const gifts = giftsData as Gift[];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUYER_STORAGE_KEY = "cha-dos-gemeos-buyer";
const PENDING_CHECKOUT_STORAGE_KEY = "cha-dos-gemeos-pending-checkout";
const LAST_PURCHASE_STORAGE_KEY = "cha-dos-gemeos-last-purchase";

type StoredBuyer = {
  name: string;
  email: string;
};

function isStoredBuyer(value: unknown): value is StoredBuyer {
  if (typeof value !== "object" || value === null) return false;

  const buyer = value as Partial<StoredBuyer>;
  return typeof buyer.name === "string" && typeof buyer.email === "string";
}

function isStoredCart(value: unknown): value is CartItem[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        Number.isInteger((item as CartItem).id) &&
        Number.isInteger((item as CartItem).quantity) &&
        (item as CartItem).quantity >= 1 &&
        (item as CartItem).quantity <= MAX_ITEM_QUANTITY,
    )
  );
}

function readStoredCart(key: string) {
  try {
    const storedValue = localStorage.getItem(key);
    const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : null;
    return isStoredCart(parsedValue) ? parsedValue : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function CartPage() {
  const { items, isReady, updateQuantity, removeItem, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<CartItem[] | null>(null);
  const [isPaymentReturnReady, setIsPaymentReturnReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hasTouchedName, setHasTouchedName] = useState(false);
  const [hasTouchedEmail, setHasTouchedEmail] = useState(false);
  const [isBuyerReady, setIsBuyerReady] = useState(false);

  const normalizedName = name.trim().replace(/\s+/g, " ");
  const normalizedEmail = email.trim().toLowerCase();
  const isNameValid =
    normalizedName.length >= 2 && normalizedName.length <= 100;
  const isEmailValid = EMAIL_PATTERN.test(normalizedEmail);

  useEffect(() => {
    if (!isReady) return;

    const status = new URLSearchParams(window.location.search).get("status");
    let purchase: CartItem[] | null = null;

    if (status === "success") {
      const pendingCheckout = readStoredCart(PENDING_CHECKOUT_STORAGE_KEY);
      purchase = pendingCheckout ?? readStoredCart(LAST_PURCHASE_STORAGE_KEY);

      if (purchase) {
        localStorage.setItem(
          LAST_PURCHASE_STORAGE_KEY,
          JSON.stringify(purchase),
        );
      }

      localStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
    }

    const timeout = window.setTimeout(() => {
      if (purchase) setPurchasedItems(purchase);
      if (status === "success") clearCart();
      setPaymentStatus(status);
      setIsPaymentReturnReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [clearCart, isReady]);

  useEffect(() => {
    let storedBuyer: StoredBuyer | null = null;

    try {
      const storedValue = localStorage.getItem(BUYER_STORAGE_KEY);
      const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : null;

      if (isStoredBuyer(parsedValue)) storedBuyer = parsedValue;
    } catch {
      localStorage.removeItem(BUYER_STORAGE_KEY);
    }

    const timeout = window.setTimeout(() => {
      if (storedBuyer) {
        setName(storedBuyer.name);
        setEmail(storedBuyer.email);
      }
      setIsBuyerReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isBuyerReady) return;

    localStorage.setItem(
      BUYER_STORAGE_KEY,
      JSON.stringify({ name, email } satisfies StoredBuyer),
    );
  }, [email, isBuyerReady, name]);

  const cartLines = useMemo(
    () =>
      items.flatMap((item) => {
        const gift = gifts.find((candidate) => candidate.id === item.id);
        return gift ? [{ ...gift, quantity: item.quantity }] : [];
      }),
    [items],
  );

  const total = cartLines.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const purchasedLines = useMemo(
    () =>
      (purchasedItems ?? []).flatMap((item) => {
        const gift = gifts.find((candidate) => candidate.id === item.id);
        return gift ? [{ ...gift, quantity: item.quantity }] : [];
      }),
    [purchasedItems],
  );

  const purchasedTotal = purchasedLines.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  async function checkout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasTouchedName(true);
    setHasTouchedEmail(true);

    if (!isNameValid || !isEmailValid) return;

    setError("");
    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          email: normalizedEmail,
        }),
      });
      const result: { checkoutUrl?: string; error?: string } =
        await response.json();

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(
          result.error || "Não foi possível iniciar o pagamento.",
        );
      }

      localStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify(items));
      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Não foi possível iniciar o pagamento.",
      );
      setIsCheckingOut(false);
    }
  }

  if (!isReady || !isPaymentReturnReady) {
    return (
      <div className="grid min-h-80 place-items-center text-muted">
        Carregando carrinho…
      </div>
    );
  }

  if (paymentStatus === "success" && purchasedLines.length > 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 rounded-2xl border border-forest/15 bg-[#edf0d3]/90 px-5 py-4 text-center text-forest">
          <h2 className="font-display text-3xl font-semibold">
            Obrigado pelo carinho!
          </h2>
          <p className="mt-1 text-sm">
            Estes foram os presentes comprados. A confirmação também será
            enviada por e-mail.
          </p>
        </div>

        <div className="space-y-4">
          {purchasedLines.map((item) => (
            <article
              className="flex items-center gap-5 rounded-2xl border border-forest/15 bg-paper/90 p-4 shadow-[0_12px_35px_rgba(54,84,59,.07)]"
              key={item.id}
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-[#edf0d3] max-sm:size-20">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-2xl font-semibold text-forest max-sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}
                </p>
                <p className="mt-1 text-sm font-bold text-moss sm:hidden">
                  {formatBRL(item.price * item.quantity)}
                </p>
              </div>
              <strong className="shrink-0 text-sm text-forest max-sm:hidden">
                {formatBRL(item.price * item.quantity)}
              </strong>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-forest/15 bg-paper/90 p-6 text-center shadow-[0_18px_50px_rgba(54,84,59,.1)]">
          <div className="mb-5 flex items-center justify-between border-b border-forest/10 pb-4 text-muted">
            <span>Total da compra</span>
            <strong className="text-lg text-forest">
              {formatBRL(purchasedTotal)}
            </strong>
          </div>
          <Link
            className="inline-flex rounded-full bg-forest px-7 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#29462f]"
            href="/presentes"
          >
            Fazer uma nova compra
          </Link>
        </div>
      </div>
    );
  }

  if (cartLines.length === 0) {
    return (
      <div className="mx-auto flex min-h-100 max-w-xl flex-col items-center justify-center rounded-3xl border border-forest/15 bg-paper/85 p-10 text-center shadow-[0_20px_55px_rgba(54,84,59,.08)]">
        <Image
          src="/images/cart-empty.png"
          className="h-auto w-28 shrink-0 object-contain max-sm:w-24"
          width={1254}
          height={1254}
          alt="Carrinho vazio"
        />
        <h2 className="mt-5 font-display text-4xl text-forest">
          Seu carrinho está vazio
        </h2>
        <p className="mt-2 mb-6 text-muted">
          Escolha um presente para os pequenos e ele aparecerá aqui.
        </p>
        <Link
          className="rounded-full bg-forest px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#29462f]"
          href="/presentes"
        >
          Ver lista de presentes
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_340px] gap-7 max-lg:grid-cols-1">
      <div className="space-y-4">
        {paymentStatus && (
          <div className="rounded-2xl border border-forest/15 bg-[#edf0d3]/80 px-5 py-4 text-sm text-forest">
            {paymentStatus === "success"
              ? "Pagamento concluído! Enviaremos por e-mail a confirmação do presente assim que o Mercado Pago confirmar o processamento. Obrigado pelo carinho!"
              : paymentStatus === "pending"
                ? "O Mercado Pago está processando o pagamento."
                : "O pagamento não foi concluído. Você pode tentar novamente."}
          </div>
        )}
        {cartLines.map((item) => (
          <article
            className="flex items-center gap-5 rounded-2xl border border-forest/15 bg-paper/90 p-4 shadow-[0_12px_35px_rgba(54,84,59,.07)] max-sm:items-start"
            key={item.id}
          >
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-[#edf0d3] max-sm:size-20">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-semibold text-forest max-sm:text-xl">
                {item.title}
              </h2>
              <p className="mt-1 text-sm font-bold text-moss">
                {formatBRL(item.price)} cada
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label
                  className="text-xs font-bold text-muted"
                  htmlFor={`cart-${item.id}`}
                >
                  Quantidade
                </label>
                <input
                  id={`cart-${item.id}`}
                  className="w-18 rounded-full border border-forest/25 bg-white px-3 py-1.5 text-center text-sm text-forest outline-none focus:border-forest"
                  type="number"
                  min={1}
                  max={MAX_ITEM_QUANTITY}
                  value={item.quantity}
                  onChange={(event) =>
                    updateQuantity(item.id, Number(event.target.value))
                  }
                />
                <button
                  className="text-xs font-bold text-[#8b4d42] underline decoration-[#8b4d42]/30 underline-offset-4"
                  type="button"
                  onClick={() => removeItem(item.id)}
                >
                  Remover
                </button>
              </div>
            </div>
            <strong className="shrink-0 text-sm text-forest max-sm:hidden">
              {formatBRL(item.price * item.quantity)}
            </strong>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-3xl border border-forest/15 bg-paper/90 p-6 shadow-[0_18px_50px_rgba(54,84,59,.1)] lg:sticky lg:top-6">
        <h2 className="font-display text-3xl font-semibold text-forest">
          Resumo
        </h2>
        <div className="my-5 flex justify-between border-y border-forest/10 py-4 text-sm text-muted">
          <span>Total</span>
          <strong className="text-lg text-forest">{formatBRL(total)}</strong>
        </div>
        <form noValidate onSubmit={checkout}>
          <label
            className="mb-2 block text-sm font-bold text-forest"
            htmlFor="checkout-name"
          >
            Nome completo
          </label>
          <input
            id="checkout-name"
            className="w-full rounded-xl border border-forest/25 bg-white/80 px-4 py-3 text-sm text-forest outline-none transition placeholder:text-muted/65 focus:border-forest focus:ring-2 focus:ring-forest/15 aria-invalid:border-[#8b4d42] aria-invalid:ring-[#8b4d42]/15"
            type="text"
            autoComplete="name"
            maxLength={100}
            placeholder="Seu nome"
            value={name}
            aria-describedby="checkout-name-help"
            aria-invalid={hasTouchedName && !isNameValid}
            onBlur={() => setHasTouchedName(true)}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
          />
          <p
            id="checkout-name-help"
            className={`mt-1.5 min-h-4 text-xs ${
              hasTouchedName && !isNameValid ? "text-[#8b4d42]" : "text-muted"
            }`}
          >
            {hasTouchedName && !isNameValid
              ? "Digite seu nome para continuar."
              : "Seu nome ficará salvo somente neste dispositivo."}
          </p>
          <label
            className="mt-3 mb-2 block text-sm font-bold text-forest"
            htmlFor="checkout-email"
          >
            E-mail para confirmação
          </label>
          <input
            id="checkout-email"
            className="w-full rounded-xl border border-forest/25 bg-white/80 px-4 py-3 text-sm text-forest outline-none transition placeholder:text-muted/65 focus:border-forest focus:ring-2 focus:ring-forest/15 aria-invalid:border-[#8b4d42] aria-invalid:ring-[#8b4d42]/15"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            aria-describedby="checkout-email-help"
            aria-invalid={hasTouchedEmail && !isEmailValid}
            onBlur={() => setHasTouchedEmail(true)}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
          />
          <p
            id="checkout-email-help"
            className={`mt-1.5 min-h-4 text-xs ${
              hasTouchedEmail && !isEmailValid ? "text-[#8b4d42]" : "text-muted"
            }`}
          >
            {hasTouchedEmail && !isEmailValid
              ? "Digite um e-mail válido para continuar."
              : "O e-mail será enviado ao Mercado Pago para identificar o pagamento."}
          </p>
          <button
            className="mt-4 w-full rounded-full bg-forest px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#29462f] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
            type="submit"
            disabled={isCheckingOut || !isNameValid || !isEmailValid}
          >
            {isCheckingOut ? "Abrindo Mercado Pago…" : "Pagar com Mercado Pago"}
          </button>
        </form>
        <Link
          className="mt-2.5 flex w-full items-center justify-center rounded-full border border-forest/30 bg-white/55 px-5 py-3 text-sm font-bold text-forest transition hover:-translate-y-0.5 hover:bg-white"
          href="/presentes"
        >
          Continuar comprando
        </Link>
        <p className="mt-3 text-center text-xs leading-relaxed text-muted">
          Você será redirecionado ao ambiente seguro do Mercado Pago.
        </p>
        {error && (
          <p
            className="mt-4 rounded-xl bg-[#f8e9e5] p-3 text-sm text-[#7b4037]"
            role="alert"
          >
            {error}
          </p>
        )}
      </aside>
    </div>
  );
}
