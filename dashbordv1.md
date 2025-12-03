 **complete, end-to-end UI/UX wireframe** f

# **Unified Documents + Billing + POS — Full UI/UX Wireframe**

This is a full high-fidelity **text-based wireframe** that you can directly hand to **GitHub Copilot**, designers, and frontend developers to implement inside your SaaS dashboard.

The wireframe covers:

* **Dashboard**
* **Documents List**
* **Document Editor**
* **Document Viewer**
* **Billing Panel**
* **Payment Modal**
* **POS System (Restaurant/Hotel Style)**
* **POS Checkout**
* **Settings**
* **Billing Dashboard**
* **Receipts**
* **Plan Limits (Free/Pro)**

Everything is formatted cleanly so Copilot can auto-generate components, routes, and logic.

---

# 📌 **1. Main Layout (Global App Shell)**

```
┌─────────────────────────────────────────────┐
│ Sidebar (left)                              │
│---------------------------------------------│
│  • Dashboard                                │
│  • Documents                                │
│     - Invoices                              │
│     - Quotations                            │
│     - Estimates                             │
│     - Purchase Orders                       │
│     - Delivery Notes                        │
│     - Credit Notes                          │
│     - Receipts                              │
│  • POS                                      │
│  • Billing Dashboard                        │
│  • Templates                                │
│  • Settings                                 │
│  • Upgrade Plan (highlighted)               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Top Navbar                                   │
│  - Search bar                                │
│  - Notifications                             │
│  - User menu                                 │
└─────────────────────────────────────────────┘
```

---

# 📌 **2. Dashboard**

```
Dashboard
───────────────────────────────────────
| KPI Cards (grid)                    |
|-------------------------------------|
| • Total Income                      |
| • Total Expenses                    |
| • Refunds Issued                    |
| • Outstanding Payments              |
───────────────────────────────────────

Recent Documents (table)
───────────────────────────────────────
| Type | Customer | Amount | Status | View |
───────────────────────────────────────

Quick Actions
───────────────────────────────────────
| + Create Invoice                     |
| + Create Quotation                   |
| + Create Purchase Order              |
| + New POS Order                      |
| + Record Payment                     |
```

---

# 📌 **3. Documents List Page**

```
Documents
────────────────────────────────────────────────
Filters:
[ All Types ▼ ] [ Status ▼ ] [ Date ▼ ] [ Search ]

Table:
──────────────────────────────────────────────────────────────
| Type | Doc # | Customer | Total | Billing Status | Actions  |
|-------------------------------------------------------------|
| Invoice | INV-1001 | Adam | $240 | Unpaid | View Edit Delete |
| Quotation | QT-299 | Nexa Co | $0 | — | View Edit Delete   |
| Purchase Order | PO-11 | Supplier | $830 | Expense | View   |
| Receipt | RC-99 | Adam | $240 | Income | View              |
──────────────────────────────────────────────────────────────

Footer:
• Free plan: “3/5 documents used”
• Upgrade button
```

---

# 📌 **4. Document Editor (Create / Edit)**

```
Document Editor (Invoice / Quote / etc.)
────────────────────────────────────────────

Left Panel:
────────────────────────────────────────────
| • Customer                               |
| • Items                                   |
| • Notes                                   |
| • Terms                                   |
| • Tax Settings                            |
| • Template (Pro only)                     |
────────────────────────────────────────────

Main Form:
────────────────────────────────────────────
| Document Header                           |
|  - Document type (Invoice, Quote...)      |
|  - Document number                         |
|  - Date / Due date                         |

| Items Table                                |
|  [ Item name | Qty | Price | Tax | Total ] |

| Summary                                   |
|  Subtotal:                                |
|  Tax:                                      |
|  Total:                                    |

Actions:
• Save Draft
• Send Email (disabled for free? NO → allowed)
• Print
• (No Download button)
• Convert to Invoice (for quotes)
```

---

# 📌 **5. Document Viewer (After Creation)**

```
DocumentViewer Layout
───────────────────────────────────────────────
| Document Preview (A4) on left               |
| Billing Panel on right                      |
───────────────────────────────────────────────
```

---

# 📌 **6. Billing Panel (Right Side)**

