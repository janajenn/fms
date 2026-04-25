import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { useToast } from '@/Contexts/ToastContext';
import ProductDetailsModal from '@/Components/Admin/ProductDetailsModal';

export default function Index({ products }) {
    const { showToast } = useToast();
    const { flash } = usePage().props;
    const [previewImage, setPreviewImage] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [viewProduct, setViewProduct] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) showToast('success', 'Success', flash.success);
        if (flash?.error) showToast('error', 'Error', flash.error);
        if (flash?.info) showToast('info', 'Info', flash.info);
    }, [flash]);

    const confirmDelete = (product) => {
        confirmDialog({
            header: 'Delete Product',
            message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-secondary',
            accept: () => {
                router.delete(route('admin.products.destroy', product.id), {
                    preserveScroll: true,
                    onError: () => showToast('error', 'Error', 'Failed to delete product.'),
                });
            },
            reject: () => {
                showToast('info', 'Cancelled', 'Deletion cancelled.');
            }
        });
    };

    const getStockBadge = (product) => {
        if (product.sizes && product.sizes.length > 0) {
            const totalStock = product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
            const sizeCount = product.sizes.length;

            if (totalStock > 10) {
                return {
                    text: `${totalStock} total (${sizeCount} sizes)`,
                    className: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700'
                };
            } else if (totalStock > 0) {
                return {
                    text: `${totalStock} total (${sizeCount} sizes)`,
                    className: 'bg-amber-900/30 text-amber-400 border border-amber-700'
                };
            } else {
                return {
                    text: 'Out of stock',
                    className: 'bg-red-900/30 text-red-400 border border-red-700'
                };
            }
        }

        const stock = product.inventory?.stock || 0;
        if (stock > 10) {
            return { text: `${stock} in stock`, className: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700' };
        } else if (stock > 0) {
            return { text: `${stock} in stock`, className: 'bg-amber-900/30 text-amber-400 border border-amber-700' };
        } else {
            return { text: 'Out of stock', className: 'bg-red-900/30 text-red-400 border border-red-700' };
        }
    };

    const openImagePreview = (imageUrl) => {
        setPreviewImage(imageUrl);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setPreviewImage(null);
    };

    const openViewModal = (product) => {
        setViewProduct(product);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewProduct(null);
    };

    return (
        <AdminLayout>
            <Head title="Admin - Products" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Products</h1>
                            <p className="text-stone-400 mt-1">Manage your furniture collection</p>
                        </div>
                        <Link
                            href={route('admin.products.create')}
                            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                        >
                            Add New Product
                        </Link>
                    </div>

                    {/* Products Table */}
                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Image</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-black divide-y divide-stone-800">
                                    {products.data.map((product) => {
                                        const stockBadge = getStockBadge(product);
                                        return (
                                            <tr key={product.id} className="hover:bg-stone-900/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {product.first_image_url ? (
                                                        <img
                                                            src={product.first_image_url}
                                                            alt={product.name}
                                                            className="h-12 w-12 object-cover rounded-lg border border-stone-700 cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => openImagePreview(product.first_image_url)}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                                const placeholder = `<div class="h-12 w-12 bg-stone-900 rounded-lg flex items-center justify-center border border-stone-700"><svg class="h-6 w-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>`;
                                                                e.target.parentElement.innerHTML = placeholder;
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 bg-stone-900 rounded-lg flex items-center justify-center border border-stone-700">
                                                            <svg className="h-6 w-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-stone-300">
                                                        {product.category?.name || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-white">{product.name}</div>
                                                    {product.description && (
                                                        <div className="text-sm text-stone-400 truncate max-w-xs mt-1">{product.description}</div>
                                                    )}
                                                    {product.sizes && product.sizes.length > 0 && (
                                                        <div className="text-xs text-stone-500 mt-1">
                                                            {product.sizes.length} size variant(s)
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-400 font-medium">
                                                    ₱{product.base_price}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${stockBadge.className}`}>
                                                        {stockBadge.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                    <button
                                                        onClick={() => openViewModal(product)}
                                                        className="text-blue-500 hover:text-blue-400 transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    <Link
                                                        href={route('admin.products.edit', product.id)}
                                                        className="text-amber-500 hover:text-amber-400 transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => confirmDelete(product)}
                                                        className="text-red-500 hover:text-red-400 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
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
                                            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
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

            {/* Image Preview Modal */}
            <Dialog
                header="Image Preview"
                visible={isImageModalOpen}
                style={{ width: 'auto', maxWidth: '90vw' }}
                onHide={closeImageModal}
                className="bg-black border border-stone-800 rounded-lg"
                footer={null}
            >
                <div className="flex justify-center p-4">
                    <img
                        src={previewImage}
                        alt="Product preview"
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    />
                </div>
            </Dialog>

            {/* Product Details Modal */}
            <ProductDetailsModal
                product={viewProduct}
                isOpen={isViewModalOpen}
                onClose={closeViewModal}
            />
        </AdminLayout>
    );
}
