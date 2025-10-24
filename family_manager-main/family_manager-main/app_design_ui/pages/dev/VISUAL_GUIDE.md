# Visual Guide - Dev Test Harness

## Accessing the Test Harness

### Step 1: Add #dev to URL
```
http://localhost:5173/         →    http://localhost:5173/#dev
                                    or
                                    http://localhost:5173/?dev=true
```

### Step 2: Warning Screen

```
┌─────────────────────────────────────────────────────────┐
│                         ⚠️                              │
│                                                         │
│               ⚠️ DEV TEST HARNESS ⚠️                   │
│                                                         │
│   ┌───────────────────────────────────────────────┐   │
│   │ ⚠  Development Environment Only               │   │
│   │                                                │   │
│   │  • This page is for testing only              │   │
│   │  • Do not use in production                   │   │
│   │  • Actions may modify data stores             │   │
│   │  • Some functions simulate blockchain txns    │   │
│   │  • Raw responses will be displayed            │   │
│   └───────────────────────────────────────────────┘   │
│                                                         │
│   [ I Understand, Continue ]  [ Go Back ]              │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Main Test Interface

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ⚠ DEV MODE - Test Harness Active                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                        BaseFam Test Actions                                     │
├───────────────────────────────────┬─────────────────────────────────────────────┤
│                                   │                                             │
│  FAMILY SERVICE ACTIONS           │       LIVE RESULTS                          │
│  ┌─────────────────────────────┐ │  ┌──────────────────────────────────────┐  │
│  │ Get Family Data             │ │  │ ✓ Success                            │  │
│  │ ┌─────────────────────────┐ │ │  │ getFamilyData                        │  │
│  │ │ [Load Family Data]      │ │ │  │ 2024-01-15 10:30:45                  │  │
│  │ └─────────────────────────┘ │ │  │                                      │  │
│  └─────────────────────────────┘ │  │ Response Data:                       │  │
│                                   │  │ {                                    │  │
│  ┌─────────────────────────────┐ │  │   "mainWalletBalance": 10000,        │  │
│  │ Add Family Member           │ │  │   "members": [                       │  │
│  │ [Name          ]            │ │  │     {                                │  │
│  │ [Kid ▼]                     │ │  │       "id": "dad-01",                │  │
│  │ [Spending Limit]            │ │  │       "name": "Michael",             │  │
│  │ [Daily Allowance]           │ │  │       "role": "Father",              │  │
│  │ [Add Member   ]             │ │  │       "balance": 10000               │  │
│  └─────────────────────────────┘ │  │     },                               │  │
│                                   │  │     ...                              │  │
│  ┌─────────────────────────────┐ │  │   ]                                  │  │
│  │ Update Member Settings      │ │  │ }                                    │  │
│  │ [Member ID (kid-01)]        │ │  └──────────────────────────────────────┘  │
│  │ [New Spending Limit]        │ │                                             │
│  │ [New Daily Allowance]       │ │  ┌──────────────────────────────────────┐  │
│  │ [Update Settings]           │ │  │ ✗ Error                              │  │
│  └─────────────────────────────┘ │  │ addFamilyMember                      │  │
│                                   │  │ 2024-01-15 10:29:12                  │  │
│  ┌─────────────────────────────┐ │  │                                      │  │
│  │ Revoke Access               │ │  │ Error:                               │  │
│  │ [Member ID to revoke]       │ │  │ Name is required                     │  │
│  │ [Revoke Access]             │ │  └──────────────────────────────────────┘  │
│  └─────────────────────────────┘ │                                             │
│                                   │  ┌──────────────────────────────────────┐  │
│  ┌─────────────────────────────┐ │  │ ✓ Success                            │  │
│  │ Process Daily Allowances    │ │  │ fundChild (simulated)                │  │
│  │ [Process Allowances]        │ │  │ 2024-01-15 10:28:05                  │  │
│  └─────────────────────────────┘ │  │                                      │  │
│                                   │  │ Transaction Hash:                    │  │
│  UNITS HELPERS                    │  │ 0xa1b2c3d4e5f6...                    │  │
│  ┌─────────────────────────────┐ │  │                                      │  │
│  │ Test Units Conversion       │ │  │ Response Data:                       │  │
│  │ [Amount (1.5)]              │ │  │ {                                    │  │
│  │ [Test parseUnits/format]    │ │  │   "childAddress": "0x123...",        │  │
│  │                             │ │  │   "amountEth": "1.5",                │  │
│  │ Helper Functions:           │ │  │   "amountWei": "1500000..."          │  │
│  │ • parseUnits(value, dec)    │ │  │ }                                    │  │
│  │ • formatUnits(value, dec)   │ │  └──────────────────────────────────────┘  │
│  │ • parseEther(value)         │ │                                             │
│  │ • formatEther(value)        │ │                [Clear]                      │
│  │ • parseUsdc/formatUsdc      │ │                                             │
│  └─────────────────────────────┘ │                                             │
│                                   │                                             │
│  CONTRACT SIMULATION              │                                             │
│  ┌─────────────────────────────┐ │                                             │
│  │ Fund Child (Simulated)      │ │                                             │
│  │ [Child Address (0x...)]     │ │                                             │
│  │ [Amount in ETH]             │ │                                             │
│  │ [Simulate Fund Child]       │ │                                             │
│  │                             │ │                                             │
│  │ ℹ️ Contract Functions:      │ │                                             │
│  │ • registerChild             │ │                                             │
│  │ • fundChild                 │ │                                             │
│  │ • getChildLimits            │ │                                             │
│  │ • isRegisteredChild         │ │                                             │
│  └─────────────────────────────┘ │                                             │
└───────────────────────────────────┴─────────────────────────────────────────────┘
```

