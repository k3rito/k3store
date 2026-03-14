"use client";

import React from "react";

interface CartDrawerNewProps {
  isOpen: boolean;
  onClose: () => void;
  items?: Array<{ id: string; name: string; price: number; image?: string }>;
}

const CartDrawerNew: React.FC<CartDrawerNewProps> = ({
  isOpen,
  onClose,
  items = [
    { id: "1", name: "Surgical Masks (50pk)", price: 24.99 },
    { id: "2", name: "Digital Thermometer", price: 12.50 },
  ],
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Drawer Body */}
      <section className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-800">Your Cart</h3>
            <span className="bg-[#e6eff7] text-[#0054a3] px-2 py-0.5 rounded-full text-xs font-bold">
              {items.length} Items
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* New Share Cart Button */}
            <button className="p-2 text-[#0054a3] hover:bg-[#e6eff7] rounded-full transition-colors" title="Share Cart">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
            {/* Close Button */}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" onClick={onClose}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </button>
          </div>
        </header>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center p-3 rounded-xl border border-slate-50 bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex-shrink-0 overflow-hidden">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{item.name}</p>
                <p className="text-sm text-slate-500">${item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <p>Your cart is empty</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-slate-100 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="text-xl font-bold text-slate-800">${subtotal.toFixed(2)}</span>
          </div>
          <button className="w-full bg-[#0054a3] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-100 active:scale-[0.98] transition-all">
            Proceed to Checkout
          </button>
        </footer>
      </section>
    </div>
  );
};

export default CartDrawerNew;
