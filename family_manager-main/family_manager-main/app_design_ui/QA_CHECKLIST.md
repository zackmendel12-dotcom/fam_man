# BaseFam Manual QA Checklist

This document outlines the comprehensive manual quality assurance testing procedures for the BaseFam smart family wallet application.

## 📱 Test Environments

Test on the following viewports:
- [ ] Mobile (320px - 480px)
- [ ] Mobile Large (481px - 767px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1025px+)

Test on the following browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

## 🎯 Parent/Admin Flows

### Initial Load
- [ ] Application loads without errors
- [ ] Loading state displays with animation and text
- [ ] Main wallet dashboard appears with correct data
- [ ] Family members are displayed in card layout
- [ ] Transaction history is hidden by default
- [ ] Header shows BaseFam branding and wallet button

### View Main Wallet
- [ ] Main wallet balance displays correctly ($10,000)
- [ ] Balance is formatted with commas (e.g., 10,000 not 10000)
- [ ] "Managed by Michael" text appears below balance
- [ ] Three action buttons are visible: Daily Allowance, History, Add Member
- [ ] Buttons are properly spaced and clickable

### Add Family Member - Kid Role
1. [ ] Click "Add Member" button
2. [ ] Modal opens with proper animation
3. [ ] Modal has title "Add New Family Member"
4. [ ] Close button (X) is visible in top-right
5. [ ] Name field is empty and focused
6. [ ] Role dropdown defaults to "Kid"
7. [ ] Daily Spending Limit field shows 20
8. [ ] Daily Allowance field shows 10
9. [ ] Enter name: "Emma"
10. [ ] Keep role as "Kid"
11. [ ] Set Daily Spending Limit: 25
12. [ ] Set Daily Allowance: 15
13. [ ] Click "Add Member" button
14. [ ] Modal closes
15. [ ] New member card appears in Family Members section
16. [ ] Emma's card shows:
    - [ ] Name: Emma
    - [ ] Role: Kid
    - [ ] Balance: $15 (first allowance)
    - [ ] Daily Limit: $25
    - [ ] Daily Allowance: +$15
17. [ ] Main wallet balance decreases by $15
18. [ ] Toggle History - new transaction appears for "First Allowance"

### Add Family Member - Mom Role
1. [ ] Click "Add Member" button
2. [ ] Change role to "Mom"
3. [ ] Label changes to "Monthly Spending Limit"
4. [ ] Daily Allowance field disappears
5. [ ] Enter name: "Jessica"
6. [ ] Set Monthly Spending Limit: 1500
7. [ ] Click "Add Member"
8. [ ] New Mom card appears with:
    - [ ] Name: Jessica
    - [ ] Role: Mom
    - [ ] Balance: $0
    - [ ] Monthly Limit: $1,500
    - [ ] No allowance field shown