```
Billing Panel
──────────────────────────────────────────
Amount Summary
------------------------------------------
Subtotal:          $100
Tax:               $10
Total:             $110

Billing Status:
[ Unpaid | Partial | Paid | Refunded ]

Buttons (based on rules):
• Record Payment
• View Payment History
• Generate Receipt (only when fully paid)

Auto Rules:
• Invoice → income
• PO → expense
• Credit Note → refund
• Quote/Estimate/Delivery → no billing
```

---

# 📌 **7. Payment Modal**

```
Record Payment
──────────────────────────────────────────
Payment Amount:   [ 110.00 ]
Method:           [ Cash | Bank | Stripe ]
Reference / Notes: [ Optional ]

Button:
[ Save Payment ]

After saving:
• Billing status updates
• Receipt auto-created (Document type: receipt)
```

---

# 📌 **8. POS System (Restaurant / Hotel Billing)**

## POS Order Builder Screen

```
POS (Restaurant Mode)
──────────────────────────────────────────

Top Bar:
• New Order
• Table Number (dropdown)
• Customer name (optional)
• Order type: [ Dine-In | Takeaway | Room ]

Left: Category List
───────────────────
• Food
• Drinks
• Packages
• Services
• Custom Item

Center: Items Grid (cards)
──────────────────────────
| Burger $10 | Fries $5 | Noodles $8 | Coffee $3 | ...

Right: Order Cart
──────────────────────────
| Order Summary:           |
|  - Items list w/ qty     |
|  - Tax                   |
|  - Total                 |
| Buttons:                 |
|   [ Hold Order ]         |
|   [ Clear ]              |
|   [ Checkout → ]         |
```

---

# 📌 **9. POS Checkout Panel**

```
Checkout
──────────────────────────────────────────
Order Total:     $42
Tax:             $4.20
Grand Total:     $46.20

Payment Method:
[ Cash | Card | Stripe | Room Charge ]

If Stripe:
• Show “Pay with Card” modal

Buttons:
• Record Payment
• Print Receipt (thermal)
• Close Order
```

Billing Rules:

* Creating POS order → no billing
* Checkout (payment confirm) → create Billing + Payment
* Receipt auto-generated as Document

---

# 📌 **10. Receipt Print View**

Two formats:

### **A) A4 Invoice/Receipt Layout**

```
──────────────────────────────────────────
Company Logo
Company Address
──────────────────────────────────────────
Receipt #RC-002
Invoice Reference: INV-1001
Customer: John Silva
Date: 2025-02-01
──────────────────────────────────────────
Itemized Table
──────────────────────────────────────────
Subtotal | Tax | Total
──────────────────────────────────────────
Paid via: Stripe (Card)
```

---

### **B) Thermal Receipt Layout (58mm / 80mm)**

```
******** RESTAURANT NAME ********
Receipt #: RC-002
Date: 2025-02-01

Burger ----- 10.00  
Fries  ------ 5.00  
Coffee -----  3.00
-------------------------
Subtotal:    18.00
Tax:          1.80
Total:       19.80

Payment: Cash
Thank you!
*******************************
```

---

# 📌 **11. Billing Dashboard**

```
Billing Dashboard
──────────────────────────────────────────
Filters:
[ Date Range ] [ Type ▼ ] [ Method ▼ ]

Top Metrics (cards)
• Income
• Expenses
• Refunds
• Net Profit

Charts:
• Income vs Expense (bar)
• Payment Methods (pie)

Tables:
Recent Payments
──────────────────────────────────────────
| Date | Amount | Method | Source | Status |
──────────────────────────────────────────
```

---

# 📌 **12. Plan Limits & Upgrade UX**

## Free Plan:

```
• Limit: 5 documents total
• Unlimited POS orders (but manual payment only)
• No premium templates
• Online payment (Stripe) disabled
• Multi-currency disabled
```

When the user clicks “Create Document” after limit:

```
You’ve reached the free plan limit (5 documents).
[ Upgrade to Pro ]
```

---

# 📌 **13. Settings Page**

```
Settings
──────────────────────────
Business Info
Logo Upload
Taxes
Payment Methods
Stripe Integration
Template Customization
Plan & Billing
──────────────────────────
```

---



