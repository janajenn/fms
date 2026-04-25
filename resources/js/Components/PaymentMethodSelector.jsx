import { useState } from 'react';

export default function PaymentMethodSelector({ value, onChange, downPaymentPercentage = 30 }) {
    const paymentMethods = [
        {
            id: 'cod',
            name: 'Cash on Delivery (COD)',
            description: `Pay ${downPaymentPercentage}% down payment now, remaining upon delivery`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm0 0v2" />
                </svg>
            ),
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            textColor: 'text-emerald-700'
        },
        {
            id: 'gcash',
            name: 'GCash',
            description: 'Pay via GCash mobile wallet',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700'
        },
        {
            id: 'paymaya',
            name: 'PayMaya',
            description: 'Pay via PayMaya wallet',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-700'
        },
        {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            description: 'Pay via bank transfer (BPI, BDO, Metrobank)',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-700'
        }
    ];

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-stone-700 mb-2">
                Payment Method *
            </label>
            <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => (
                    <button
                        key={method.id}
                        type="button"
                        onClick={() => onChange(method.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            value === method.id
                                ? `${method.borderColor} ${method.bgColor} ring-2 ring-${method.textColor.split('-')[1]}-200`
                                : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`${value === method.id ? method.textColor : 'text-stone-400'}`}>
                                {method.icon}
                            </div>
                            <div className="flex-1">
                                <p className={`font-semibold ${value === method.id ? method.textColor : 'text-stone-700'}`}>
                                    {method.name}
                                </p>
                                <p className="text-xs text-stone-500 mt-0.5">
                                    {method.description}
                                </p>
                            </div>
                            {value === method.id && (
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
