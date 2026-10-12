import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Parisienne } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import { FloatingCart } from "@/components/cart/floating-cart";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const script = Parisienne({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tonessa.baby"),
  title: { default: "Bebês Tonessa", template: "%s | Bebês Tonessa" },
  description: "Duas Ervilhinhas numa Vagem -Chá de bebê dos gêmeos Tonessa.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Bebês Tonessa",
    title: "Bebês Tonessa",
    description: "Duas Ervilhinhas numa Vagem — Chá de bebê dos gêmeos Tonessa.",
    images: [
      {
        url: "/images/shared-image.png",
        width: 1902,
        height: 914,
        alt: "Duas Ervilhinhas numa Vagem — Chá de bebê dos gêmeos Tonessa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bebês Tonessa",
    description: "Duas Ervilhinhas numa Vagem — Chá de bebê dos gêmeos Tonessa.",
    images: ["/images/shared-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable} ${script.variable}`}
    >
      <body className="m-0 bg-cream font-sans text-ink antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <FloatingCart />
        </CartProvider>
      </body>
    </html>
  );
}
