import { Tooltip } from 'primereact/tooltip';

export default function ActionButtons({
    onView,
    onEdit,
    onDelete,
    onRestore = null,
    onStockIn = null,
    onStockOut = null,
    onAlert = null,  // Add this
    isDeleted = false,
    showView = true,
    showEdit = true,
    showDelete = true,
    showRestore = false,
    showStockIn = false,
    showStockOut = false,
    showAlert = false  // Add this
}) {
    return (
        <div className="flex items-center gap-2">
            {showView && onView && (
                <>
                    <button
                        onClick={onView}
                        className="text-blue-500 hover:text-blue-400 transition-colors"
                        data-pr-tooltip="View Details"
                        data-pr-position="top"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <Tooltip target="[data-pr-tooltip]" />
                </>
            )}

            {showEdit && onEdit && (
                <>
                    <button
                        onClick={onEdit}
                        className="text-amber-500 hover:text-amber-400 transition-colors"
                        data-pr-tooltip="Edit"
                        data-pr-position="top"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <Tooltip target="[data-pr-tooltip]" />
                </>
            )}

            {showStockIn && onStockIn && (
                <>
                    <button
                        onClick={onStockIn}
                        className="text-emerald-500 hover:text-emerald-400 transition-colors"
                        data-pr-tooltip="Stock In"
                        data-pr-position="top"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <Tooltip target="[data-pr-tooltip]" />
                </>
            )}

            {showStockOut && onStockOut && (
                <>
                    <button
                        onClick={onStockOut}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        data-pr-tooltip="Stock Out"
                        data-pr-position="top"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <Tooltip target="[data-pr-tooltip]" />
                </>
            )}

            {/* New Alert Button */}
            {showAlert && onAlert && (
                <>
                    <button
                        onClick={onAlert}
                        className="text-amber-500 hover:text-amber-400 transition-colors"
                        data-pr-tooltip="Set Alert Level"
                        data-pr-position="top"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </button>
                    <Tooltip target="[data-pr-tooltip]" />
                </>
            )}

            {showRestore && onRestore && (
                <>
                    <button
                        onClick={onRestore}
                        className="text-green-500 hover:text-green-400 transition-colors"
                        data-pr-tooltip="Restore"
                        data-pr-position="top"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <Tooltip target="[data-pr-tooltip]" />
                </>
            )}

            {showDelete && onDelete && !isDeleted && (
                <>
                    <button
                        onClick={onDelete}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        data-pr-tooltip="Archive"
                        data-pr-position="top"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <Tooltip target="[data-pr-tooltip]" />
                </>
            )}
        </div>
    );
}
