import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { confirmDialog } from 'primereact/confirmdialog';
import { useToast } from '@/Contexts/ToastContext';
import ActionButtons from '@/Components/ActionButtons';

export default function Archived({ materials }) {
    const { showToast } = useToast();

    const confirmRestore = (material) => {
        confirmDialog({
            header: 'Restore Material',
            message: `Are you sure you want to restore "${material.name}"?`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-success',
            rejectClassName: 'p-button-secondary',
            accept: () => {
                router.post(route('admin.materials.restore', material.id), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('success', 'Restored', 'Material restored successfully.');
                        router.reload();
                    },
                    onError: () => {
                        showToast('error', 'Error', 'Failed to restore material.');
                    },
                });
            },
        });
    };

    const confirmPermanentDelete = (material) => {
        confirmDialog({
            header: 'Permanently Delete',
            message: `Are you sure you want to permanently delete "${material.name}"? This action cannot be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-secondary',
            accept: () => {
                router.delete(route('admin.materials.forceDelete', material.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('success', 'Deleted', 'Material permanently deleted.');
                        router.reload();
                    },
                    onError: () => {
                        showToast('error', 'Error', 'Failed to delete material.');
                    },
                });
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Archived Materials" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Archived Materials</h1>
                            <p className="text-stone-400 mt-1">View and restore archived materials</p>
                        </div>
                        <Link
                            href={route('admin.materials.index')}
                            className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-800 transition-colors"
                        >
                            ← Back to Materials
                        </Link>
                    </div>

                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Material</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Supplier</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Archived Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-800">
                                    {materials.data.map((material) => (
                                        <tr key={material.id} className="hover:bg-stone-900/50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-white">{material.name}</div>
                                                {material.description && (
                                                    <div className="text-xs text-stone-400 mt-1">{material.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-300">
                                                {material.supplier?.name || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-300">{material.unit}</td>
                                            <td className="px-6 py-4 text-sm text-stone-300">
                                                {new Date(material.deleted_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <ActionButtons
                                                    onRestore={() => confirmRestore(material)}
                                                    onDelete={() => confirmPermanentDelete(material)}
                                                    showView={false}
                                                    showEdit={false}
                                                    showDelete={true}
                                                    showRestore={true}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {materials.links && materials.links.length > 0 && (
                            <div className="px-6 py-4 border-t border-stone-800">
                                <div className="flex justify-center space-x-1">
                                    {materials.links.map((link, index) => (
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
