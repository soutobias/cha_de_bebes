import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";
import Image from "next/image";

export const metadata: Metadata = { title: "Carrinho" };

export default function CarrinhoPage() {
  return (
    <section
      className="
    relative isolate min-h-svh
    before:absolute before:inset-0 before:-z-10
    before:bg-[url('/images/banner.png')]
    before:bg-cover before:bg-center before:bg-fixed
    before:opacity-50
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
        <CartPage />
      </div>
    </section>
  );
}
