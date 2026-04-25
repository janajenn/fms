export const woodFinishOptions = {
    title: 'Wood Finish',
    description: 'Select available wood finishes for this product',
    options: [
        {
            id: 'natural-clear',
            name: 'Natural / Clear Gloss',
            category: 'natural',
            description: 'Preserves the natural wood grain with a protective clear coat',
            price_modifier: 0,
            selected: false
        },
        {
            id: 'dark-walnut',
            name: 'Dark Walnut Stain',
            category: 'stain',
            description: 'Rich, deep brown that highlights the wood grain',
            price_modifier: 50,
            selected: false
        },
        {
            id: 'ebony',
            name: 'Ebony',
            category: 'stain',
            description: 'Sleek, dark finish for a modern, sophisticated look',
            price_modifier: 75,
            selected: false
        },
        {
            id: 'dark-oak',
            name: 'Dark Oak',
            category: 'stain',
            description: 'Warm, rich oak stain with prominent grain pattern',
            price_modifier: 50,
            selected: false
        }
    ]
};

export const paintColorOptions = {
    title: 'Paint / Solid Colors',
    description: 'Select available paint colors for this product',
    options: [
        {
            id: 'matte-black',
            name: 'Matte Black',
            color_code: '#000000',
            finish: 'matte',
            description: 'Sleek, modern black with a non-reflective finish',
            price_modifier: 0,
            selected: false
        },
        {
            id: 'white',
            name: 'White',
            color_code: '#FFFFFF',
            finish: 'semi-gloss',
            description: 'Clean, bright white for a fresh, airy feel',
            price_modifier: 0,
            selected: false
        },
        {
            id: 'sage-green',
            name: 'Sage Green',
            color_code: '#9CAF88',
            finish: 'matte',
            description: 'Soft, calming green that brings nature indoors',
            price_modifier: 25,
            selected: false
        }
    ]
};

export const finishTypeOptions = {
    title: 'Finish Type',
    description: 'Select available finish types for this product',
    options: [
        {
            id: 'matte',
            name: 'Matte',
            description: 'Non-reflective, smooth finish that hides imperfections',
            sheen_level: '0-10%',
            price_modifier: 0,
            selected: false
        },
        {
            id: 'semi-gloss',
            name: 'Semi-Gloss',
            description: 'Moderate sheen, durable and easy to clean',
            sheen_level: '35-45%',
            price_modifier: 25,
            selected: false
        },
        {
            id: 'high-gloss',
            name: 'High-Gloss',
            description: 'High shine, reflective finish for a luxurious look',
            sheen_level: '70-85%',
            price_modifier: 50,
            selected: false
        }
    ]
};

export const fabricOptions = {
    title: 'Fabric & Upholstery',
    description: 'Select available fabric types for cushions and upholstery',
    options: [
        {
            id: 'leather',
            name: 'Leather',
            type: 'premium',
            description: 'Genuine leather, soft and durable with a luxurious feel',
            durability: 'High',
            care: 'Wipe clean with damp cloth',
            price_modifier: 200,
            selected: false
        },
        {
            id: 'velvet',
            name: 'Velvet',
            type: 'premium',
            description: 'Luxurious, soft fabric with a rich texture',
            durability: 'Medium',
            care: 'Dry clean only',
            price_modifier: 150,
            selected: false
        },
        {
            id: 'canvas',
            name: 'Canvas',
            type: 'standard',
            description: 'Durable, versatile fabric perfect for everyday use',
            durability: 'High',
            care: 'Machine washable',
            price_modifier: 0,
            selected: false
        },
        {
            id: 'cotton-linen',
            name: 'Cotton Linen',
            type: 'standard',
            description: 'Breathable, natural fabric with a casual elegance',
            durability: 'Medium',
            care: 'Dry clean recommended',
            price_modifier: 50,
            selected: false
        }
    ]
};

export const fabricColorOptions = {
    title: 'Fabric Colors',
    description: 'Select available fabric colors',
    colors: [
        // Basic colors
        { id: 'red', name: 'Red', color_code: '#FF0000', stock: true, price_modifier: 0, selected: false },
        { id: 'orange', name: 'Orange', color_code: '#FFA500', stock: true, price_modifier: 0, selected: false },
        { id: 'yellow', name: 'Yellow', color_code: '#FFFF00', stock: true, price_modifier: 0, selected: false },
        { id: 'green', name: 'Green', color_code: '#008000', stock: true, price_modifier: 0, selected: false },
        { id: 'light-blue', name: 'Light Blue', color_code: '#ADD8E6', stock: true, price_modifier: 0, selected: false },
        { id: 'dark-blue', name: 'Dark Blue', color_code: '#00008B', stock: true, price_modifier: 0, selected: false },
        { id: 'purple', name: 'Purple', color_code: '#800080', stock: true, price_modifier: 0, selected: false },
        { id: 'pink', name: 'Pink', color_code: '#FFC0CB', stock: true, price_modifier: 0, selected: false },
        { id: 'brown', name: 'Brown', color_code: '#A52A2A', stock: true, price_modifier: 0, selected: false },
        { id: 'beige', name: 'Beige', color_code: '#F5F5DC', stock: true, price_modifier: 0, selected: false },
        { id: 'gray', name: 'Gray', color_code: '#808080', stock: true, price_modifier: 0, selected: false },
        // Additional requested colors
        { id: 'royal-blue', name: 'Royal Blue', color_code: '#4169E1', stock: true, price_modifier: 0, selected: false },
        { id: 'charcoal-gray', name: 'Charcoal Gray', color_code: '#36454F', stock: true, price_modifier: 0, selected: false },
    ]
};
export const hardwareOptions = {
    title: 'Hardware & Accents',
    description: 'Select available hardware options',
    categories: {
        knobs_handles: {
            name: 'Knobs / Handles',
            description: 'Choose the perfect hardware for your furniture',
            options: [
                {
                    id: 'gold',
                    name: 'Gold',
                    style: 'elegant',
                    description: 'Elegant and premium look',
                    price_modifier: 30,
                    selected: false
                },
                {
                    id: 'silver',
                    name: 'Silver',
                    style: 'modern',
                    description: 'Clean and modern',
                    price_modifier: 20,
                    selected: false
                },
                {
                    id: 'rustic-iron',
                    name: 'Rustic Iron',
                    style: 'vintage',
                    description: 'Vintage or industrial style',
                    price_modifier: 25,
                    selected: false
                }
            ]
        },
        leg_styles: {
            name: 'Leg Styles',
            description: 'Choose the base that complements your design',
            options: [
                {
                    id: 'metal-legs',
                    name: 'Metal Legs',
                    style: 'modern',
                    description: 'Industrial and modern design',
                    price_modifier: 50,
                    selected: false
                },
                {
                    id: 'wood-legs',
                    name: 'Wood Legs',
                    style: 'classic',
                    description: 'Classic and traditional appearance',
                    price_modifier: 40,
                    selected: false
                }
            ]
        }
    }
};
