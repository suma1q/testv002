/**
 * DocumentViewer Component
 * Shows document preview + billing panel side-by-side
 */

'use client';

import { useEffect, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import BillingPanel from '@/components/Billing/BillingPanel';

interface DocumentViewerProps {
  documentId: string;
  onRefresh?: () => void;
}

interface DocumentData {
  id: string;
  documentType: string;
  documentNumber: string;
  fromName: string;
  toName: string;
  toEmail: string;
  documentDate: string;
  dueDate?: string;
  items: any[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  billings: Array<{
    id: string;
    amount: number;
    tax: number;
    total: number;
    paidAmount: number;
    remainingAmount: number;
    billingStatus: 'unpaid' | 'paid' | 'partial' | 'refunded';
    payments: Array<{
      id: string;
      amount: number;
      method: string;
      paidAt: string;
    }>;
  }>;
}

export default function DocumentViewer({ documentId, onRefresh }: DocumentViewerProps) {
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${documentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const data = await response.json();
      setDocument(data.document);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-900">Error</p>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return <div className="text-center py-8 text-gray-500">Document not found</div>;
  }

  const billing = document.billings?.[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Document Preview - Left (2/3) */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-8">
        {/* Document Header */}
        <div className="mb-8 text-center border-b pb-6">
          <div className="inline-block bg-blue-100 px-3 py-1 rounded-full text-xs font-semibold text-blue-800 mb-3">
            {document.documentType.toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{document.fromName}</h1>
        </div>

        {/* Document Details Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Document #
            </p>
            <p className="text-lg font-semibold text-gray-900">{document.documentNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Date
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(document.documentDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* From/To */}
        <div className="grid grid-cols-2 gap-8 mb-8 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">From</p>
            <p className="font-semibold text-gray-900">{document.fromName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">To</p>
            <p className="font-semibold text-gray-900">{document.toName}</p>
            <p className="text-sm text-gray-600">{document.toEmail}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700 w-20">Qty</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700 w-24">Price</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700 w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-3">{item.description}</td>
                  <td className="text-right py-3">{item.quantity}</td>
                  <td className="text-right py-3">${item.rate.toFixed(2)}</td>
                  <td className="text-right py-3 font-medium">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-8 space-y-2 text-right">
          <div className="flex justify-end gap-8">
            <span className="text-gray-600">Subtotal:</span>
            <span className="w-32 font-medium">${document.subtotal.toFixed(2)}</span>
          </div>
          {document.discount > 0 && (
            <div className="flex justify-end gap-8">
              <span className="text-gray-600">Discount:</span>
              <span className="w-32 font-medium">-${document.discount.toFixed(2)}</span>
            </div>
          )}
          {document.tax > 0 && (
            <div className="flex justify-end gap-8">
              <span className="text-gray-600">Tax:</span>
              <span className="w-32 font-medium">${document.tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-end gap-8 border-t-2 border-gray-900 pt-3">
            <span className="font-bold text-lg">Total:</span>
            <span className="w-32 font-bold text-lg text-blue-600">${document.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {document.notes && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm font-semibold text-yellow-900 mb-1">Notes</p>
            <p className="text-sm text-yellow-800">{document.notes}</p>
          </div>
        )}
      </div>

      {/* Billing Panel - Right (1/3) */}
      {billing && (
        <div className="lg:col-span-1">
          <BillingPanel
            billing={billing}
            documentType={document.documentType}
            onPaymentRecorded={fetchDocument}
          />
        </div>
      )}
    </div>
  );
}
