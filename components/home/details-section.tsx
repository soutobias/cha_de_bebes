import Image from "next/image";
import Link from "next/link";
import { DetailCard } from "./detail-card";

const details = [
  {
    label: "Data",
    title: "07 de Novembro de 2026",
    text: "Sábado",
    image: "/images/calendar-icon.png",
    mapUrl: null,
  },
  {
    label: "Horário",
    title: "A partir das 15h",
    text: "Esperamos você",
    image: "/images/relogio-icon.png",
    mapUrl: null,
  },
  {
    label: "Local",
    title: "Rua Spix, 157 - Ponta Grossa/PR",
    text: "Casa da vó Nadir",
    image: "/images/marker-icon.png",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Rua+Spix%2C+157%2C+Ponta+Grossa%2C+PR",
  },
];

export function DetailsSection() {
  return (
    <section
      className="
    relative isolate min-h-svh overflow-hidden
    pt-12 pb-24
    max-sm:pt-28 max-sm:pb-12

    before:absolute
    before:inset-0
    before:-z-10
    before:content-['']
    before:bg-[url('/images/banner-detalhes2.png')]
    before:bg-cover
    before:bg-center
    before:opacity-50

    max-sm:before:bg-[url('/images/banner-details-mobile.png')]
  "
      id="detalhes"
    >
      <div className="mx-auto w-[min(1160px,calc(100%-40px))] max-sm:w-[calc(100%-28px)]">
        <div className="mx-auto mb-7 flex items-center justify-center gap-4 max-sm:grid max-sm:w-full max-sm:grid-cols-[2rem_minmax(0,1fr)_2rem] max-sm:gap-2 max-sm:px-1 max-sm:mb-3">
          <Image
            src="/images/leafes.png"
            className="h-auto w-20 shrink-0 max-sm:w-8"
            width={1254}
            height={1254}
            alt=""
            aria-hidden="true"
          />
          <Image
            src="/images/title-detalhes.png"
            className="h-auto min-w-0 flex-1 max-sm:w-full max-sm:max-w-none"
            width={2137}
            height={242}
            alt="Detalhes do nosso encontro"
          />
          <Image
            src="/images/leafes.png"
            className="h-auto w-20 shrink-0 rotate-180 max-sm:w-8"
            width={1254}
            height={1254}
            alt=""
            aria-hidden="true"
          />
        </div>
        <p className="mx-auto mb-8 max-w-2xl text-center leading-7 text-muted max-sm:mb-5 max-sm:text-sm max-sm:leading-5">
          Será um momento muito especial e adoraríamos ter você com a gente!
        </p>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 max-md:grid-cols-1 max-sm:grid-cols-2 max-sm:gap-3">
          {details.map(({ mapUrl, ...detail }, index) => (
            <DetailCard
              key={detail.label}
              {...detail}
              className={index === 2 ? "max-sm:col-span-2" : ""}
            >
              {mapUrl && (
                <a
                  className="mt-3 inline-flex rounded-full bg-forest px-3.5 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#29462f] max-sm:mt-2"
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver no Google Maps&nbsp; ↗
                </a>
              )}
            </DetailCard>
          ))}
          <DetailCard
            className="max-sm:col-span-2"
            label="Confirmação + Presentes"
            title="Confirme sua presença e veja nossa lista de presentes"
            text=""
            image="/images/gift-icon.png"
          >
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              <Link
                className="rounded-full bg-forest px-3.5 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#29462f]"
                href="/confirmacao"
              >
                Confirmar presença
              </Link>
              <Link
                className="rounded-full border border-forest/30 bg-white/60 px-3.5 py-2 text-xs font-bold text-forest transition hover:-translate-y-0.5 hover:bg-white"
                href="/presentes"
              >
                Lista de presentes
              </Link>
            </div>
          </DetailCard>
        </div>
      </div>
    </section>
  );
}
