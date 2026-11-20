
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  // Restore guest cart from localStorage when the app starts
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('shopease_guest_cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (error) {
      console.error('Could not restore cart:', error)
      return []
    }
  })

  // Save cart whenever items change
  useEffect(() => {
    localStorage.setItem(
      'shopease_guest_cart',
      JSON.stringify(cartItems)
    )
  }, [cartItems])

  // Add product to cart
  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return

    const requestedQuantity = Math.max(1, Number(quantity) || 1)

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id
      )

      const currentQuantity = existingItem?.quantity || 0
      const availableStock = Number(product.stock_quantity) || 0

      if (availableStock <= currentQuantity) return currentItems

      const finalQuantity = Math.min(
        currentQuantity + requestedQuantity,
        availableStock
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: finalQuantity }
            : item
        )
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: Math.min(requestedQuantity, availableStock),
        },
      ]
    })
  }

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId)
    )
  }

  // Update product quantity
  const updateQuantity = (productId, quantity) => {
    const requestedQuantity = Number(quantity)

    if (!Number.isFinite(requestedQuantity) || requestedQuantity < 1) return

    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== productId) return item

        const stock = Number(item.stock_quantity) || 0

        return {
          ...item,
          quantity: Math.min(requestedQuantity, stock),
        }
      })
    )
  }

  // Clear cart
  const clearCart = () => {
  setCartItems([])
  localStorage.removeItem('shopease_guest_cart')
}

  // Calculate total quantity
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  )

  // Calculate total price
  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  )

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }

  return context
}
