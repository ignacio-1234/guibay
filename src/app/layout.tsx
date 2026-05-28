import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
