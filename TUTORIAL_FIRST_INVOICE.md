# 🎯 Step-by-Step Tutorial: Create Your First Invoice

## ✅ Complete Walkthrough (10 minutes)

---

## STEP 1: Start Your Application

```bash
npm run dev
```

**Wait for:**
```
ready - started server on 0.0.0.0:3000
```

---

## STEP 2: Open Browser

Go to:
```
http://localhost:3000/dashboard/billing
```

You should see:
- **Billing Dashboard** title
- 4 KPI cards (all showing $0)
- "Recent Billings" table (empty)
- 3 buttons at bottom

---

## STEP 3: Click "Create Invoice" Button

You'll see a form with fields:

```
From Name: ________________________
To Name: ________________________
Document Type: invoice (dropdown)
Amount: ________________________
Tax: ________________________
Items: [Add Item button]
```

---

## STEP 4: Fill in the Form

### Example Data:
```
From Name: My Awesome Company
To Name: John Smith
Document Type: invoice
Amount: 1000
Tax: 100
Items: 
  - Description: Website Development
    Quantity: 1
    Rate: 1000
```

---

## STEP 5: Submit the Form

Click the **"Create Invoice"** button

**What happens:**
- ✅ Invoice created
- ✅ Billing entry created automatically
- ✅ You get redirected back to dashboard
- ✅ Invoice appears in "Recent Billings" table

---

## STEP 6: Check Dashboard

Look at the dashboard now:

**BEFORE:** All cards showed $0
```
Total Income: $0
Total Expenses: $0
Refunds: $0
Outstanding: $0
Net Profit: $0
```

**AFTER:** Outstanding increased
```
Total Income: $0          ← Still $0 (not paid yet)
Total Expenses: $0
Refunds: $0
Outstanding: $1,100 ✅    ← This increased!
Net Profit: -$1,100       ← Shows negative (owed money)
```

---

## STEP 7: See the Invoice in the Table

Look at "Recent Billings" table:

```
┌────────────┬────────┬──────────┬──────────┬────────────┐
│ Document # │ Type   │ Amount   │ Status   │ Date       │
├────────────┼────────┼──────────┼──────────┼────────────┤
│ INV-001    │ income │ $1,100   │ unpaid   │ Nov 26,... │
└────────────┴────────┴──────────┴──────────┴────────────┘
```

**Status is "unpaid"** because no payment recorded yet

---

## STEP 8: Record a Payment

### Option A: From Table
Click on the invoice row → Opens invoice detail → Click "Record Payment"

### Option B: Direct Button
If visible, click "Record Payment" button on the invoice

---

## STEP 9: Fill Payment Form

A modal appears:

```
Amount: 550
Payment Method: [Dropdown - select "bank"]
Reference: TXN-123456
[Submit Button]
```

---

## STEP 10: Submit Payment

Click **"Submit"** or **"Record Payment"**

**What happens:**
- ✅ Payment recorded
- ✅ Status changes to "partial" (because $550 paid of $1,100)
- ✅ Dashboard updates

---

## STEP 11: Check Dashboard Again

Notice changes:

```
BEFORE Payment:
Outstanding: $1,100

AFTER $550 Payment:
Outstanding: $550          ✅ Decreased!
Income: $0                 ← Still $0 (not fully paid)
```

**In Recent Billings table:**
- Status changed from "unpaid" → **"partial"**
- Amount still shows $1,100 (total invoice)

---

## STEP 12: Record Final Payment

Record another payment for remaining $550:

```
Amount: 550
Payment Method: cash
Reference: (leave empty)
[Submit]
```

---

## STEP 13: See Full Payment Result

Dashboard updates:

```
BEFORE Final Payment:
Outstanding: $550
Income: $0

AFTER Final Payment:
Outstanding: $0            ✅ Zero!
Income: $1,100            ✅ Now shows!
Net Profit: $1,100        ✅ Positive!
```

**In Recent Billings table:**
- Status changed to **"paid"** ✅

---

## 🎉 SUCCESS!

You've completed:
1. ✅ Created an invoice
2. ✅ Recorded partial payment
3. ✅ Recorded final payment
4. ✅ Watched dashboard update
5. ✅ Tracked money flow

---

## 📊 Dashboard Summary

After all payments:

```
┌──────────────────────────────────────────┐
│        BILLING DASHBOARD                 │
├──────────────────────────────────────────┤
│ Total Income:        $1,100    ✅        │
│ Total Expenses:      $0                  │
│ Refunds Issued:      $0                  │
│ Outstanding:         $0                  │
├──────────────────────────────────────────┤
│ Net Profit:          $1,100              │
└──────────────────────────────────────────┘

Recent Billings:
┌────────────┬────────┬──────────┬─────────┐
│ INV-001    │ income │ $1,100   │ PAID ✅ │
└────────────┴────────┴──────────┴─────────┘
```

---

## 🔄 What Happened Behind the Scenes

When you created the invoice:
```
1. Document created (INV-001)
2. Billing entry created automatically
3. Status set to "unpaid"
4. Outstanding amount set to $1,100
```

When you recorded first payment:
```
1. Payment record created ($550)
2. Billing status changed to "partial"
3. Outstanding decreased to $550
4. Income still $0 (not fully paid)
```

When you recorded second payment:
```
1. Payment record created ($550)
2. Billing status changed to "paid"
3. Outstanding decreased to $0
4. Income increased to $1,100 ✅
5. Net profit calculated
```

---

## 🎓 Practice Exercises

### Exercise 1: Create an Expense
1. Go to dashboard
2. Click "Record Expense" 
3. Create a Purchase Order (like invoice, but type=purchaseOrder)
4. Record payment
5. Check that "Total Expenses" increases

### Exercise 2: Create a Quote (No Billing)
1. Click "Create Invoice"
2. Change type to "quotation"
3. Submit
4. Notice: Outstanding doesn't increase (quotes don't create billing)
5. No money owed

### Exercise 3: Test Partial Payments
1. Create invoice for $1,000
2. Record payment $300
3. Check status = "partial"
4. Record payment $200
5. Check status still = "partial"
6. Record payment $500
7. Check status = "paid"

---

## 💡 Key Points to Remember

**Money Only Counts When PAID:**
- Creating invoice = Outstanding increases
- Recording payment = Outstanding decreases & Income increases
- Income only shows for PAID invoices

**Dashboard is Automatic:**
- You don't manually update anything
- All changes automatic when you record payment
- Always accurate

**Payment Methods Don't Matter:**
- Cash, bank, stripe, cheque, other
- All treated the same for accounting
- Just for record-keeping

**Status Shows Payment Progress:**
- Unpaid = $0 paid
- Partial = Some paid, some owed
- Paid = 100% paid

---

## 🆘 If Something's Wrong

**Nothing shows on dashboard?**
- Make sure you're logged in
- Check browser console (F12) for errors
- Try refreshing (F5)

**Invoice not appearing?**
- Check if you hit plan limit (5 for free plan)
- Try creating again
- Check Recent Billings table

**Payment not recorded?**
- Check amount is less than outstanding
- Make sure you clicked Submit
- Try refreshing page

---

## ✅ Congratulations!

You now know:
- ✅ How to create invoices
- ✅ How to record payments
- ✅ How the dashboard updates
- ✅ How money tracking works
- ✅ What each metric means

**Next:** Check out `HOW_TO_USE_BILLING.md` for more features!

---

**Ready to use the billing system? Start today! 🚀**
