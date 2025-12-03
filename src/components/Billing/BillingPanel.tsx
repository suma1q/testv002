/**
 * BillingPanel Component
 * Shows billing status, payment history, and record payment
 * Used in DocumentViewer
 */

'use client';

import { useState } from 'react';
import { DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface BillingPanelProps {
  billing: {
    id: string;
    amount: number;
    tax: number;
    total: number;
    paidAmount: number;
    remainingAmount: number;
    billingStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
    payments: Array<{
      id: string;
      amount: number;
      method: string;
      paidAt: string;
    }>;
  };
  documentType: string;
  onPaymentRecorded?: () => void;
}

export default function BillingPanel({
  billing,
  documentType,
  onPaymentRecorded,
}: BillingPanelProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5" />;
      case 'partial':
        return <Clock className="w-5 h-5" />;
      case 'unpaid':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  // Don't show billing for documents that don't have billing
  if (documentType === 'quotation' || documentType === 'estimate' || documentType === 'deliveryNote') {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">No billing for this document type.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>

        {/* Amount Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${billing.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">${billing.tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg">${billing.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Billing Status */}
        <div className="mb-6">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusColor(billing.billingStatus)}`}>
            {getStatusIcon(billing.billingStatus)}
            <span className="font-semibold capitalize">{billing.billingStatus}</span>
          </div>
        </div>

        {/* Payment Progress */}
        {billing.remainingAmount > 0 && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Paid</span>
              <span className="text-sm font-medium">${billing.paidAmount.toFixed(2)} / ${billing.total.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(billing.paidAmount / billing.total) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Remaining: <span className="font-semibold">${billing.remainingAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {billing.remainingAmount > 0 && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Record Payment
          </button>
        )}
      </div>

      {/* Payment History */}
      {billing.payments.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Payment History</h4>
          <div className="space-y-3">
            {billing.payments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-gray-900">{payment.method}</p>
                  <p className="text-gray-600">{new Date(payment.paidAt).toLocaleDateString()}</p>
                </div>
                <span className="font-semibold text-green-600">${payment.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Record Payment</h3>
            <p className="text-sm text-gray-600 mb-4">Remaining: ${billing.remainingAmount.toFixed(2)}</p>
            <input
              type="number"
              placeholder="Amount"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              max={billing.remainingAmount}
            />
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
