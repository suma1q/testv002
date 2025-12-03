/**
 * Billing service for database operations
 */

import { prisma } from '@/lib/prisma';
import { shouldCreateBilling, getBillingTypeForDocument, calculateBillingAmounts } from './rules';
import type { DocumentType } from './rules';

/**
 * Create a billing entry when document is created
 */
export async function createBillingFromDocument(
  documentId: string,
  userId: string,
  documentType: DocumentType,
  amount: number,
  tax: number,
  discount: number,
  notes?: string
) {
  if (!shouldCreateBilling(documentType)) {
    return null;
  }

  const billingType = getBillingTypeForDocument(documentType);
  const amounts = calculateBillingAmounts(amount, tax, discount);

  const billing = await prisma.billing.create({
    data: {
      documentId,
      userId,
      type: billingType,
      billingStatus: 'unpaid',
      amount: amounts.subtotal,
      tax: amounts.tax,
      total: amounts.total,
      paidAmount: 0,
      remainingAmount: amounts.total,
      notes,
    },
  });

  return billing;
}

/**
 * Update billing status based on payment
 */
export async function updateBillingStatus(billingId: string, paidAmount: number) {
  const billing = await prisma.billing.findUnique({
    where: { id: billingId },
  });

  if (!billing) {
    throw new Error('Billing not found');
  }

  const newPaidAmount = billing.paidAmount + paidAmount;
  const newRemainingAmount = billing.total - newPaidAmount;
  
  let status: 'paid' | 'partial' | 'unpaid' | 'refunded' = 'unpaid';
  if (newPaidAmount >= billing.total) {
    status = 'paid';
  } else if (newPaidAmount > 0) {
    status = 'partial';
  }

  return await prisma.billing.update({
    where: { id: billingId },
    data: {
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, newRemainingAmount),
      billingStatus: status,
    },
  });
}

/**
 * Get billing dashboard stats
 */
export async function getBillingStats(userId: string, monthYear?: string) {
  // Default to current month if not specified
  const now = new Date();
  const month = monthYear || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Get income (invoices paid)
  const incomeData = await prisma.billing.aggregate({
    where: {
      userId,
      type: 'income',
      billingStatus: 'paid',
    },
    _sum: {
      total: true,
    },
  });

  // Get expenses (purchase orders)
  const expensesData = await prisma.billing.aggregate({
    where: {
      userId,
      type: 'expense',
      billingStatus: 'paid',
    },
    _sum: {
      total: true,
    },
  });

  // Get refunds (credit notes)
  const refundsData = await prisma.billing.aggregate({
    where: {
      userId,
      type: 'refund',
      billingStatus: 'paid',
    },
    _sum: {
      total: true,
    },
  });

  // Get outstanding (unpaid invoices)
  const outstandingData = await prisma.billing.aggregate({
    where: {
      userId,
      type: 'income',
      billingStatus: { in: ['unpaid', 'partial'] },
    },
    _sum: {
      remainingAmount: true,
    },
  });

  return {
    income: incomeData._sum.total || 0,
    expenses: expensesData._sum.total || 0,
    refunds: refundsData._sum.total || 0,
    outstanding: outstandingData._sum.remainingAmount || 0,
    netProfit: (incomeData._sum.total || 0) - (expensesData._sum.total || 0) - (refundsData._sum.total || 0),
  };
}

/**
 * Get recent billings for dashboard
 */
export async function getRecentBillings(userId: string, limit: number = 10) {
  return await prisma.billing.findMany({
    where: { userId },
    include: {
      document: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
