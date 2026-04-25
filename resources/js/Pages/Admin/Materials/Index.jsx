import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { confirmDialog } from 'primereact/confirmdialog';
import { useToast } from '@/Contexts/ToastContext';
import axios from 'axios';
import MaterialFormModal from '@/Components/Admin/MaterialFormModal';
import StockModal from '@/Components/Admin/StockModal';
import ActionButtons from '@/Components/ActionButtons';

export default function Index({ materials, stats }) {
    const { showToast } = useToast();
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [materialModalOpen, setMaterialModalOpen] = useState(false);
    const [stockType, setStockType] = useState('in');
    const [suppliers, setSuppliers] = useState([]);

    // Fetch suppliers on component mount
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await axios.get(route('admin.suppliers.list'));
                setSuppliers(response.data);
            } catch (error) {
                console.error('Failed to fetch suppliers:', error);
            }
        };
        fetchSuppliers();
    }, []);

    const openCreateModal = () => {
        setSelectedMaterial(null);
        setMaterialModalOpen(true);
    };

    const openEditModal = (material) => {
        setSelectedMaterial(material);
        setMaterialModalOpen(true);
    };

    const openStockModal = (material, type) => {
        setSelectedMaterial(material);
        setStockType(type);
        setStockModalOpen(true);
    };

    const confirmArchive = (material) => {
        confirmDialog({
            header: 'Archive Material',
            message: `Are you sure you want to archive "${material.name}"? This material will be moved to archive and won't appear in active lists.`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-secondary',
            accept: () => {
                router.delete(route('admin.materials.destroy', material.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('success', 'Archived', 'Material moved to archive successfully.');
                        router.reload();
                    },
                    onError: () => {
                        showToast('error', 'Error', 'Failed to archive material.');
                    },
                });
            },
        });
    };

    const getStockBadge = (material) => {
        if (material.stock <= 0) {
            return { text: 'Out of Stock', className: 'bg-red-900/30 text-red-400 border border-red-700' };
        } else if (material.stock <= material.minimum_stock) {
            return { text: 'Low Stock', className: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' };
        } else {
            return { text: 'In Stock', className: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700' };
        }
    };

    return (
        <AdminLayout>
            <Head title="Material Stock" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Material Stock Management</h1>
                            <p className="text-stone-400 mt-1">Track raw materials used for product customizations</p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={route('admin.materials.logs')}
                                className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-800 transition-colors"
                            >
                                View Stock Logs
                            </Link>
                            <Link
                                href={route('admin.materials.archived')}
                                className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-800 transition-colors"
                            >
                                View Archive
                            </Link>
                            <button
                                onClick={openCreateModal}
                                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                            >
                                Add New Material
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Total Materials</p>
                            <p className="text-2xl font-bold text-white">{stats.total_materials}</p>
                        </div>
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Low Stock Items</p>
                            <p className="text-2xl font-bold text-yellow-400">{stats.low_stock}</p>
                        </div>
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-400">{stats.out_of_stock}</p>
                        </div>
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Total Inventory Value</p>
                            <p className="text-2xl font-bold text-amber-400">₱{stats.total_value?.toLocaleString() || 0}</p>
                        </div>
                    </div>

                    {/* Removed the View Stock Logs link from here */}
                    <div className="mb-4">
                        <p className="text-sm text-stone-400">
                            💡 <span className="text-amber-500">Note:</span> Materials are raw materials you purchase from suppliers.
                            They are used to fulfill custom orders but are <strong className="text-red-400">NOT visible</strong> to customers.
                            Link these to <strong className="text-amber-500">Customization Options</strong> to track stock usage.
                        </p>
                    </div>

                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Material</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Supplier</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Min Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-800">
                                    {materials.data.map((material) => {
                                        const stockBadge = getStockBadge(material);
                                        return (
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
                                                <td className="px-6 py-4 text-sm text-white font-medium">{material.stock}</td>
                                                <td className="px-6 py-4 text-sm text-stone-300">{material.minimum_stock}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stockBadge.className}`}>
                                                        {stockBadge.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <ActionButtons
                                                        onEdit={() => openEditModal(material)}
                                                        onDelete={() => confirmArchive(material)}
                                                        onStockIn={() => openStockModal(material, 'in')}
                                                        onStockOut={() => openStockModal(material, 'out')}
                                                        showView={false}
                                                        showEdit={true}
                                                        showDelete={true}
                                                        showStockIn={true}
                                                        showStockOut={true}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
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

            {/* Material Form Modal */}
            <MaterialFormModal
                isOpen={materialModalOpen}
                onClose={() => setMaterialModalOpen(false)}
                material={selectedMaterial}
                suppliers={suppliers}
            />

            {/* Stock Modal */}
            <StockModal
                isOpen={stockModalOpen}
                onClose={() => setStockModalOpen(false)}
                material={selectedMaterial}
                stockType={stockType}
            />
        </AdminLayout>
    );
}
