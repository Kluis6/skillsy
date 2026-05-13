import { z } from 'zod';
import { AVAILABILITY_OPTIONS, PROVIDER_CATEGORIES } from '@/lib/profile-form';
import { REPORT_REASON_OPTIONS } from '@/lib/reporting';

const currentYear = new Date().getFullYear();

const optionalTextField = (max: number, message: string) =>
  z.string().trim().max(max, message);

const optionalDigitsField = (
  min: number,
  max: number,
  minMessage: string,
  maxMessage: string,
) =>
  z
    .union([
      z.literal(''),
      z
        .string()
        .trim()
        .regex(/^\d+$/, 'Apenas números são permitidos')
        .min(min, minMessage)
        .max(max, maxMessage),
    ])
    ;

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  bio: optionalTextField(500, 'Bio deve ter no máximo 500 caracteres'),
  location: optionalTextField(100, 'Localização deve ter no máximo 100 caracteres'),
  ward: optionalTextField(100, 'Ala/Ramo deve ter no máximo 100 caracteres'),
  serviceType: optionalTextField(100, 'Serviço deve ter no máximo 100 caracteres'),
  category: z.union([z.literal(''), z.enum(PROVIDER_CATEGORIES)]),
  companyName: optionalTextField(100, 'Nome da empresa deve ter no máximo 100 caracteres'),
  businessAddress: optionalTextField(150, 'Endereço deve ter no máximo 150 caracteres'),
  businessAddressNumber: optionalTextField(20, 'Número deve ter no máximo 20 caracteres'),
  businessNeighborhood: optionalTextField(100, 'Bairro deve ter no máximo 100 caracteres'),
  businessState: optionalTextField(100, 'Estado deve ter no máximo 100 caracteres'),
  businessComplement: optionalTextField(100, 'Complemento deve ter no máximo 100 caracteres'),
  isProvider: z.boolean(),
  whatsapp: optionalDigitsField(
    10,
    15,
    'WhatsApp deve ter pelo menos 10 dígitos (DDD + Número)',
    'Número de WhatsApp deve ter no máximo 15 dígitos',
  ),
  phone: z
    .union([
      z.literal(''),
      z
        .string()
        .trim()
        .regex(/^\d+$/, 'Apenas números são permitidos')
        .max(15, 'Número de telefone deve ter no máximo 15 dígitos'),
    ])
    ,
  instagram: optionalTextField(50, 'Usuário de Instagram deve ter no máximo 50 caracteres'),
  facebook: optionalTextField(100, 'Link de Facebook deve ter no máximo 100 caracteres'),
  linkedin: optionalTextField(100, 'Link de LinkedIn deve ter no máximo 100 caracteres'),
  website: z
    .union([
      z.literal(''),
      z
        .string()
        .trim()
        .url('Formato de URL inválido (use https://...)')
        .max(150, 'Link do site muito longo'),
    ])
    ,
  baptismYear: z
    .union([
      z.literal(''),
      z
        .string()
        .trim()
        .regex(/^\d{4}$/, 'Ano deve ter exatamente 4 dígitos')
        .refine(
          (value) => {
            const year = Number(value);
            return year >= 1830 && year <= currentYear;
          },
          `Ano deve estar entre 1830 e ${currentYear}`,
        ),
    ])
    ,
  availability: z.array(z.enum(AVAILABILITY_OPTIONS)),
  serviceHours: optionalTextField(100, 'Horário muito longo'),
  photoURL: z.string(),
  bannerURL: z.string(),
  gallery: z
    .array(
      z.object({
        url: z.string().trim().min(1, 'A foto precisa ter uma URL válida'),
        description: z.string().max(200, 'Descrição da foto muito longa')
      }),
    )
    .max(5, 'Você pode enviar no máximo 5 fotos para a galeria'),
}).superRefine((data, ctx) => {
  if (!data.isProvider) {
    return;
  }

  if (!data.category) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['category'],
      message: 'Selecione uma categoria para anunciar seus serviços',
    });
  }

  if (!data.serviceType || data.serviceType.trim().length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['serviceType'],
      message: 'Descreva sua especialidade para aparecer nas buscas',
    });
  }
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
    .max(100, 'O e-mail deve ter no máximo 100 caracteres'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(50, 'A senha deve ter no máximo 50 caracteres'),
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
  businessAddress: z.string().max(150, 'Endereço muito longo').nullable().optional(),
  businessAddressNumber: z.string().max(20, 'Número muito longo').nullable().optional(),
  businessNeighborhood: z.string().max(100, 'Bairro muito longo').nullable().optional(),
  businessState: z.string().max(100, 'Estado muito longo').nullable().optional(),
  businessComplement: z.string().max(100, 'Complemento muito longo').nullable().optional(),
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

export const reportUserSchema = z.object({
  reason: z.enum(REPORT_REASON_OPTIONS, {
    message: 'Selecione um motivo para a denúncia',
  }),
  details: z
    .string()
    .trim()
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
});

export type ReportUserFormData = z.infer<typeof reportUserSchema>;

export const postEditorSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(120, 'O título deve ter no máximo 120 caracteres'),
  slug: z
    .string()
    .trim()
    .min(3, 'O slug deve ter pelo menos 3 caracteres')
    .max(140, 'O slug deve ter no máximo 140 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  excerpt: z
    .string()
    .trim()
    .min(20, 'O resumo deve ter pelo menos 20 caracteres')
    .max(240, 'O resumo deve ter no máximo 240 caracteres'),
  content: z
    .string()
    .trim()
    .min(100, 'O conteúdo deve ter pelo menos 100 caracteres')
    .max(20000, 'O conteúdo deve ter no máximo 20000 caracteres'),
  coverImageUrl: z
    .union([
      z.literal(''),
      z.string().trim().url('Informe uma URL válida para a capa'),
    ]),
  tags: z
    .string()
    .max(120, 'As tags devem ter no máximo 120 caracteres'),
});

export type PostEditorFormData = z.infer<typeof postEditorSchema>;
