
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '../../supabase/client'
import {
  saveAddress,
  getUserAddresses,
} from '../addressService'

describe('addressService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('saveAddress', () => {
    it('saves a customer address successfully', async () => {
      const mockAddress = {
        id: 'address-123',
        user_id: 'user-123',
        full_name: 'John Doe',
        phone: '0712345678',
        county: 'Nairobi',
        city: 'Nairobi',
        street_address: 'Westlands',
        postal_code: '00100',
        is_default: false,
      }

      const single = vi.fn().mockResolvedValue({
        data: mockAddress,
        error: null,
      })

      const select = vi.fn().mockReturnValue({ single })

      const insert = vi.fn().mockReturnValue({ select })

      supabase.from.mockReturnValue({ insert })

      const address = {
        fullName: ' John Doe ',
        phone: ' 0712345678 ',
        county: 'Nairobi',
        city: ' Nairobi ',
        streetAddress: ' Westlands ',
        postalCode: '00100',
      }

      const result = await saveAddress('user-123', address)

      expect(supabase.from).toHaveBeenCalledWith('addresses')

      expect(insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        full_name: 'John Doe',
        phone: '0712345678',
        county: 'Nairobi',
        city: 'Nairobi',
        street_address: 'Westlands',
        postal_code: '00100',
        is_default: false,
      })

      expect(result).toEqual(mockAddress)
    })

    it('saves null when postal code is empty', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { id: 'address-123', postal_code: null },
        error: null,
      })

      const select = vi.fn().mockReturnValue({ single })
      const insert = vi.fn().mockReturnValue({ select })

      supabase.from.mockReturnValue({ insert })

      const address = {
        fullName: 'John Doe',
        phone: '0712345678',
        county: 'Nairobi',
        city: 'Nairobi',
        streetAddress: 'Westlands',
        postalCode: '',
      }

      await saveAddress('user-123', address)

      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          postal_code: null,
        })
      )
    })

    it('throws an error when saving an address fails', async () => {
      const mockError = new Error('Unable to save address')

      const single = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      const select = vi.fn().mockReturnValue({ single })
      const insert = vi.fn().mockReturnValue({ select })

      supabase.from.mockReturnValue({ insert })

      const address = {
        fullName: 'John Doe',
        phone: '0712345678',
        county: 'Nairobi',
        city: 'Nairobi',
        streetAddress: 'Westlands',
        postalCode: '',
      }

      await expect(
        saveAddress('user-123', address)
      ).rejects.toThrow('Unable to save address')
    })
  })

  describe('getUserAddresses', () => {
    it('returns addresses belonging to a customer', async () => {
      const mockAddresses = [
        { id: 'address-1', user_id: 'user-123' },
        { id: 'address-2', user_id: 'user-123' },
      ]

      const order = vi.fn().mockResolvedValue({
        data: mockAddresses,
        error: null,
      })

      const eq = vi.fn().mockReturnValue({ order })

      const select = vi.fn().mockReturnValue({ eq })

      supabase.from.mockReturnValue({ select })

      const result = await getUserAddresses('user-123')

      expect(supabase.from).toHaveBeenCalledWith('addresses')
      expect(select).toHaveBeenCalledWith('*')
      expect(eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      })

      expect(result).toEqual(mockAddresses)
    })

    it('returns an empty array when the customer has no addresses', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      const eq = vi.fn().mockReturnValue({ order })
      const select = vi.fn().mockReturnValue({ eq })

      supabase.from.mockReturnValue({ select })

      const result = await getUserAddresses('user-123')

      expect(result).toEqual([])
    })

    it('throws an error when fetching addresses fails', async () => {
      const mockError = new Error('Unable to fetch addresses')

      const order = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      const eq = vi.fn().mockReturnValue({ order })
      const select = vi.fn().mockReturnValue({ eq })

      supabase.from.mockReturnValue({ select })

      await expect(
        getUserAddresses('user-123')
      ).rejects.toThrow('Unable to fetch addresses')
    })
  })
})
