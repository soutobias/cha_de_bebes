import type { Metadata } from "next";
import Image from "next/image";
import gifts from "@/data/presentes.json";
import { GiftList } from "@/components/gifts/gift-list";
import type { Gift } from "@/lib/cart";
export const metadata: Metadata = { title: "Presentes" };
export default function PresentesPage() {
  return (
    <section
      className="
    relative isolate min-h-svh
    pt-28 pb-10
    max-sm:pt-[calc(5rem+env(safe-area-inset-top))]
    max-sm:pb-17

    before:absolute
    before:inset-0
    before:-z-10
    before:content-['']
    before:bg-[url('/images/banner-detalhes2.png')]
    before:bg-cover
    before:bg-center
    before:bg-fixed
    before:opacity-50

    max-sm:before:bg-[url('/images/banner-details-mobile.png')]
    max-sm:before:bg-fixed
  "
    >
      <div className="pb-20 mx-auto w-[min(1160px,calc(100%-40px))] max-sm:w-[calc(100%-20px)]">
        <div className="mx-auto mb-13 max-w-200 text-center">
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
              src="/images/gift-title.png"
              className="h-auto min-w-0 flex-1 max-sm:max-w-[calc(100%-64px)]"
              width={2114}
              height={447}
              alt="Sugestões de presentes para os pequenos"
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
          <p className="leading-7 text-muted pt-5">
            Como os papais moram do outro lado do oceano, seria muito difícil
            levar todos os presentes do Brasil. Por isso, criamos essa lista
            virtual. Os valores serão convertidos em dinheiro e utilizados pelos
            papais para compra dos presentes.
          </p>
        </div>
        <GiftList gifts={gifts as Gift[]} />
      </div>
    </section>
  );
}
