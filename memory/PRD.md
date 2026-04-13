# PRD: The Women - Premium Ethnic Apparel E-commerce

## Original Problem Statement
Build a premium women-only ethnic apparel e-commerce website for "The Women" brand, inspired by SHREE and Ritu Kumar. Full-stack application with admin panel, product management, cart, checkout, order tracking, and payment integration.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI components + Recharts
- **Backend**: FastAPI (Python) on port 8001
- **Database**: MongoDB (Motor async driver)
- **Auth**: JWT (httpOnly cookies) with bcrypt password hashing
- **Payment**: Razorpay (MOCKED - needs real keys), PayU (deferred)
- **Design**: Cormorant Garamond + Outfit fonts, Soft Beige/Maroon/Gold palette

## User Personas
1. **Shopper (Age 18-60)**: Browse categories, filter products, add to cart/wishlist, checkout, track orders
2. **Admin**: Manage products, orders, coupons, view dashboard analytics

## Core Requirements
- Premium responsive e-commerce UI with elegant ethnic aesthetic
- Product catalog with categories, filters, sorting
- Shopping cart with coupon system
- User authentication (register, login, forgot password)
- User dashboard (profile, orders, wishlist, addresses)
- Admin panel (dashboard stats, product/order/coupon management)
- Payment gateway integration

## What's Been Implemented (April 13, 2026)

### Backend (FastAPI + MongoDB)
- JWT authentication (register, login, logout, me, refresh, forgot/reset password)
- Admin seeding on startup
- Products CRUD with filters, sorting, pagination
- Cart management (add, update, remove, clear)
- Wishlist (add, remove, list)
- Address management (CRUD for billing/shipping)
- Order creation with Razorpay order flow
- Coupon system (CRUD, validation)
- Admin dashboard stats endpoint
- Admin product/order/coupon management endpoints
- 6 seed products + 6 categories

### Frontend (React + Tailwind)
- Homepage: Hero slider, categories, featured products, new arrivals, newsletter
- Product listing with filters (category, price, size, fabric, sort)
- Product detail page with image gallery, size chart, size/color selection
- Cart page with quantity controls, coupon application
- Checkout with address management, payment method selection
- User dashboard with profile, orders, wishlist, addresses
- Admin dashboard with stats cards, charts (Recharts)
- Admin product management (add/edit/delete with modal form)
- Admin order management (status updates, tracking ID)
- Admin coupon management (create/edit/deactivate)
- Login/Register pages
- Protected routes for auth and admin
- Responsive design, glassmorphism navbar

## Prioritized Backlog

### P0 (Critical)
- [x] Authentication system
- [x] Product catalog & detail pages
- [x] Cart & checkout flow
- [x] Admin panel
- [x] Order management

### P1 (Important)
- [ ] Razorpay real key integration (needs merchant keys)
- [ ] PayU payment integration (needs merchant keys)
- [ ] Google OAuth social login
- [ ] Product image upload (currently URL-based)
- [ ] Order email notifications
- [ ] Search with auto-suggestions

### P2 (Nice to Have)
- [ ] Blog section for SEO
- [ ] AI-based product recommendations
- [ ] WhatsApp chat integration
- [ ] Abandoned cart recovery
- [ ] Social sharing buttons
- [ ] Schema markup for SEO
- [ ] Recently viewed products
- [ ] Product reviews & ratings

## Next Tasks
1. Configure real Razorpay API keys for live payments
2. Add PayU payment gateway
3. Implement Google OAuth login
4. Add more seed products with varied images
5. Implement search with auto-suggestions
6. Add product reviews & ratings
