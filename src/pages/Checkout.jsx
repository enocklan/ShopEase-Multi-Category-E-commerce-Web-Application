
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const Checkout = () => {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Complete your delivery information and place your order.
          </p>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default Checkout
