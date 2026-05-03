import { z } from 'zod';

const currentYear = new Date().getFullYear();

const optionalTextField = (max: number, message: string) =>
  z.string().trim().max(max, message).nullable().optional();

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
    .nullable()
    .optional();

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
  category: optionalTextField(50, 'Categoria inválida'),
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
    .nullable()
    .optional(),
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
    .nullable()
    .optional(),
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
    .nullable()
    .optional(),
  availability: z.array(z.string()).optional(),
  serviceHours: optionalTextField(100, 'Horário muito longo'),
  photoURL: z.string().nullable().optional(),
  bannerURL: z.string().nullable().optional(),
  gallery: z
    .array(
      z.object({
        url: z.string(),
        description: z.string().max(200, 'Descrição da foto muito longa').nullable().optional()
      }),
    )
    .max(5, 'Você pode enviar no máximo 5 fotos para a galeria'),
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
