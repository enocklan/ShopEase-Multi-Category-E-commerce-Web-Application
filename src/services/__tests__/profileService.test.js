
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

import { supabase } from '../../supabase/client'

import {
  getMyProfile,
  updateMyProfile,
  deactivateMyAccount,
} from '../profileService'

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMyProfile', () => {
    it('retrieves the logged-in customer profile', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'customer@example.com',
          },
        },
        error: null,
      })

      const profile = {
        id: 'user-123',
        full_name: 'John Doe',
        phone: '0712345678',
        role: 'customer',
      }

      const single = vi.fn().mockResolvedValue({
        data: profile,
        error: null,
      })

      const eq = vi.fn().mockReturnValue({ single })

      const select = vi.fn().mockReturnValue({ eq })

      supabase.from.mockReturnValue({ select })

      const result = await getMyProfile()

      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(eq).toHaveBeenCalledWith('id', 'user-123')
      expect(result).toEqual({
        ...profile,
        email: 'customer@example.com',
      })
    })

    it('throws an error when retrieving the user fails', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Authentication failed'),
      })

      await expect(getMyProfile())
        .rejects.toThrow('Authentication failed')
    })

    it('throws an error when no user is logged in', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await expect(getMyProfile())
        .rejects.toThrow('You must be logged in.')
    })

    it('throws an error when profile retrieval fails', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'customer@example.com',
          },
        },
        error: null,
      })

      const single = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Profile not found'),
      })

      const eq = vi.fn().mockReturnValue({ single })
      const select = vi.fn().mockReturnValue({ eq })

      supabase.from.mockReturnValue({ select })

      await expect(getMyProfile())
        .rejects.toThrow('Profile not found')
    })
  })

  describe('updateMyProfile', () => {
    it('updates the customer profile successfully', async () => {
      const updatedProfile = {
        id: 'user-123',
        full_name: 'Jane Doe',
        phone: '0712345678',
      }

      supabase.rpc.mockResolvedValue({
        data: updatedProfile,
        error: null,
      })

      const result = await updateMyProfile(
        'Jane Doe',
        '0712345678'
      )

      expect(supabase.rpc).toHaveBeenCalledWith(
        'update_my_profile',
        {
          p_full_name: 'Jane Doe',
          p_phone: '0712345678',
        }
      )

      expect(result).toEqual(updatedProfile)
    })

    it('throws an error when profile update fails', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      })

      await expect(
        updateMyProfile('Jane Doe', '0712345678')
      ).rejects.toThrow('Update failed')
    })
  })

  describe('deactivateMyAccount', () => {
    it('deactivates the account and signs out successfully', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: { email: 'customer@example.com' },
        },
        error: null,
      })

      supabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
      })

      supabase.rpc.mockResolvedValue({
        error: null,
      })

      supabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      const result = await deactivateMyAccount('password123')

      expect(supabase.auth.signInWithPassword)
        .toHaveBeenCalledWith({
          email: 'customer@example.com',
          password: 'password123',
        })

      expect(supabase.rpc)
        .toHaveBeenCalledWith('deactivate_my_account')

      expect(supabase.auth.signOut).toHaveBeenCalled()

      expect(result).toBe(true)
    })

    it('requires the current password', async () => {
      await expect(deactivateMyAccount(''))
        .rejects.toThrow('Please enter your current password.')
    })

    it('throws an error when retrieving the user fails', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Authentication failed'),
      })

      await expect(deactivateMyAccount('password123'))
        .rejects.toThrow('Authentication failed')
    })

    it('throws an error when no authenticated email exists', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: {} },
        error: null,
      })

      await expect(deactivateMyAccount('password123'))
        .rejects.toThrow('No authenticated account was found.')
    })

    it('rejects an incorrect current password', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: { email: 'customer@example.com' },
        },
        error: null,
      })

      supabase.auth.signInWithPassword.mockResolvedValue({
        error: new Error('Invalid password'),
      })

      await expect(deactivateMyAccount('wrongpassword'))
        .rejects.toThrow('Your current password is incorrect.')

      expect(supabase.rpc).not.toHaveBeenCalled()
    })

    it('throws an error when account deactivation fails', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: { email: 'customer@example.com' },
        },
        error: null,
      })

      supabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
      })

      supabase.rpc.mockResolvedValue({
        error: new Error('Deactivation failed'),
      })

      await expect(deactivateMyAccount('password123'))
        .rejects.toThrow('Deactivation failed')

      expect(supabase.auth.signOut).not.toHaveBeenCalled()
    })

    it('throws an error when signing out fails', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: { email: 'customer@example.com' },
        },
        error: null,
      })

      supabase.auth.signInWithPassword.mockResolvedValue({
        error: null,
      })

      supabase.rpc.mockResolvedValue({
        error: null,
      })

      supabase.auth.signOut.mockResolvedValue({
        error: new Error('Sign out failed'),
      })

      await expect(deactivateMyAccount('password123'))
        .rejects.toThrow('Sign out failed')
    })
  })
})
