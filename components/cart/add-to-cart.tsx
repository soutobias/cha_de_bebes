"use client";

import { useEffect, useState } from "react";
import { MAX_ITEM_QUANTITY } from "@/lib/cart";
import { CartIcon } from "./cart-icon";
import { useCart } from "./cart-provider";

export function AddToCart({ productId }: { productId: number }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [wasAdded, setWasAdded] = useState(false);

  useEffect(() => {
    if (!wasAdded) return;

    const timeout = window.setTimeout(() => setWasAdded(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [wasAdded]);

  return (
    <div className="mt-5 flex gap-2 max-sm:mt-2 max-sm:w-full max-sm:min-w-0 max-sm:flex-col max-sm:gap-1.5">
      <label className="sr-only" htmlFor={`quantity-${productId}`}>
        Quantidade
      </label>
      <input
        id={`quantity-${productId}`}
        className="w-17 rounded-full border border-forest/25 bg-white px-3 text-center text-sm text-forest outline-none focus:border-forest max-sm:h-8 max-sm:w-full max-sm:px-2"
        type="number"
        min={1}
        max={MAX_ITEM_QUANTITY}
        value={quantity}
        onChange={(event) => {
          const nextQuantity = Number(event.target.value);
          setQuantity(
            Number.isFinite(nextQuantity)
              ? Math.min(MAX_ITEM_QUANTITY, Math.max(1, nextQuantity))
              : 1,
          );
        }}
      />
      <button
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-forest px-4 py-2.5 text-sm font-bold whitespace-nowrap text-white transition hover:-translate-y-0.5 hover:bg-[#29462f] max-sm:h-8 max-sm:w-full max-sm:max-w-full max-sm:min-w-0 max-sm:flex-none max-sm:gap-1 max-sm:overflow-hidden max-sm:px-1.5 max-sm:py-1 max-sm:text-[11px]"
        type="button"
        onClick={() => {
          addItem(productId, quantity);
          setWasAdded(true);
        }}
      >
        <CartIcon className="size-4.5 shrink-0 text-[#dfe8c8] max-sm:size-3.5" />
        <span className="min-w-0 truncate">
          {wasAdded ? "Adicionado ✓" : "Adicionar"}
        </span>
      </button>
    </div>
  );
}
