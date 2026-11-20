
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, LockKeyhole } from 'lucide-react'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { requestPasswordReset } from '../services/authService'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess(false)

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    try {
      setLoading(true)

      await requestPasswordReset(email.trim())

      setSuccess(true)
    } catch (err) {
      console.error('Password reset error:', err)
      setError(
        err.message || 'Unable to send password reset email. Please try again.'
      )
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
              Forgot your password?
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Enter the email address associated with your account.
              We'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-center">
              <Mail className="mx-auto mb-3 text-green-700" size={30} />

              <h2 className="font-semibold text-green-800">
                Check your email
              </h2>

              <p className="mt-2 text-sm text-green-700">
                If an account exists for {email}, you should receive
                a password reset link shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label
                htmlFor="email"
                className="font-medium text-gray-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                }}
                placeholder="you@example.com"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Sending reset link...' : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default ForgotPassword
