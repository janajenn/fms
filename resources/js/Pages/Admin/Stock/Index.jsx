import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Dialog } from 'primereact/dialog';
import { Tooltip } from 'primereact/tooltip';
import { useToast } from '@/Contexts/ToastContext';
import ActionButtons from '@/Components/ActionButtons';

export default function Index({ products, stats }) {
    const { showToast } = useToast();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [stockType, setStockType] = useState('in');
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [alertLevel, setAlertLevel] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openStockModal = (product, type, size = null) => {
        setSelectedProduct(product);
        setSelectedSize(size);
        setStockType(type);
        setQuantity(1);
        setReason('');
        setStockModalOpen(true);
    };

    const handleStockSubmit = () => {
        if (!quantity || quantity < 1) {
            showToast('error', 'Error', 'Please enter a valid quantity.');
            return;
        }

        setIsSubmitting(true);

        const url = stockType === 'in'
            ? route('admin.stock.in', selectedProduct.id)
            : route('admin.stock.out', selectedProduct.id);

        const data = {
            quantity: quantity,
            reason: reason,
        };

        if (selectedSize) {
            data.size_id = selectedSize.id;
        }

        router.post(url, data, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setStockModalOpen(false);
                showToast('success', 'Success', `Stock ${stockType === 'in' ? 'added' : 'removed'} successfully.`);
                router.reload();
            },
            onError: (error) => {
                setIsSubmitting(false);
                const message = error?.response?.data?.message || 'Failed to update stock.';
                showToast('error', 'Error', message);
            },
        });
    };

    const openAlertModal = (product, size = null) => {
        setSelectedProduct(product);
        setSelectedSize(size);
        if (size) {
            setAlertLevel(size.minimum_stock || 5);
        } else {
            setAlertLevel(product.inventory?.minimum_stock || 5);
        }
        setAlertModalOpen(true);
    };

    const handleAlertSubmit = () => {
        setIsSubmitting(true);

        const data = {
            minimum_stock: alertLevel,
        };

        if (selectedSize) {
            data.size_id = selectedSize.id;
        }

        router.post(route('admin.stock.alert.update', selectedProduct.id), data, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setAlertModalOpen(false);
                showToast('success', 'Success', 'Stock alert level updated.');
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                showToast('error', 'Error', 'Failed to update alert level.');
            },
        });
    };

    const getStockBadge = (product) => {
        if (product.stock_type === 'sizes') {
            if (product.current_stock <= 0) {
                return { text: 'Out of Stock', className: 'bg-red-900/30 text-red-400 border border-red-700' };
            } else if (product.current_stock <= 5) {
                return { text: `${product.current_stock} total (${product.sizes?.length} sizes)`, className: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' };
            } else {
                return { text: `${product.current_stock} total (${product.sizes?.length} sizes)`, className: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700' };
            }
        } else {
            const stock = product.inventory?.stock || 0;
            if (stock <= 0) {
                return { text: 'Out of Stock', className: 'bg-red-900/30 text-red-400 border border-red-700' };
            } else if (stock <= (product.inventory?.minimum_stock || 5)) {
                return { text: `${stock} in stock`, className: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' };
            } else {
                return { text: `${stock} in stock`, className: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700' };
            }
        }
    };

    const stockModalFooter = () => (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => setStockModalOpen(false)}
                className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-900"
            >
                Cancel
            </button>
            <button
                onClick={handleStockSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Processing...' : `Stock ${stockType === 'in' ? 'In' : 'Out'}`}
            </button>
        </div>
    );

    const alertModalFooter = () => (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => setAlertModalOpen(false)}
                className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-900"
            >
                Cancel
            </button>
            <button
                onClick={handleAlertSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Saving...' : 'Update Alert Level'}
            </button>
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Stock Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tooltip component */}
                    <Tooltip target="[data-pr-tooltip]" position="top" />

                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-white">Product Stock Management</h1>
                        <p className="text-stone-400 mt-1">Track inventory levels, manage stock in/out, and monitor alerts</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Total Products</p>
                            <p className="text-2xl font-bold text-white">{stats.total_products}</p>
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
                            <p className="text-2xl font-bold text-amber-400">₱{stats.total_value.toLocaleString()}</p>
                        </div>
                    </div>

                   <div className="mb-4 flex justify-between items-center">
    <p className="text-sm text-stone-400">
        💡 <span className="text-amber-500">Note:</span> Products with size variations show total stock across all sizes.
    </p>
    <div className="flex gap-3">
        {/* Print Report Button */}
        <a
            href={route('admin.reports.stock')}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
        </a>
        <button
    onClick={() => router.get(route('admin.stock.logs'))}
    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium"
>
    View Stock Logs
</button>
    </div>
</div>

                    {/* Products Table */}
                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Size / Variant</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Current Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Min. Alert</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-800">
                                    {products.data.map((product) => {
                                        const stockBadge = getStockBadge(product);

                                        if (product.stock_type === 'sizes' && product.sizes && product.sizes.length > 0) {
                                            // Show each size as a separate row
                                            return product.sizes.map((size, idx) => (
                                                <tr key={`${product.id}-${size.id}`} className="hover:bg-stone-900/50">
                                                    {idx === 0 && (
                                                        <>
                                                            <td rowSpan={product.sizes.length} className="px-6 py-4 border-r border-stone-800 align-top">
                                                                <div className="text-sm font-medium text-white">{product.name}</div>
                                                                <div className="text-xs text-stone-400 mt-1">{product.category?.name}</div>
                                                            </td>
                                                            <td rowSpan={product.sizes.length} className="px-6 py-4 border-r border-stone-800 align-top text-sm text-stone-300">
                                                                {product.category?.name}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="px-6 py-4 text-sm text-stone-300">
                                                        {size.size} ({size.size_type})
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-white font-medium">{size.stock}</td>
                                                    <td className="px-6 py-4 text-sm text-stone-300">{size.minimum_stock || 5}</td>
                                                    <td className="px-6 py-4">
                                                        {size.stock <= 0 ? (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-900/30 text-red-400 border border-red-700">Out of Stock</span>
                                                        ) : size.stock <= (size.minimum_stock || 5) ? (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700">Low Stock</span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-700">In Stock</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <ActionButtons
                                                            onStockIn={() => openStockModal(product, 'in', size)}
                                                            onStockOut={() => openStockModal(product, 'out', size)}
                                                            onAlert={() => openAlertModal(product, size)}
                                                            showStockIn={true}
                                                            showStockOut={true}
                                                            showAlert={true}
                                                            showEdit={false}
                                                            showDelete={false}
                                                            showView={false}
                                                            showRestore={false}
                                                        />
                                                    </td>
                                                </tr>
                                            ));
                                        } else {
                                            // Simple product (no sizes)
                                            return (
                                                <tr key={product.id} className="hover:bg-stone-900/50">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-white">{product.name}</div>
                                                        <div className="text-xs text-stone-400 mt-1">{product.category?.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-stone-300">{product.category?.name}</td>
                                                    <td className="px-6 py-4 text-sm text-stone-400">—</td>
                                                    <td className="px-6 py-4 text-sm text-white font-medium">{product.inventory?.stock || 0}</td>
                                                    <td className="px-6 py-4 text-sm text-stone-300">{product.inventory?.minimum_stock || 5}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stockBadge.className}`}>
                                                            {stockBadge.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <ActionButtons
                                                            onStockIn={() => openStockModal(product, 'in')}
                                                            onStockOut={() => openStockModal(product, 'out')}
                                                            onAlert={() => openAlertModal(product)}
                                                            showStockIn={true}
                                                            showStockOut={true}
                                                            showAlert={true}
                                                            showEdit={false}
                                                            showDelete={false}
                                                            showView={false}
                                                            showRestore={false}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {products.links && products.links.length > 0 && (
                            <div className="px-6 py-4 border-t border-stone-800">
                                <div className="flex justify-center space-x-1">
                                    {products.links.map((link, index) => (
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

            {/* Stock In/Out Modal */}
            <Dialog
                header={`Stock ${stockType === 'in' ? 'In' : 'Out'} - ${selectedProduct?.name}${selectedSize ? ` (${selectedSize.size})` : ''}`}
                visible={stockModalOpen}
                style={{ width: '450px' }}
                onHide={() => setStockModalOpen(false)}
                footer={stockModalFooter}
                className="bg-black border border-stone-800 rounded-lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">
                            Quantity *
                        </label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                            min="1"
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">
                            Reason (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="2"
                            placeholder="e.g., Restock, Damaged items, Return, etc."
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>
                    <div className="text-xs text-stone-500 bg-stone-900 p-2 rounded">
                        Current stock: {selectedSize ? selectedSize.stock : selectedProduct?.inventory?.stock || 0} units
                    </div>
                </div>
            </Dialog>

            {/* Alert Level Modal */}
            <Dialog
                header={`Set Stock Alert - ${selectedProduct?.name}${selectedSize ? ` (${selectedSize.size})` : ''}`}
                visible={alertModalOpen}
                style={{ width: '450px' }}
                onHide={() => setAlertModalOpen(false)}
                footer={alertModalFooter}
                className="bg-black border border-stone-800 rounded-lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">
                            Minimum Stock Alert Level *
                        </label>
                        <input
                            type="number"
                            value={alertLevel}
                            onChange={(e) => setAlertLevel(parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                        <p className="text-xs text-stone-500 mt-1">
                            You will be alerted when stock falls below this level
                        </p>
                    </div>
                    <div className="text-xs text-stone-500 bg-stone-900 p-2 rounded">
                        Current stock: {selectedSize ? selectedSize.stock : selectedProduct?.inventory?.stock || 0} units
                    </div>
                </div>
            </Dialog>
        </AdminLayout>
    );
}