9. [ ] Main wallet balance unchanged (Mom doesn't get initial allowance)

### Edit Member Settings - Kid
1. [ ] Click settings icon (gear) on Leo's card
2. [ ] Settings modal opens
3. [ ] Modal title shows "Settings for Leo"
4. [ ] Daily Spending Limit shows current value (20)
5. [ ] Daily Allowance shows current value (10)
6. [ ] Change Daily Spending Limit to 30
7. [ ] Change Daily Allowance to 12
8. [ ] Click "Save Changes"
9. [ ] Modal closes
10. [ ] Leo's card updates with new values
11. [ ] Next daily allowance will use new amount (12)

### Edit Member Settings - Mom
1. [ ] Click settings icon on Sarah's card
2. [ ] Settings modal opens
3. [ ] Shows "Monthly Spending Limit" label
4. [ ] No Daily Allowance field (Mom role)
5. [ ] Change Monthly Spending Limit to 2500
6. [ ] Click "Save Changes"
7. [ ] Sarah's card updates to show $2,500 limit

### Revoke Member Access
1. [ ] Click settings icon on any member
2. [ ] Click "Revoke Access" button (red text)
3. [ ] Browser confirmation dialog appears
4. [ ] Confirm the action
5. [ ] Modal closes
6. [ ] Member card is removed from display
7. [ ] Remaining members still visible
8. [ ] No errors in console

### Process Daily Allowances
1. [ ] Note current balance of all kids
2. [ ] Note main wallet balance
3. [ ] Click "Daily Allowance" button
4. [ ] Button shows loading/processing state
5. [ ] All kid balances increase by their allowance amount
6. [ ] Main wallet balance decreases by total allowances
7. [ ] Toggle History to view new transactions
8. [ ] Each kid has a new "Daily Allowance" transaction

## 👶 Child/Mom Account Flows

### Kid Account Display
- [ ] Kid card shows role badge as "Kid"
- [ ] Current Balance displays correctly
- [ ] Daily Limit displays correctly
- [ ] Daily Allowance displays in green with "+" prefix
- [ ] Settings icon is visible and clickable
- [ ] Avatar image loads (from pravatar.cc)
- [ ] Card has hover effect (shadow and slight lift)

### Mom Account Display
- [ ] Mom card shows role badge as "Mom"
- [ ] Current Balance displays correctly
- [ ] Monthly Limit displays correctly
- [ ] No Daily Allowance field shown
- [ ] Settings icon is visible and clickable
- [ ] Avatar image loads correctly
- [ ] Card styling matches Kid cards

## 🚫 Category Blocks & Spending Controls

### Limit Validation
- [ ] Cannot add member with negative spending limit
- [ ] Cannot add member with negative allowance
- [ ] Cannot set spending limit to negative value in settings
- [ ] Cannot set allowance to negative value in settings
- [ ] Form shows validation error for invalid inputs
- [ ] "Add Member" button disabled until valid input

### Father Account
- [ ] Father (Michael) not shown in Family Members section
- [ ] Father mentioned in "Managed by" text
- [ ] Father has unlimited spending (Infinity in data)
- [ ] No spending limit shown for Father

### Spending Limit Display
- [ ] Kid limits show "Daily Limit" label
- [ ] Mom limits show "Monthly Limit" label
- [ ] Limits are formatted with $ and commas
- [ ] Limits are bold and stand out visually

## 📊 Transaction List & History

### Toggle History
- [ ] Click "History" button in dashboard
- [ ] Transaction History section appears below Family Members
- [ ] Click "History" button again
- [ ] Transaction History section disappears
- [ ] Button state doesn't change appearance

### Transaction Display
- [ ] Table has 4 columns: Date, Member, Store/Description, Amount
- [ ] All transactions show correct member name
- [ ] Dates are formatted as locale date string
- [ ] Amounts show with 2 decimal places
- [ ] Amounts are prefixed with "-$" (negative)
- [ ] Most recent transaction appears at top
- [ ] Older transactions appear below

### Transaction List Refresh
1. [ ] Note existing transactions
2. [ ] Add a new family member (Kid)
3. [ ] Toggle History
4. [ ] New "First Allowance" transaction appears at top
5. [ ] Process Daily Allowances
6. [ ] Refresh History
7. [ ] New transactions for each kid appear
8. [ ] All transactions maintain correct order (newest first)

### Empty State
- [ ] If no transactions exist, table shows empty state
- [ ] Message: "No transactions yet"
- [ ] Empty state is centered and styled appropriately

## 📱 Mobile Responsiveness

### Mobile (320px - 480px)
- [ ] Header stacks properly, logo + wallet button visible
- [ ] Wallet address text hidden on mobile, only icon shown
- [ ] Main wallet card stacks vertically
- [ ] Action buttons stack and wrap properly
- [ ] Button text shortened ("Allowance" instead of "Daily Allowance")
- [ ] "Add" button shows "Add" instead of "Add Member"
- [ ] Family member cards display full-width (1 column)
- [ ] Cards maintain proper spacing and padding
- [ ] Modals are full-width with proper padding
- [ ] Modal buttons stack vertically and stretch full width
- [ ] Transaction table scrolls horizontally
- [ ] Table maintains minimum width for readability
- [ ] No horizontal overflow on main content

### Tablet (768px - 1024px)
- [ ] Header spacing increases (md:px-8)
- [ ] Main wallet card displays in row layout
- [ ] Buttons display inline with full text
- [ ] Family member cards in 2-column grid
- [ ] Card hover effects work properly
- [ ] Modals centered with max-width
- [ ] Modal buttons inline (not stacked)
- [ ] Transaction table displays without scroll

### Desktop (1025px+)
- [ ] Family member cards in 3-column grid
- [ ] All text visible and properly sized
- [ ] Hover effects smooth and performant
- [ ] Large balance numbers readable
- [ ] Plenty of whitespace and padding
- [ ] Modals centered with good proportions

## 🎨 UI/UX Polish

### Loading State
- [ ] Animated pulse on wallet icon
- [ ] "Loading BaseFam..." text
- [ ] "Preparing your family wallet" subtext
- [ ] Centered on screen
- [ ] Professional appearance

### Error State
- [ ] Error icon displays (red exclamation circle)
- [ ] Error heading: "Oops! Something went wrong"
- [ ] Error message displays in red
- [ ] "Reload Page" button present and functional
- [ ] Clicking button reloads the application
- [ ] Error state is centered and easy to read

### Modal Behavior
- [ ] Modals have backdrop overlay (50% black)
- [ ] Clicking backdrop closes modal
- [ ] Clicking X button closes modal
- [ ] Pressing ESC key closes modal
- [ ] Body scroll disabled when modal open
- [ ] Modal animates smoothly on open
- [ ] Modal content doesn't stretch beyond max-width
- [ ] Modal is vertically and horizontally centered

### Form Validation
- [ ] Required fields show validation on submit
- [ ] Number inputs don't accept negative values
- [ ] Empty name field shows validation error
- [ ] Min value (0) enforced on number inputs
- [ ] Form cannot be submitted with invalid data
- [ ] Validation messages are clear and helpful

### Button States
- [ ] All buttons have hover effects
- [ ] Hover changes background color slightly
- [ ] Transitions are smooth (300ms)
- [ ] Active/clicked state provides feedback
- [ ] Disabled buttons have reduced opacity
- [ ] Cursor changes to pointer on hover

### Card Animations
- [ ] Cards have subtle shadow
- [ ] Shadow increases on hover
- [ ] Card lifts slightly on hover (-translate-y-1)
- [ ] Transitions are smooth (300ms)
- [ ] Animations don't interfere with clicking

### Avatar Images
- [ ] All avatars load successfully
- [ ] Avatars are circular
- [ ] Border with base-blue tint
- [ ] 16x16 size (64px)
- [ ] No broken image icons
- [ ] Loading is fast (pravatar CDN)

### Color Consistency
- [ ] Base blue (#0052FF) used for primary actions
- [ ] Dark text (#1a202c) for main content
- [ ] Light text (#718096) for secondary info
- [ ] Light background (#F5F8FF) for page
- [ ] Green for positive actions (allowance)
- [ ] Red for destructive actions (revoke)
- [ ] Gray for neutral actions (cancel, history)

### Typography
- [ ] Inter font loads from Google Fonts
- [ ] Headings use proper weight (bold/semibold)
- [ ] Body text is readable (400 weight)
- [ ] Font sizes scale appropriately
- [ ] Line height provides good readability
- [ ] No text cutoff or overflow

## ♿ Accessibility

### Keyboard Navigation
- [ ] Tab key navigates through interactive elements
- [ ] Tab order is logical and predictable
- [ ] Enter key submits forms
- [ ] Enter key activates buttons
- [ ] ESC key closes modals
- [ ] Focus indicator visible on all elements
- [ ] No keyboard traps

### Form Labels
- [ ] All inputs have associated labels
- [ ] Labels use htmlFor attribute
- [ ] Labels are descriptive
- [ ] Role dropdown has clear label
- [ ] Required fields indicated

### Button Labels
- [ ] All buttons have descriptive text or aria-label
- [ ] Icon-only buttons have tooltips or labels
- [ ] Button purpose is clear from label
- [ ] Settings icon understandable in context

### Color Contrast
- [ ] Main text on white meets WCAG AA (4.5:1)
- [ ] Light text on white meets WCAG AA for large text
- [ ] White text on base-blue is highly readable
- [ ] Red text for errors is readable
- [ ] Green text for allowances is readable
- [ ] All interactive elements have sufficient contrast

### Focus Indicators
- [ ] Blue outline on focused inputs
- [ ] Visible focus on buttons
- [ ] Focus doesn't get lost
- [ ] Focus state different from hover state

## 🐛 Error Handling & Edge Cases

### Network Errors
- [ ] Simulated API delay doesn't break UI
- [ ] Loading state shows during async operations
- [ ] Errors display helpful messages
- [ ] Retry functionality works

### Data Validation
- [ ] Decimal values handled correctly
- [ ] Large numbers formatted properly
- [ ] Zero values display correctly
- [ ] Negative inputs rejected

### Empty States
- [ ] No family members: shows empty state
- [ ] No transactions: shows "No transactions yet"
- [ ] Empty name: form validation prevents submit

### Boundary Conditions
- [ ] Main wallet at $0: can't process allowances
- [ ] Very large numbers: format with commas
- [ ] Very long names: truncate or wrap properly
- [ ] Many family members: grid handles overflow

### Browser Compatibility
- [ ] No console errors on page load
- [ ] No console warnings
- [ ] localStorage not required (in-memory works)
- [ ] Tailwind CDN loads successfully
- [ ] Google Fonts load successfully

## ✅ Final Smoke Test

Run through this quick flow to verify all systems working:

1. [ ] Load application
2. [ ] View dashboard and confirm data displays
3. [ ] Add new Kid member with allowance
4. [ ] Add new Mom member with limit
5. [ ] Process daily allowances
6. [ ] View transaction history
7. [ ] Edit a member's settings
8. [ ] Revoke a member's access
9. [ ] Test on mobile viewport
10. [ ] Test on desktop viewport
11. [ ] Check for console errors
12. [ ] Verify TypeScript compilation: `npm run typecheck`
13. [ ] Verify production build: `npm run build`

## 🚨 Known Limitations to Document

During testing, document any of these known limitations encountered:

- [ ] Wallet connection not functional (hardcoded address)
- [ ] Data resets on page refresh (in-memory only)
- [ ] No real blockchain transactions
- [ ] No USDC token interactions
- [ ] No multi-signature approvals
- [ ] No spending categories/restrictions
- [ ] No backend API integration
- [ ] No user authentication
- [ ] No transaction signing
- [ ] No gas fee estimation

## 📝 Test Results

**Test Date**: _________________  
**Tester Name**: _________________  
**Environment**: _________________  
**Browser**: _________________  
**Device**: _________________  

**Overall Pass Rate**: _____ / _____ tests passed

**Critical Issues Found**: 

**Medium Issues Found**: 

**Minor Issues Found**: 

**Recommendations**: 

**Approval**: 
- [ ] Ready for demo
- [ ] Ready for staging
- [ ] Ready for production (with known limitations)
- [ ] Requires fixes before deployment
