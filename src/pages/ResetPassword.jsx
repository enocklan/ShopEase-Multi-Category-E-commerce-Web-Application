
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LockKeyhole, Eye, EyeOff } from 'lucide-react'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { updateUserPassword } from '../services/authService'

const ResetPassword = () => {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      await updateUserPassword(password)

      setSuccess(true)
    } catch (err) {
      console.error('Password update error:', err)
      setError(err.message || 'Unable to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="flex min-h-[75vh] items-center justify-center bg-green-50 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-green-100 bg-white p-8 shadow-lg">

          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4 text-green-700">
              <LockKeyhole size={30} />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Reset your password
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Enter your new password below.
            </p>
          </div>

          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
              <h2 className="font-semibold text-green-800">
                Password updated successfully!
              </h2>

              <p className="mt-2 text-sm text-green-700">
                You can now log in using your new password.
              </p>

              <button
                onClick={() => navigate('/login')}
                className="mt-5 w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
              >
                Go to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              <label className="font-medium text-gray-700">
                New password
              </label>

              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <label className="mt-5 block font-medium text-gray-700">
                Confirm new password
              </label>

              <div className="relative mt-2">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-green-700 hover:text-green-800"
            >
              Back to login
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}

export default ResetPassword
