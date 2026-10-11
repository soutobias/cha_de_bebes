"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Início" },
  { href: "/#detalhes", label: "Detalhes" },
  { href: "/presentes", label: "Presentes" },
  { href: "/confirmacao", label: "Confirmação" },
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const overlaysPage = [
    "/",
    "/presentes",
    "/confirmacao",
    "/carrinho",
  ].includes(pathname);

  return (
    <header
      className={`${overlaysPage ? "absolute" : "sticky"} top-0 z-20 w-full bg-transparent max-sm:border-b max-sm:border-white/10 max-sm:bg-[#fffef7]/10 max-sm:pt-[env(safe-area-inset-top)] max-sm:backdrop-blur-[2px]`}
    >
      <div className="relative mx-auto flex min-h-19 w-[min(1160px,calc(100%-40px))] items-center justify-between max-sm:min-h-16 max-sm:w-[calc(100%-32px)] max-sm:py-2">
        <Link
          className="flex items-center gap-2.5"
          href="/"
          aria-label="Chá dos Gêmeos — início"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/images/logo.png"
            className="h-auto w-50 max-sm:w-38"
            width={2102}
            height={536}
            alt=""
            aria-hidden="true"
          />
        </Link>
        <button
          className="hidden size-11 items-center justify-center rounded-full border border-forest/20 bg-paper/80 text-forest shadow-sm backdrop-blur-sm max-sm:inline-flex"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="relative block h-4.5 w-5" aria-hidden="true">
            <span
              className={`absolute top-0 left-0 h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`absolute top-2 left-0 h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`absolute top-4 left-0 h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </span>
        </button>
        <nav
          id="mobile-navigation"
          className={`${isMenuOpen ? "max-sm:flex" : "max-sm:hidden"} flex gap-2 max-sm:absolute max-sm:top-[calc(100%+8px)] max-sm:right-0 max-sm:z-30 max-sm:w-full max-sm:flex-col max-sm:rounded-2xl max-sm:border max-sm:border-forest/15 max-sm:bg-paper/95 max-sm:p-3 max-sm:shadow-[0_16px_40px_rgba(37,55,41,.18)] max-sm:backdrop-blur-md`}
          aria-label="Navegação principal"
        >
          {links.map((link) => {
            const className = `rounded-full px-4.5 py-2.5 text-lg font-bold transition-colors max-sm:px-3 max-sm:py-2 max-sm:text-xs ${pathname === link.href ? "bg-[#e9edce] text-forest2 " : "text-[#53604f] hover:bg-[#e9edce] hover:text-forest2"}`;

            if (link.href === "/#detalhes") {
              return (
                <a
                  key={link.href}
                  className={className}
                  href={pathname === "/" ? "#detalhes" : link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                className={className}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link
          className="flex items-center gap-2.5 max-sm:hidden"
          href="/"
          aria-label="Chá dos Gêmeos — início"
        >
          <Image
            src="/images/logo2.png"
            className="h-auto w-50"
            width={2172}
            height={724}
            alt=""
            aria-hidden="true"
          />
        </Link>
      </div>
    </header>
  );
}
