export default function PaintColorSelector({ value, onChange, options }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {options.map(option => (
                    <label
                        key={option.id}
                        className={`relative flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all ${
                            value === option.id
                                ? 'border-amber-500 bg-amber-900/20'
                                : 'border-stone-700 bg-stone-900 hover:border-stone-600'
                        }`}
                    >
                        <input
                            type="radio"
                            name="paint_color"
                            value={option.id}
                            checked={value === option.id}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute opacity-0"
                        />
                        <div
                            className="w-16 h-16 rounded-lg border-2 border-stone-600 mb-2"
                            style={{ backgroundColor: option.color_code }}
                        />
                        <span className="text-sm font-medium text-white text-center">
                            {option.name}
                        </span>
                        <span className="text-xs text-stone-400 capitalize mt-1">
                            {option.finish}
                        </span>
                        {option.price_modifier > 0 && (
                            <span className="text-xs text-amber-500 mt-1">
                                +₱{option.price_modifier}
                            </span>
                        )}
                    </label>
                ))}
            </div>
        </div>
    );
}
