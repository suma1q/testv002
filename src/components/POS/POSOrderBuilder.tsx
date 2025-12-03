/**
 * POSOrderBuilder Component
 * Main POS interface for building orders
 * Categories + Items grid + Cart on right
 */

'use client';

import { useState } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';

interface PosItem {
  id: string;
  itemName: string;
  category: string;
  unitPrice: number;
  tax?: number;
}

interface CartItem extends PosItem {
  quantity: number;
  amount: number;
}

interface POSOrderBuilderProps {
  categories: string[];
  items: PosItem[];
  onCheckout?: (order: any) => void;
}

export default function POSOrderBuilder({
  categories,
  items,
  onCheckout,
}: POSOrderBuilderProps) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'room-service'>('dine-in');

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const addToCart = (item: PosItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id
            ? { ...ci, quantity: ci.quantity + 1, amount: (ci.quantity + 1) * ci.unitPrice }
            : ci
        );
      }
      return [
        ...prev,
        {
          ...item,
          quantity: 1,
          amount: item.unitPrice,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) =>
        ci.id === itemId
          ? { ...ci, quantity, amount: quantity * ci.unitPrice }
          : ci
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.amount, 0);
  const tax = cart.reduce((sum, item) => sum + (item.tax || 0) * item.quantity, 0);
  const total = subtotal + tax;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-screen bg-gray-100">
      {/* Left: Categories & Items */}
      <div className="lg:col-span-3 bg-white overflow-hidden flex flex-col">
        {/* Order Header */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Table #"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="dine-in">Dine-in</option>
              <option value="takeaway">Takeaway</option>
              <option value="room-service">Room Service</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 border-b overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-md transition"
              >
                <div className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                  {item.itemName}
                </div>
                <div className="text-lg font-bold text-blue-600">${item.unitPrice.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Order Cart */}
      <div className="bg-white border-l overflow-hidden flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b bg-blue-600 text-white">
          <h2 className="font-bold text-lg">Order</h2>
          <p className="text-sm opacity-90">{cart.length} items</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-sm">No items added</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-gray-50 p-2 rounded border">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-semibold text-gray-700 flex-1">{item.itemName}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs font-semibold">${item.amount.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setCart([])}
                className="px-3 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm font-medium transition"
              >
                Clear
              </button>
              <button
                onClick={() => onCheckout?.({ items: cart, subtotal, tax, total, tableNumber, customerName, orderType })}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition flex items-center justify-center gap-1"
              >
                <DollarSign className="w-4 h-4" />
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
