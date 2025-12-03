/**
 * Enhanced Dashboard with Billing Metrics
 * Shows Income, Expenses, Refunds, Outstanding
 */

'use client';

import { useEffect, useState } from 'react';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BookOpen,
  Loader,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  income: number;
  expenses: number;
  refunds: number;
  outstanding: number;
  netProfit: number;
}

interface BillingData {
  stats: DashboardStats;
  recentBillings: any[];
}

export default function BillingDashboard() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'income' | 'expenses' | 'refunds'>('income');

  useEffect(() => {
    fetchBillingStats();
  }, []);

  const fetchBillingStats = async () => {
    try {
      const response = await fetch('/api/billing/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching billing stats:', error);
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

  if (!data?.stats) {
    return <div className="text-center py-8 text-gray-500">Failed to load billing data</div>;
  }

  const stats = data.stats;
  const recentBillings = data.recentBillings || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your income, expenses, and payments</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Income</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats.income.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats.expenses.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Refunds */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Refunds Issued</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats.refunds.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Outstanding */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Outstanding</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">${stats.outstanding.toFixed(2)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Net Profit */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-8">
        <p className="text-blue-100 mb-2">Net Profit (This Period)</p>
        <p className="text-4xl font-bold">${stats.netProfit.toFixed(2)}</p>
      </div>

      {/* Recent Billings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Billings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Document #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentBillings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No billings yet
                  </td>
                </tr>
              ) : (
                recentBillings.map((billing) => (
                  <tr key={billing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {billing.document?.documentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {billing.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      ${billing.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          billing.billingStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : billing.billingStatus === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {billing.billingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(billing.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/documents/create?type=invoice"
          className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition text-center"
        >
          <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="font-semibold text-gray-900">Create Invoice</p>
        </Link>
        <Link
          href="/dashboard/documents/create?type=purchaseOrder"
          className="block p-6 bg-red-50 border border-red-200 rounded-lg hover:shadow-md transition text-center"
        >
          <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="font-semibold text-gray-900">Record Expense</p>
        </Link>
        <Link
          href="/dashboard/pos"
          className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition text-center"
        >
          <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-semibold text-gray-900">POS Order</p>
        </Link>
      </div>
    </div>
  );
}
