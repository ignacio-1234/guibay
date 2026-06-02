import { z } from "zod";

const optionalUrlSchema = z.union([z.string().url(), z.literal(""), z.null()]).optional();

export const createMicrositeSchema = z.object({
  title: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(60),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  templateId: z.string().min(1, "Plantilla inválida"),
  category: z.string().optional(),
  description: z.string().max(160).optional(),
});

export const updateMicrositeSchema = createMicrositeSchema.partial().omit({ slug: true });

export const slugSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
});

export const updateMicrositeSectionsSchema = z.object({
  profile: z.object({
    name: z.string().min(1, "El nombre es requerido").max(80),
    bio: z.string().max(240).optional().default(""),
    avatarUrl: optionalUrlSchema,
    heroUrl: optionalUrlSchema,
  }),
  social: z.object({
    networks: z
      .array(
        z.object({
          id: z.string().min(1),
          network: z.string().min(1).max(30),
          url: z.string().url("URL invalida"),
          label: z.string().max(40).optional(),
        })
      )
      .max(8),
  }),
  links: z.object({
    buttons: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1).max(60),
          url: z.string().url("URL invalida"),
          color: z
            .string()
            .regex(/^#[0-9A-Fa-f]{6}$/, "Color invalido")
            .optional(),
        })
      )
      .max(12),
  }),
  services: z
    .object({
      heading: z.string().max(60).optional().default("Nuestros Servicios"),
      items: z
        .array(
          z.object({
            id: z.string().min(1),
            title: z.string().min(1).max(60),
            description: z.string().max(200).optional().default(""),
            icon: z.string().max(8).optional().default("⭐"),
          })
        )
        .max(20),
    })
    .optional(),
  contact: z
    .object({
      phone: z.string().max(30).optional().default(""),
      whatsapp: z.string().max(30).optional().default(""),
      email: z.string().email().optional().or(z.literal("")).optional(),
      address: z.string().max(200).optional().default(""),
      hours: z.string().max(100).optional().default(""),
    })
    .optional(),
});

export type CreateMicrositeInput = z.infer<typeof createMicrositeSchema>;
export type UpdateMicrositeInput = z.infer<typeof updateMicrositeSchema>;
export type UpdateMicrositeSectionsInput = z.infer<typeof updateMicrositeSectionsSchema>;
