/**
 * POSCheckoutPanel Component
 * Final checkout with payment method selection
 */

'use client';

import { useState } from 'react';
import { CreditCard, Banknote, Loader } from 'lucide-react';

interface POSCheckoutPanelProps {
  orderTotal: number;
  orderItems: any[];
  tableNumber?: string;
  customerName?: string;
  onPaymentComplete?: (payment: any) => void;
  onCancel?: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'stripe' | 'room';

export default function POSCheckoutPanel({
  orderTotal,
  orderItems,
  tableNumber,
  customerName,
  onPaymentComplete,
  onCancel,
}: POSCheckoutPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState(orderTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const change = amountPaid - orderTotal;

  const handlePayment = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          total: orderTotal,
          paymentMethod,
          paymentAmount: amountPaid,
          tableNumber,
          customerName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Payment failed');
      }

      const result = await response.json();
      onPaymentComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        {tableNumber && (
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold">Table:</span> {tableNumber}
          </p>
        )}
        {customerName && (
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-semibold">Customer:</span> {customerName}
          </p>
        )}
        <div className="border-t pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${(orderTotal * 0.9).toFixed(2)}</span>
          </div>
          {orderTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax (10%)</span>
              <span>${(orderTotal * 0.1).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span className="text-blue-600">${orderTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`p-3 rounded-lg border-2 transition ${
              paymentMethod === 'cash'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Banknote className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Cash</div>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-3 rounded-lg border-2 transition ${
              paymentMethod === 'card'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-6 h-6 mx-auto mb-1" />
            <div className="text-sm font-medium">Card</div>
          </button>
        </div>
      </div>

      {/* Amount Paid */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Amount Paid
        </label>
        {paymentMethod === 'cash' ? (
          <input
            type="number"
            step="0.01"
            min={orderTotal}
            value={amountPaid}
            onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none text-lg font-bold"
          />
        ) : (
          <div className="px-4 py-2 bg-gray-50 rounded-lg text-lg font-bold text-gray-900">
            ${orderTotal.toFixed(2)}
          </div>
        )}
      </div>

      {/* Change */}
      {paymentMethod === 'cash' && change > 0 && (
        <div className="mb-6 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Change</p>
          <p className="text-2xl font-bold text-green-600">${change.toFixed(2)}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          Complete
        </button>
      </div>
    </div>
  );
}