## Color Coding

### Success Results (Green)
- Border: Light green (#d1fae5)
- Background: Very light green (#f0fdf4)
- Text: Dark green (#065f46)
- Badge: Green with checkmark (✓)

### Error Results (Red)
- Border: Light red (#fecaca)
- Background: Very light red (#fef2f2)
- Text: Dark red (#991b1b)
- Badge: Red with X (✗)

### Action Buttons
- **Blue**: Get/Read operations
- **Green**: Add/Create operations
- **Yellow**: Update/Modify operations
- **Red**: Delete/Revoke operations
- **Purple**: Process/Execute operations
- **Indigo**: Test/Utility operations
- **Teal**: Simulate operations

## Interaction Flow

### Example 1: Adding a Family Member

```
1. Fill in form fields:
   Name: "Emma"
   Role: Kid
   Spending Limit: 50
   Daily Allowance: 10

2. Click [Add Member]

3. Result appears in right panel:
   ┌──────────────────────────────┐
   │ ✓ Success                    │
   │ addFamilyMember              │
   │ 2024-01-15 10:35:20          │
   │                              │
   │ Response Data:               │
   │ {                            │
   │   "members": [               │
   │     {                        │
   │       "id": "kid-1234567",   │
   │       "name": "Emma",        │
   │       "role": "Kid",         │
   │       "balance": 10,         │
   │       "spendingLimit": 50    │
   │     }                        │
   │   ]                          │
   │ }                            │
   └──────────────────────────────┘
```

### Example 2: Testing Units Conversion

```
1. Enter amount: "2.5"

2. Click [Test parseUnits/formatUnits]

3. Result shows conversion:
   ┌──────────────────────────────┐
   │ ✓ Success                    │
   │ testUnitsHelpers             │
   │ 2024-01-15 10:36:15          │
   │                              │
   │ Response Data:               │
   │ {                            │
   │   "input": "2.5",            │
   │   "parsedWei": "2500000...00"│
   │   "formattedBack": "2.5",    │
   │   "formatEther": "2.5"       │
   │ }                            │
   └──────────────────────────────┘
```

### Example 3: Simulating Contract Call

```
1. Fill in:
   Child Address: "0x1234...5678"
   Amount: "1.0"

2. Click [Simulate Fund Child]

3. Result with TX hash:
   ┌──────────────────────────────┐
   │ ✓ Success                    │
   │ fundChild (simulated)        │
   │ 2024-01-15 10:37:00          │
   │                              │
   │ Transaction Hash:            │
   │ 0xa1b2c3d4e5f67890...        │
   │                              │
   │ Response Data:               │
   │ {                            │
   │   "childAddress": "0x12...", │
   │   "amountEth": "1.0",        │
   │   "amountWei": "100000..."   │
   │ }                            │
   └──────────────────────────────┘
```

## Mobile Responsive Layout

On smaller screens, the layout stacks vertically:

```
┌─────────────────────────────┐
│ ⚠ DEV MODE Active           │
├─────────────────────────────┤
│  BaseFam Test Actions       │
├─────────────────────────────┤
│                             │
│  [Action Forms]             │
│  ↓                          │
│  ↓                          │
│  ↓                          │
│                             │
├─────────────────────────────┤
│                             │
│  [Live Results]             │
│  ↓                          │
│  ↓                          │
│  ↓                          │
│                             │
└─────────────────────────────┘
```

## Keyboard Shortcuts (Future Enhancement)

Potential shortcuts to add:
- `Ctrl+K` - Clear results
- `Ctrl+L` - Focus on last action
- `Ctrl+E` - Export results as JSON
- `Esc` - Close warning dialog / return to main app

## Accessibility Features

Current:
- ✅ Semantic HTML structure
- ✅ Color contrast ratios meet WCAG AA
- ✅ Button focus states
- ✅ Form labels (placeholders)

To Add:
- [ ] ARIA labels for screen readers
- [ ] Keyboard navigation
- [ ] Focus trap in warning dialog
- [ ] Live region for results announcements

## Browser Support

Tested and works on:
- Chrome/Edge (Chromium) 90+
- Firefox 88+
- Safari 14+

Requirements:
- Modern browser with ES2020+ support
- JavaScript enabled
- Local storage (for warning dismissal - future)
