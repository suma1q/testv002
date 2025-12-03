/**
 * ReceiptPrintView Component
 * Prints receipt in A4 or thermal (58mm/80mm) format
 */

'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';

interface ReceiptPrintViewProps {
  receipt: {
    id: string;
    documentNumber: string;
    documentDate: string;
    fromName: string;
    toName: string;
    items: any[];
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
  };
  payment?: {
    method: string;
    amount: number;
    paidAt: string;
  };
  format?: 'a4' | 'thermal'; // thermal = 58mm
}

export default function ReceiptPrintView({
  receipt,
  payment,
  format = 'a4',
}: ReceiptPrintViewProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 500);
  };

  if (format === 'thermal') {
    return (
      <div className="print:w-[58mm]">
        {/* Thermal Receipt - 58mm width */}
        <div
          id="thermal-receipt"
          className="bg-white text-center p-2 font-mono text-xs"
          style={{ width: '58mm', padding: '8px', fontSize: '9pt' }}
        >
          <div className="mb-2 font-bold uppercase">{receipt.fromName}</div>
          <div className="mb-3 border-b pb-2 text-xs">
            {new Date(receipt.documentDate).toLocaleDateString()}
          </div>

          {/* Items */}
          <div className="mb-2 text-left">
            {receipt.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs mb-1">
                <span>{item.itemName} x{item.quantity}</span>
                <span>${(item.amount || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-b my-2" />

          {/* Totals */}
          <div className="text-left space-y-1 mb-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${receipt.subtotal.toFixed(2)}</span>
            </div>
            {receipt.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${receipt.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-1">
              <span>Total:</span>
              <span>${receipt.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment */}
          {payment && (
            <div className="border-t pt-1 mb-2 text-xs">
              <div>Payment: {payment.method.toUpperCase()}</div>
              <div>${payment.amount.toFixed(2)}</div>
            </div>
          )}

          <div className="border-b my-2" />
          <div className="text-xs mb-2">Thank you!</div>
          <div className="text-xs">Receipt #{receipt.documentNumber}</div>
        </div>

        {/* Print Button */}
        <div className="mt-4 flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    );
  }

  // A4 Format
  return (
    <div className="bg-white">
      {/* A4 Receipt */}
      <div
        id="a4-receipt"
        className="max-w-2xl mx-auto p-8 print:p-0 print:max-w-none"
        style={{ pageBreakAfter: 'always' }}
      >
        {/* Header */}
        <div className="mb-8 text-center border-b pb-4">
          <h1 className="text-3xl font-bold">{receipt.fromName}</h1>
          <p className="text-gray-600 mt-2">Receipt</p>
        </div>

        {/* Receipt Details */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-semibold text-gray-700">Receipt #</p>
            <p className="text-lg">{receipt.documentNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">Date</p>
            <p className="text-lg">{new Date(receipt.documentDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer */}
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <p className="text-sm font-semibold text-gray-700">Customer</p>
          <p className="text-lg">{receipt.toName}</p>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-2 text-sm font-semibold">Description</th>
                <th className="text-center py-2 text-sm font-semibold">Qty</th>
                <th className="text-right py-2 text-sm font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-2">{item.itemName}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">${(item.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-8 space-y-2 text-right">
          <div className="flex justify-end gap-4">
            <span className="text-gray-600">Subtotal:</span>
            <span className="w-32">${receipt.subtotal.toFixed(2)}</span>
          </div>
          {receipt.tax > 0 && (
            <div className="flex justify-end gap-4">
              <span className="text-gray-600">Tax:</span>
              <span className="w-32">${receipt.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-end gap-4 border-t-2 border-gray-900 pt-2 font-bold text-lg">
            <span>Total:</span>
            <span className="w-32">${receipt.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment */}
        {payment && (
          <div className="mb-8 p-4 bg-green-50 rounded">
            <p className="text-sm font-semibold text-gray-700">Payment</p>
            <p className="text-lg">
              {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}: ${payment.amount.toFixed(2)}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          <p>Thank you for your business!</p>
        </div>
      </div>

      {/* Print Button */}
      <div className="mt-4 flex gap-2 no-print justify-center">
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>
        {/* Save as PDF removed — use browser print dialog to save as PDF if needed */}
      </div>
    </div>
  );
}
