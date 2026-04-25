import { useState } from 'react';

export default function SizeManager({ sizes = [], unit = 'cm', onChange }) {
    const [sizeList, setSizeList] = useState(sizes);
    const [isExpanded, setIsExpanded] = useState(true);

    const sizeTypes = [
        { value: 'cm', label: 'Centimeters (cm)' },
        { value: 'inches', label: 'Inches (in)' },
        { value: 'mm', label: 'Millimeters (mm)' },
    ];

    const addSize = () => {
        const newSize = {
            id: null,
            size: '',
            size_type: unit,
            additional_price: 0,
            stock: 0,
        };
        const updated = [...sizeList, newSize];
        setSizeList(updated);
        onChange(updated);
    };

    const updateSize = (index, field, value) => {
        const updated = [...sizeList];
        updated[index][field] = value;
        setSizeList(updated);
        onChange(updated);
    };

    const removeSize = (index) => {
        const updated = sizeList.filter((_, i) => i !== index);
        setSizeList(updated);
        onChange(updated);
    };

    const getTotalStock = () => {
        return sizeList.reduce((sum, size) => sum + (parseInt(size.stock) || 0), 0);
    };

    return (
        <div className="bg-black border border-stone-800 rounded-lg p-6">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between mb-4"
            >
                <div>
                    <h2 className="text-lg font-medium text-white">Product Sizes & Variations</h2>
                    {sizeList.length > 0 && (
                        <p className="text-xs text-stone-500 mt-1">
                            Total stock across all sizes: {getTotalStock()} units
                        </p>
                    )}
                </div>
                <svg
                    className={`w-5 h-5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="space-y-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-stone-400 mb-2">
                            Default Size Unit
                        </label>
                        <select
                            value={unit}
                            onChange={(e) => {
                                // Update unit for all existing sizes
                                const updatedSizes = sizeList.map(size => ({
                                    ...size,
                                    size_type: e.target.value
                                }));
                                setSizeList(updatedSizes);
                                onChange(updatedSizes);
                            }}
                            className="w-48 rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        >
                            {sizeTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-stone-400">
                            Available Sizes
                        </label>
                        <button
                            type="button"
                            onClick={addSize}
                            className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
                        >
                            + Add Size
                        </button>
                    </div>

                    {sizeList.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-stone-700 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-stone-400 mt-2">No sizes added yet</p>
                            <p className="text-xs text-stone-500 mt-1">
                                Add sizes if this product has multiple size variations
                            </p>
                            <button
                                type="button"
                                onClick={addSize}
                                className="mt-3 text-amber-500 hover:text-amber-400 text-sm font-medium"
                            >
                                Add your first size
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Size Table Header */}
                            <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-stone-900 rounded-lg text-xs font-medium text-stone-400">
                                <div className="col-span-5">Size Description</div>
                                <div className="col-span-2">Unit</div>
                                <div className="col-span-2">Add. Price (₱)</div>
                                <div className="col-span-2">Stock</div>
                                <div className="col-span-1">Actions</div>
                            </div>

                            {sizeList.map((size, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-start bg-stone-900 p-4 rounded-lg border border-stone-800">
                                    <div className="col-span-5">
                                        <input
                                            type="text"
                                            placeholder="e.g., 80x60x40 cm, Diameter 50 cm, Length 120 cm"
                                            value={size.size}
                                            onChange={(e) => updateSize(index, 'size', e.target.value)}
                                            className="w-full rounded-md bg-black border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <select
                                            value={size.size_type}
                                            onChange={(e) => updateSize(index, 'size_type', e.target.value)}
                                            className="w-full rounded-md bg-black border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        >
                                            {sizeTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={size.additional_price}
                                            onChange={(e) => updateSize(index, 'additional_price', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-md bg-black border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={size.stock}
                                            onChange={(e) => updateSize(index, 'stock', parseInt(e.target.value) || 0)}
                                            className="w-full rounded-md bg-black border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div className="col-span-1">
                                        <button
                                            type="button"
                                            onClick={() => removeSize(index)}
                                            className="text-red-500 hover:text-red-400 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-xs text-stone-500 bg-stone-900 p-3 rounded-lg">
                        <span className="text-amber-500">💡 Tip:</span> Enter dimensions like "80x60x40" for rectangular pieces,
                        "Diameter 50" for round pieces, or "Length 120" for linear measurements.
                        Each size can have its own price adjustment and stock count.
                    </div>
                </div>
            )}
        </div>
    );
}
