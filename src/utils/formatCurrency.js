
export const formatCurrency = (amount, currency = 'KES') => {
  const numericAmount = Number(amount || 0)

  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(numericAmount)
  } catch {
    return `${currency} ${numericAmount.toLocaleString('en-KE')}`
  }
}
