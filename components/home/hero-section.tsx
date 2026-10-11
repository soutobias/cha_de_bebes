import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative isolate grid min-h-svh items-center overflow-hidden bg-[#f8f6e8]">
      <div
        className="absolute inset-0 -z-10 bg-[url('/images/banner.png')] bg-cover bg-center max-md:bg-position-[62%_center] max-sm:bg-[url('/images/banner-mobile.png')] max-sm:bg-center"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-linear-to-r from-cream/25 to-transparent max-md:from-cream/95 max-md:via-cream/70 max-md:to-cream/10 max-sm:hidden"
        aria-hidden="true"
      />
      <div className="mx-auto w-[min(1160px,calc(100%-40px))] py-20 pb-30 max-sm:flex max-sm:min-h-svh max-sm:w-[calc(100%-32px)] max-sm:flex-col max-sm:pt-[calc(5rem+env(safe-area-inset-top))] max-sm:pb-7">
        <div className="flex w-full items-center justify-center">
          <Image
            src="/images/hero-title.png"
            className="mb-6 h-auto max-h-[52svh] w-auto max-w-full max-sm:mb-0 max-sm:max-h-none max-sm:w-full"
            width={1672}
            height={941}
            alt=""
            aria-hidden="true"
          />
        </div>
        <div className="mt-7.5 flex flex-wrap justify-center gap-3 max-sm:mt-auto max-sm:flex-col max-sm:items-stretch max-sm:gap-2">
          <Link
            className="inline-flex w-[20%] items-center justify-center gap-2 rounded-full bg-forest px-5.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(54,84,59,.2)] transition hover:-translate-y-0.5 hover:bg-[#29462f] max-sm:min-h-11 max-sm:w-full max-sm:py-1 max-sm:text-base"
            href="/presentes"
          >
            <Image
              src="/images/gift-icon.svg"
              width={25}
              height={25}
              className="max-sm:size-6"
              alt=""
              aria-hidden="true"
            />
            Lista de presentes
          </Link>
          <Link
            className="inline-flex w-[20%] items-center justify-center gap-2 rounded-full border border-forest bg-paper/80 px-5.5 py-2 text-sm font-bold transition hover:-translate-y-0.5 max-sm:min-h-11 max-sm:w-full max-sm:py-1 max-sm:text-base"
            href="/confirmacao"
          >
            <Image
              src="/images/hearth-icon.png"
              width={30}
              height={30}
              className="max-sm:size-6"
              alt=""
              aria-hidden="true"
            />
            Confirmar presença
          </Link>
          <a
            className="inline-flex w-[20%] items-center justify-center gap-2 rounded-full bg-forest px-5.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(54,84,59,.2)] transition hover:-translate-y-0.5 hover:bg-[#29462f] max-sm:min-h-11 max-sm:w-full max-sm:py-1 max-sm:text-base"
            href="#detalhes"
          >
            <Image
              src="/images/marker-icon.png"
              width={40}
              height={40}
              className="max-sm:size-6"
              alt=""
              aria-hidden="true"
            />
            Detalhes
          </a>
        </div>
      </div>
    </section>
  );
}
