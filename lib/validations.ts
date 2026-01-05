import { z } from 'zod'

// Schémas de validation pour les API routes

export const interventionSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(200, 'Le titre est trop long'),
  description: z.string().max(1000, 'La description est trop longue').optional().nullable(),
  date: z.string().datetime('Date invalide'),
  duration: z.number().int().min(1, 'La durée doit être au minimum de 1 minute').optional().nullable(),
  clientId: z.string().min(1, 'Le client est requis'),
  address: z.string().max(500, 'L\'adresse est trop longue').optional().nullable(),
  price: z.number().min(0, 'Le prix ne peut pas être négatif').optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']).optional(),
})

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Le client est requis'),
  date: z.string().datetime('Date invalide'),
  dueDate: z.string().datetime('Date d\'échéance invalide').optional().nullable(),
  subtotal: z.number().min(0, 'Le sous-total ne peut pas être négatif'),
  taxRate: z.number().min(0).max(100, 'Le taux de TVA doit être entre 0 et 100'),
  tax: z.number().min(0, 'La TVA ne peut pas être négative'),
  total: z.number().min(0, 'Le total ne peut pas être négatif'),
  notes: z.string().max(2000, 'Les notes sont trop longues').optional().nullable(),
  taxExemptionText: z.string().max(500, 'Le texte d\'exonération est trop long').optional().nullable(),
  items: z.array(z.object({
    description: z.string().min(1, 'La description est requise').max(500, 'La description est trop longue'),
    quantity: z.number().min(0.01, 'La quantité doit être supérieure à 0'),
    unitPrice: z.number().min(0, 'Le prix unitaire ne peut pas être négatif'),
    total: z.number().min(0, 'Le total ne peut pas être négatif'),
  })).min(1, 'Au moins un article est requis'),
})

export const quoteSchema = z.object({
  clientId: z.string().min(1, 'Le client est requis'),
  date: z.string().datetime('Date invalide'),
  validUntil: z.string().datetime('Date de validité invalide').optional().nullable(),
  subtotal: z.number().min(0, 'Le sous-total ne peut pas être négatif'),
  taxRate: z.number().min(0).max(100, 'Le taux de TVA doit être entre 0 et 100'),
  tax: z.number().min(0, 'La TVA ne peut pas être négative'),
  total: z.number().min(0, 'Le total ne peut pas être négatif'),
  notes: z.string().max(2000, 'Les notes sont trop longues').optional().nullable(),
  taxExemptionText: z.string().max(500, 'Le texte d\'exonération est trop long').optional().nullable(),
  items: z.array(z.object({
    description: z.string().min(1, 'La description est requise').max(500, 'La description est trop longue'),
    quantity: z.number().min(0.01, 'La quantité doit être supérieure à 0'),
    unitPrice: z.number().min(0, 'Le prix unitaire ne peut pas être négatif'),
    total: z.number().min(0, 'Le total ne peut pas être négatif'),
  })).min(1, 'Au moins un article est requis'),
})

export const clientSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(100, 'Le prénom est trop long'),
  lastName: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Email invalide').optional().nullable(),
  phone: z.string().max(20, 'Le téléphone est trop long').optional().nullable(),
  address: z.string().max(500, 'L\'adresse est trop longue').optional().nullable(),
  notes: z.string().max(2000, 'Les notes sont trop longues').optional().nullable(),
})

export const expenseSchema = z.object({
  description: z.string().min(1, 'La description est requise').max(500, 'La description est trop longue'),
  category: z.string().max(100, 'La catégorie est trop longue').optional().nullable(),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  date: z.string().datetime('Date invalide'),
  receipt: z.string().url('URL invalide').optional().nullable(),
  invoiceId: z.string().optional().nullable(),
})

export const stockItemSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long'),
  description: z.string().max(1000, 'La description est trop longue').optional().nullable(),
  category: z.string().max(100, 'La catégorie est trop longue').optional().nullable(),
  quantity: z.number().min(0, 'La quantité ne peut pas être négative'),
  unit: z.string().max(50, 'L\'unité est trop longue').optional().nullable(),
  unitPrice: z.number().min(0, 'Le prix unitaire ne peut pas être négatif').optional().nullable(),
  minQuantity: z.number().min(0, 'La quantité minimale ne peut pas être négative').optional().nullable(),
  supplier: z.string().max(200, 'Le fournisseur est trop long').optional().nullable(),
})

export const paginationSchema = z.object({
  page: z.string().transform((val) => {
    const num = parseInt(val, 10)
    return isNaN(num) || num < 1 ? 1 : num
  }).pipe(z.number().int().min(1)),
  limit: z.string().transform((val) => {
    const num = parseInt(val, 10)
    return isNaN(num) || num < 1 ? 50 : Math.min(num, 1000) // Max 1000
  }).pipe(z.number().int().min(1).max(1000)),
})

