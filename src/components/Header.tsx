"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, LogOut } from "lucide-react";
import { useState } from 'react';

export default function Header({ showDashboardLinks = true, userEmail, onSignOut }: { showDashboardLinks?: boolean; userEmail?: string | null; onSignOut?: (() => void) | undefined }) {
  const pathname = usePathname();
  const [showCreate, setShowCreate] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <nav className="border-b border-[#e9eaea] sticky top-0 bg-[#fcfcfc] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-[#fcc425]" />
                <span className="text-2xl font-bold text-[#464646]">InvoiceGen</span>
              </Link>

              {showDashboardLinks ? (
                <nav className="hidden sm:flex items-center space-x-4 ml-6">
                  <Link href="/dashboard" className="text-sm text-gray-700 hover:text-gray-900">Dashboard</Link>
                  <Link href="/dashboard/create?type=estimate" className="text-sm font-semibold text-gray-900">Estimate</Link>
                  <Link href="/dashboard/create?type=purchaseOrder" className="text-sm px-2 py-0.5 rounded bg-pink-50 text-pink-700">Create PO</Link>
                  <Link href="/dashboard/create?type=deliveryNote" className="text-sm px-2 py-0.5 rounded bg-green-50 text-green-700">Delivery</Link>
                  <Link href="/dashboard/create?type=creditNote" className="text-sm text-gray-700 hover:text-gray-900">Credit Note</Link>
                  <Link href="/dashboard/invoices" className="text-sm text-gray-700 hover:text-gray-900">Invoices</Link>
                  <Link href="/dashboard/quotations" className="text-sm text-gray-700 hover:text-gray-900">Quotations</Link>
                </nav>
              ) : (
                <div className="hidden md:flex items-center space-x-6 ml-6">
                  <a
                    href="/#features"
                    onClick={(e) => handleScroll(e, "features")}
                    className="text-[#464646] hover:text-[#fcc425] transition cursor-pointer"
                  >
                    Features
                  </a>

                  <Link href="/pricing" className="text-[#464646] hover:text-[#fcc425] transition">
                    Pricing
                  </Link>

                  <a
                    href="/#how-it-works"
                    onClick={(e) => handleScroll(e, "how-it-works")}
                    className="text-[#464646] hover:text-[#fcc425] transition cursor-pointer"
                  >
                    How It Works
                  </a>

                  <a
                    href="/#contact"
                    onClick={(e) => handleScroll(e, "contact")}
                    className="text-[#464646] hover:text-[#fcc425] transition cursor-pointer"
                  >
                    Contact
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowCreate((s) => !s)}
                  className="inline-flex items-center gap-2 bg-[#fcc425] text-[#464646] px-4 py-2 rounded-lg font-semibold hover:bg-[#fae29b] transition"
                  aria-haspopup="true"
                  aria-expanded={showCreate}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                </button>

                {showCreate && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <Link href="/dashboard/create?type=invoice" onClick={() => setShowCreate(false)} className="block px-4 py-2 hover:bg-gray-50">Invoice</Link>
                    <Link href="/dashboard/create?type=quotation" onClick={() => setShowCreate(false)} className="block px-4 py-2 hover:bg-gray-50">Quotation</Link>
                    <Link href="/dashboard/create?type=estimate" onClick={() => setShowCreate(false)} className="block px-4 py-2 hover:bg-gray-50">Estimate</Link>
                    <Link href="/dashboard/create?type=purchaseOrder" onClick={() => setShowCreate(false)} className="block px-4 py-2 hover:bg-gray-50">PO</Link>
                    <Link href="/dashboard/create?type=deliveryNote" onClick={() => setShowCreate(false)} className="block px-4 py-2 hover:bg-gray-50">Delivery Note</Link>
                    <Link href="/dashboard/create?type=creditNote" onClick={() => setShowCreate(false)} className="block px-4 py-2 hover:bg-gray-50">Credit Note</Link>
                  </div>
                )}
              </div>

              {showDashboardLinks ? (
                <div className="hidden sm:flex items-center space-x-3">
                  {userEmail ? (
                    <>
                      <div className="text-sm text-gray-700">{userEmail}</div>
                      <button title="Logout" onClick={onSignOut} className="text-gray-600 hover:text-gray-900"><LogOut className="w-5 h-5" /></button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="text-[#464646] hover:text-[#fcc425] transition">Login</Link>
                      <Link
                        href="/signup"
                        className="bg-[#fcc425] text-[#464646] px-4 py-1 rounded-lg font-semibold hover:bg-[#fae29b] transition"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-6 ml-6">
                  <a
                    href="/#features"
                    onClick={(e) => handleScroll(e, "features")}
                    className="text-[#464646] hover:text-[#fcc425] transition cursor-pointer"
                  >
                    Features
                  </a>

                  <Link href="/pricing" className="text-[#464646] hover:text-[#fcc425] transition">
                    Pricing
                  </Link>

                  <a
                    href="/#how-it-works"
                    onClick={(e) => handleScroll(e, "how-it-works")}
                    className="text-[#464646] hover:text-[#fcc425] transition cursor-pointer"
                  >
                    How It Works
                  </a>

                  <a
                    href="/#contact"
                    onClick={(e) => handleScroll(e, "contact")}
                    className="text-[#464646] hover:text-[#fcc425] transition cursor-pointer"
                  >
                    Contact
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

