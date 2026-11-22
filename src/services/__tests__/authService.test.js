
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    rpc: vi.fn(),
  },
}))

import { supabase } from '../../supabase/client'

import {
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  getCurrentSession,
  onAuthStateChange,
  requestPasswordReset,
  updateUserPassword,
  changeUserPassword,
  getAdminCustomers,
} from '../authService'

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerUser', () => {
    it('registers a customer successfully', async () => {
      const mockData = { user: { id: 'user-123' } }

      supabase.auth.signUp.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await registerUser(
        'John Doe',
        '0712345678',
        'john@example.com',
        'password123'
      )

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'John Doe',
            phone: '0712345678',
          },
          emailRedirectTo: window.location.origin,
        },
      })

      expect(result).toEqual(mockData)
    })

    it('throws an error when registration fails', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: new Error('Registration failed'),
      })

      await expect(
        registerUser('John', '0712345678', 'john@example.com', 'password123')
      ).rejects.toThrow('Registration failed')
    })
  })

  describe('loginUser', () => {
    it('logs in using email and password', async () => {
      const mockData = { user: { id: 'user-123' } }

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await loginUser('john@example.com', 'password123')

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
      })

      expect(result).toEqual(mockData)
    })

    it('throws an error when login fails', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: new Error('Invalid credentials'),
      })

      await expect(
        loginUser('john@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('loginWithGoogle', () => {
    it('starts Google authentication', async () => {
      const mockData = { provider: 'google' }

      supabase.auth.signInWithOAuth.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await loginWithGoogle()

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })

      expect(result).toEqual(mockData)
    })

    it('throws an error when Google authentication fails', async () => {
      supabase.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: new Error('Google login failed'),
      })

      await expect(loginWithGoogle()).rejects.toThrow(
        'Google login failed'
      )
    })
  })

  describe('logoutUser', () => {
    it('logs out successfully', async () => {
      supabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      await expect(logoutUser()).resolves.toBeUndefined()

      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('throws an error when logout fails', async () => {
      supabase.auth.signOut.mockResolvedValue({
        error: new Error('Logout failed'),
      })

      await expect(logoutUser()).rejects.toThrow('Logout failed')
    })
  })

  describe('getCurrentSession', () => {
    it('returns the current session', async () => {
      const mockSession = { access_token: 'test-token' }

      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await getCurrentSession()

      expect(result).toEqual(mockSession)
    })

    it('returns null when there is no session', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await getCurrentSession()

      expect(result).toBeNull()
    })

    it('throws an error when session retrieval fails', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: null,
        error: new Error('Session error'),
      })

      await expect(getCurrentSession()).rejects.toThrow('Session error')
    })
  })

  describe('onAuthStateChange', () => {
    it('registers an authentication state listener', () => {
      const callback = vi.fn()
      const subscription = { data: { subscription: {} } }

      supabase.auth.onAuthStateChange.mockReturnValue(subscription)

      const result = onAuthStateChange(callback)

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback)
      expect(result).toBe(subscription)
    })
  })

  describe('requestPasswordReset', () => {
    it('sends a password reset email', async () => {
      const mockData = { message: 'Reset email sent' }

      supabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await requestPasswordReset('john@example.com')

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'john@example.com',
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      expect(result).toEqual(mockData)
    })

    it('throws an error when password reset fails', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: new Error('Reset failed'),
      })

      await expect(
        requestPasswordReset('john@example.com')
      ).rejects.toThrow('Reset failed')
    })
  })

  describe('updateUserPassword', () => {
    it('updates the password successfully', async () => {
      const mockData = { user: { id: 'user-123' } }

      supabase.auth.updateUser.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await updateUserPassword('newpassword123')

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      })

      expect(result).toEqual(mockData)
    })

    it('rejects an empty password', async () => {
      await expect(
        updateUserPassword('')
      ).rejects.toThrow('Please enter your new password.')

      expect(supabase.auth.updateUser).not.toHaveBeenCalled()
    })

    it('throws an error when password update fails', async () => {
      supabase.auth.updateUser.mockResolvedValue({
        data: null,
        error: new Error('Password update failed'),
      })

      await expect(
        updateUserPassword('newpassword123')
      ).rejects.toThrow('Password update failed')
    })
  })

  describe('changeUserPassword', () => {
    it('changes the password successfully', async () => {
      const mockData = { user: { id: 'user-123' } }

      supabase.auth.updateUser.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await changeUserPassword(
        'oldpassword',
        'newpassword123'
      )

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        current_password: 'oldpassword',
        password: 'newpassword123',
      })

      expect(result).toEqual(mockData)
    })

    it('rejects missing passwords', async () => {
      await expect(
        changeUserPassword('', 'newpassword123')
      ).rejects.toThrow(
        'Please enter both your current and new passwords.'
      )

      expect(supabase.auth.updateUser).not.toHaveBeenCalled()
    })

    it('rejects passwords shorter than 8 characters', async () => {
      await expect(
        changeUserPassword('oldpassword', 'short')
      ).rejects.toThrow(
        'Your new password must contain at least 8 characters.'
      )

      expect(supabase.auth.updateUser).not.toHaveBeenCalled()
    })

    it('rejects the same current and new password', async () => {
      await expect(
        changeUserPassword('password123', 'password123')
      ).rejects.toThrow(
        'Your new password must be different from your current password.'
      )

      expect(supabase.auth.updateUser).not.toHaveBeenCalled()
    })

    it('throws an error when password change fails', async () => {
      supabase.auth.updateUser.mockResolvedValue({
        data: null,
        error: new Error('Password change failed'),
      })

      await expect(
        changeUserPassword('oldpassword', 'newpassword123')
      ).rejects.toThrow('Password change failed')
    })
  })

  describe('getAdminCustomers', () => {
    it('returns all admin customers', async () => {
      const mockCustomers = [
        { id: 'customer-1', full_name: 'John Doe' },
        { id: 'customer-2', full_name: 'Jane Doe' },
      ]

      supabase.rpc.mockResolvedValue({
        data: mockCustomers,
        error: null,
      })

      const result = await getAdminCustomers()

      expect(supabase.rpc).toHaveBeenCalledWith('get_admin_customers')
      expect(result).toEqual(mockCustomers)
    })

    it('returns an empty array when no customers exist', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getAdminCustomers()

      expect(result).toEqual([])
    })

    it('throws an error when customer retrieval fails', async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Unable to access customers' },
      })

      await expect(getAdminCustomers()).rejects.toThrow(
        'Unable to access customers'
      )
    })
  })
})
