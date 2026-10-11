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
  title: { default: "Chá dos Gêmeos", template: "%s | Chá dos Gêmeos" },
  description:
    "Um encontro cheio de carinho para celebrar a chegada dos nossos bebês.",
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
