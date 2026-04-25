import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Logs({ logs }) {
    const getTypeBadge = (type) => {
        const badges = {
            in: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700',
            out: 'bg-red-900/30 text-red-400 border border-red-700',
            adjustment: 'bg-blue-900/30 text-blue-400 border border-blue-700',
            order: 'bg-purple-900/30 text-purple-400 border border-purple-700',
            return: 'bg-amber-900/30 text-amber-400 border border-amber-700',
        };
        return badges[type] || badges.in;
    };

    return (
        <AdminLayout>
            <Head title="Material Stock Logs" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-white">Material Stock Logs</h1>
                        <p className="text-stone-400 mt-1">Complete history of all material stock movements</p>
                    </div>

                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Material</th>
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
                                            <td className="px-6 py-4 text-sm text-white">{log.material?.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(log.type)}`}>
                                                    {log.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white font-medium">{log.quantity} {log.material?.unit}</td>
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
        </AdminLayout>
    );
}
