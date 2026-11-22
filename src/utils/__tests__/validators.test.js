
import { describe, it, expect } from 'vitest'

import {
  validateKenyanPhone,
  validateRequired,
  validatePostalCode,
  validateDeliveryDetails,
} from '../validators'

describe('validateKenyanPhone', () => {
  it('accepts valid Kenyan mobile numbers', () => {
    expect(validateKenyanPhone('0712345678')).toBe(true)
    expect(validateKenyanPhone('0112345678')).toBe(true)
    expect(validateKenyanPhone('254712345678')).toBe(true)
    expect(validateKenyanPhone('+254712345678')).toBe(true)
  })

  it('accepts phone numbers containing spaces', () => {
    expect(validateKenyanPhone('0712 345 678')).toBe(true)
  })

  it('rejects invalid phone numbers', () => {
    expect(validateKenyanPhone('123456')).toBe(false)
    expect(validateKenyanPhone('0812345678')).toBe(false)
    expect(validateKenyanPhone('071234567')).toBe(false)
  })
})

describe('validateRequired', () => {
  it('accepts non-empty values', () => {
    expect(validateRequired('ShopEase')).toBe(true)
  })

  it('rejects empty or whitespace-only values', () => {
    expect(validateRequired('')).toBe(false)
    expect(validateRequired('   ')).toBe(false)
  })
})

describe('validatePostalCode', () => {
  it('accepts a five-digit postal code', () => {
    expect(validatePostalCode('00100')).toBe(true)
    expect(validatePostalCode('20100')).toBe(true)
  })

  it('rejects invalid postal codes', () => {
    expect(validatePostalCode('1234')).toBe(false)
    expect(validatePostalCode('123456')).toBe(false)
    expect(validatePostalCode('12A45')).toBe(false)
  })

  it('allows surrounding whitespace', () => {
    expect(validatePostalCode(' 00100 ')).toBe(true)
  })
})

describe('validateDeliveryDetails', () => {
  const validDetails = {
    fullName: 'John Doe',
    phone: '0712345678',
    county: 'Nairobi',
    city: 'Nairobi',
    streetAddress: 'Kenyatta Avenue',
    postalCode: '00100',
  }

  it('returns no errors for valid delivery details', () => {
    expect(validateDeliveryDetails(validDetails)).toEqual({})
  })

  it('returns errors for missing required details', () => {
    const details = {
      fullName: '',
      phone: '123',
      county: '',
      city: '',
      streetAddress: '',
      postalCode: '',
    }

    expect(validateDeliveryDetails(details)).toEqual({
      fullName: 'Full name is required',
      phone: 'Enter a valid Kenyan phone number',
      county: 'Please select your county',
      city: 'Town or city is required',
      streetAddress: 'Street address is required',
    })
  })

  it('rejects an invalid postal code', () => {
    const details = {
      ...validDetails,
      postalCode: '123',
    }

    expect(validateDeliveryDetails(details)).toEqual({
      postalCode: 'Enter a valid 5-digit postal code',
    })
  })

  it('allows an optional empty postal code', () => {
    const details = {
      ...validDetails,
      postalCode: '',
    }

    expect(validateDeliveryDetails(details)).toEqual({})
  })
})
