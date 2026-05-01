import { useRef } from 'react';
import { Printer, X, Calendar, MapPin, CreditCard, Clock, User, Phone, Mail } from 'lucide-react';

export default function OrderReceipt({ order, onClose }) {
    const receiptRef = useRef(null);

    const formatCurrency = (value) => {
        if (!value) return '0.00';
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (date) => {
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            cod: 'Cash on Delivery',
            gcash: 'GCash',
            paymaya: 'PayMaya',
            bank_transfer: 'Bank Transfer'
        };
        return methods[method] || method.toUpperCase();
    };

    const getPaymentStatusBadge = (status) => {
        const statuses = {
            paid: { text: 'PAID', color: 'text-emerald-600' },
            pending_payment: { text: 'PENDING', color: 'text-amber-600' },
            pending_downpayment: { text: 'DOWNPAYMENT DUE', color: 'text-orange-600' },
            failed: { text: 'FAILED', color: 'text-red-600' },
            refunded: { text: 'REFUNDED', color: 'text-stone-500' }
        };
        return statuses[status] || { text: 'PENDING', color: 'text-amber-600' };
    };

    const handlePrint = () => {
        const printContent = receiptRef.current.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt #${order.order_number}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Courier New', 'Monaco', monospace;
                        background: white;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                    }
                    .receipt-print {
                        max-width: 350px;
                        width: 100%;
                        margin: 0 auto;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .no-print {
                            display: none;
                        }
                        button {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-print">
                    ${printContent}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };

    const calculateSubtotal = () => {
        return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const shippingAddress = typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address;

    const paymentStatus = getPaymentStatusBadge(order.payment_status);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="relative max-w-md w-full">
                    {/* Receipt Content - Compact Store Receipt Style */}
                    <div ref={receiptRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden">

                        {/* Header - Simple Store Brand */}
                        <div className="bg-white px-5 pt-6 pb-3 text-center border-b border-dashed border-stone-200">
                            <h2 className="text-xl font-bold text-stone-800 tracking-wide">A' ARFEELS</h2>
                            <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">TRADING</p>
                            <div className="w-12 h-0.5 bg-amber-500 mx-auto mt-2"></div>
                            <p className="text-[10px] text-stone-400 mt-2">Premium Handcrafted Furniture</p>
                            <p className="text-[9px] text-stone-300 mt-1">123 Furniture St, Manila, Philippines</p>
                        </div>

                        {/* Receipt Body - Compact */}
                        <div className="px-5 py-4 space-y-4">

                            {/* Order Info Row */}
                            <div className="flex justify-between items-center border-b border-dashed border-stone-100 pb-2">
                                <div>
                                    <p className="text-[10px] text-stone-400">ORDER #</p>
                                    <p className="text-xs font-mono font-bold text-stone-700">#{order.order_number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-stone-400">DATE</p>
                                    <p className="text-[11px] text-stone-600">{formatShortDate(order.created_at)}</p>
                                </div>
                            </div>

                            {/* Payment Status Badge */}
                            <div className="bg-stone-50 rounded-lg px-3 py-2 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                                    <span className="text-[11px] text-stone-600">{getPaymentMethodLabel(order.payment_method)}</span>
                                </div>
                                <span className={`text-[10px] font-bold ${paymentStatus.color}`}>
                                    ● {paymentStatus.text}
                                </span>
                            </div>

                            {/* Customer Info - Compact */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[11px]">
                                    <User className="w-3 h-3 text-stone-400" />
                                    <span className="text-stone-700">{order.customer_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px]">
                                    <Mail className="w-3 h-3 text-stone-400" />
                                    <span className="text-stone-500">{order.customer_email}</span>
                                </div>
                                {shippingAddress?.phone && (
                                    <div className="flex items-center gap-2 text-[11px]">
                                        <Phone className="w-3 h-3 text-stone-400" />
                                        <span className="text-stone-500">{shippingAddress.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Address - Compact */}
                            <div className="bg-amber-50/50 rounded-lg px-3 py-2">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-[10px] text-stone-600 leading-tight">
                                        {shippingAddress?.address}
                                        {shippingAddress?.barangay && <>, {shippingAddress.barangay}</>}
                                        <br />
                                        {shippingAddress?.city}, {shippingAddress?.postal_code}
                                    </p>
                                </div>
                            </div>

                            {/* Order Items - Compact Table */}
                            <div className="border-t border-stone-100 pt-3">
                                <div className="flex justify-between text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                                    <span className="flex-1">ITEM</span>
                                    <span className="w-12 text-center">QTY</span>
                                    <span className="w-16 text-right">TOTAL</span>
                                </div>
                                <div className="space-y-2">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-[11px]">
                                            <div className="flex-1">
                                                <p className="font-medium text-stone-700">{item.product?.name}</p>
                                                {item.size && (
                                                    <p className="text-[9px] text-stone-400">Size: {item.size.size}</p>
                                                )}
                                                {item.customizations?.length > 0 && (
                                                    <p className="text-[8px] text-stone-400">
                                                        {item.customizations.map(c => c.value).join(', ')}
                                                    </p>
                                                )}
                                                <p className="text-[9px] text-stone-400">₱{formatCurrency(item.price)}</p>
                                            </div>
                                            <div className="w-12 text-center text-stone-600">×{item.quantity}</div>
                                            <div className="w-16 text-right font-medium text-stone-700">
                                                ₱{formatCurrency(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals - Compact */}
                            <div className="border-t border-stone-100 pt-3 space-y-1.5">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-stone-500">Subtotal</span>
                                    <span className="text-stone-700">₱{formatCurrency(calculateSubtotal())}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-stone-500">Shipping</span>
                                    <span className="text-stone-700">₱{formatCurrency(order.shipping_cost || 0)}</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-stone-500">Tax (12% VAT)</span>
                                    <span className="text-stone-700">₱{formatCurrency(calculateSubtotal() * 0.12)}</span>
                                </div>
                                {order.down_payment_amount > 0 && order.payment_method === 'cod' && (
                                    <>
                                        <div className="flex justify-between text-[11px] pt-1">
                                            <span className="text-stone-500">Down Payment (30%)</span>
                                            <span className="text-emerald-600 font-medium">-₱{formatCurrency(order.down_payment_amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] border-b border-dashed border-stone-100 pb-2">
                                            <span className="text-stone-500">Balance Due</span>
                                            <span className="text-amber-600 font-medium">₱{formatCurrency(order.remaining_balance)}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between items-center pt-1 border-t border-dashed border-stone-200">
                                    <span className="text-sm font-bold text-stone-800">TOTAL</span>
                                    <span className="text-base font-bold text-amber-600">₱{formatCurrency(order.total_price)}</span>
                                </div>
                            </div>

                            {/* Delivery Notes */}
                            {shippingAddress?.notes && (
                                <div className="bg-stone-50 rounded-lg px-3 py-2">
                                    <p className="text-[9px] font-medium text-stone-500 uppercase tracking-wide">Delivery Notes</p>
                                    <p className="text-[10px] text-stone-600 mt-0.5">{shippingAddress.notes}</p>
                                </div>
                            )}

                            {/* Order Timeline */}
                            <div className="flex justify-between text-[9px] text-stone-400 pt-2">
                                <span>Ordered: {formatDate(order.created_at)}</span>
                                {order.status === 'completed' && (
                                    <span>Completed: {formatDate(order.updated_at)}</span>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="text-center pt-3 border-t border-dashed border-stone-200">
                                <p className="text-[8px] text-stone-400">Thank you for shopping with us!</p>
                                <p className="text-[7px] text-stone-300 mt-1">This is a computer-generated receipt • No signature required</p>
                                <div className="flex justify-center gap-3 mt-2">
                                    <span className="text-[8px] text-stone-300">✓ Quality Guaranteed</span>
                                    <span className="text-[8px] text-stone-300">✓ 5-Year Warranty</span>
                                </div>
                                <p className="text-[7px] text-stone-300 mt-2">hello@aarfeels.com | +63 (123) 456-7890</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3 mt-4 no-print">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-all duration-200 shadow-lg text-sm font-medium"
                        >
                            <Printer className="w-4 h-4" />
                            Print Receipt
                        </button>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all duration-200 text-sm font-medium"
                        >
                            <X className="w-4 h-4" />
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
