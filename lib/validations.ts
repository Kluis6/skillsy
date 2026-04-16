import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').nullable().optional(),
  location: z.string().max(100, 'Localização muito longa').nullable().optional(),
  ward: z.string().max(100, 'Ala/Ramo muito longo').nullable().optional(),
  serviceType: z.string().max(100, 'Serviço muito longo').nullable().optional(),
  category: z.string().nullable().optional(),
  companyName: z.string().max(100, 'Nome da empresa muito longo').nullable().optional(),
  isProvider: z.boolean(),
  whatsapp: z.string()
    .regex(/^\d*$/, 'Apenas números são permitidos')
    .max(15, 'Número de WhatsApp muito longo')
    .nullable().optional(),
  instagram: z.string().max(50, 'Usuário de Instagram muito longo').nullable().optional(),
  facebook: z.string().max(100, 'Link de Facebook muito longo').nullable().optional(),
  linkedin: z.string().max(100, 'Link de LinkedIn muito longo').nullable().optional(),
  website: z.string().url('URL inválida').or(z.literal('')).nullable().optional(),
  photoURL: z.string().nullable().optional(),
  bannerURL: z.string().nullable().optional(),
  gallery: z.array(z.string()),
}).refine((data) => {
  if (data.isProvider) {
    return !!data.category && data.category !== '';
  }
  return true;
}, {
  message: "Selecione uma categoria para seu serviço",
  path: ["category"]
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export const signUpSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres').max(1000, 'Mensagem muito longa'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const adminEditUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  location: z.string().max(100, 'Localização muito longa').nullable().optional(),
  ward: z.string().max(100, 'Ala/Ramo muito longo').nullable().optional(),
  serviceType: z.string().max(100, 'Serviço muito longo').nullable().optional(),
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
