// Re-exporta los tipos de Prisma que se usan en el frontend
export type {
  User,
  Microsite,
  Template,
  Section,
  Addon,
  Plan,
  Subscription,
  Analytics,
} from "@prisma/client";

// Extensión de NextAuth
import "next-auth";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Tipos de datos JSON para cada sección
export interface ProfileSectionData {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  heroUrl?: string;
  category?: string;
}

export interface SocialSectionData {
  networks: {
    id: string;
    network: "instagram" | "facebook" | "twitter" | "tiktok" | "youtube" | "linkedin" | "whatsapp" | "other";
    url: string;
    label?: string;
  }[];
}

export interface LinksSectionData {
  buttons: {
    id: string;
    label: string;
    url: string;
    color?: string;
    icon?: string;
  }[];
}

export interface CatalogAddonData {
  products: {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    imageUrl?: string;
    available: boolean;
  }[];
}

export interface MapAddonData {
  address: string;
  lat?: number;
  lng?: number;
  embedUrl?: string;
}

export interface GalleryAddonData {
  images: {
    id: string;
    url: string;
    alt?: string;
  }[];
  columns?: 2 | 3;
}

// Tipos de respuesta API
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
