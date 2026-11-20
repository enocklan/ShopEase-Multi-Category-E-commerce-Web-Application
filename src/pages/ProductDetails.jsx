
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  RefreshCw,
  ImageOff,
  CheckCircle,
} from 'lucide-react'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { getProductBySlug } from '../services/productService'
import { useCart } from '../context/CartContext'

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 2,
  }).format(amount)

const ProductDetails = () => {
  const { slug } = useParams()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError('')
        setProduct(null)
        setQuantity(1)
        setAdded(false)

        const data = await getProductBySlug(slug)

        if (!data) {
          setError('This product could not be found.')
          return
        }

        setProduct(data)
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError('Unable to load this product. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  const handleAddToCart = () => {
    if (!product || product.stock_quantity <= 0) return

    addToCart(product, quantity)
    setAdded(true)
  }

  const stock = Number(product?.stock_quantity) || 0
  const isOutOfStock = stock <= 0

  return (
    <div className="min-h-screen bg-gray-50">
    

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        {loading && (
          <div className="flex justify-center py-24">
            <RefreshCw size={35} className="animate-spin text-green-600" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Product unavailable
            </h2>
            <p className="mt-2 text-gray-500">{error}</p>

            <Link
              to="/products"
              className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && product && (
          <div className="grid grid-cols-1 gap-10 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">

            {/* Product Image */}
            <div className="overflow-hidden rounded-2xl bg-green-50">
              {product.image_urls?.[0] ? (
                <img
                  src={product.image_urls[0]}
                  alt={product.name}
                  className="h-full min-h-80 max-h-137.5 w-full object-cover"
                />
              ) : (
                <div className="flex min-h-80 items-center justify-center text-green-600">
                  <ImageOff size={60} />
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="flex flex-col justify-center">
              {product.is_featured && (
                <span className="mb-4 w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Featured Product
                </span>
              )}

              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              <p className="mt-4 leading-7 text-gray-600">
                {product.description || 'Discover this quality product from ShopEase.'}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-3xl font-bold text-green-700">
                  {formatPrice(product.price)}
                </span>

                {product.compare_at_price > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>

              <div className="mt-5">
                {isOutOfStock ? (
                  <span className="font-semibold text-red-600">
                    Out of stock
                  </span>
                ) : (
                  <span className="text-sm font-medium text-green-700">
                    {stock} items available
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="mt-7">
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Quantity
                  </label>

                  <div className="flex w-fit items-center rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-3 text-gray-600 hover:bg-green-50 disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={18} />
                    </button>

                    <span className="min-w-12 text-center font-semibold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(stock, q + 1))
                      }
                      disabled={quantity >= stock}
                      className="p-3 text-gray-600 hover:bg-green-50 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              {added && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                  <CheckCircle size={19} />
                  Product added to your cart!
                  <Link to="/cart" className="ml-auto underline">
                    View Cart
                  </Link>
                </div>
              )}

              <p className="mt-5 text-sm text-gray-400">
                Product SKU: {product.sku}
              </p>
            </div>
          </div>
        )}
      </main>

    
    </div>
  )
}

export default ProductDetails
