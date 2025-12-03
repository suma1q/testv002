# **🚀 Quick Start Guide - Billing System Integration**

## **Step 1: Database Migration (REQUIRED)**

```bash
# Navigate to project directory
cd "c:\Users\Sampath\Desktop\new cloads app\invoice-saas"

# Run Prisma migration
npx prisma migrate dev --name add_unified_billing

# This will:
# ✅ Create Document table
# ✅ Create Billing table
# ✅ Create Payment table
# ✅ Create PosOrder table
# ✅ Create PosOrderItem table
# ✅ Create TaxLedger table
# ✅ Update User table with new relations
```

---

## **Step 2: Test the Billing API**

### **Create a Test Document (Invoice)**
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invoice",
    "documentNumber": "INV-0001",
    "fromName": "My Company",
    "fromEmail": "company@example.com",
    "toName": "Client Name",
    "toEmail": "client@example.com",
    "documentDate": "2025-01-15",
    "dueDate": "2025-02-15",
    "items": [
      {
        "description": "Web Development",
        "quantity": 1,
        "rate": 1000,
        "amount": 1000
      }
    ],
    "subtotal": 1000,
    "tax": 100,
    "discount": 0,
    "total": 1100
  }'
```

**Expected Response:**
```json
{
  "document": {
    "id": "doc-123",
    "documentType": "invoice",
    "documentNumber": "INV-0001",
    "status": "draft"
  }
}
```

### **Get Billing Stats**
```bash
curl http://localhost:3000/api/billing/stats
```

**Expected Response:**
```json
{
  "stats": {
    "income": 0,
    "expenses": 0,
    "refunds": 0,
    "outstanding": 1100,
    "netProfit": 0
  },
  "recentBillings": [
    {
      "id": "billing-123",
      "type": "income",
      "billingStatus": "unpaid",
      "total": 1100
    }
  ]
}
```

### **Record a Payment**
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "billingId": "billing-123",
    "amount": 1100,
    "method": "stripe",
    "reference": "txn_123456"
  }'
```

**Expected Response:**
```json
{
  "payment": {
    "id": "payment-123",
    "amount": 1100,
    "method": "stripe",
    "status": "completed"
  }
}
```

---

## **Step 3: Integrate Components into Dashboard**

### **Add Billing Dashboard Link to Sidebar**

In `src/app/dashboard/layout.tsx`, update navigation:

```tsx
<Link 
  href="/dashboard/billing" 
  className="text-[#464646] hover:text-[#fcc425] transition"
>
  💰 Billing Dashboard
</Link>
```

### **Use DocumentViewer in Document Detail Page**

Create `src/app/dashboard/documents/[id]/page.tsx`:

```tsx
'use client';

import DocumentViewer from '@/components/Documents/DocumentViewer';
import { useParams } from 'next/navigation';

export default function DocumentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Document Details</h1>
      <DocumentViewer documentId={id} />
    </div>
  );
}
```

### **Add POS Page**

Create `src/app/dashboard/pos/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import POSOrderBuilder from '@/components/POS/POSOrderBuilder';
import POSCheckoutPanel from '@/components/POS/POSCheckoutPanel';

export default function POSPage() {
  const [checkout, setCheckout] = useState(false);
  const [order, setOrder] = useState(null);

  const categories = ['Food', 'Drinks', 'Packages', 'Services'];
  const items = [
    // Mock POS items - replace with DB fetch
    {
      id: '1',
      itemName: 'Burger',
      category: 'Food',
      unitPrice: 10,
      tax: 1,
    },
    {
      id: '2',
      itemName: 'Coffee',
      category: 'Drinks',
      unitPrice: 5,
      tax: 0.5,
    },
  ];

  if (checkout && order) {
    return (
      <POSCheckoutPanel
        orderTotal={order.total}
        orderItems={order.items}
        tableNumber={order.tableNumber}
        customerName={order.customerName}
        onPaymentComplete={() => {
          alert('Order completed!');
          setCheckout(false);
          setOrder(null);
        }}
        onCancel={() => {
          setCheckout(false);
          setOrder(null);
        }}
      />
    );
  }

  return (
    <POSOrderBuilder
      categories={categories}
      items={items}
      onCheckout={(order) => {
        setOrder(order);
        setCheckout(true);
      }}
    />
  );
}
```

