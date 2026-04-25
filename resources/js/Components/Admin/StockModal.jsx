import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { router } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';

export default function StockModal({ isOpen, onClose, material, stockType }) {
    const { showToast } = useToast();
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!quantity || quantity <= 0) {
            showToast('error', 'Error', 'Please enter a valid quantity.');
            return;
        }

        setIsSubmitting(true);

        const url = stockType === 'in'
            ? route('admin.materials.stock.in', material.id)
            : route('admin.materials.stock.out', material.id);

        router.post(url, { quantity, reason }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                showToast('success', 'Success', `Stock ${stockType === 'in' ? 'added' : 'removed'} successfully.`);
                onClose();
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                showToast('error', 'Error', 'Failed to update stock.');
            },
        });
    };

    const modalFooter = () => (
        <div className="flex justify-end gap-2">
            <button
                onClick={onClose}
                className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-900"
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Processing...' : `Stock ${stockType === 'in' ? 'In' : 'Out'}`}
            </button>
        </div>
    );

    if (!material) return null;

    return (
        <Dialog
            header={`Stock ${stockType === 'in' ? 'In' : 'Out'} - ${material.name}`}
            visible={isOpen}
            onHide={onClose}
            style={{ width: '450px' }}
            footer={modalFooter}
            className="bg-black border border-stone-800 rounded-lg"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-stone-400 mb-1">
                        Quantity ({material.unit}) *
                    </label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0.01"
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
                        placeholder="e.g., New shipment, Damaged, Production, etc."
                        className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                    />
                </div>
                <div className="text-xs text-stone-500 bg-stone-900 p-2 rounded">
                    Current stock: {material.stock || 0} {material.unit}
                </div>
            </div>
        </Dialog>
    );
}
