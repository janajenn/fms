import { useState, useEffect } from 'react';

export default function DynamicCustomizationSection({ category, options, selectedOptions, onUpdate }) {
    const [mergedOptions, setMergedOptions] = useState(() => {
        return options.map(opt => {
            const selectedOpt = selectedOptions.find(s => s.id === opt.id);
            return {
                ...opt,
                selected: selectedOpt ? selectedOpt.selected : false,
                price_modifier: selectedOpt ? selectedOpt.price_modifier : opt.price_modifier,
            };
        });
    });

    useEffect(() => {
        const newMerged = options.map(opt => {
            const selectedOpt = selectedOptions.find(s => s.id === opt.id);
            return {
                ...opt,
                selected: selectedOpt ? selectedOpt.selected : false,
                price_modifier: selectedOpt ? selectedOpt.price_modifier : opt.price_modifier,
            };
        });
        setMergedOptions(newMerged);
    }, [selectedOptions, options]);

    const toggleOption = (optionId) => {
        const updated = mergedOptions.map(opt =>
            opt.id === optionId ? { ...opt, selected: !opt.selected } : opt
        );
        setMergedOptions(updated);
        const toSend = updated
            .filter(opt => opt.selected)
            .map(opt => ({
                id: opt.id,
                name: opt.name,
                price_modifier: opt.price_modifier,
                selected: opt.selected,
            }));
        onUpdate(category.id, toSend);
    };

    const updatePrice = (optionId, newPrice) => {
        const updated = mergedOptions.map(opt =>
            opt.id === optionId ? { ...opt, price_modifier: parseFloat(newPrice) || 0 } : opt
        );
        setMergedOptions(updated);
        const toSend = updated
            .filter(opt => opt.selected)
            .map(opt => ({
                id: opt.id,
                name: opt.name,
                price_modifier: opt.price_modifier,
                selected: opt.selected,
            }));
        onUpdate(category.id, toSend);
    };

    const selectedCount = mergedOptions.filter(opt => opt.selected).length;

    // Helper function to extract numeric value from string (e.g., "100.00" or "100.00 meters")
    const extractNumber = (value) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const match = value.match(/(\d+(?:\.\d+)?)/);
            return match ? parseFloat(match[1]) : NaN;
        }
        return NaN;
    };

    // Check if material has sufficient stock for 1 unit of product
    const isMaterialAvailable = (option) => {
        if (!option.material) return true;

        const stock = extractNumber(option.material.stock);
        const quantityUsed = extractNumber(option.quantity_used || 1);

        if (isNaN(stock) || stock <= 0) return false;
        if (stock < quantityUsed) return false;
        return true;
    };

    // Get status text based on material stock
    const getMaterialStatusText = (option) => {
        if (!option.material) return null;

        const stock = extractNumber(option.material.stock);
        const quantityUsed = extractNumber(option.quantity_used || 1);
        const minStock = extractNumber(option.material.minimum_stock);

        if (isNaN(stock) || stock <= 0) return 'Out of Stock';
        if (stock < quantityUsed) return 'Insufficient Stock';
        if (!isNaN(minStock) && stock <= minStock) return 'Low Stock';
        return null;
    };

    // Get CSS class based on material stock status
    const getMaterialStatusClass = (option) => {
        if (!option.material) return '';

        const stock = extractNumber(option.material.stock);
        const quantityUsed = extractNumber(option.quantity_used || 1);
        const minStock = extractNumber(option.material.minimum_stock);

        if (isNaN(stock) || stock <= 0) return 'text-red-500';
        if (stock < quantityUsed) return 'text-red-500';
        if (!isNaN(minStock) && stock <= minStock) return 'text-yellow-500';
        return 'text-green-500';
    };

    // Get formatted stock display (e.g., "100.00 meters")
    const getStockDisplay = (option) => {
        if (!option.material) return null;
        const stock = extractNumber(option.material.stock);
        if (isNaN(stock)) return null;
        return `${stock.toFixed(2)} ${option.material.unit}`;
    };

    // In your DynamicCustomizationSection component