---

## **Step 4: Update Package.json (if needed)**

All dependencies are already in `package.json`:
- `@react-pdf/renderer` - PDF generation
- `lucide-react` - Icons
- `zod` - Validation
- etc.

No new packages needed! ✅

---

## **Step 5: Test Free Plan Limit**

### **Test Case: Create 6 documents on free plan**

```bash
# Create document 1-5 (should succeed)
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/documents \
    -H "Content-Type: application/json" \
    -d "{\"documentType\":\"invoice\",\"documentNumber\":\"INV-000$i\",...}"
done

# Attempt document 6 (should fail with 403)
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d "{...}"

# Expected: 403 error with message:
# "You've reached the free plan limit (5 documents). Upgrade to create more."
```

---

## **Step 6: View Billing Dashboard**

Navigate to: `http://localhost:3000/dashboard/billing`

You should see:
- 📊 KPI cards (Income, Expenses, Refunds, Outstanding)
- 📈 Net Profit card
- 📋 Recent Billings table
- 🎯 Quick Action buttons

---

## **Step 7: Print Receipt**

In any document with a paid invoice:

```tsx
import ReceiptPrintView from '@/components/Billing/ReceiptPrintView';

<ReceiptPrintView
  receipt={receipt}
  payment={payment}
  format="a4"  // or "thermal" for thermal printers
/>
```

Click "Print Receipt" or "Save as PDF"

---

## **Common Issues & Solutions**

### **Issue: Prisma migration fails**
```bash
# Solution: Reset database
npx prisma migrate reset --force
# OR
npx prisma db push --force-reset
```

### **Issue: 401 Unauthorized on API calls**
**Cause:** Not authenticated with NextAuth

**Solution:** 
- Login first via `/login`
- Ensure session cookie is valid
- Check `.env` for `NEXTAUTH_SECRET`

### **Issue: Document not created**
**Cause:** Could be plan limit or validation error

**Solution:**
```bash
# Check error response for details
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d "{...}" | jq .
```

### **Issue: BillingPanel not showing**
**Cause:** Document might not have billing entry

**Solution:**
- Ensure document type is 'invoice', 'purchaseOrder', or 'creditNote'
- Check database: `SELECT * FROM Billing WHERE documentId = '...'`

---

## **Feature Checklist**

- [ ] Database migrated successfully
- [ ] Can create invoices via `/api/documents`
- [ ] Billings auto-created for invoices
- [ ] Can record payments via `/api/payments`
- [ ] Billing status updates on payment
- [ ] Billing dashboard shows correct metrics
- [ ] Free plan enforces 5 document limit
- [ ] Can create POS orders
- [ ] POS checkout creates receipt + billing
- [ ] Receipt prints in A4 format
- [ ] Receipt prints in thermal format
- [ ] DocumentViewer shows billing panel
- [ ] PaymentModal records payments
- [ ] User data isolation working

---

## **Next: Advanced Features**

### **Stripe Integration**
Create `/api/payments/stripe/webhook` to handle:
- Payment intent creation
- Charge confirmation
- Auto-update billing status

### **Email Notifications**
Send via Resend when:
- Invoice created → send to client
- Payment received → send confirmation
- Receipt generated → send receipt

### **Tax Reporting**
Generate tax reports from `TaxLedger`:
- GST/VAT calculation
- Export for government filing

### **Multi-Currency**
For Pro plan users:
- Currency selection on document creation
- Exchange rate tracking
- Multi-currency reports

---

## **Documentation Links**

- 📖 **Full Guide:** `BILLING_SYSTEM_GUIDE.md`
- 📋 **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- 🎨 **UI/UX Wireframe:** `dashbordv1.md`

---

## **Support Commands**

```bash
# Check database
npx prisma studio

# View logs
npm run dev

# Run tests (when ready)
npm run test

# Format code
npm run lint
```

---

## **🎉 You're Ready!**

Run the app:
```bash
npm run dev
```

Visit: `http://localhost:3000/dashboard`

Enjoy your new billing system! 🚀
