"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import giftsData from "@/data/presentes.json";
import { formatBRL, MAX_ITEM_QUANTITY, type Gift } from "@/lib/cart";
import { useCart } from "./cart-provider";

const gifts = giftsData as Gift[];

export function CartPage() {
  const { items, isReady, updateQuantity, removeItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPaymentStatus(
        new URLSearchParams(window.location.search).get("status"),
      );
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

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

  async function checkout() {
    setError("");
    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const result: { checkoutUrl?: string; error?: string } =
        await response.json();

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(
          result.error || "Não foi possível iniciar o pagamento.",
        );
      }

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

  if (!isReady) {
    return (
      <div className="grid min-h-80 place-items-center text-muted">
        Carregando carrinho…
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
              ? "Você retornou do Mercado Pago. A confirmação final será enviada pelo próprio Mercado Pago. Obrigado pelo carinho!"
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
        <button
          className="w-full rounded-full bg-forest px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#29462f] disabled:cursor-wait disabled:opacity-60"
          type="button"
          disabled={isCheckingOut}
          onClick={checkout}
        >
          {isCheckingOut ? "Abrindo Mercado Pago…" : "Pagar com Mercado Pago"}
        </button>
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
