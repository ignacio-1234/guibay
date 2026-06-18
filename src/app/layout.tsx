import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Guibay — Tu negocio, un solo enlace",
    template: "%s | Guibay",
  },
  description:
    "Crea tu micrositio web en minutos, sin saber programar. Ideal para negocios, emprendedores y creadores de contenido.",
  keywords: ["micrositio", "link en bio", "página web", "negocio", "emprendedor"],
  authors: [{ name: "Guibay" }],
  creator: "Guibay",
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://guibay.com",
    siteName: "Guibay",
    title: "Guibay — Tu negocio, un solo enlace",
    description: "Crea tu micrositio web en minutos, sin saber programar.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guibay — Tu negocio, un solo enlace",
    description: "Crea tu micrositio web en minutos, sin saber programar.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
