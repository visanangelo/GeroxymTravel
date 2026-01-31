# Guest Checkout Implementation

## Overview
Implemented a complete guest checkout flow that allows customers to book tickets without creating an account. Accounts are optional and can be created after purchase.

## Database Changes

### 1. Customers Table
- Created `customers` table to store guest customer information
- Fields: `id`, `full_name`, `email`, `phone`, `user_id` (nullable), `created_at`, `updated_at`
- Indexes on `email`, `user_id`, and `phone` for fast lookups
- RLS policies allow:
  - Anyone to create customers (via server actions)
  - Users to read/update their own customer data
  - Admins to read all customers

### 2. Orders Table Updates
- Added `customer_id` column (required, references `customers.id`)
- Made `user_id` nullable (guests don't have user_id)
- Orders now link to customers instead of requiring users

### 3. SQL Function Updates
- Updated `allocate_tickets()` function to work with both authenticated and guest orders
- Function now checks `customer_id` for guest orders
- Grants execute permission to both `authenticated` and `anon` roles

## Booking Flow

### Step 1: Route Selection
- **Page**: `/[locale]/routes`
- Lists all active routes with availability
- Users click "View Details & Book" to proceed

### Step 2: Route Details & Quantity Selection
- **Page**: `/[locale]/routes/[id]`
- Shows route information and availability
- User selects quantity (1-10 tickets)
- Clicks "Continue" → moves to customer info step

### Step 3: Customer Information (Guest Checkout)
- **Component**: `RouteBookingForm` (two-step form)
- Step 1: Select quantity
- Step 2: Enter customer information:
  - Full Name (required)
  - Email (required, validated)
  - Phone (required)
- Creates customer record (or updates if email exists)
- Creates order with `status='created'` and `source='online'`
- Redirects to confirmation page

### Step 4: Order Confirmation
- **Page**: `/[locale]/checkout/confirm?orderId=...`
- Shows complete order summary:
  - Route details
  - Customer information
  - Quantity and total amount
- "Confirm Booking (Simulate Payment)" button
- Validates availability one more time before confirmation

### Step 5: Payment Simulation & Seat Allocation
- **Action**: `finalizeOrder(orderId)`
- Calls SQL function `allocate_tickets()` which:
  - Verifies order status is 'created'
  - Selects random available seats from ONLINE pool
  - Inserts tickets with status 'paid'
  - Updates order status to 'paid'
  - Returns allocated seat numbers
- Transactional and safe from double-booking (uses `FOR UPDATE SKIP LOCKED`)

### Step 6: Success Page
- **Page**: `/[locale]/checkout/success?orderId=...`
- Shows:
  - Success confirmation
  - Route details
  - Allocated seat numbers
  - Customer information
  - Order ID
- **Optional Account Creation CTA**:
  - Only shown if customer doesn't have account and user is not logged in
  - Links to signup page with pre-filled email
  - Explains benefits of creating account

## Server Actions

### `createOrderWithGuest(routeId, quantity, fullName, email, phone, locale)`
- Validates quantity (1-10)
- Validates customer information
- Checks route availability
- Creates or updates customer by email
- Creates order with `customer_id` and optional `user_id` (if logged in)
- Returns order ID

### `finalizeOrder(orderId)`
- Works for both authenticated and guest orders
- Verifies order exists and status is 'created'
- For authenticated orders, verifies ownership
- Calls `allocate_tickets()` SQL function
- Returns success status and seat numbers

## Security

### RLS Policies
- **Customers**: Anyone can create, users can read/update own, admins can read all
- **Orders**: Anyone can create (via server actions), users can read own (by user_id or customer email), admins can read all
- **Tickets**: Created via SQL function (SECURITY DEFINER) which enforces business logic

### Validation
- Email format validation
- Quantity limits (1-10)
- Availability checks before order creation and finalization
- Order status verification (only 'created' orders can be finalized)

## How Stripe Will Replace Payment Simulation

### Current Flow (Simulation)
1. User clicks "Confirm Booking (Simulate Payment)"
2. `finalizeOrder()` is called directly
3. Seats are allocated immediately
4. Order status → 'paid'

### Future Flow (With Stripe)
1. User clicks "Proceed to Payment"
2. `createStripeCheckoutSession()` server action:
   - Creates Stripe Checkout Session
   - Stores `stripe_session_id` in order
   - Returns Stripe Checkout URL
3. User redirected to Stripe Checkout
4. After payment, Stripe webhook calls `/api/webhooks/stripe`:
   - Verifies webhook signature
   - Finds order by `stripe_session_id`
   - Calls `finalizeOrder()` to allocate seats
   - Sends confirmation email
5. User redirected to success page

### Migration Path
- Keep `finalizeOrder()` as-is (it's already webhook-ready)
- Add `createStripeCheckoutSession()` action
- Replace "Simulate Payment" button with "Proceed to Payment"
- Add webhook endpoint at `/api/webhooks/stripe`
- Update confirmation page to show Stripe session status

## Files Created/Modified

### New Files
- `supabase/migrations/20250128_guest_checkout.sql` - Database migration
- `supabase/migrations/20250128_update_allocate_tickets_for_guests.sql` - SQL function update
- `src/app/[locale]/checkout/confirm/page.tsx` - Confirmation page
- `src/components/checkout/CheckoutConfirmForm.tsx` - Confirmation form
- `src/components/checkout/CreateAccountCTA.tsx` - Optional account creation CTA

### Modified Files
- `src/app/[locale]/routes/actions.ts` - Added `createOrderWithGuest()`, updated `createOrder()`
- `src/components/routes/RouteBookingForm.tsx` - Two-step form with customer info
- `src/app/[locale]/checkout/[orderId]/actions.ts` - Updated `finalizeOrder()` for guests
- `src/app/[locale]/checkout/success/page.tsx` - Added optional account creation

## Testing Checklist

- [ ] Guest can browse routes without login
- [ ] Guest can select quantity and enter customer info
- [ ] Order is created with customer_id (not user_id)
- [ ] Confirmation page shows correct order details
- [ ] Payment simulation allocates random seats
- [ ] Success page shows allocated seats
- [ ] Optional account creation CTA appears for guests
- [ ] Authenticated users can still create orders (backward compatibility)
- [ ] Email validation works correctly
- [ ] Availability checks prevent overbooking
- [ ] Concurrent bookings don't cause double-booking

## Next Steps

1. **Stripe Integration**:
   - Install Stripe SDK
   - Create `createStripeCheckoutSession()` action
   - Add webhook endpoint
   - Update UI to use Stripe Checkout

2. **Email Notifications**:
   - Send booking confirmation email
   - Include ticket details and seat numbers
   - Use customer email from order

3. **Account Linking**:
   - Implement signup page with email pre-fill
   - Link existing customer to new user account
   - Use `link_customer_to_user()` SQL function

4. **My Bookings Page**:
   - Update to work with customer_id
   - Allow guests to view bookings by email lookup
   - Show "Create Account" CTA for guests

