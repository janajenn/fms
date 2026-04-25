import { useState } from 'react';

export default function WoodFinishSelector({ value, onChange, options }) {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'All Finishes' },
        { id: 'natural', name: 'Natural Finishes' },
        { id: 'stain', name: 'Wood Stains' }
    ];

    const filteredOptions = selectedCategory === 'all'
        ? options
        : options.filter(opt => opt.category === selectedCategory);

    const handleSelect = (optionId) => {
        onChange(optionId === value ? '' : optionId);
    };

    return (
        <div className="space-y-4">
            {/* Category Filters */}
            <div className="flex gap-2 border-b border-stone-800 pb-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            selectedCategory === cat.id
                                ? 'bg-amber-600 text-white'
                                : 'text-stone-400 hover:text-stone-200'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredOptions.map(option => (
                    <label
                        key={option.id}
                        onDoubleClick={() => handleSelect(option.id)}
                        className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                            value === option.id
                                ? 'border-amber-500 bg-amber-900/20'
                                : 'border-stone-700 bg-stone-900 hover:border-stone-600'
                        }`}
                    >
                        <input
                            type="radio"
                            name="wood_finish"
                            value={option.id}
                            checked={value === option.id}
                            onChange={(e) => onChange(e.target.value)}
                            className="mt-1 text-amber-600 focus:ring-amber-500 bg-stone-800 border-stone-600"
                        />
                        <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white">
                                    {option.name}
                                </span>
                                {option.price_modifier > 0 && (
                                    <span className="text-xs text-amber-500">
                                        +₱{option.price_modifier}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-stone-400 mt-1">
                                {option.description}
                            </p>
                        </div>
                    </label>
                ))}
            </div>
            <p className="text-xs text-stone-500 mt-2">
                💡 Tip: Double-click to select/deselect
            </p>
        </div>
    );
}
