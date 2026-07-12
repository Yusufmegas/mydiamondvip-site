import type { Metadata, Viewport } from "next";
import { Inter_Tight, Marcellus } from "next/font/google";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import ScrollFx from "@/components/site/ScrollFx";
import { JsonLd } from "@/components/site/Shared";
import { contact } from "@/data/contact";

const interTight = Inter_Tight({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500"],
});

// Display serif — başlıklarda atelier zarafeti (tek ağırlık, ölçülü kullanım)
const marcellus = Marcellus({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(contact.siteUrl),
  title: {
    default: "MyDiamondVIP — VIP Araç Dizayn | İstanbul",
    template: "%s | MyDiamondVIP",
  },
  description:
    "İstanbul'da VIP araç dizaynı, Mercedes Vito & Sprinter VIP dönüşüm, araç içi kaplama, deri döşeme, yıldız tavan ve ambiyans aydınlatma. Kişiye özel premium araç tasarımı.",
  keywords: [
    "VIP araç dizayn", "VIP oto dizayn", "Mercedes Vito VIP dizayn", "Mercedes Sprinter VIP dizayn",
    "araç içi kaplama", "binek araç deri döşeme", "yıldız tavan", "ambiyans aydınlatma", "İstanbul VIP araç dizayn",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "MyDiamondVIP",
    title: "MyDiamondVIP — VIP Araç Dizayn | İstanbul",
    description: "Kişiye özel VIP araç tasarımı: Vito, Sprinter, V-Class dönüşüm, deri döşeme, yıldız tavan.",
    images: ["/poster.webp"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${interTight.variable} ${marcellus.variable}`}>
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "AutoRepair",
            name: contact.companyName,
            description: contact.shortDescription,
            url: contact.siteUrl,
            telephone: contact.phone,
            email: contact.email,
            image: `${contact.siteUrl}/poster.webp`,
            address: {
              "@type": "PostalAddress",
              streetAddress: contact.address,
              addressLocality: contact.city,
              addressCountry: contact.country,
            },
            areaServed: contact.city,
            openingHours: "Mo-Sa 09:00-19:00",
            sameAs: [contact.social.instagram, contact.social.youtube],
          }}
        />
        <ScrollFx />
        <Header />
        <main>{children}</main>
        <Footer />
        {/* Mobilde her an görünür WhatsApp erişimi */}
        <a
          className="floating-wa"
          href={`https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent('Merhaba, MyDiamondVIP hizmetleri hakkında bilgi almak istiyorum.')}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile iletişime geç"
        >
          WhatsApp
        </a>
      </body>
    </html>
  );
}
