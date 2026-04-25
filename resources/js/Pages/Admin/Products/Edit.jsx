import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import ProductForm from '@/Components/ProductForm';

export default function Edit({ product, categories, customizationCategories, selectedCustomizations }) {
    return (
        <AdminLayout>
            <Head title={`Edit Product - ${product.name}`} />
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-white">Edit Product</h1>
                        <p className="text-stone-400 mt-1">Update product information and options</p>
                    </div>
                    <ProductForm
                        product={product}
                        categories={categories}
                        customizationCategories={customizationCategories}
                        selectedCustomizations={selectedCustomizations}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
