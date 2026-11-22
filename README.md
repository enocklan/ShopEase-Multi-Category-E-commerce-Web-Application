# ShopEase – Multi-Category E-commerce Web Application

ShopEase is a modern, responsive multi-category e-commerce web application built with React and Supabase. It provides customers with a convenient online shopping experience, including product discovery, shopping cart management, checkout, delivery location selection, order tracking and M-Pesa payments.

The platform also includes an administrative dashboard for managing products, categories, customers and orders.

## Live Demo

- **Live Website:** https://shop-ease-multi-category-e-commerce.vercel.app/
- **GitHub Repository:** https://github.com/enocklan/ShopEase-Multi-Category-E-commerce-Web-Application.git

## Project Objectives

The main objectives of ShopEase are to:

- Provide a simple and user-friendly online shopping experience.
- Allow customers to browse and search for products.
- Support secure customer authentication.
- Enable customers to manage shopping carts and delivery addresses.
- Integrate M-Pesa for payments.
- Provide order tracking and management.
- Give administrators tools to manage the online store.

## Features

### Customer Features

- User registration and login.
- Google authentication.
- Password reset and password management.
- Browse products and categories.
- Search and discover products.
- View product details and availability.
- Add products to the shopping cart.
- Update product quantities and remove cart items.
- View order summaries and delivery fees.
- Select delivery locations using an interactive map.
- Calculate road delivery distances.
- Checkout and submit orders.
- Pay using M-Pesa STK Push.
- View payment status and transaction information.
- View personal order history.
- Track order status.
- Cancel eligible pending orders.
- Manage personal profiles.
- Save and view delivery addresses.
- Deactivate customer accounts.

### Administrator Features

- Access a dedicated administration dashboard.
- View store statistics and sales information.
- Manage products.
- Upload product images.
- Update product information and availability.
- Manage product categories.
- View and manage customer information.
- View customer order histories.
- View and manage all orders.
- Update order statuses according to the order workflow.
- View payment records and transaction information.

### Payment Features

ShopEase integrates Safaricom Daraja API to support M-Pesa STK Push payments.

The payment workflow includes:

1. A customer creates an order.
2. The customer enters an M-Pesa phone number.
3. The application requests an STK Push payment.
4. The customer approves the payment on their phone.
5. Safaricom sends a payment callback.
6. The application reconciles the payment.
7. Successful payments are recorded and the corresponding order is updated.

**Note:** M-Pesa integration requires valid Daraja API credentials and properly configured Supabase Edge Function secrets.

## Technologies Used

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| JavaScript | Application functionality |
| Vite | Development server and build tool |
| Tailwind CSS | Styling and responsive design |
| React Router | Application navigation |
| Lucide React | Icons |
| Supabase | Backend services and database |
| PostgreSQL | Relational database |
| Supabase Auth | User authentication |
| Supabase Storage | Product image storage |
| Supabase Edge Functions | Secure backend operations |
| Safaricom Daraja API | M-Pesa payments |
| React Leaflet | Interactive delivery maps |
| OSRM | Road distance calculation |
| Vitest | Automated testing |
| React Testing Library | Component testing |
| Vercel | Application deployment |
| Git and GitHub | Version control |

## Application Architecture

ShopEase uses a React frontend connected to Supabase backend services.

- **Frontend:** React application built with Vite.
- **Database:** Supabase PostgreSQL.
- **Authentication:** Supabase Auth.
- **File storage:** Supabase Storage.
- **Server-side operations:** Supabase Edge Functions and PostgreSQL functions.
- **Payments:** Safaricom Daraja API.
- **Deployment:** Vercel.

Sensitive payment credentials are stored as Supabase Edge Function secrets and are not exposed in the frontend.

## Database Structure

The application uses the following main database tables:

| Table | Description |
|---|---|
| profiles | Customer and administrator profile information |
| categories | Product categories |
| products | Product information, prices and stock |
| addresses | Customer delivery addresses |
| cart_items | Shopping cart records |
| orders | Customer orders and delivery information |
| order_items | Products associated with orders |
| payments | Payment transactions and statuses |

Row Level Security (RLS) policies are used to control access to database records.

## Order Management Workflow

Orders follow a controlled status workflow:

- Pending → Processing
- Pending → Cancelled
- Processing → Shipped
- Processing → Cancelled
- Shipped → Delivered
- Shipped → Cancelled

Delivered and cancelled orders are terminal states.

