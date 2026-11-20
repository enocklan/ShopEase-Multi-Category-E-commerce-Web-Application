
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { MapPin, ShoppingBag, Truck } from 'lucide-react'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { validateDeliveryDetails } from '../utils/validators'

const counties = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', 'Murang’a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot',
]

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount)

const Checkout = () => {
  const { cartItems, cartTotal } = useCart()
  const { profile, user } = useAuth()

  const deliveryFee = 200
  const total = cartTotal + deliveryFee

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || user?.user_metadata?.full_name || '',
    phone: profile?.phone || user?.user_metadata?.phone || '',
    county: '',
    city: '',
    streetAddress: '',
    postalCode: '',
    instructions: '',
  })

  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [name]: '',
    }))

    setSuccessMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const validationErrors = validateDeliveryDetails(formData)

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setSuccessMessage('')
      return
    }

    setSuccessMessage(
      'Your delivery information is valid. You can proceed to the next checkout stage.'
    )
  }

  const inputClass = (field) =>
    `mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 ${
      errors[field] ? 'border-red-500' : 'border-gray-300'
    }`

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Checkout
            </h1>
            <p className="mt-2 text-gray-600">
              Enter your delivery details to continue with your order.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

            {/* Delivery Form */}
            <section className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-3 text-green-700">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Delivery information
                    </h2>
                    <p className="text-sm text-gray-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="font-medium text-gray-700">
                      Full name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={inputClass('fullName')}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="font-medium text-gray-700">
                      Phone number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0712345678"
                      className={inputClass('phone')}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* County */}
                  <div>
                    <label className="font-medium text-gray-700">
                      County *
                    </label>
                    <select
                      name="county"
                      value={formData.county}
                      onChange={handleChange}
                      className={inputClass('county')}
                    >
                      <option value="">Select your county</option>
                      {counties.map((county) => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </select>
                    {errors.county && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.county}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="font-medium text-gray-700">
                      Town / City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Nairobi"
                      className={inputClass('city')}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="font-medium text-gray-700">
                      Postal code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="e.g. 00100"
                      maxLength={5}
                      className={inputClass('postalCode')}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="font-medium text-gray-700">
                      Street address *
                    </label>
                    <textarea
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Building, street, estate or landmark"
                      className={inputClass('streetAddress')}
                    />
                    {errors.streetAddress && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.streetAddress}
                      </p>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="sm:col-span-2">
                    <label className="font-medium text-gray-700">
                      Additional delivery instructions
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any directions that will help us find you (optional)"
                      className={inputClass('instructions')}
                    />
                  </div>
                </div>

                {successMessage && (
                  <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    {successMessage}
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button
                    type="submit"
                    className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
                  >
                    Validate delivery details
                  </button>

                  <Link
                    to="/cart"
                    className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Back to cart
                  </Link>
                </div>
              </form>
            </section>

            {/* Order Summary */}
            <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <ShoppingBag className="text-green-700" size={23} />
                <h2 className="text-xl font-bold text-gray-900">
                  Your order
                </h2>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-green-50">
                        {item.image_urls?.[0] ? (
                          <img
                            src={item.image_urls[0]}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-green-700">
                            <ShoppingBag size={20} />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <p className="whitespace-nowrap text-sm font-semibold text-gray-800">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="my-6 border-t border-gray-200" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Truck size={16} />
                    Delivery fee
                  </span>
                  <span className="font-medium">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-gray-200" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-700">
                  {formatPrice(total)}
                </span>
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-500">
                Delivery fee is currently a temporary flat rate and will be
                refined when delivery pricing is implemented.
              </p>
            </aside>

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default Checkout
