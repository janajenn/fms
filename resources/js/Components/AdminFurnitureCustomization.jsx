import { useState, useEffect } from 'react';

export default function AdminFurnitureCustomization({ value = {}, onChange }) {
    const [customizations, setCustomizations] = useState({
        woodFinishes: value.woodFinishes || [],
        paintColors: value.paintColors || [],
        finishTypes: value.finishTypes || [],
        fabrics: value.fabrics || [],
        fabricColors: value.fabricColors || [],
        knobs: value.knobs || [],
        legs: value.legs || []
    });

    useEffect(() => {
        onChange(customizations);
    }, [customizations]);

    const updateSelection = (category, itemId) => {
        setCustomizations(prev => ({
            ...prev,
            [category]: prev[category].map(item =>
                item.id === itemId ? { ...item, selected: !item.selected } : item
            )
        }));
    };

    const updatePrice = (category, itemId, newPrice) => {
        setCustomizations(prev => ({
            ...prev,
            [category]: prev[category].map(item =>
                item.id === itemId ? { ...item, price_modifier: parseFloat(newPrice) || 0 } : item
            )
        }));
    };

    return (
        <div className="space-y-6">
            {/* Wood Finish Section */}
            <OptionSection
                title="Wood Finish"
                description="Select available wood finishes and set additional prices"
                options={customizations.woodFinishes}
                onToggle={(id) => updateSelection('woodFinishes', id)}
                onPriceChange={(id, price) => updatePrice('woodFinishes', id, price)}
                showPrice={true}
            />

            {/* Paint Colors Section */}
            <OptionSection
                title="Paint / Solid Colors"
                description="Select available paint colors and set additional prices"
                options={customizations.paintColors}
                onToggle={(id) => updateSelection('paintColors', id)}
                onPriceChange={(id, price) => updatePrice('paintColors', id, price)}
                showPrice={true}
                colorDisplay={true}
            />

            {/* Finish Type Section */}
            <OptionSection
                title="Finish Type"
                description="Select available finish types and set additional prices"
                options={customizations.finishTypes}
                onToggle={(id) => updateSelection('finishTypes', id)}
                onPriceChange={(id, price) => updatePrice('finishTypes', id, price)}
                showPrice={true}
            />

            {/* Fabric Section */}
            <OptionSection
                title="Fabric & Upholstery"
                description="Select available fabric types and set additional prices"
                options={customizations.fabrics}
                onToggle={(id) => updateSelection('fabrics', id)}
                onPriceChange={(id, price) => updatePrice('fabrics', id, price)}
                showPrice={true}
                showDetails={true}
            />

            {/* Fabric Colors Section - Minimal Grid */}
            <div className="bg-black border border-stone-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">Fabric Colors</h3>
                    {customizations.fabricColors.filter(c => c.selected).length > 0 && (
                        <span className="text-xs text-amber-500 bg-amber-900/30 px-2 py-1 rounded">
                            {customizations.fabricColors.filter(c => c.selected).length} selected
                        </span>
                    )}
                </div>
                <p className="text-sm text-stone-400 mb-4">Select available fabric colors</p>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-3">
                    {customizations.fabricColors.map(color => (
                        <label
                            key={color.id}
                            onDoubleClick={() => updateSelection('fabricColors', color.id)}
                            className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all ${
                                !color.stock ? 'opacity-40 cursor-not-allowed' : ''
                            } ${
                                color.selected
                                    ? 'border-amber-500 bg-amber-900/20'
                                    : 'border-stone-700 bg-stone-900 hover:border-stone-600'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={color.selected || false}
                                onChange={() => color.stock && updateSelection('fabricColors', color.id)}
                                disabled={!color.stock}
                                className="absolute opacity-0"
                            />
                            <div
                                className="w-10 h-10 rounded-full border-2 border-stone-600 shadow-sm transition-transform hover:scale-110"
                                style={{ backgroundColor: color.color_code }}
                            />
                            <span className="text-xs text-stone-300 mt-2 text-center truncate w-full">
                                {color.name}
                            </span>
                            {color.selected && (
                                <div className="absolute top-1 right-1">
                                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            {!color.stock && (
                                <span className="text-xs text-red-500 mt-1">Out of Stock</span>
                            )}
                        </label>
                    ))}
                </div>

                {customizations.fabricColors.filter(c => c.selected).length === 0 && (
                    <p className="text-xs text-stone-500 text-center mt-4">
                        💡 Click or double-click on colors to select available options
                    </p>
                )}
            </div>

            {/* Hardware Section */}
            <div className="space-y-4">
                <OptionSection
                    title="Knobs & Handles"
                    description="Select available knob and handle options"
                    options={customizations.knobs}
                    onToggle={(id) => updateSelection('knobs', id)}
                    onPriceChange={(id, price) => updatePrice('knobs', id, price)}
                    showPrice={true}
                />

                <OptionSection
                    title="Leg Styles"
                    description="Select available leg style options"
                    options={customizations.legs}
                    onToggle={(id) => updateSelection('legs', id)}
                    onPriceChange={(id, price) => updatePrice('legs', id, price)}
                    showPrice={true}
                />
            </div>
        </div>
    );
}

// Reusable Option Section Component
function OptionSection({ title, description, options, onToggle, onPriceChange, showPrice = true, showDetails = false, colorDisplay = false }) {
    if (!options || options.length === 0) return null;

    const selectedCount = options.filter(opt => opt.selected).length;

    return (
        <div className="bg-black border border-stone-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-white">{title}</h3>
                {selectedCount > 0 && (
                    <span className="text-xs text-amber-500 bg-amber-900/30 px-2 py-1 rounded">
                        {selectedCount} selected
                    </span>
                )}
            </div>
            <p className="text-sm text-stone-400 mb-4">{description}</p>

            <div className="space-y-3">
                {options.map(option => (
                    <div key={option.id} className={`flex items-start space-x-4 p-4 bg-stone-900 rounded-lg border transition-all ${
                        option.selected ? 'border-amber-500' : 'border-stone-800'
                    }`}>
                        {/* Checkbox */}
                        <input
                            type="checkbox"
                            checked={option.selected || false}
                            onChange={() => onToggle(option.id)}
                            onDoubleClick={() => onToggle(option.id)}
                            className="mt-1 text-amber-600 focus:ring-amber-500 bg-stone-800 border-stone-600 rounded"
                        />

                        {/* Option Details */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center space-x-3">
                                    {colorDisplay && option.color_code && (
                                        <div
                                            className="w-6 h-6 rounded-full border border-stone-600"
                                            style={{ backgroundColor: option.color_code }}
                                        />
                                    )}
                                    <span className="text-sm font-medium text-white">{option.name}</span>
                                </div>

                                {showPrice && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-stone-400">+₱</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={option.price_modifier || 0}
                                            onChange={(e) => onPriceChange(option.id, e.target.value)}
                                            className="w-24 rounded-md bg-black border-stone-700 text-white text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                            disabled={!option.selected}
                                        />
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-stone-400 mt-1">{option.description}</p>

                            {showDetails && option.durability && (
                                <div className="flex gap-3 mt-2 text-xs">
                                    <span className="text-stone-500">Durability: {option.durability}</span>
                                    <span className="text-stone-500">Care: {option.care}</span>
                                </div>
                            )}

                            {option.sheen_level && (
                                <p className="text-xs text-stone-500 mt-1">Sheen: {option.sheen_level}</p>
                            )}

                            {option.style && (
                                <p className="text-xs text-stone-500 mt-1 capitalize">Style: {option.style}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
