export default function FinishTypeSelector({ value, onChange, options }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {options.map(option => (
                    <label
                        key={option.id}
                        className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                            value === option.id
                                ? 'border-amber-500 bg-amber-900/20'
                                : 'border-stone-700 bg-stone-900 hover:border-stone-600'
                        }`}
                    >
                        <input
                            type="radio"
                            name="finish_type"
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
                            <p className="text-xs text-stone-500 mt-1">
                                Sheen: {option.sheen_level}
                            </p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}
