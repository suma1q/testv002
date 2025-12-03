# **Unified Documents + Billing + POS System - Implementation Guide**

## **📋 Overview**

This is a comprehensive invoice-saas enhancement that implements:

1. **Unified Document System** - Single model for invoices, quotations, estimates, POs, delivery notes, credit notes, receipts
2. **Integrated Billing Engine** - Automatic billing entry creation with classification (income/expense/refund)
3. **Payment Tracking** - Record payments, track payment history, update billing status
4. **POS System** - Quick order creation for restaurants/hotels with integrated checkout and receipt generation
5. **Tax Ledger** - Track GST/VAT for compliance

---

## **🗄️ Database Schema**

### **Core Models**

#### **Document**
Universal document model replacing separate Invoice/Quotation/etc. models.

```prisma
model Document {
  id              String
  documentType    String  // invoice, quotation, estimate, purchaseOrder, deliveryNote, creditNote, receipt
  documentNumber  String  @unique
  userId          String
  fromName        String
  toName          String
  items           Json
  subtotal        Float
  tax             Float
  discount        Float
  total           Float
  status          String  // draft, sent, accepted, rejected, converted, paid
  billings        Billing[]
}
```

#### **Billing**
Tracks income/expense/refund entries.

```prisma
model Billing {
  id              String
  documentId      String  @unique
  userId          String
  type            String  // income, expense, refund, none
  billingStatus   String  // unpaid, partial, paid, refunded
  amount          Float
  tax             Float
  total           Float
  paidAmount      Float
  remainingAmount Float
  payments        Payment[]
}
```

#### **Payment**
Payment records for each billing.

```prisma
model Payment {
  id              String
  billingId       String
  userId          String
  amount          Float
  method          String  // cash, bank, stripe, cheque, other
  status          String  // completed, failed, refunded
  paidAt          DateTime
  stripePaymentIntentId String?
  gatewayMeta     Json?
}
```

#### **PosOrder**
POS order with items and payment tracking.

```prisma
model PosOrder {
  id              String
  userId          String
  documentId      String?  // Linked receipt after checkout
  tableNumber     String?
  customerName    String?
  orderType       String   // dine-in, takeaway, room-service
  items           PosOrderItem[]
  subtotal        Float
  tax             Float
  total           Float
  status          String   // open, held, checkout, closed
  paymentStatus   String   // unpaid, paid, partial
}
```

#### **PosOrderItem**
Individual items in POS order.

```prisma
model PosOrderItem {
  id              String
  posOrderId      String
  itemName        String
  category        String
  quantity        Int
  unitPrice       Float
  tax             Float
  amount          Float
  notes           String?
}
```

#### **TaxLedger**
Tax compliance tracking.

```prisma
model TaxLedger {
  id              String
  userId          String
  billingId       String?
  taxType         String  // GST, VAT, Sales Tax
  rate            Float
  taxableAmount   Float
  taxAmount       Float
  taxPeriod       String  // YYYY-MM
}
```

---

## **🔧 Billing Rules**

### **Document → Billing Mapping**

| Document Type | Billing Type | Auto-Create? | Status Tracking |
|--------------|-------------|-------------|-----------------|
| Invoice | income | ✅ Yes | unpaid → paid |
| Purchase Order | expense | ✅ Yes | unpaid → paid |
| Credit Note | refund | ✅ Yes | unpaid → refunded |
| Quotation | none | ❌ No | - |
| Estimate | none | ❌ No | - |
| Delivery Note | none | ❌ No | - |
| Receipt | none | ❌ No (linked to payment) | - |

### **Plan Limits**

```javascript
Free Plan:
- Max 5 documents
- Manual payment only (no Stripe)
- No premium templates
- Single currency (USD)
- No auto-receipts

Pro Plan:
- Max 50 documents
- Stripe integration
- Premium templates
- Multi-currency
- Auto-receipts on payment

Professional:
- Max 500 documents
- All features
- Advanced reporting

Enterprise:
- Unlimited documents
- Custom integrations
```

---

## **📁 File Structure**

```
src/
├── lib/billing/
│   ├── rules.ts           # Billing rules, document types, plan limits
│   └── service.ts         # Database operations for billing
│
├── app/api/
│   ├── documents/
│   │   ├── route.ts       # GET/POST documents
│   │   └── [id]/route.ts  # GET/PUT/DELETE document
│   │
│   ├── billing/
│   │   ├── route.ts       # GET/POST billings
│   │   └── stats/route.ts # GET billing dashboard stats
│   │
│   ├── payments/
│   │   └── route.ts       # POST payment, GET history
│   │
│   └── pos/
│       ├── route.ts       # POST/GET POS orders
│       └── [id]/route.ts  # PUT order, POST checkout
│
├── components/
│   ├── Billing/
│   │   ├── BillingPanel.tsx        # Shows billing status, payment history
│   │   ├── PaymentModal.tsx        # Record payment modal
│   │   └── ReceiptPrintView.tsx    # A4 + thermal receipt printing
│   │
│   ├── POS/
│   │   ├── POSOrderBuilder.tsx     # Order creation interface
│   │   └── POSCheckoutPanel.tsx    # Checkout + payment
│   │
│   └── Documents/
│       └── DocumentViewer.tsx      # Document preview + billing
│
├── app/dashboard/
│   ├── billing/
│   │   └── page.tsx               # Billing dashboard
│   └── pos/
│       └── page.tsx               # POS interface
│
└── __tests__/
    └── billing.test.ts            # Unit test stubs
```

---

## **🔌 API Routes**

