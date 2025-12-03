# 📖 How to Use the Billing System - Simple Guide

## 🎯 Overview

Your billing system has **3 main parts**:

1. **📄 Documents** - Create invoices, purchase orders, quotes, receipts
2. **💰 Billing** - Automatically track income/expenses/refunds
3. **💳 Payments** - Record payments and track payment history

---

## 🚀 Quick Start (5 minutes)

### Step 1: Start the Server
```bash
npm run dev
```

### Step 2: Go to Billing Dashboard
```
http://localhost:3000/dashboard/billing
```

You'll see:
- **Total Income** - Money from paid invoices
- **Total Expenses** - Money from paid purchase orders
- **Refunds Issued** - Money from credit notes
- **Outstanding** - Money still owed to you
- **Net Profit** - Income minus expenses and refunds

---

## 📋 Create an Invoice (Most Common)

### Method 1: Via Dashboard Button (Easiest)
1. Go to: `http://localhost:3000/dashboard/billing`
2. Click **"Create Invoice"** button
3. Fill in form:
   - From Name: Your company
   - To Name: Customer name
   - Items: What you're selling
   - Amount: Price per item
   - Tax: 10% (example)
4. Click **Submit**

✅ **Result:**
- Invoice created ✅
- Billing entry created automatically ✅
- Dashboard metrics update ✅
- Amount shows as "Outstanding" (not paid yet)

### Method 2: Via API (For Developers)
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invoice",
    "fromName": "Your Company",
    "toName": "Customer Name",
    "items": [{"description": "Service", "quantity": 1, "rate": 100}],
    "amount": 100,
    "tax": 10
  }'
```

---

## 💳 Record a Payment

### Step 1: View the Invoice
Click on the invoice from the recent billings table

### Step 2: Click "Record Payment"
A modal will appear

### Step 3: Enter Payment Details
- **Amount**: How much was paid
- **Method**: cash, bank, stripe, cheque, or other
- **Reference**: Transaction ID or cheque number (optional)

### Step 4: Click Submit
✅ **Result:**
- Payment recorded ✅
- Invoice status updates:
  - If fully paid → "Paid" ✅
  - If partially paid → "Partial" 🟡
  - If still owed → "Unpaid" ❌

---

## 📊 Understanding the Dashboard

### What Each Card Shows

| Card | Meaning | Example |
|------|---------|---------|
| **Total Income** | All paid invoices | $5,000 |
| **Total Expenses** | All paid purchase orders | $2,000 |
| **Refunds Issued** | All paid credit notes | $500 |
| **Outstanding** | Money still owed | $1,000 |
| **Net Profit** | Income - Expenses - Refunds | $2,500 |

### Recent Billings Table

Shows latest transactions:
- **Document #** - Invoice number
- **Type** - What kind (invoice, expense, etc)
- **Amount** - How much
- **Status** - Paid, Partial, or Unpaid
- **Date** - When created

---

## 🎯 Document Types Explained

### Income Documents (Money In)
- **Invoice** ← Most common, track what customer owes
- **Receipt** - Immediate payment record

### Expense Documents (Money Out)
- **Purchase Order** - Track what you owe suppliers

### Other Documents
- **Quotation** - Estimate (doesn't create billing)
- **Estimate** - Similar to quote (doesn't create billing)
- **Credit Note** - Refund to customer

---

## 📈 Real-World Example

### Scenario: You Service a Customer

```
Day 1: Create Invoice
├─ Amount: $1,000
├─ Tax: $100
└─ Total: $1,100
   → Dashboard shows:
   ✓ Outstanding: $1,100
   ✓ Income: $0 (not paid yet)

Day 5: Customer Pays $500
├─ Record Payment: $500
│  Method: Bank transfer
│  Reference: TXN123
└─ Status: Partial
   → Dashboard shows:
   ✓ Outstanding: $600
   ✓ Income: $0 (still not fully paid)

Day 10: Customer Pays Remaining $600
├─ Record Payment: $600
│  Method: Cash
└─ Status: Paid
   → Dashboard shows:
   ✓ Outstanding: $0
   ✓ Income: $1,100 ✅
   ✓ Net Profit: $1,100 (if no expenses)
