# Tickets Visualization & Random Seat Assignment - Update

## Changes Made

### 1. Random Seat Assignment ✅

**File:** `src/app/[locale]/admin/orders/actions.ts`

**Before:** Seats were assigned sequentially (ascending order)
**After:** Seats are now assigned randomly using Fisher-Yates shuffle algorithm

**Key Changes:**
- Removed `.order('seat_no', { ascending: true })` and `.limit(quantity)` from queries
- Added `shuffle()` function to randomly shuffle available seats
- Randomly selects seats from available offline pool first
- Falls back to randomly selected online seats if needed
- Maintains the preference for offline seats, but selection is random

**Why Random?**
- Better for testing different seat combinations
- More realistic booking simulation
- Prevents predictable patterns in seat assignments

### 2. Tickets Visualization ✅

**File:** `src/app/[locale]/admin/routes/[id]/page.tsx`

**Added:** New "Tickets" card showing all assigned tickets for the route

**Features:**
- Shows all tickets with their seat numbers
- Displays order ID, customer name, and phone (from metadata)
- Shows order source (online/offline) with color coding
- Shows ticket status
- Shows creation date
- Only displays when tickets exist
- Table format for easy scanning

**Data Structure:**
- Fetches tickets with joined order information
- Includes customer metadata (name, phone) from order metadata JSONB field
- Sorted by seat number for easy viewing

## Testing

1. **Test Random Seat Assignment:**
   - Create multiple offline orders for the same route
   - Check route details page
   - Verify seats are assigned randomly (not sequential)
   - Verify offline seats are preferred but selection is random

2. **Test Tickets Visualization:**
   - Create an offline order with customer name and phone
   - View route details page
   - Scroll down to see "Tickets" card
   - Verify all tickets are listed with correct information
   - Verify customer name and phone appear correctly

## Code Notes

- The shuffle function uses Fisher-Yates algorithm for true randomization
- Ticket visualization uses a simple table (not shadcn Table component) for simplicity
- Customer data comes from `orders.metadata` JSONB field
- All tickets are fetched with their related order information in a single query using Supabase joins

