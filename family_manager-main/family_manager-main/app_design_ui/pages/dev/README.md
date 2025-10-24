# Dev Test Harness

This directory contains the development test harness page for manually testing BaseFam hook actions and utilities.

## Accessing the Test Harness

The test harness is hidden from production navigation by default. Access it using one of these methods:

### Method 1: URL Hash
Add `#dev` to your URL:
```
http://localhost:5173/#dev
```

### Method 2: Query Parameter
Add `?dev=true` to your URL:
```
http://localhost:5173/?dev=true
```

## Features

### Family Service Actions
- **Get Family Data**: Load current family member data and transactions
- **Add Family Member**: Add new members (Mom or Kid) with spending limits and allowances
- **Update Member Settings**: Modify spending limits and daily allowances for existing members
- **Revoke Access**: Remove a family member from the system
- **Process Daily Allowances**: Manually trigger daily allowance distribution

### Units Helpers
Test currency conversion utilities:
- `parseUnits(value, decimals)` - Convert human-readable values to wei/smallest units
- `formatUnits(value, decimals)` - Convert wei/smallest units to human-readable values
- `parseEther(value)` - Convert ETH to wei (18 decimals)
- `formatEther(value)` - Convert wei to ETH
- `parseUsdc(value)` - Convert USDC (6 decimals)
- `formatUsdc(value)` - Format USDC values

### Contract Simulation
- **Fund Child**: Simulate funding a child account with specified amount
  - Shows transaction hash (simulated)
  - Demonstrates units conversion from ETH to wei

## Live Feedback

All actions display:
- ✅ Success/error status
- 📅 Timestamp
- 🔗 Transaction hashes (when applicable)
- 📊 Raw response data in JSON format
- ❌ Error messages and stack traces

Results are shown in real-time on the right panel, with the most recent action at the top.

## Security Warning

⚠️ **IMPORTANT**: This page is for development and testing only.

- Do not enable this in production environments
- Access is not authenticated
- Actions may modify in-memory data stores
- Some functions simulate blockchain transactions without actual on-chain execution

The page displays a warning dialog on first access to ensure developers understand its purpose.

## Implementation Details

### File Structure
```
pages/dev/
├── TestActions.tsx    # Main test harness component
├── index.tsx          # Export file
└── README.md          # This file

utils/
├── units.ts           # Units conversion helpers
└── index.ts           # Export file
```

### Access Control
Access is controlled via:
1. URL hash (`#dev`) or query parameter (`?dev=true`)
2. Initial warning dialog requiring explicit confirmation
3. No links in production navigation

### Technologies Used
- React 19
- TypeScript
- Tailwind CSS (utility classes)
- In-memory family service
- FamilyManager contract ABI reference
