/**
 * Billing Rules Engine
 * Determines how documents map to billing entries
 */

export type DocumentType = 'invoice' | 'quotation' | 'estimate' | 'purchaseOrder' | 'deliveryNote' | 'creditNote' | 'receipt';
export type BillingType = 'income' | 'expense' | 'refund' | 'none';

/**
 * Get billing type for document
 * - Invoice → income
 * - PurchaseOrder → expense
 * - CreditNote → refund
 * - Quotation/Estimate/DeliveryNote → none (no billing)
 * - Receipt → linked to original invoice/billing
 */
export function getBillingTypeForDocument(documentType: DocumentType): BillingType {
  const billingRules: Record<DocumentType, BillingType> = {
    invoice: 'income',
    quotation: 'none',
    estimate: 'none',
    purchaseOrder: 'expense',
    deliveryNote: 'none',
    creditNote: 'refund',
    receipt: 'none', // receipts don't have their own billing, they reference payments
  };
  
  return billingRules[documentType];
}

/**
 * Check if document should auto-create billing entry
 */
export function shouldCreateBilling(documentType: DocumentType): boolean {
  const billingType = getBillingTypeForDocument(documentType);
  return billingType !== 'none';
}

/**
 * Generate document number with prefix
 */
export function generateDocumentNumber(documentType: DocumentType, sequence: number): string {
  const prefixes: Record<DocumentType, string> = {
    invoice: 'INV',
    quotation: 'QT',
    estimate: 'EST',
    purchaseOrder: 'PO',
    deliveryNote: 'DN',
    creditNote: 'CN',
    receipt: 'RC',
  };
  
  const prefix = prefixes[documentType];
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Plan limits for document creation
 */
export interface PlanLimits {
  maxDocuments: number;
  premiumTemplates: boolean;
  multiCurrency: boolean;
  stripePay: boolean;
  autoReceipts: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxDocuments: 5,
    premiumTemplates: false,
    multiCurrency: false,
    stripePay: false,
    autoReceipts: false,
  },
  starter: {
    maxDocuments: 50,
    premiumTemplates: true,
    multiCurrency: false,
    stripePay: true,
    autoReceipts: true,
  },
  professional: {
    maxDocuments: 500,
    premiumTemplates: true,
    multiCurrency: true,
    stripePay: true,
    autoReceipts: true,
  },
  enterprise: {
    maxDocuments: -1, // unlimited
    premiumTemplates: true,
    multiCurrency: true,
    stripePay: true,
    autoReceipts: true,
  },
};

/**
 * Check if user can create document based on plan
 */
export function canCreateDocument(userPlan: string, currentDocumentCount: number): { allowed: boolean; message: string } {
  const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
  
  if (limits.maxDocuments === -1) {
    return { allowed: true, message: 'Unlimited documents' };
  }
  
  if (currentDocumentCount >= limits.maxDocuments) {
    return {
      allowed: false,
      message: `You've reached the ${userPlan} plan limit (${limits.maxDocuments} documents). Upgrade to create more.`,
    };
  }
  
  return { allowed: true, message: 'OK' };
}

/**
 * Calculate billing amounts after tax/discount
 */
export function calculateBillingAmounts(subtotal: number, tax: number, discount: number) {
  const discountedSubtotal = subtotal - discount;
  const taxAmount = (discountedSubtotal * tax) / 100;
  const total = discountedSubtotal + taxAmount;
  
  return {
    subtotal: discountedSubtotal,
    tax: taxAmount,
    total,
    paidAmount: 0,
    remainingAmount: total,
  };
}