### **Documents**

```
POST /api/documents
- Create document
- Auto-creates billing if applicable
- Checks plan limits

GET /api/documents?type=invoice&status=draft
- List documents with filters
- Includes billing info

GET /api/documents/[id]
- Get document with billing and payments

PUT /api/documents/[id]
- Update document

DELETE /api/documents/[id]
- Delete document and associated billings
```

### **Billing**

```
GET /api/billing?type=income&status=paid
- List billings with filters

POST /api/billing
- Create billing manually (usually auto-created)

GET /api/billing/stats
- Dashboard stats (income, expenses, refunds, outstanding, net profit)
```

### **Payments**

```
POST /api/payments
- Record payment
- Updates billing status
- Creates payment record

GET /api/payments?billingId=123
- Get payment history for billing
```

### **POS**

```
POST /api/pos
- Create POS order

GET /api/pos?status=open
- List POS orders

PUT /api/pos/[id]
- Update POS order items/status

POST /api/pos/[id]/checkout
- Process checkout, create receipt + billing + payment
```

---

## **⚙️ Implementation Workflow**

### **1. Create Invoice → Auto Billing**

```typescript
// 1. User creates invoice
POST /api/documents
{
  documentType: 'invoice',
  documentNumber: 'INV-0001',
  items: [...],
  total: 1000
}

// 2. API automatically:
// - Creates Document
// - Creates Billing (type: 'income', status: 'unpaid', total: 1000)
// - Returns { document, billing }
```

### **2. Record Payment → Update Status**

```typescript
// 1. User records payment
POST /api/payments
{
  billingId: 'billing-123',
  amount: 1000,
  method: 'stripe'
}

// 2. API:
// - Creates Payment record
// - Updates Billing: paidAmount = 1000, status = 'paid'
// - Returns { payment, updatedBilling }
```

### **3. POS Checkout → Receipt + Billing**

```typescript
// 1. POS order created, user clicks Checkout
POST /api/pos/order-123/checkout
{
  paymentMethod: 'cash',
  paymentAmount: 150
}

// 2. API:
// - Creates Receipt document
// - Creates Billing (type: 'income', total: 150)
// - Creates Payment
// - Updates PosOrder: status = 'closed', documentId = receipt.id
// - Returns { receipt, billing, payment }
```

---

## **💻 Component Usage**

### **BillingPanel**

```tsx
import BillingPanel from '@/components/Billing/BillingPanel';

<BillingPanel
  billing={billing}
  documentType="invoice"
  onPaymentRecorded={() => refetch()}
/>
```

### **DocumentViewer**

```tsx
import DocumentViewer from '@/components/Documents/DocumentViewer';

<DocumentViewer
  documentId="doc-123"
  onRefresh={() => refetch()}
/>
```

### **POSOrderBuilder**

```tsx
import POSOrderBuilder from '@/components/POS/POSOrderBuilder';

<POSOrderBuilder
  categories={['Food', 'Drinks', 'Packages']}
  items={items}
  onCheckout={(order) => processCheckout(order)}
/>
```

### **ReceiptPrintView**

```tsx
import ReceiptPrintView from '@/components/Billing/ReceiptPrintView';

<ReceiptPrintView
  receipt={receipt}
  payment={payment}
  format="thermal"  // or 'a4'
/>
```

---

## **📊 Billing Dashboard**

Dashboard shows:

- **Income**: Sum of all paid invoices
- **Expenses**: Sum of all paid purchase orders
- **Refunds**: Sum of all refunded credit notes
- **Outstanding**: Sum of unpaid/partial invoice amounts
- **Net Profit**: Income - Expenses - Refunds
- **Recent Billings**: Table of recent transactions

---

## **🛡️ Security & Validation**

- ✅ All endpoints require NextAuth session
- ✅ User ownership verification on every access
- ✅ Plan limits enforced before document creation
- ✅ Payment amount validation
- ✅ Billing status transitions validated
- ✅ Tax calculations audited

---

## **📝 Usage Restrictions by Plan**

### **Free Plan**
- ❌ Cannot create more than 5 documents
- ❌ No Stripe/online payment (cash/bank only)
- ❌ No premium templates
- ❌ Single currency
- ✅ Can print documents
- ✅ Can email documents
- ✅ Can manually record payments

### **Pro+ Plans**
- ✅ Stripe integration
- ✅ Premium templates
- ✅ Multi-currency
- ✅ Auto-receipt generation
- ✅ Advanced tax reporting
- ✅ Unlimited documents (Pro+)

---

## **🧪 Testing**

Unit test stubs in `src/__tests__/billing.test.ts`:

- Billing rules validation
- Plan limits enforcement
- Payment status updates
- POS checkout flow
- Tax calculations

---

## **🚀 Next Steps**

1. **Run Prisma Migration**
   ```bash
   npx prisma migrate dev --name add_unified_billing
   ```

2. **Seed Test Data** (optional)
   ```bash
   npx prisma db seed
   ```

3. **Update Navigation**
   - Add "Billing" link to sidebar
   - Add "POS" link to sidebar
   - Add "Documents" link to sidebar

4. **Connect to Stripe** (for Pro plan)
   - Add Stripe webhook handlers
   - Implement `/api/payments/webhook`

5. **Implement Email Sending**
   - Invoice email templates
   - Receipt email templates
   - Payment confirmation emails

---

## **📞 Support**

For questions or issues, refer to:
- `dashbordv1.md` - UI/UX wireframe
- `PRISMA.md` - Database schema details
- Individual component files - Implementation comments
