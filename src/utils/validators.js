
// Validate Kenyan phone numbers
export const validateKenyanPhone = (phone) => {
  const phoneRegex = /^(?:\+254|254|0)(?:7\d{8}|1\d{8})$/

  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

// Validate required fields
export const validateRequired = (value) => {
  return Boolean(value && value.trim())
}

// Validate postal code
export const validatePostalCode = (postalCode) => {
  return /^\d{5}$/.test(postalCode.trim())
}

// Validate checkout delivery information
export const validateDeliveryDetails = (details) => {
  const errors = {}

  if (!validateRequired(details.fullName)) {
    errors.fullName = 'Full name is required'
  }

  if (!validateKenyanPhone(details.phone)) {
    errors.phone = 'Enter a valid Kenyan phone number'
  }

  if (!validateRequired(details.county)) {
    errors.county = 'Please select your county'
  }

  if (!validateRequired(details.city)) {
    errors.city = 'Town or city is required'
  }

  if (!validateRequired(details.streetAddress)) {
    errors.streetAddress = 'Street address is required'
  }

  if (
    details.postalCode &&
    !validatePostalCode(details.postalCode)
  ) {
    errors.postalCode = 'Enter a valid 5-digit postal code'
  }

  return errors
}
