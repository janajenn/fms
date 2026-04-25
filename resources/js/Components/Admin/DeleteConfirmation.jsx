import { confirmDialog } from 'primereact/confirmdialog';
import { router } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';

export default function DeleteConfirmation({ item, onSuccess }) {
    const { showToast } = useToast();

    const confirmDelete = () => {
        confirmDialog({
            header: 'Delete Material',
            message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-secondary',
            accept: () => {
                router.delete(route('admin.materials.destroy', item.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('success', 'Deleted', 'Material deleted successfully.');
                        if (onSuccess) onSuccess();
                        router.reload();
                    },
                    onError: () => {
                        showToast('error', 'Error', 'Failed to delete material. It may be in use.');
                    },
                });
            },
        });
    };

    return { confirmDelete };
}
