"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AddToCart } from "@/components/cart/add-to-cart";
import { formatBRL, type Gift } from "@/lib/cart";

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

const titleCollator = new Intl.Collator("pt-BR", { sensitivity: "base" });

export function GiftList({ gifts }: { gifts: Gift[] }) {
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");

  const sortedGifts = useMemo(() => {
    return [...gifts].sort((first, second) => {
      switch (sortBy) {
        case "name-desc":
          return titleCollator.compare(second.title, first.title);
        case "price-asc":
          return first.price - second.price;
        case "price-desc":
          return second.price - first.price;
        default:
          return titleCollator.compare(first.title, second.title);
      }
    });
  }, [gifts, sortBy]);

  return (
    <>
      <div className="mb-5 flex justify-end max-sm:mb-3">
        <label className="flex items-center gap-2 rounded-full border border-forest/15 bg-paper/90 py-1.5 pr-2 pl-4 text-sm font-bold text-forest shadow-sm backdrop-blur-xs max-sm:w-full max-sm:text-xs">
          <span className="shrink-0">Ordenar por</span>
          <select
            className="min-w-0 flex-1 cursor-pointer rounded-full border border-forest/20 bg-white px-3 py-2 text-sm font-medium text-ink outline-none focus:border-forest max-sm:text-xs"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
          >
            <option value="name-asc">Nome: A–Z</option>
            <option value="name-desc">Nome: Z–A</option>
            <option value="price-asc">Preço: menor para maior</option>
            <option value="price-desc">Preço: maior para menor</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-4 gap-3.5 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:gap-2.5">
        {sortedGifts.map((gift) => (
          <article
            className="flex min-h-105 min-w-0 flex-col overflow-hidden rounded-xl border border-[#d9dfbf] bg-[#fffef7]/88 p-3 shadow-[0_8px_24px_rgba(54,84,59,.07)] backdrop-blur-[2px] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(54,84,59,.12)] max-sm:min-h-0 max-sm:w-full max-sm:p-2"
            key={gift.id}
          >
            <div className="relative h-45 overflow-hidden max-sm:h-30">
              <Image
                className="object-contain p-1 max-sm:scale-125 max-sm:p-0"
                src={gift.image}
                alt={gift.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <div className="flex flex-1 flex-col px-2 pb-2 text-center max-sm:px-1 max-sm:pb-1">
              <h2 className="font-display text-[24px] leading-tight font-semibold text-forest max-sm:text-lg">
                {gift.title}
              </h2>
              <p className="mt-1.5 mb-4 min-h-15 text-[13px] leading-relaxed text-muted max-sm:mt-1 max-sm:mb-2 max-sm:min-h-0 max-sm:text-xs max-sm:leading-snug">
                {gift.description}
              </p>
              <p className="mt-auto font-display text-xl font-semibold text-forest max-sm:text-lg">
                {formatBRL(gift.price)}
              </p>
              <AddToCart productId={gift.id} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
