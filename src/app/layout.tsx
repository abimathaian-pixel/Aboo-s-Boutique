import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { CartDrawer } from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: "Aboo'sBoutique | Curated Luxury Apparel & Haute Couture",
  description:
    "Discover bespoke tailoring, Italian linen shirts, Japanese selvedge denim, and artisanal Mulberry silk dresses at Aboo'sBoutique.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#FCFBF9] text-neutral-900 antialiased selection:bg-brand-gold selection:text-white">
        <Providers>
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
