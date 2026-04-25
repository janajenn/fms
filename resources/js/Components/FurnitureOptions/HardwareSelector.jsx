import { useState } from 'react';

export default function HardwareSelector({ knobValue, legValue, onKnobChange, onLegChange, hardwareOptions }) {
    const [activeCategory, setActiveCategory] = useState('knobs_handles');

    const categories = [
        { id: 'knobs_handles', name: 'Knobs & Handles' },
        { id: 'leg_styles', name: 'Leg Styles' }
    ];

    const currentCategory = hardwareOptions.categories[activeCategory];

    return (
        <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex gap-2 border-b border-stone-800">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeCategory === cat.id
                                ? 'text-amber-500 border-b-2 border-amber-500'
                                : 'text-stone-400 hover:text-stone-200'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Current Category Options */}
            <div>
                <div className="mb-3">
                    <h4 className="text-sm font-medium text-white">
                        {currentCategory.name}
                    </h4>
                    <p className="text-xs text-stone-400 mt-1">
                        {currentCategory.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {currentCategory.options.map(option => (
                        <label
                            key={option.id}
                            className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                                (activeCategory === 'knobs_handles' && knobValue === option.id) ||
                                (activeCategory === 'leg_styles' && legValue === option.id)
                                    ? 'border-amber-500 bg-amber-900/20'
                                    : 'border-stone-700 bg-stone-900 hover:border-stone-600'
                            }`}
                        >
                            <input
                                type="radio"
                                name={activeCategory === 'knobs_handles' ? 'knobs' : 'legs'}
                                value={option.id}
                                checked={
                                    (activeCategory === 'knobs_handles' && knobValue === option.id) ||
                                    (activeCategory === 'leg_styles' && legValue === option.id)
                                }
                                onChange={(e) => {
                                    if (activeCategory === 'knobs_handles') {
                                        onKnobChange(e.target.value);
                                    } else {
                                        onLegChange(e.target.value);
                                    }
                                }}
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
                                <p className="text-xs text-stone-500 mt-1 capitalize">
                                    Style: {option.style}
                                </p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
