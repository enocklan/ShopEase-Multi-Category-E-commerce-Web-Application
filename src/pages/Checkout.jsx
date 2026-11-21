
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  MapPin,
  ShoppingBag,
  Truck,
  Smartphone,
} from 'lucide-react'

import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

import { validateDeliveryDetails } from '../utils/validators'
import { createOrder } from '../services/orderService'
import { initiateMpesaPayment } from '../services/paymentService'
import { calculateRoadDistance } from '../services/deliveryService'

import DeliveryLocationPicker from '../components/DeliveryLocationPicker'

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

// Estimate delivery fee using road distance.
// The database calculates the final authoritative fee.
const calculateDeliveryFee = (distance) => {
  if (distance === null || distance === undefined) return null

  if (distance <= 10) return 0
  if (distance <= 20) return 100
  if (distance <= 30) return 200
  if (distance <= 40) return 300
  if (distance <= 50) return 400
  if (distance <= 60) return 500
  if (distance <= 70) return 600
  if (distance <= 80) return 700
  if (distance <= 90) return 800
  if (distance <= 100) return 900

  return 1000
}

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { profile, user } = useAuth()

  // Delivery form state
  const [formData, setFormData] = useState({
    fullName:
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      '',
    phone:
      profile?.phone ||
      user?.user_metadata?.phone ||
      '',
    county: '',
    city: '',
    streetAddress: '',
    postalCode: '',
    instructions: '',
  })

  // Delivery location states
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [deliveryDistance, setDeliveryDistance] = useState(null)
  const [calculatingDistance, setCalculatingDistance] = useState(false)
  const [distanceError, setDistanceError] = useState('')

  // Form and order states
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  // M-Pesa payment states
  const [initiatingPayment, setInitiatingPayment] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [paymentInitiated, setPaymentInitiated] = useState(false)

  // IMPORTANT: Calculate derived values AFTER declaring state.
  const estimatedDeliveryFee = calculateDeliveryFee(deliveryDistance)

  const displayedSubtotal = orderResult
    ? Number(orderResult.subtotal)
    : cartTotal

  const displayedDeliveryFee = orderResult
    ? Number(orderResult.delivery_fee)
    : estimatedDeliveryFee

  const displayedTotal = orderResult
    ? Number(orderResult.total_amount)
    : estimatedDeliveryFee === null
      ? null
      : cartTotal + estimatedDeliveryFee

  if (cartItems.length === 0 && !orderResult) {
    return <Navigate to="/cart" replace />
  }

  // Handle delivery form changes
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
    setSaveError('')
    setPaymentError('')
  }

  // Handle map location selection and calculate road distance
  const handleLocationSelect = async (location) => {
    setSelectedLocation(location)
    setDeliveryDistance(null)
    setDistanceError('')
    setCalculatingDistance(true)

    setErrors((previous) => ({
      ...previous,
      deliveryLocation: '',
    }))

    try {
      const distance = await calculateRoadDistance(location)
      setDeliveryDistance(distance)
    } catch (error) {
      console.error('Distance calculation error:', error)

      setDistanceError(
        error.message || 'Unable to calculate delivery distance.'
      )
    } finally {
      setCalculatingDistance(false)
    }
  }

  // Initiate M-Pesa payment for an existing order
  const handlePayment = async (order) => {
    try {
      setInitiatingPayment(true)
      setPaymentError('')
      setPaymentMessage('Sending M-Pesa payment request...')

      const result = await initiateMpesaPayment(
        order.order_id,
        formData.phone.trim()
      )

      setPaymentInitiated(true)

      // Clear the cart only after the STK request succeeds.
      clearCart()

      setPaymentMessage(
        result.message ||
        'M-Pesa prompt sent successfully. Check your phone and enter your M-Pesa PIN.'
      )
    } catch (error) {
      console.error('M-Pesa payment error:', error)

      setPaymentMessage('')
      setPaymentError(
        error.message ||
        'Unable to initiate M-Pesa payment. Please try again.'
      )
    } finally {
      setInitiatingPayment(false)
    }
  }

  // Create order and initiate payment
  const handleSubmit = async (event) => {
    event.preventDefault()

    if (
      savingAddress ||
      initiatingPayment ||
      paymentInitiated ||
      calculatingDistance
    ) {
      return
    }

    if (!user?.id) {
      setSaveError('Please log in before placing your order.')
      return
    }

    setSaveError('')
    setPaymentError('')
    setPaymentMessage('')

    // Retry payment if an order already exists.
    if (orderResult) {
      await handlePayment(orderResult)
      return
    }

    const validationErrors = validateDeliveryDetails(formData)

    if (!selectedLocation) {
      validationErrors.deliveryLocation =
        'Please select your delivery location on the map.'
    }

    if (selectedLocation && deliveryDistance === null) {
      validationErrors.deliveryLocation =
        'Please wait for the delivery distance to be calculated successfully.'
    }

    if (distanceError) {
      validationErrors.deliveryLocation =
        'Unable to calculate the road distance. Please select another location or try again.'
    }

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    try {
      setSavingAddress(true)

      // Create the order through the secure Supabase Edge Function.
      const result = await createOrder(cartItems, {
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        county: formData.county,
        city: formData.city.trim(),
        street_address: formData.streetAddress.trim(),
        postal_code: formData.postalCode.trim(),
        instructions: formData.instructions.trim(),

        delivery_location: {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        },

        // Reference only. The Edge Function independently
        // calculates and verifies the road distance.
        road_distance_km: deliveryDistance,
      })

      setOrderResult(result)

      setSuccessMessage(
        'Your order has been created. Complete payment using M-Pesa.'
      )

      // Initiate STK Push using the new order.
      await handlePayment(result)
    } catch (error) {
      console.error('Checkout error:', error)

      setSaveError(
        error.message ||
        'Unable to create your order. Please try again.'
      )
    } finally {
      setSavingAddress(false)
    }
  }

  // Input styling with validation support
  const inputClass = (field) =>
    `mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 ${
      errors[field] ? 'border-red-500' : 'border-gray-300'
    }`

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Enter your delivery details and pay securely using M-Pesa.
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
                  <label htmlFor="fullName" className="font-medium text-gray-700">
                    Full name *
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    disabled={Boolean(orderResult)}
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
                  <label htmlFor="phone" className="font-medium text-gray-700">
                    M-Pesa phone number *
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0712345678"
                    disabled={Boolean(orderResult)}
                    className={inputClass('phone')}
                  />

                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-gray-500">
                    Enter the number that should receive the M-Pesa prompt.
                  </p>
                </div>

                {/* County */}
                <div>
                  <label htmlFor="county" className="font-medium text-gray-700">
                    County *
                  </label>

                  <select
                    id="county"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    disabled={Boolean(orderResult)}
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
                  <label htmlFor="city" className="font-medium text-gray-700">
                    Town / City *
                  </label>

                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Nairobi"
                    disabled={Boolean(orderResult)}
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
                  <label htmlFor="postalCode" className="font-medium text-gray-700">
                    Postal code
                  </label>

                  <input
                    id="postalCode"
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="e.g. 00100"
                    maxLength={5}
                    disabled={Boolean(orderResult)}
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
                  <label htmlFor="streetAddress" className="font-medium text-gray-700">
                    Street address *
                  </label>

                  <textarea
                    id="streetAddress"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Building, street, estate or landmark"
                    disabled={Boolean(orderResult)}
                    className={inputClass('streetAddress')}
                  />

                  {errors.streetAddress && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.streetAddress}
                    </p>
                  )}
                </div>

                {/* Delivery Map and Distance */}
                <div className="sm:col-span-2">
                  <DeliveryLocationPicker
                    selectedLocation={selectedLocation}
                    onLocationSelect={handleLocationSelect}
                  />

                  {calculatingDistance && (
                    <p className="mt-3 text-sm text-gray-600">
                      Calculating road distance from HH Towers...
                    </p>
                  )}

                  {deliveryDistance !== null && (
                    <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4">
                      <p className="font-semibold text-green-800">
                        Delivery road distance: {deliveryDistance} km
                      </p>

                      <p className="mt-1 text-sm text-green-700">
                        Distance calculated from HH Towers, Moi Avenue, Nairobi CBD.
                      </p>

                      <p className="mt-2 text-sm font-semibold text-green-800">
                        Estimated delivery fee:{' '}
                        {estimatedDeliveryFee === 0
                          ? 'FREE'
                          : formatPrice(estimatedDeliveryFee)}
                      </p>
                    </div>
                  )}

                  {distanceError && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-sm text-red-700">
                        {distanceError}
                      </p>
                    </div>
                  )}

                  {errors.deliveryLocation && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.deliveryLocation}
                    </p>
                  )}

                  {orderResult && (
                    <p className="mt-2 text-xs text-gray-500">
                      Your delivery location has been saved with this order.
                    </p>
                  )}
                </div>

                {/* Additional Instructions */}
                <div className="sm:col-span-2">
                  <label htmlFor="instructions" className="font-medium text-gray-700">
                    Additional delivery instructions
                  </label>

                  <textarea
                    id="instructions"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any directions that will help us find you (optional)"
                    disabled={Boolean(orderResult)}
                    className={inputClass('instructions')}
                  />
                </div>
              </div>

              {/* Order Creation Success */}
              {successMessage && (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  {successMessage}
                </div>
              )}

              {/* Order Details */}
              {orderResult && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <h3 className="font-bold text-green-800">
                    Order created successfully!
                  </h3>

                  <p className="mt-2 text-sm text-green-700">
                    Order number: {orderResult.order_number}
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    Verified road distance: {orderResult.road_distance_km} km
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    Delivery fee:{' '}
                    {Number(orderResult.delivery_fee) === 0
                      ? 'FREE'
                      : formatPrice(Number(orderResult.delivery_fee))}
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    Total: {formatPrice(Number(orderResult.total_amount))}
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    Payment status: Awaiting M-Pesa confirmation
                  </p>
                </div>
              )}

              {/* M-Pesa Payment Message */}
              {paymentMessage && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <div className="flex items-center gap-2 font-semibold">
                    <Smartphone size={18} />
                    M-Pesa payment
                  </div>

                  <p className="mt-2">
                    {paymentMessage}
                  </p>
                </div>
              )}

              {/* M-Pesa Payment Error */}
              {paymentError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">
                    Payment request failed
                  </p>

                  <p className="mt-1">
                    {paymentError}
                  </p>

                  {orderResult && (
                    <p className="mt-2">
                      Your order has already been created. You can retry the payment without creating another order.
                    </p>
                  )}
                </div>
              )}

              {/* Order Creation Error */}
              {saveError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              {/* Form Buttons */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={
                    savingAddress ||
                    initiatingPayment ||
                    paymentInitiated ||
                    calculatingDistance
                  }
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingAddress
                    ? 'Creating order...'
                    : initiatingPayment
                      ? 'Sending M-Pesa prompt...'
                      : calculatingDistance
                        ? 'Calculating delivery distance...'
                        : paymentInitiated
                          ? 'Payment prompt sent'
                          : orderResult
                            ? 'Retry M-Pesa payment'
                            : 'Place order & Pay with M-Pesa'}
                </button>

                {!orderResult && (
                  <Link
                    to="/cart"
                    className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Back to cart
                  </Link>
                )}

                {orderResult && (
                  <Link
                    to="/products"
                    className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Continue shopping
                  </Link>
                )}
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
              {/* Subtotal */}
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>

                <span className="font-medium">
                  {formatPrice(displayedSubtotal)}
                </span>
              </div>

              {/* Delivery Fee */}
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-gray-600">
                  <Truck size={16} />
                  {orderResult ? 'Delivery fee' : 'Estimated delivery fee'}
                </span>

                <span className="font-medium">
                  {displayedDeliveryFee === null
                    ? 'Select location'
                    : displayedDeliveryFee === 0
                      ? 'FREE'
                      : formatPrice(displayedDeliveryFee)}
                </span>
              </div>
            </div>

            <div className="my-5 border-t border-gray-200" />

            {/* Total */}
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span className="text-green-700">
                {displayedTotal === null
                  ? 'Select location'
                  : formatPrice(displayedTotal)}
              </span>
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              {orderResult
                ? `Verified delivery distance: ${orderResult.road_distance_km} km.`
                : 'Free delivery within 10 km. Additional delivery charges apply for longer distances.'}
            </p>

            <div className="mt-5 rounded-lg bg-green-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                <Smartphone size={18} />
                Pay with M-Pesa
              </div>

              <p className="mt-1 text-xs leading-5 text-green-700">
                You will receive an STK Push prompt on your phone to authorize the payment.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}

export default Checkout
