
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../formatCurrency'

describe('formatCurrency', () => {
  it('formats Kenyan shillings', () => {
    expect(formatCurrency(1500, 'KES')).toContain('1,500')
  })

  it('formats US dollars', () => {
    expect(formatCurrency(100, 'USD')).toContain('100')
  })

  it('formats euros', () => {
    expect(formatCurrency(250, 'EUR')).toContain('250')
  })

  it('defaults to Kenyan shillings', () => {
    expect(formatCurrency(500)).toContain('500')
  })

  it('handles zero amounts', () => {
    expect(formatCurrency(0, 'KES')).toContain('0')
  })

  it('handles null amounts', () => {
    expect(formatCurrency(null, 'KES')).toContain('0')
  })

  it('handles invalid currency codes', () => {
    expect(formatCurrency(100, 'INVALID')).toContain('INVALID')
    expect(formatCurrency(100, 'INVALID')).toContain('100')
  })
})
