import { describe, it, expect } from 'vitest'
import { interventionSchema, invoiceSchema, quoteSchema, clientSchema } from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('interventionSchema', () => {
    it('should validate a valid intervention', () => {
      const valid = {
        title: 'Test Intervention',
        date: '2026-01-15T10:00:00Z',
        clientId: 'client-123',
      }
      expect(() => interventionSchema.parse(valid)).not.toThrow()
    })

    it('should reject missing required fields', () => {
      const invalid = {
        title: 'Test',
      }
      expect(() => interventionSchema.parse(invalid)).toThrow()
    })

    it('should reject invalid date format', () => {
      const invalid = {
        title: 'Test',
        date: 'invalid-date',
        clientId: 'client-123',
      }
      expect(() => interventionSchema.parse(invalid)).toThrow()
    })
  })

  describe('invoiceSchema', () => {
    it('should validate a valid invoice', () => {
      const valid = {
        clientId: 'client-123',
        date: '2026-01-15T10:00:00Z',
        subtotal: 100,
        taxRate: 20,
        tax: 20,
        total: 120,
        items: [
          {
            description: 'Item 1',
            quantity: 1,
            unitPrice: 100,
            total: 100,
          },
        ],
      }
      expect(() => invoiceSchema.parse(valid)).not.toThrow()
    })

    it('should reject invoice without items', () => {
      const invalid = {
        clientId: 'client-123',
        date: '2026-01-15T10:00:00Z',
        subtotal: 100,
        taxRate: 20,
        tax: 20,
        total: 120,
        items: [],
      }
      expect(() => invoiceSchema.parse(invalid)).toThrow()
    })
  })
})

