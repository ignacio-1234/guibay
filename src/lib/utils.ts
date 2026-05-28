import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

/** Combina clases de Tailwind de forma segura */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Genera un slug URL-safe desde un texto */
export function toSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: "es",
    remove: /[*+~.()'"!:@]/g,
  });
}

/** Formatea un número como precio en CLP */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formatea un número como precio en USD */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Trunca un texto a un máximo de caracteres */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** Genera la URL pública de un micrositio */
export function getMicrositeUrl(slug: string, customDomain?: string | null): string {
  if (customDomain) return `https://${customDomain}`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://guibay.com";
  return `${baseUrl}/${slug}`;
}

/** Verifica si una URL es válida */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
