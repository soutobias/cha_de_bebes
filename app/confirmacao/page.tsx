import type { Metadata } from "next";
import Image from "next/image";
export const metadata: Metadata = { title: "Confirmação" };
export default function ConfirmacaoPage() {
  const formUrl = process.env.NEXT_PUBLIC_GOOGLE_FORM_URL;
  return (
    <section className="min-h-svh opacity-50 bg-[url('/images/banner.png')] bg-cover bg-center bg-fixed pt-28 pb-23 max-sm:bg-[url('/images/banner-mobile.png')] max-sm:bg-scroll max-sm:pt-[calc(5rem+env(safe-area-inset-top))] max-sm:pb-17">
      <div className="mx-auto w-[min(940px,calc(100%-40px))] max-sm:w-[calc(100%-28px)]">
        <div className="mx-auto max-w-170 text-center">
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
              src="/images/presenca-title.png"
              className="h-auto min-w-0 flex-1 max-sm:max-w-[calc(100%-64px)]"
              width={2172}
              height={724}
              alt="Confirmação de presença"
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
        <div className="mx-auto flex items-center max-w-100 justify-center gap-4 max-sm:gap-1 mb-8">
          <p className="text-xs font-bold tracking-[.2em] text-moss uppercase">
            Esperamos por você
          </p>
        </div>
        <div className="min-h-130 rounded-3xl border border-forest/15 bg-paper/85 p-2.5 shadow-[0_24px_70px_rgba(54,84,59,.1)] max-sm:p-1.5">
          {formUrl ? (
            <iframe
              className="block h-270 w-full rounded-[17px] border-0 bg-white"
              src={formUrl}
              title="Formulário de confirmação de presença"
              loading="lazy"
            >
              Carregando…
            </iframe>
          ) : (
            <div className="flex min-h-125 flex-col items-center justify-center p-10 text-center max-sm:p-6">
              <h2 className="mt-5 mb-2 font-display text-[32px] text-forest">
                Seu formulário aparecerá aqui
              </h2>
              <p className="max-w-130 leading-7 text-muted">
                Adicione a URL incorporada do Google Forms na variável{" "}
                <code className="rounded bg-[#edf0d3] px-1.5 py-0.5 text-forest max-sm:break-all">
                  NEXT_PUBLIC_GOOGLE_FORM_URL
                </code>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
