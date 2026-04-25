import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';

export default function CODInstructions({ order }) {
    const formatCurrency = (value) => {
        if (!value) return '0';
        return value.toLocaleString();
    };

    return (
        <CustomerLayout>
            <Head title="Complete Your Down Payment" />

            <div className="py-12 bg-stone-50 min-h-screen">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Complete Your Down Payment</h1>
                            <p className="text-amber-100 mt-2">Order #{order.order_number}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Payment Summary */}
                            <div className="bg-stone-50 rounded-xl p-4">
                                <h3 className="font-semibold text-stone-800 mb-3">Payment Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Total Order Amount</span>
                                        <span className="text-stone-800">₱{formatCurrency(order.total_price)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Down Payment (30%)</span>
                                        <span className="text-emerald-600 font-semibold">₱{formatCurrency(order.down_payment_amount)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-stone-200">
                                        <span className="text-stone-500">Remaining Balance</span>
                                        <span className="text-stone-800">₱{formatCurrency(order.remaining_balance)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Instructions */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                                    Choose Payment Method
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="p-3 border border-stone-200 rounded-xl text-center hover:border-amber-500 transition-colors">
                                        <div className="font-medium text-stone-800">GCash</div>
                                        <div className="text-xs text-stone-400">Scan to pay</div>
                                    </button>
                                    <button className="p-3 border border-stone-200 rounded-xl text-center hover:border-amber-500 transition-colors">
                                        <div className="font-medium text-stone-800">Bank Transfer</div>
                                        <div className="text-xs text-stone-400">BPI / BDO</div>
                                    </button>
                                </div>

                                <h3 className="font-semibold text-stone-800 flex items-center gap-2 mt-4">
                                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                                    Send Payment Proof
                                </h3>
                                <div className="bg-amber-50 rounded-xl p-4">
                                    <p className="text-sm text-amber-800 mb-2">Send your proof of payment to:</p>
                                    <p className="text-sm font-mono bg-white p-2 rounded text-center">hello@aarfeels.com</p>
                                    <p className="text-xs text-amber-700 mt-2 text-center">Include your Order # in the subject line</p>
                                </div>

                                <h3 className="font-semibold text-stone-800 flex items-center gap-2 mt-4">
                                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                                    Order Confirmation
                                </h3>
                                <p className="text-sm text-stone-600">
                                    Once we receive and verify your down payment, we'll confirm your order and start production.
                                    You'll receive an email notification within 24 hours.
                                </p>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-700 font-medium">Important:</p>
                                <p className="text-xs text-red-600 mt-1">
                                    Your order will only be processed after we receive the down payment.
                                    Unpaid orders will be cancelled after 48 hours.
                                </p>
                            </div>

                            <Link
                                href="/customer/orders"
                                className="block w-full text-center py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium"
                            >
                                View My Orders
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
