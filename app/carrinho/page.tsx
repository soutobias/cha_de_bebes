import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";
import Image from "next/image";
import { getSiteVariant } from "@/lib/get-site-variant";

export const metadata: Metadata = { title: "Carrinho" };

export default async function CarrinhoPage() {
  const isUkSite = (await getSiteVariant()) === "uk";

  return (
    <section
      className="
    relative isolate min-h-svh
    before:absolute before:inset-0 before:-z-10
    before:bg-[url('/images/banner.png')]
    before:bg-cover before:bg-center before:bg-fixed
    before:opacity-40
    max-sm:before:bg-[url('/images/banner-mobile.png')]
    max-sm:before:bg-scroll
    pt-28 pb-14
    max-sm:pt-[calc(5rem+env(safe-area-inset-top))]
    max-sm:pb-10
  "
    >
      {" "}
      <div className="mx-auto w-[min(1100px,calc(100%-40px))] max-sm:w-[calc(100%-28px)]">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto flex items-center max-w-100 justify-center gap-4 max-sm:gap-1">
            <Image
              src="/images/leafes.png"
              className="h-auto w-20 shrink-0 max-sm:w-7"
              width={1254}
              height={1254}
              alt=""
              aria-hidden="true"
            />
            <Image
              src="/images/carrinho-title.png"
              className="h-auto min-w-0 flex-1 max-sm:max-w-[calc(100%-64px)]"
              width={2172}
              height={724}
              alt="Carrinho de presentes"
            />
            <Image
              src="/images/leafes.png"
              className="h-auto w-20 shrink-0 rotate-180 max-sm:w-7"
              width={1254}
              height={1254}
              alt=""
              aria-hidden="true"
            />
          </div>
        </div>
        {isUkSite ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-forest/15 bg-paper/85 p-10 text-center shadow-[0_24px_70px_rgba(54,84,59,.1)]">
            <h1 className="font-display text-3xl text-forest">
              Carrinho indisponível
            </h1>
            <p className="mt-3 text-muted">
              Para este evento, os presentes estão disponíveis na lista da
              Amazon UK.
            </p>
          </div>
        ) : (
          <CartPage />
        )}
      </div>
    </section>
  );
}