```

---

## 💡 Common Tasks

### Task 1: See How Much Money You're Owed
1. Go to Dashboard
2. Look at **"Outstanding"** card
3. That's total unpaid invoices

### Task 2: See Today's Income
1. Go to Dashboard
2. Look at **"Total Income"** card
3. This is only from PAID invoices

### Task 3: Generate a Receipt for Printing
1. Create an invoice or receipt
2. Click the document
3. Click **"Print Receipt"** button
4. Choose format: A4 (full page) or Thermal (58mm)
5. Print or save as PDF

### Task 4: Track Expenses
1. Click **"Record Expense"** button
2. Create a Purchase Order
3. Record payment when paid
4. Dashboard **"Total Expenses"** updates

### Task 5: Issue a Refund
1. Create a Credit Note document
2. Record payment
3. Dashboard **"Refunds Issued"** updates

---

## 🔄 Workflow Summary

```
CREATE DOCUMENT
     ↓
AUTO-CREATE BILLING
     ↓
CUSTOMER RECEIVES
     ↓
CUSTOMER PAYS (Record Payment)
     ↓
STATUS UPDATES (Unpaid → Partial → Paid)
     ↓
DASHBOARD METRICS UPDATE
     ↓
PRINT RECEIPT (Optional)
     ↓
DONE!
```

---

## 📱 What Gets Tracked Automatically

When you create a document, these happen automatically:

✅ Invoice created
✅ Billing entry created
✅ Payment tracking started
✅ Document number assigned
✅ Tax calculated
✅ Totals computed
✅ Dates recorded
✅ User linked
✅ Plan limit checked

You don't need to do anything - it's all automatic!

---

## 🎓 Payment Status Meanings

### Unpaid ❌
- Invoice created
- No payment received yet
- Amount fully outstanding

### Partial 🟡
- Some payment received
- Some amount still owed
- Example: Paid $500 of $1,000

### Paid ✅
- Full payment received
- Balance is $0
- Amount added to Income

### Refunded 🔄
- Credit note issued
- Amount refunded to customer

---

## ⚙️ Settings

### Plan Limits
Your plan controls how many documents you can create:

| Plan | Documents Allowed |
|------|------------------|
| Free | 5 total |
| Starter | 50 total |
| Professional | 500 total |
| Enterprise | Unlimited |

If you hit the limit, you need to upgrade.

### Document Numbers
Auto-generated:
- Invoice: INV-001, INV-002, etc
- PO: PO-001, PO-002, etc
- Quote: QUOTE-001, etc
- Receipt: REC-001, etc

---

## 🆘 Troubleshooting

### Problem: Dashboard shows $0 for everything
**Answer:** You haven't created and paid any documents yet. Create one and record payment.

### Problem: Outstanding amount not showing
**Answer:** Outstanding only shows UNPAID invoices. If you record payment, it moves to Income.

### Problem: Can't create more invoices
**Answer:** You hit your plan limit. Upgrade your plan.

### Problem: Payment not recording
**Answer:** Make sure amount is valid and ≤ remaining balance.

---

## 📞 Common Questions

**Q: When does money show in "Total Income"?**
A: Only when invoice is fully paid and payment is recorded.

**Q: Can I edit an invoice after creating it?**
A: Yes, click the invoice and edit fields.

**Q: What if customer pays partially?**
A: Record that amount. Status becomes "Partial". Record additional payments as they come.

**Q: Can I delete a document?**
A: Yes, but it also deletes the billing entry. Use carefully.

**Q: How do I know profit?**
A: Look at **Net Profit** card = Income - Expenses - Refunds

**Q: Can I print a receipt?**
A: Yes, create a receipt and click Print. Choose A4 or thermal (58mm).

---

## ✨ Tips & Tricks

1. **Record Payment Immediately** - Don't wait, record when paid so dashboard is accurate

2. **Use Reference IDs** - Add transaction ID or cheque number for tracking

3. **Check Dashboard Daily** - See outstanding amounts at a glance

4. **Export Data** - Use Prisma Studio to export data
   ```bash
   npx prisma studio
   ```

5. **Bulk Operations** - Use API for creating multiple documents at once

---

## 🎯 Next Steps

**Beginner:**
1. Create an invoice
2. Record a payment
3. Check dashboard updates

**Intermediate:**
1. Create multiple documents (different types)
2. Record partial payments
3. View payment history

**Advanced:**
1. Use API for automation
2. Implement webhooks
3. Generate reports
4. Export data

---

## 📚 More Resources

- **Technical Guide:** See `BILLING_SYSTEM_GUIDE.md`
- **API Reference:** See `QUICK_START.md`
- **Complete Docs:** See `INDEX.md`

---

**That's it! You're ready to use the billing system! 🚀**

Start by creating your first invoice and recording a payment.
