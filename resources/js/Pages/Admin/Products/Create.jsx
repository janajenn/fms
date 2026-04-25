import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import ProductForm from '@/Components/ProductForm';

export default function Create({ categories, customizationCategories }) {
    return (
        <AdminLayout>
            <Head title="Create Product" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-white">Create New Product</h1>
                        <p className="text-stone-400 mt-1">Add a new product to your furniture collection</p>
                    </div>
                    <ProductForm
                        categories={categories}
                        customizationCategories={customizationCategories}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