const handleOptionToggle = (optionId) => {
    const updatedOptions = options.map(opt =>
        opt.id === optionId
            ? { ...opt, selected: !opt.selected }
            : opt
    );

    onUpdate(category.id, updatedOptions);
};

    const isColorCategory = category.slug === 'fabric-colors' || category.slug === 'paint-colors';

    // Color Category Display (with color swatches)
    if (isColorCategory) {
        return (
            <div className="bg-black border border-stone-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">{category.name}</h3>
                    {selectedCount > 0 && (
                        <span className="text-xs text-amber-500 bg-amber-900/30 px-2 py-1 rounded">
                            {selectedCount} selected
                        </span>
                    )}
                </div>
                <p className="text-sm text-stone-400 mb-4">{category.description}</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-3">
                    {mergedOptions.map(option => {
                        const materialAvailable = isMaterialAvailable(option);
                        const statusText = getMaterialStatusText(option);
                        const statusClass = getMaterialStatusClass(option);
                        const stockDisplay = getStockDisplay(option);

                        return (
                            <label
                                key={option.id}
                                onDoubleClick={() => materialAvailable && toggleOption(option.id)}
                                className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all ${
                                    !materialAvailable ? 'opacity-50 cursor-not-allowed' : ''
                                } ${
                                    option.selected
                                        ? 'border-amber-500 bg-amber-900/20'
                                        : 'border-stone-700 bg-stone-900 hover:border-stone-600'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={option.selected}
                                    onChange={() => materialAvailable && toggleOption(option.id)}
                                    disabled={!materialAvailable}
                                    className="absolute opacity-0"
                                />
                                <div
                                    className="w-10 h-10 rounded-full border-2 border-stone-600 shadow-sm transition-transform hover:scale-110"
                                    style={{ backgroundColor: option.color_code || '#cccccc' }}
                                />
                                <span className="text-xs text-stone-300 mt-2 text-center truncate w-full">
                                    {option.name}
                                </span>
                                {stockDisplay && (
                                    <span className={`text-xs mt-1 ${statusClass}`}>
                                        {stockDisplay}
                                    </span>
                                )}
                                {statusText && (
                                    <span className={`text-xs mt-1 ${statusClass}`}>
                                        ⚠️ {statusText}
                                    </span>
                                )}
                                {option.selected && (
                                    <div className="absolute top-1 right-1">
                                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </label>
                        );
                    })}
                </div>
                <div className="mt-4 text-xs text-stone-500 text-center">
                    💡 Click to select, double-click to quickly toggle | Stock levels shown below each color
                </div>
            </div>
        );
    }

    // Regular Display (non-color categories with checkboxes)
    return (
        <div className="bg-black border border-stone-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-white">{category.name}</h3>
                {selectedCount > 0 && (
                    <span className="text-xs text-amber-500 bg-amber-900/30 px-2 py-1 rounded">
                        {selectedCount} selected
                    </span>
                )}
            </div>
            <p className="text-sm text-stone-400 mb-4">{category.description}</p>
            <div className="space-y-3">
                {mergedOptions.map(option => {
                    const materialAvailable = isMaterialAvailable(option);
                    const statusText = getMaterialStatusText(option);
                    const statusClass = getMaterialStatusClass(option);
                    const stockDisplay = getStockDisplay(option);

                    return (
                        <div
                            key={option.id}
                            className={`flex items-start space-x-4 p-4 bg-stone-900 rounded-lg border transition-all ${
                                option.selected ? 'border-amber-500' : 'border-stone-800'
                            } ${!materialAvailable ? 'opacity-60' : ''}`}
                        >
                            <input
                                type="checkbox"
                                checked={option.selected}
                                onChange={() => materialAvailable && toggleOption(option.id)}
                                onDoubleClick={() => materialAvailable && toggleOption(option.id)}
                                disabled={!materialAvailable}
                                className="mt-1 text-amber-600 focus:ring-amber-500 bg-stone-800 border-stone-600 rounded"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <div>
                                        <span className="text-sm font-medium text-white">{option.name}</span>
                                        {stockDisplay && (
                                            <span className={`text-xs ml-2 ${statusClass}`}>
                                                ({stockDisplay} available)
                                            </span>
                                        )}
                                        {statusText && (
                                            <span className={`text-xs ml-2 ${statusClass}`}>
                                                ⚠️ {statusText}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-stone-400">+₱</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={option.price_modifier}
                                            onChange={(e) => updatePrice(option.id, e.target.value)}
                                            className="w-24 rounded-md bg-black border-stone-700 text-white text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                            disabled={!option.selected}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-stone-400 mt-1">{option.description}</p>
                                {option.material && option.quantity_used > 0 && (
                                    <p className="text-xs text-stone-500 mt-1">
                                        Uses: {parseFloat(option.quantity_used).toFixed(2)} {option.material.unit} per unit
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 text-xs text-stone-500 text-center">
                💡 Click to select, double-click to quickly toggle | Stock levels shown next to each option
            </div>
        </div>
    );
}
