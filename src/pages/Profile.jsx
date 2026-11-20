
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Trash2,
} from 'lucide-react'

import {
  getMyProfile,
  updateMyProfile,
  deactivateMyAccount,
} from '../services/profileService'

import {
  changeUserPassword,
} from '../services/authService'

const Profile = () => {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')

  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [deactivatePassword, setDeactivatePassword] = useState('')
  const [deactivateError, setDeactivateError] = useState('')

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile()

        if (data.deleted_at) {
          navigate('/login', { replace: true })
          return
        }

        setProfile(data)
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
      } catch (error) {
        setProfileError(error.message || 'Could not load your profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  // Save personal information
  const handleProfileUpdate = async (event) => {
    event.preventDefault()

    setProfileMessage('')
    setProfileError('')

    if (fullName.trim().length < 2) {
      setProfileError('Please enter a valid full name.')
      return
    }

    if (phone.trim().length < 9) {
      setProfileError('Please enter a valid phone number.')
      return
    }

    try {
      setSavingProfile(true)

      const updatedProfile = await updateMyProfile(
        fullName.trim(),
        phone.trim()
      )

      setProfile((previous) => ({
        ...previous,
        ...updatedProfile,
      }))

      setProfileMessage('Your profile has been updated successfully.')
    } catch (error) {
      setProfileError(error.message || 'Failed to update your profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  // Change password
  const handlePasswordChange = async (event) => {
    event.preventDefault()

    setPasswordMessage('')
    setPasswordError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Your new password must contain at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Your new passwords do not match.')
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError('Your new password must be different from your current password.')
      return
    }

    try {
      setChangingPassword(true)

      await changeUserPassword(currentPassword, newPassword)

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      setPasswordMessage(
        'Your password has been updated successfully. You can now use your new password the next time you log in.'
      )
    } catch (error) {
      setPasswordError(
        error.message || 'Password update failed. Please try again.'
      )
    } finally {
      setChangingPassword(false)
    }
  }

  // Deactivate account
  const handleDeactivateAccount = async (event) => {
    event.preventDefault()

    setDeactivateError('')

    const confirmed = window.confirm(
      'Are you sure you want to deactivate your account? You will be signed out and will no longer be able to access your account.'
    )

    if (!confirmed) return

    try {
      setDeactivating(true)

      await deactivateMyAccount(deactivatePassword)

      navigate('/login', { replace: true })
    } catch (error) {
      setDeactivateError(
        error.message || 'Could not deactivate your account.'
      )
    } finally {
      setDeactivating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="rounded-lg bg-red-50 p-4 text-red-700">
          {profileError || 'Unable to load your profile.'}
        </p>
      </div>
    )
  }

  return (
    
    <div className="min-h-screen bg-green-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your personal information and account security.
          </p>
        </div>

        {/* Personal information */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <User className="text-green-700" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>

          {profileError && (
            <div className="mb-4 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} />
              {profileError}
            </div>
          )}

          {profileMessage && (
            <div className="mb-4 flex gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle size={18} />
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={19}
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  minLength={2}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-green-600"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={19}
                />
                <input
                  type="email"
                  value={profile.email || ''}
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 py-3 pl-10 pr-3 text-gray-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Your email address cannot be changed here.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3 text-gray-400"
                  size={19}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-green-600"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Change password */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Lock className="text-green-700" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Change Password
            </h2>
          </div>

          {passwordError && (
            <div className="mb-4 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} />
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div className="mb-4 flex gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle size={18} />
              {passwordMessage}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 p-3 pr-12 outline-none focus:border-green-600"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 p-3 pr-12 outline-none focus:border-green-600"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 p-3 pr-12 outline-none focus:border-green-600"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Deactivate account */}
        <section className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <Trash2 className="text-red-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Deactivate Account
            </h2>
          </div>

          <p className="mb-5 text-sm text-gray-600">
            Deactivating your account prevents you from using it. Your order
            and payment history will remain in the database.
          </p>

          {deactivateError && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {deactivateError}
            </p>
          )}

          <form onSubmit={handleDeactivateAccount} className="space-y-4">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Confirm Current Password
              </label>
              <input
                type="password"
                value={deactivatePassword}
                onChange={(event) => setDeactivatePassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-red-500"
                placeholder="Enter your current password"
              />
            </div>

            <button
              type="submit"
              disabled={deactivating}
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deactivating ? 'Deactivating...' : 'Deactivate My Account'}
            </button>
          </form>
        </section>

      </div>
    </div>
  )
}

export default Profile
