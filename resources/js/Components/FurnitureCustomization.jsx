import { useState, useEffect } from 'react';
import WoodFinishSelector from './FurnitureOptions/WoodFinishSelector';
import PaintColorSelector from './FurnitureOptions/PaintColorSelector';
import FinishTypeSelector from './FurnitureOptions/FinishTypeSelector';
import FabricSelector from './FurnitureOptions/FabricSelector';
import HardwareSelector from './FurnitureOptions/HardwareSelector';
import {
    woodFinishOptions,
    paintColorOptions,
    finishTypeOptions,
    fabricOptions,
    fabricColorOptions,
    hardwareOptions
} from '@/Constants/furnitureOptions';

export default function FurnitureCustomization({ value = {}, onChange }) {
    const [selectedOptions, setSelectedOptions] = useState({
        woodFinish: value.woodFinish || '',
        paintColor: value.paintColor || '',
        finishType: value.finishType || '',
        fabrics: value.fabrics || [], // Changed to array for multiple selections
        fabricColors: value.fabricColors || [], // Changed to array for multiple selections
        knobs: value.knobs || '',
        legs: value.legs || ''
    });

    // Update parent when options change
    useEffect(() => {
        onChange(selectedOptions);
    }, [selectedOptions]);

    const updateOption = (key, val) => {
        setSelectedOptions(prev => ({ ...prev, [key]: val }));
    };

    // Handle multiple fabric selection
    const updateFabrics = (fabricId) => {
        setSelectedOptions(prev => {
            const currentFabrics = prev.fabrics;
            const updated = currentFabrics.includes(fabricId)
                ? currentFabrics.filter(id => id !== fabricId)
                : [...currentFabrics, fabricId];
            return { ...prev, fabrics: updated };
        });
    };

    // Handle multiple color selection
    const updateFabricColors = (colorId) => {
        setSelectedOptions(prev => {
            const currentColors = prev.fabricColors;
            const updated = currentColors.includes(colorId)
                ? currentColors.filter(id => id !== colorId)
                : [...currentColors, colorId];
            return { ...prev, fabricColors: updated };
        });
    };

    // Calculate total customization cost
    const calculateTotal = () => {
        let total = 0;

        // Wood finish cost
        const woodFinish = woodFinishOptions.options.find(f => f.id === selectedOptions.woodFinish);
        if (woodFinish) total += woodFinish.price_modifier;

        // Paint color cost
        const paintColor = paintColorOptions.options.find(c => c.id === selectedOptions.paintColor);
        if (paintColor) total += paintColor.price_modifier;

        // Finish type cost
        const finishType = finishTypeOptions.options.find(f => f.id === selectedOptions.finishType);
        if (finishType) total += finishType.price_modifier;

        // Fabric costs (sum all selected fabrics)
        selectedOptions.fabrics.forEach(fabricId => {
            const fabric = fabricOptions.options.find(f => f.id === fabricId);
            if (fabric) total += fabric.price_modifier;
        });

        // Hardware costs
        const knob = hardwareOptions.categories.knobs_handles.options.find(k => k.id === selectedOptions.knobs);
        if (knob) total += knob.price_modifier;

        const leg = hardwareOptions.categories.leg_styles.options.find(l => l.id === selectedOptions.legs);
        if (leg) total += leg.price_modifier;

        return total;
    };

    return (
        <div className="space-y-6">
            {/* Wood Finish Section */}
            <div className="bg-black border border-stone-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-2">{woodFinishOptions.title}</h3>
                <p className="text-sm text-stone-400 mb-4">{woodFinishOptions.description}</p>
                <WoodFinishSelector
                    value={selectedOptions.woodFinish}
                    onChange={(value) => updateOption('woodFinish', value)}
                    options={woodFinishOptions.options}
                />
            </div>

            {/* Paint / Solid Colors Section */}
            <div className="bg-black border border-stone-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-2">{paintColorOptions.title}</h3>
                <p className="text-sm text-stone-400 mb-4">{paintColorOptions.description}</p>
                <PaintColorSelector
                    value={selectedOptions.paintColor}
                    onChange={(value) => updateOption('paintColor', value)}
                    options={paintColorOptions.options}
                />
            </div>

            {/* Finish Type Section */}
            <div className="bg-black border border-stone-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-2">{finishTypeOptions.title}</h3>
                <p className="text-sm text-stone-400 mb-4">{finishTypeOptions.description}</p>
                <FinishTypeSelector
                    value={selectedOptions.finishType}
                    onChange={(value) => updateOption('finishType', value)}
                    options={finishTypeOptions.options}
                />
            </div>

            {/* Fabric & Upholstery Section - Now with checkboxes */}
            <div className="bg-black border border-stone-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-2">{fabricOptions.title}</h3>
                <p className="text-sm text-stone-400 mb-4">{fabricOptions.description}</p>
                <FabricSelector
                    selectedFabrics={selectedOptions.fabrics}
                    selectedColors={selectedOptions.fabricColors}
                    onFabricChange={updateFabrics}
                    onColorChange={updateFabricColors}
                    fabricOptions={fabricOptions.options}
                    colorOptions={fabricColorOptions}
                />
            </div>

            {/* Hardware & Accents Section */}
            <div className="bg-black border border-stone-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-2">{hardwareOptions.title}</h3>
                <p className="text-sm text-stone-400 mb-4">{hardwareOptions.description}</p>
                <HardwareSelector
                    knobValue={selectedOptions.knobs}
                    legValue={selectedOptions.legs}
                    onKnobChange={(value) => updateOption('knobs', value)}
                    onLegChange={(value) => updateOption('legs', value)}
                    hardwareOptions={hardwareOptions}
                />
            </div>

            {/* Summary Card */}
            <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Customization Total:</span>
                    <span className="text-lg font-bold text-amber-500">₱{calculateTotal().toLocaleString()}</span>
                </div>
                <p className="text-xs text-stone-400 mt-2">
                    This will be added to the base price of the product
                </p>
            </div>
        </div>
    );
}