Customers can cancel eligible pending orders, while administrators can manage order statuses through the administrative dashboard.

## Project Structure

The main application structure is organized as follows:

```text
ShopEase/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── cart/
│   │   ├── common/
│   │   ├── layout/
│   │   └── products/
│   │
│   ├── context/
│   │
│   ├── hooks/
│   │
│   ├── pages/
│   │   ├── admin/
│   │   └── customer/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │   └── __tests__/
│   │
│   ├── supabase/
│   │
│   ├── test/
│   │
│   ├── utils/
│   │   └── __tests__/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── supabase/
│   └── functions/
│       ├── create-order/
│       ├── mpesa-stk-push/
│       ├── mpesa-callback/
│       └── reconcile-payment/
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

*Note: This is an overview of the main project structure. Individual filenames and additional configuration files may vary.*

## Installation and Setup

### Prerequisites

Before running the application, ensure you have installed:

- Node.js
- npm
- Git
- A Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/enocklan/ShopEase-Multi-Category-E-commerce-Web-Application.git
```

### 2. Navigate to the project directory

```bash
cd ShopEase-Multi-Category-E-commerce-Web-Application
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholder values with your Supabase project configuration.

Never commit `.env` files or private API credentials to GitHub.

### 5. Configure Supabase

Create or connect a Supabase project.

Configure the required database tables, relationships, Row Level Security policies, database functions and storage bucket.

The application requires the following Supabase services:

- PostgreSQL database.
- Authentication.
- Storage bucket named `product-images`.
- Row Level Security policies.
- Required PostgreSQL functions.
- Supabase Edge Functions.

### 6. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## M-Pesa Configuration

ShopEase uses the Safaricom Daraja API for M-Pesa payments.

To configure payments:

1. Create an application in the Safaricom Daraja developer portal.
2. Obtain the required API credentials.
3. Configure the M-Pesa shortcode and passkey.
4. Configure the callback URL.
5. Store credentials securely as Supabase Edge Function secrets.
6. Deploy the required Edge Functions.

The Edge Functions used for payment and order processing include:

- `create-order`
- `mpesa-stk-push`
- `mpesa-callback`
- `reconcile-payment`

Do not place Daraja consumer secrets or the M-Pesa passkey in frontend environment variables.

## Testing

ShopEase uses Vitest and React Testing Library for automated testing.

The test suite covers important application utilities, services and UI components.

### Run tests in watch mode

```bash
npm run test
```

### Run all tests once

```bash
npm run test:run
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Current Testing Results

The latest recorded test run produced the following results:

| Metric | Result |
|---|---:|
| Test files passed | 17 |
| Total tests passed | 204 |
| Failed tests | 0 |
| Statement coverage | 24.68% |
| Branch coverage | 22.04% |
| Function coverage | 23.67% |
| Line coverage | 23.95% |

All 204 automated tests passed.

Coverage represents the proportion of application code executed during the tests. Additional tests can improve coverage.

## Production Build

To create an optimized production build, run:

```bash
npm run build
```

The generated production files are placed in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Deployment

ShopEase is deployed using Vercel.

Live application:

https://shop-ease-multi-category-e-commerce.vercel.app/

### Deployment Steps

1. Push the latest project changes to GitHub.
2. Import the GitHub repository into Vercel.
3. Configure the frontend environment variables in Vercel.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Deploy the application.

The project includes a `vercel.json` rewrite configuration to support React Router navigation and direct page refreshes.

Example:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Security Considerations

ShopEase applies several security measures:

- Supabase Row Level Security for database access control.
- Authentication for protected customer and administrator features.
- Role-based administrator access.
- Server-side validation for important order and payment operations.
- Secure storage of payment credentials using Supabase secrets.
- Environment variables excluded from version control.
- Payment verification through backend reconciliation.
- Controlled order status updates through database functions.

Never expose private API keys, database service-role keys, M-Pesa passkeys or other confidential credentials in the frontend or public repository.

## Future Improvements

Potential future improvements include:

- Increasing automated test coverage.
- Adding product reviews and ratings.
- Adding product recommendations.
- Improving analytics and reporting.
- Adding email and SMS order notifications.
- Improving payment reconciliation and transaction reporting.
- Adding more delivery and payment options.
- Improving accessibility and performance.

## Author

**Enock**

GitHub: https://github.com/enocklan

LinkedIn: https://www.linkedin.com/in/enock-lan-6918a9269/

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

**ShopEase – Making online shopping simple, convenient and accessible.**