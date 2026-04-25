import { useState } from 'react';

export default function CustomizationOptions({ attributes = [], selectedValues = [], onChange }) {
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (attributeId) => {
        setExpandedSections(prev => ({
            ...prev,
            [attributeId]: !prev[attributeId]
        }));
    };

    const handleCheckboxChange = (attributeId, valueId, checked) => {
        let newSelectedValues = [...selectedValues];

        if (checked) {
            newSelectedValues.push(valueId);
        } else {
            newSelectedValues = newSelectedValues.filter(id => id !== valueId);
        }

        onChange(newSelectedValues);
    };

    if (attributes.length === 0) {
        return (
            <div className="bg-black border border-stone-800 rounded-lg p-6">
                <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <p className="text-stone-400 mt-2">No customization options available</p>
                    <p className="text-xs text-stone-500 mt-1">
                        You can add customization options like colors and materials in the settings
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black border border-stone-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">Customization Options</h2>
                <span className="text-xs text-stone-500">
                    {selectedValues.length} option(s) selected
                </span>
            </div>

            <div className="space-y-4">
                {attributes.map(attribute => (
                    <div key={attribute.id} className="border border-stone-800 rounded-lg overflow-hidden">
                        {/* Attribute Header */}
                        <button
                            type="button"
                            onClick={() => toggleSection(attribute.id)}
                            className="w-full flex items-center justify-between p-4 bg-stone-900 hover:bg-stone-800 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${selectedValues.some(id =>
                                    attribute.values.some(v => v.id === id)
                                ) ? 'bg-amber-500' : 'bg-stone-600'}`} />
                                <span className="text-sm font-medium text-white">
                                    {attribute.name}
                                </span>
                                <span className="text-xs text-stone-400">
                                    ({attribute.values.length} options)
                                </span>
                            </div>
                            <svg
                                className={`w-5 h-5 text-stone-400 transition-transform ${expandedSections[attribute.id] ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Attribute Values */}
                        {expandedSections[attribute.id] !== false && (
                            <div className="p-4 bg-black">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {attribute.values.map(value => (
                                        <label
                                            key={value.id}
                                            className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                                                selectedValues.includes(value.id)
                                                    ? 'border-amber-500 bg-amber-900/20'
                                                    : 'border-stone-700 bg-stone-900 hover:border-stone-600'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                value={value.id}
                                                checked={selectedValues.includes(value.id)}
                                                onChange={(e) => handleCheckboxChange(
                                                    attribute.id,
                                                    value.id,
                                                    e.target.checked
                                                )}
                                                className="rounded bg-stone-800 border-stone-600 text-amber-500 focus:ring-amber-500"
                                            />
                                            <span className="ml-2 text-sm text-stone-300">
                                                {value.value}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Selection Tips */}
            <div className="mt-4 pt-4 border-t border-stone-800">
                <div className="text-xs text-stone-500 space-y-1">
                    <p className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Click on attribute headers to expand/collapse options
                    </p>
                    <p className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Select multiple options within each category
                    </p>
                </div>
            </div>
        </div>
    );
}
