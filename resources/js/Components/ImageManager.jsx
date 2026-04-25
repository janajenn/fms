import { useRef, useState } from 'react';
import { confirmDialog } from 'primereact/confirmdialog';
import { router } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';

export default function ImageManager({ images = [], existingImages = [], onImagesChange, productId = null }) {
    const [imagePreviews, setImagePreviews] = useState(
        images.map(img => URL.createObjectURL(img))
    );
    const [deletingImages, setDeletingImages] = useState([]);
    const [replacingImage, setReplacingImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef();
    const replaceInputRef = useRef();
    const { showToast } = useToast();

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = [...images, ...files];
        onImagesChange(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onImagesChange(newImages);

        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const confirmDeleteExistingImage = (image) => {
        confirmDialog({
            header: 'Delete Image',
            message: `Are you sure you want to delete this image? This action cannot be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-secondary',
            accept: () => {
                deleteExistingImage(image.id);
            },
            reject: () => {
                showToast('info', 'Cancelled', 'Image deletion cancelled.');
            }
        });
    };

    const deleteExistingImage = (imageId) => {
        setDeletingImages(prev => [...prev, imageId]);

        router.delete(`/admin/products/images/${imageId}`, {
            preserveScroll: true,
            onSuccess: () => {
                // The flash message from controller will show via toast
                // We'll reload the page to refresh the images
                router.reload();
            },
            onError: () => {
                setDeletingImages(prev => prev.filter(id => id !== imageId));
                showToast('error', 'Error', 'Failed to delete image.');
            },
        });
    };

    const confirmReplaceImage = (image) => {
        confirmDialog({
            header: 'Replace Image',
            message: `Are you sure you want to replace this image? The current image will be permanently deleted.`,
            icon: 'pi pi-refresh',
            acceptClassName: 'p-button-warning',
            rejectClassName: 'p-button-secondary',
            accept: () => {
                setReplacingImage(image);
                setTimeout(() => {
                    replaceInputRef.current?.click();
                }, 100);
            },
            reject: () => {
                showToast('info', 'Cancelled', 'Image replacement cancelled.');
            }
        });
    };

    const handleReplaceImage = (e) => {
        const file = e.target.files[0];
        if (!file || !replacingImage) return;

        setIsSubmitting(true);
        setDeletingImages(prev => [...prev, replacingImage.id]);

        // Create FormData for the upload
        const formData = new FormData();
        formData.append('image', file);
        formData.append('_method', 'POST');

        // First, delete the existing image
        router.delete(`/admin/products/images/${replacingImage.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                // After deletion, upload the new image
                router.post(`/admin/products/${productId}/images`, formData, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsSubmitting(false);
                        setDeletingImages(prev => prev.filter(id => id !== replacingImage.id));
                        setReplacingImage(null);
                        if (replaceInputRef.current) replaceInputRef.current.value = '';
                        // Reload to show the new image
                        router.reload();
                    },
                    onError: () => {
                        setIsSubmitting(false);
                        setDeletingImages(prev => prev.filter(id => id !== replacingImage.id));
                        setReplacingImage(null);
                        showToast('error', 'Error', 'Failed to upload new image.');
                    }
                });
            },
            onError: () => {
                setIsSubmitting(false);
                setDeletingImages(prev => prev.filter(id => id !== replacingImage.id));
                setReplacingImage(null);
                showToast('error', 'Error', 'Failed to delete old image.');
            }
        });
    };

    return (
        <div className="bg-black border border-stone-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Product Images</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-stone-400 mb-2">
                    Upload New Images
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-700 border-dashed rounded-md hover:border-amber-500 transition-colors">
                    <div className="space-y-1 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-stone-500"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="flex text-sm text-stone-400">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md font-medium text-amber-500 hover:text-amber-400"
                            >
                                <span>Upload files</span>
                                <input
                                    id="file-upload"
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="sr-only"
                                />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-stone-500">PNG, JPG, GIF up to 2MB each</p>
                    </div>
                </div>
            </div>

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-stone-400 mb-2">New Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border border-stone-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Existing Images */}
            {existingImages.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-stone-400 mb-2">Existing Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((image) => (
                            <div key={image.id} className="relative group">
                                <img
                                    src={`/storage/${image.image_path}`}
                                    alt="Existing"
                                    className="w-full h-32 object-cover rounded-lg border border-stone-700"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => confirmReplaceImage(image)}
                                        disabled={isSubmitting}
                                        className="bg-amber-600 text-white rounded-full p-2 hover:bg-amber-700 transition-colors disabled:opacity-50"
                                        title="Replace image"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => confirmDeleteExistingImage(image)}
                                        disabled={deletingImages.includes(image.id)}
                                        className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                                        title="Delete image"
                                    >
                                        {deletingImages.includes(image.id) ? (
                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hidden file input for replace functionality */}
            <input
                type="file"
                ref={replaceInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleReplaceImage}
            />
        </div>
    );
}
