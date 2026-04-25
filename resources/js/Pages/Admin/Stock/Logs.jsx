import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { useRef } from 'react';

export default function Logs({ logs }) {
    const printRef = useRef();

    const getTypeBadge = (type) => {
        const badges = {
            in: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700',
            out: 'bg-red-900/30 text-red-400 border border-red-700',
            order: 'bg-purple-900/30 text-purple-400 border border-purple-700',
            adjustment: 'bg-blue-900/30 text-blue-400 border border-blue-700',
            return: 'bg-amber-900/30 text-amber-400 border border-amber-700',
        };
        return badges[type] || badges.in;
    };

    const getTypeLabel = (type) => {
        const labels = {
            in: 'Stock In',
            out: 'Stock Out',
            order: 'Order',
            adjustment: 'Adjustment',
            return: 'Return',
        };
        return labels[type] || type.toUpperCase();
    };

    const handlePrint = () => {
        const printContent = printRef.current.innerHTML;
        const originalTitle = document.title;

        // Create print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Stock Logs Report</title>
                <meta charset="utf-8">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: 'Helvetica', Arial, sans-serif;
                        font-size: 10pt;
                        line-height: 1.5;
                        color: #333;
                        padding: 20px;
                    }

                    @page {
                        size: A4 landscape;
                        margin: 1.5cm;
                    }

                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #333;
                    }

                    .print-header h1 {
                        font-size: 16pt;
                        margin-bottom: 5px;
                    }

                    .print-header p {
                        font-size: 9pt;
                        color: #666;
                    }

                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }

                    .print-table th {
                        background: #f5f5f5;
                        padding: 8px;
                        text-align: left;
                        font-size: 9pt;
                        font-weight: bold;
                        border-bottom: 2px solid #ddd;
                    }

                    .print-table td {
                        padding: 6px 8px;
                        font-size: 8pt;
                        border-bottom: 1px solid #eee;
                    }

                    .print-footer {
                        margin-top: 20px;
                        padding-top: 10px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        font-size: 8pt;
                        color: #999;
                    }

                    .text-center {
                        text-align: center;
                    }

                    .status-badge {
                        display: inline-block;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 7pt;
                    }

                    .status-in { background: #e8f5e9; color: #2e7d32; }
                    .status-out { background: #ffebee; color: #c62828; }
                    .status-order { background: #f3e5f5; color: #6a1b9a; }
                    .status-adjustment { background: #e3f2fd; color: #1565c0; }
                    .status-return { background: #fff3e0; color: #e65100; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>A' ARFEELS TRADING</h1>
                    <p>Stock Movement Logs Report</p>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                </div>
                ${printContent}
                <div class="print-footer">
                    <p>This is an official system-generated stock movement report.</p>
                    <p>&copy; ${new Date().getFullYear()} A' Arfeels Trading. All rights reserved.</p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };

    // Calculate summary stats for print
    const totalEntries = logs.data.length;
    const stockInCount = logs.data.filter(l => l.type === 'in').length;
    const stockOutCount = logs.data.filter(l => l.type === 'out').length;
    const orderCount = logs.data.filter(l => l.type === 'order').length;

    return (
        <AdminLayout>
            <Head title="Stock Logs" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header with Print Button */}
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Stock Logs</h1>
                            <p className="text-stone-400 mt-1">Detailed history of all stock movements</p>
                        </div>
                        <div className="flex gap-3">
    <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
    >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print (Browser)
    </button>
    <a
        href={route('admin.reports.stock-logs')}
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
    >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        Download PDF
    </a>
</div>
                    </div>

                    {/* Printable Content */}
                    <div ref={printRef}>
                        {/* Summary Stats for Print */}
                        <div className="bg-stone-900/50 rounded-lg p-4 mb-4 hidden print:block">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-stone-400">Total Entries</p>
                                    <p className="text-xl font-bold text-white">{totalEntries}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-stone-400">Stock In</p>
                                    <p className="text-xl font-bold text-emerald-400">{stockInCount}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-stone-400">Stock Out</p>
                                    <p className="text-xl font-bold text-red-400">{stockOutCount}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-stone-400">Orders</p>
                                    <p className="text-xl font-bold text-purple-400">{orderCount}</p>
                                </div>
                            </div>
                        </div>

                        {/* Stock Logs Table */}
                        <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-stone-800">
                                    <thead className="bg-stone-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Date & Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Before</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">After</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Reason</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">User</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-800">
                                        {logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-stone-900/50">
                                                <td className="px-6 py-4 text-sm text-stone-300">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-white">
                                                        {log.product?.name}
                                                        {log.size_label && (
                                                            <span className="text-xs text-stone-400 ml-1">({log.size_label})</span>
                                                        )}
                                                    </div>
                                                    {log.order && (
                                                        <div className="text-xs text-stone-500 mt-1">
                                                            Order: #{log.order.order_number}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(log.type)}`}>
                                                        {getTypeLabel(log.type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white font-medium">{log.quantity}</td>
                                                <td className="px-6 py-4 text-sm text-stone-300">{log.stock_before}</td>
                                                <td className="px-6 py-4 text-sm text-stone-300">{log.stock_after}</td>
                                                <td className="px-6 py-4 text-sm text-stone-400">{log.reason || '—'}</td>
                                                <td className="px-6 py-4 text-sm text-stone-300">{log.user?.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {logs.links && logs.links.length > 0 && (
                                <div className="px-6 py-4 border-t border-stone-800">
                                    <div className="flex justify-center space-x-1">
                                        {logs.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 rounded text-sm transition-colors ${
                                                    link.active
                                                        ? 'bg-amber-600 text-white'
                                                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
