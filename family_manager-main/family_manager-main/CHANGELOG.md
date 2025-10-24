# Changelog

## [Unreleased] - Dev Test Harness

### Added

#### Dev Test Harness Page
- Created comprehensive test harness at `app_design_ui/pages/dev/TestActions.tsx`
- Added URL-based access via `#dev` hash or `?dev=true` query parameter
- Integrated into main App with view switching logic
- Displays warning dialog on first access to prevent production usage

#### Features
1. **Family Service Actions**
   - Get Family Data
   - Add Family Member (with role, limits, allowance)
   - Update Member Settings
   - Revoke Access
   - Process Daily Allowances

2. **Units Helpers Utilities**
   - `parseUnits()` - Convert to smallest units (wei)
   - `formatUnits()` - Convert from smallest units
   - `parseEther()` / `formatEther()` - ETH conversions
   - `parseUsdc()` / `formatUsdc()` - USDC conversions (6 decimals)

3. **Contract Simulation**
   - Fund Child simulation with transaction hash generation
   - Amount conversion demonstration (ETH ↔ Wei)

4. **Live Results Panel**
   - Real-time action feedback
   - Success/error color coding
   - JSON formatted response data
   - Transaction hash display
   - Timestamp tracking
   - Clear results functionality

#### Files Added
```
app_design_ui/
├── pages/
│   └── dev/
│       ├── TestActions.tsx              # Main test harness component
│       ├── index.tsx                    # Module exports
│       ├── README.md                    # Feature documentation
│       └── INTEGRATION_EXAMPLE.md       # Contract integration guide
├── utils/
│   ├── units.ts                         # Currency conversion helpers
│   └── index.ts                         # Module exports
└── App.tsx                              # Modified with dev routing

DEV_TEST_HARNESS.md                      # User guide
CHANGELOG.md                             # This file
```

#### Documentation
- **DEV_TEST_HARNESS.md**: Complete user guide with access instructions, features overview, and use cases
- **pages/dev/README.md**: Technical documentation for the test harness implementation
- **pages/dev/INTEGRATION_EXAMPLE.md**: Step-by-step guide for integrating real smart contracts with Wagmi

### Changed

#### App.tsx
- Added `currentView` state to manage main/dev view switching
- Implemented hash and query parameter detection for dev mode
- Added TestActions import and conditional rendering
- Maintains backward compatibility with existing functionality

### Technical Details

#### Access Control
- No production navigation links (hidden by default)
- URL-based access: `#dev` or `?dev=true`
- Warning dialog requiring explicit confirmation
- Easy to disable in production builds

#### Units Conversion Implementation
- Pure TypeScript implementation (no external dependencies)
- Supports arbitrary decimal places
- BigInt-based for precision
- Handles edge cases (zero, very small/large numbers)

#### Architecture
- Component-based design
- Type-safe with TypeScript
- State management with React hooks
- Modular and extensible

### Security Considerations

⚠️ **Important Notes:**
- Test harness is for development only
- No authentication/authorization
- Currently uses in-memory service (not blockchain)
- Transaction hashes are simulated
- Remove or disable hash/query detection in production

### Future Enhancements

Potential additions:
- [ ] Wagmi integration for real contract interactions
- [ ] Wallet connection requirement
- [ ] Event listening and monitoring
- [ ] Transaction status polling
- [ ] Batch operations
- [ ] Export/import test scenarios
- [ ] Response comparison tools
- [ ] Network switching
- [ ] Gas estimation display
- [ ] Contract event logs

### Testing

All new code:
- ✅ TypeScript compilation passes
- ✅ Vite build succeeds
- ✅ No linting errors
- ✅ Maintains existing functionality
- ✅ Compatible with React 19

### How to Use

1. **Start dev server**: `npm run dev`
2. **Access test harness**: Navigate to `http://localhost:5173/#dev`
3. **Dismiss warning**: Click "I Understand, Continue"
4. **Test actions**: Use forms to trigger service methods
5. **View results**: Monitor live results panel on right side

### Dependencies

No new runtime dependencies added. Uses only:
- Existing React 19
- TypeScript
- Tailwind CSS utility classes (existing)

### Version Compatibility

- React: 19.2.0+
- TypeScript: 5.8.2+
- Vite: 6.2.0+
