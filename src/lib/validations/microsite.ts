import { z } from "zod";

export const createMicrositeSchema = z.object({
  title: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(60),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  templateId: z.string().cuid("Plantilla inválida"),
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

export type CreateMicrositeInput = z.infer<typeof createMicrositeSchema>;
export type UpdateMicrositeInput = z.infer<typeof updateMicrositeSchema>;
