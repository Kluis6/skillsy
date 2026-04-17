import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome deve ter no máximo 500 caracteres'),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').nullable().optional(),
  location: z.string().max(100, 'Localização deve ter no máximo 100 caracteres').nullable().optional(),
  ward: z.string().max(100, 'Ala/Ramo deve ter no máximo 100 caracteres').nullable().optional(),
  serviceType: z.string().max(100, 'Serviço deve ter no máximo 100 caracteres').nullable().optional(),
  category: z.string().max(50, 'Categoria inválida').nullable().optional(),
  companyName: z.string().max(100, 'Nome da empresa deve ter no máximo 100 caracteres').nullable().optional(),
  isProvider: z.boolean(),
  whatsapp: z.string()
    .regex(/^\d*$/, 'Apenas números são permitidos')
    .min(10, 'WhatsApp deve ter pelo menos 10 dígitos (DDD + Número)')
    .max(15, 'Número de WhatsApp deve ter no máximo 15 dígitos')
    .nullable().optional(),
  instagram: z.string().max(50, 'Usuário de Instagram deve ter no máximo 50 caracteres').nullable().optional(),
  facebook: z.string().max(100, 'Link de Facebook deve ter no máximo 100 caracteres').nullable().optional(),
  linkedin: z.string().max(100, 'Link de LinkedIn deve ter no máximo 100 caracteres').nullable().optional(),
  website: z.string().url('Formato de URL inválido (use https://...)').max(150, 'Link do site muito longo').or(z.literal('')).nullable().optional(),
  baptismYear: z.string()
    .regex(/^\d*$/, 'Ano deve conter apenas números')
    .max(4, 'Ano deve ter 4 dígitos')
    .nullable().optional(),
  availability: z.array(z.string()).optional(),
  serviceHours: z.string().max(100, 'Horário muito longo').nullable().optional(),
  photoURL: z.string().nullable().optional(),
  bannerURL: z.string().nullable().optional(),
  gallery: z.array(z.string()),
}).refine((data) => {
  if (data.isProvider) {
    return !!data.category && data.category !== '';
  }
  return true;
}, {
  message: "Selecione uma categoria para anunciar seu serviço",
  path: ["category"]
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export const signUpSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres'),
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .max(100, 'E-mail muito longo'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha muito longa (máximo 50 caracteres)'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

export const contactSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres'),
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido')
    .max(100, 'E-mail muito longo'),
  message: z.string()
    .min(1, 'Mensagem é obrigatória')
    .min(10, 'A mensagem deve ter pelo menos 10 caracteres')
    .max(1000, 'A mensagem deve ter no máximo 1000 caracteres'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const adminEditUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  location: z.string().max(100, 'Localização muito longa').nullable().optional(),
  ward: z.string().max(100, 'Ala/Ramo muito longo').nullable().optional(),
  serviceType: z.string().max(100, 'Serviço muito longo').nullable().optional(),
  baptismYear: z.number().int().min(1830).max(new Date().getFullYear()).nullable().optional(),
  availability: z.array(z.string()).optional(),
  serviceHours: z.string().max(100, 'Horário muito longo').nullable().optional(),
  role: z.enum(['user', 'admin']),
  isProvider: z.boolean(),
  verifiedMember: z.boolean(),
  isBlocked: z.boolean(),
});

export type AdminEditUserFormData = z.infer<typeof adminEditUserSchema>;

export const adminCreateAdminSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
});

export type AdminCreateAdminFormData = z.infer<typeof adminCreateAdminSchema>;
