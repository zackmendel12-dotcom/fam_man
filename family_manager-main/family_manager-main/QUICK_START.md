# Quick Start - Dev Test Harness

## 🚀 Access in 3 Steps

### 1. Start Dev Server
```bash
cd app_design_ui
npm run dev
```

### 2. Open Browser
Navigate to one of:
- `http://localhost:5173/#dev`
- `http://localhost:5173/?dev=true`

### 3. Dismiss Warning
Click **"I Understand, Continue"** button

---

## ⚡ Quick Actions

### Test Family Service
```
1. Click "Load Family Data" → See current state
2. Add member → Enter name, role, limits → Click "Add Member"
3. View result in right panel with JSON data
```

### Test Units Helpers
```
1. Enter "1.5" in Amount field
2. Click "Test parseUnits/formatUnits"
3. See Wei conversion: "1500000000000000000"
```

### Simulate Transaction
```
1. Enter address: "0x1234567890abcdef..."
2. Enter amount: "2.0"
3. Click "Simulate Fund Child"
4. Get mock transaction hash
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **DEV_TEST_HARNESS.md** | Complete user guide |
| **FEATURE_SUMMARY.md** | Implementation overview |
| **pages/dev/README.md** | Technical details |
| **pages/dev/INTEGRATION_EXAMPLE.md** | Real contract integration |
| **pages/dev/VISUAL_GUIDE.md** | UI mockups |

---

## 🎯 Common Use Cases

### Test Adding a Kid
```
Add Member Form:
├─ Name: "Emma"
├─ Role: Kid
├─ Spending Limit: 50
└─ Daily Allowance: 10

Result: ✓ New member with ID "kid-{timestamp}"
```

### Test Processing Allowances
```
Click: "Process Allowances"
Result: All kids receive daily allowance
        Main wallet balance decreases
```

### Test Member Update
```
Update Form:
├─ Member ID: "kid-01"
├─ New Limit: 75
└─ New Allowance: 15

Result: ✓ Settings updated for kid-01
```

---

## 🔧 Utilities Available

```typescript
// Import from utils
import { parseEther, formatEther, parseUnits, formatUnits } from './utils';

// ETH conversions (18 decimals)
parseEther("1.5")          // → 1500000000000000000n
formatEther(1500...000n)   // → "1.5"

// Generic conversions
parseUnits("1.5", 6)       // → 1500000n (USDC)
formatUnits(1500000n, 6)   // → "1.5"
```

---

## ✅ Validation

All checks pass:
```bash
npm run typecheck  # ✓ TypeScript OK
npm run build      # ✓ Build succeeds
npm run lint       # ✓ No errors
```

---

## 🔒 Security

✅ Hidden from production nav  
✅ URL-based access only  
✅ Warning dialog guards access  
✅ In-memory only (no blockchain writes)  
✅ Simulated transaction hashes  

---

## 🐛 Troubleshooting

**No results showing?**
- Check browser console for errors
- Verify service is imported correctly

**TypeScript errors?**
- Run `npm run typecheck`
- Check all types imported from `types.ts`

**Build fails?**
- Run `npm run build` for details
- Check for any console.logs

**Can't access test harness?**
- Verify URL has `#dev` or `?dev=true`
- Check browser console for routing errors

---

## 📞 Need Help?

1. Read **DEV_TEST_HARNESS.md** for detailed guide
2. Check **FEATURE_SUMMARY.md** for overview
3. See **pages/dev/INTEGRATION_EXAMPLE.md** for contract integration

---

## 🎨 Result Colors

| Color | Meaning |
|-------|---------|
| 🟢 Green | Success |
| 🔴 Red | Error |
| 🔵 Blue | Get/Read operations |
| 🟢 Green | Add/Create operations |
| 🟡 Yellow | Update operations |
| 🔴 Red | Delete/Revoke operations |
| 🟣 Purple | Process operations |

---

**Ready to test? Navigate to http://localhost:5173/#dev** 🚀
