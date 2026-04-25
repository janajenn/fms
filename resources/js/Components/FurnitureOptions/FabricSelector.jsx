import { useState } from 'react';

export default function FabricSelector({
    selectedFabrics = [],
    selectedColors = [],
    onFabricChange,
    onColorChange,
    fabricOptions,
    colorOptions
}) {
    const [selectedFabricIds, setSelectedFabricIds] = useState(selectedFabrics);
    const [selectedColorIds, setSelectedColorIds] = useState(selectedColors);

    const handleFabricToggle = (fabricId) => {
        const updated = selectedFabricIds.includes(fabricId)
            ? selectedFabricIds.filter(id => id !== fabricId)
            : [...selectedFabricIds, fabricId];
        setSelectedFabricIds(updated);
        onFabricChange(fabricId); // Pass the fabricId to parent for toggling
    };

    const handleColorToggle = (colorId) => {
        const updated = selectedColorIds.includes(colorId)
            ? selectedColorIds.filter(id => id !== colorId)
            : [...selectedColorIds, colorId];
        setSelectedColorIds(updated);
        onColorChange(colorId); // Pass the colorId to parent for toggling
    };

    return (
        <div className="space-y-6">
            {/* Fabric Type Selection - Checkboxes */}
            <div>
                <label className="block text-sm font-medium text-stone-400 mb-3">
                    Select Fabric Types (Multiple options available)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fabricOptions.map(fabric => (
                        <label
                            key={fabric.id}
                            onDoubleClick={() => handleFabricToggle(fabric.id)}
                            className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                                selectedFabrics.includes(fabric.id)
                                    ? 'border-amber-500 bg-amber-900/20'
                                    : 'border-stone-700 bg-stone-900 hover:border-stone-600'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedFabrics.includes(fabric.id)}
                                onChange={() => handleFabricToggle(fabric.id)}
                                className="mt-1 text-amber-600 focus:ring-amber-500 bg-stone-800 border-stone-600 rounded"
                            />
                            <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white">
                                        {fabric.name}
                                    </span>
                                    {fabric.price_modifier > 0 && (
                                        <span className="text-xs text-amber-500">
                                            +₱{fabric.price_modifier}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-stone-400 mt-1">
                                    {fabric.description}
                                </p>
                                <div className="flex gap-2 mt-2 text-xs">
                                    <span className="text-stone-500">
                                        Durability: {fabric.durability}
                                    </span>
                                    <span className="text-stone-500">
                                        Care: {fabric.care}
                                    </span>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Color Selection - Show if any fabric is selected */}
            {selectedFabrics.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-stone-400 mb-3">
                        Select Fabric Colors (Multiple options available)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {colorOptions.colors.map(color => (
                            <label
                                key={color.id}
                                onDoubleClick={() => color.stock && handleColorToggle(color.id)}
                                className={`relative flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                    !color.stock ? 'opacity-50 cursor-not-allowed' : ''
                                } ${
                                    selectedColors.includes(color.id)
                                        ? 'border-amber-500 bg-amber-900/20'
                                        : 'border-stone-700 bg-stone-900 hover:border-stone-600'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedColors.includes(color.id)}
                                    onChange={() => color.stock && handleColorToggle(color.id)}
                                    disabled={!color.stock}
                                    className="absolute opacity-0"
                                />
                                <div
                                    className="w-12 h-12 rounded-full border-2 border-stone-600 mb-2"
                                    style={{ backgroundColor: color.color_code }}
                                />
                                <span className="text-xs font-medium text-white text-center">
                                    {color.name}
                                </span>
                                {!color.stock && (
                                    <span className="text-xs text-red-500 mt-1">
                                        Out of Stock
                                    </span>
                                )}
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-stone-500 mt-2">
                        💡 Tip: Double-click to select/deselect
                    </p>
                </div>
            )}
        </div>
    );
}
