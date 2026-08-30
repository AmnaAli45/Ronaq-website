// Ronak Multi-Brand E-Commerce Product Catalog

export const PRODUCTS = [
  // ==========================================
  // VELORA (Cosmetics & Skincare)
  // ==========================================
  {
    id: 'velora-1',
    brand: 'Velora',
    brandSlug: 'velora',
    name: 'Sunscreen SPF 50+ Invisible Shield',
    category: 'SPF & Protection',
    price: 2400,
    originalPrice: 3200,
    discountBadge: '25% OFF',
    rating: 4.9,
    reviewsCount: 128,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Ultra-lightweight, non-greasy broad spectrum SPF 50 sun protection infused with Hyaluronic Acid and Niacinamide. Leaves zero white cast and provides a radiant, hydrated finish.',
    features: ['SPF 50+ PA++++ Broad Spectrum', 'Non-Greasy & Zero White Cast', 'Infused with Ceramides & Vitamin E', 'Dermatologically Tested & Cruelty Free'],
    shadesOrSizes: ['50ml Tube', '100ml Jumbo Pump'],
    ingredients: 'Water, Ethylhexyl Methoxycinnamate, Niacinamide, Glycerin, Hyaluronic Acid, Titanium Dioxide, Tocopherol (Vitamin E), Centella Asiatica Extract.',
    howToUse: 'Apply generously 15 minutes before sun exposure. Reapply every 2 hours or after swimming and sweating.'
  },
  {
    id: 'velora-2',
    brand: 'Velora',
    brandSlug: 'velora',
    name: 'Gentle Hydrating Face Wash',
    category: 'Cleansers',
    price: 1800,
    originalPrice: 2200,
    discountBadge: '18% OFF',
    rating: 4.8,
    reviewsCount: 94,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Sulfate-free foaming gel cleanser enriched with Chamomile and Green Tea. Gently dissolves impurities and makeup without stripping natural skin moisture.',
    features: ['pH Balanced Formula (5.5)', 'Sulfate & Paraben Free', 'Calming Botanical Extracts', 'Ideal for All Skin Types'],
    shadesOrSizes: ['150ml Bottle', '250ml Refill Pack'],
    ingredients: 'Aqua, Sodium Cocoyl Isethionate, Chamomilla Recutita Flower Extract, Camellia Sinensis (Green Tea) Leaf Extract, Panthenol, Glycerin.',
    howToUse: 'Pump a small amount onto damp hands. Gently massage onto face in circular motions for 60 seconds. Rinse thoroughly with lukewarm water.'
  },
  {
    id: 'velora-3',
    brand: 'Velora',
    brandSlug: 'velora',
    name: 'Vitamin C Glow Elixir Serum',
    category: 'Serums',
    price: 3400,
    originalPrice: 4500,
    discountBadge: '24% OFF',
    rating: 4.95,
    reviewsCount: 210,
    isBestSeller: true,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Stabilized 15% L-Ascorbic Acid Serum powered by Ferulic Acid and Vitamin E. Target hyperpigmentation, boost collagen production, and reveal luminous skin tone.',
    features: ['15% Pure Vitamin C Concentrate', 'Boosts Radiance & Evens Skin Tone', 'Protects Against Environmental Stressors', 'Quick-absorbing Oil-free Texture'],
    shadesOrSizes: ['30ml Bottle', '50ml Bottle'],
    ingredients: 'Water, Ascorbic Acid, Ferulic Acid, Tocopherol, Sodium Hyaluronate, Propanediol, Phenoxyethanol.',
    howToUse: 'Apply 3-4 drops in the morning on clean skin before moisturizer and SPF.'
  },
  {
    id: 'velora-4',
    brand: 'Velora',
    brandSlug: 'velora',
    name: 'Niacinamide 10% Clarifying Serum',
    category: 'Serums',
    price: 2800,
    originalPrice: 3500,
    discountBadge: '20% OFF',
    rating: 4.7,
    reviewsCount: 86,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High-strength 10% Niacinamide with 1% Zinc PCA. Minimizes enlarged pores, regulates sebum production, and smooths skin texture.',
    features: ['Reduces Visible Pore Size', 'Controls Excess Oil & Shine', 'Calms Blemishes & Redness', 'Lightweight Water-Gel Base'],
    shadesOrSizes: ['30ml Bottle'],
    ingredients: 'Aqua, Niacinamide, Zinc PCA, Dimethyl Isosorbide, Ethoxydiglycol, Phenoxyethanol, Xanthan Gum.',
    howToUse: 'Apply a few drops morning and night before heavier creams.'
  },
  {
    id: 'velora-5',
    brand: 'Velora',
    brandSlug: 'velora',
    name: 'Ceramide Rich Hydrating Moisturizer',
    category: 'Moisturizers',
    price: 2600,
    originalPrice: 3400,
    discountBadge: '23% OFF',
    rating: 4.85,
    reviewsCount: 156,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
    ],

    description: 'Nourishing daily moisturizer with 5 essential ceramides and peptides. Locks in 24-hour hydration and repairs skin barrier function.',
    features: ['5 Essential Ceramides & Peptides', '24-Hour Continuous Hydration', 'Soothes Sensitive & Dry Skin', 'Velvety Soft Texture'],
    shadesOrSizes: ['50g Jar', '100g Jar'],
    ingredients: 'Water, Glycerin, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Phytosphingosine, Cholesterol, Hyaluronic Acid.',
    howToUse: 'Smooth evenly over clean face and neck morning and evening.'
  },
  {
    id: 'velora-6',
    brand: 'Velora',
    brandSlug: 'velora',
    name: 'Velvet Tinted Lip & Cheek Stain',
    category: 'Lip & Makeup',
    price: 1600,
    originalPrice: 2000,
    discountBadge: '20% OFF',
    rating: 4.9,
    reviewsCount: 78,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Long-wearing dual lip and cheek stain with buildable sheer-to-bold tint. Infused with Rosehip Oil and Vitamin E for moisturized, flushed perfection.',
    features: ['Dual Use for Lips & Cheeks', 'Long-lasting 12H Tint', 'Hydrating Rosehip Oil Blend', 'Smudge-proof & Transfer-resistant'],
    shadesOrSizes: ['Rose Petal', 'Berry Crush', 'Warm Coral', 'Nude Blush'],
    ingredients: 'Dimethicone, Water, Isododecane, Polyglyceryl-2 Triisostearate, Rosehip Seed Oil, Tocopherol, Iron Oxides.',
    howToUse: 'Dab lightly onto lips or apples of cheeks and blend with fingertips.'
  },
  {
    id: 'velora-7',
    brand: 'Velora',
    brandSlug: 'velora',
    name: 'Dewy Skin Radiance BB Cream',
    category: 'Face Makeup',
    price: 2900,
    originalPrice: 3800,
    discountBadge: '23% OFF',
    rating: 4.75,
    reviewsCount: 65,
    isBestSeller: false,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1599733589046-10c005739ef9?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1599733589046-10c005739ef9?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'All-in-one tinted moisturizer, skin-perfecting foundation, and SPF 30 shield. Seamlessly evens skin tone for a natural, luminous finish.',
    features: ['Light-to-Medium Natural Coverage', 'SPF 30 UV Protection', 'Hydrating Dewy Finish', 'Breathable & Non-Comedogenic'],
    shadesOrSizes: ['Fair Light', 'Medium Nude', 'Honey Warm', 'Deep Olive'],
    ingredients: 'Titanium Dioxide, Zinc Oxide, Water, Cyclopentasiloxane, Squalane, Niacinamide, Sodium Hyaluronate.',
    howToUse: 'Blend outwards from the center of the face using fingertips or beauty sponge.'
  },
  {
    id: 'velora-8',
    brand: 'Velora',
    brandSlug: 'velora',
    name: 'Argan & Keratin Nourishing Hair Serum',
    category: 'Hair Care',
    price: 2500,
    originalPrice: 3200,
    discountBadge: '21% OFF',
    rating: 4.88,
    reviewsCount: 112,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Silky hair treatment oil infused with Cold-Pressed Moroccan Argan Oil and Keratin Protein. Tames frizz, seals split ends, and adds high-gloss shine.',
    features: ['Moroccan Argan & Hydrolyzed Keratin', 'Heat Defense up to 450°F', 'Tames Flyaways & Smooths Frizz', 'Non-greasy Featherweight Formula'],
    shadesOrSizes: ['60ml Bottle', '120ml Bottle'],
    ingredients: 'Cyclopentasiloxane, Argania Spinosa Kernel Oil, Hydrolyzed Keratin, Fragrance, Vitamin E Acetate.',
    howToUse: 'Apply 1-2 pumps to damp or dry hair, focusing on mid-lengths to ends.'
  },

  // ==========================================
  // ELAN (Clothing: Men, Women, Teens)
  // ==========================================
  // --- MEN ---
  {
    id: 'elan-men-1',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Men',
    name: 'Essential Oversized Heavyweight T-Shirt',
    category: 'Men Apparel',
    price: 3200,
    originalPrice: 4200,
    discountBadge: '24% OFF',
    rating: 4.85,
    reviewsCount: 84,
    isBestSeller: true,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Crafted from 240 GSM 100% Organic Heavyweight Cotton. Boxy modern streetwear silhouette with dropped shoulders and reinforced rib collar.',
    features: ['100% Premium Organic Cotton', '240 GSM Heavyweight Fabric', 'Relaxed Boxy Fit', 'Pre-shrunk Fabric'],
    shadesOrSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    ingredients: '100% Organic Combed Cotton.',
    howToUse: 'Machine wash cold with dark colors. Tumble dry low or hang dry.'
  },
  {
    id: 'elan-men-2',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Men',
    name: 'Modern Tailored Oxford Formal Shirt',
    category: 'Men Apparel',
    price: 5400,
    originalPrice: 7000,
    discountBadge: '22% OFF',
    rating: 4.9,
    reviewsCount: 62,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Crisp button-down Oxford cotton shirt with structured collar and mother-of-pearl finish buttons. Perfect for business meetings or evening attire.',
    features: ['100% Egyptian Cotton Oxford Weave', 'Wrinkle-resistant Finish', 'Tailored Modern Slim Fit', 'Button-down Spread Collar'],
    shadesOrSizes: ['S', 'M', 'L', 'XL'],
    ingredients: '100% Egyptian Cotton.',
    howToUse: 'Warm iron or steam recommended for a razor-sharp crisp finish.'
  },
  {
    id: 'elan-men-3',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Men',
    name: 'Slim Tapered Vintage Wash Denim Jeans',
    category: 'Men Apparel',
    price: 6800,
    originalPrice: 8500,
    discountBadge: '20% OFF',
    rating: 4.78,
    reviewsCount: 95,
    isBestSeller: false,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&w=800&q=80'
    ],
    description: '13oz Japanese selvage denim featuring subtle hand-distressed vintage wash. Designed with 2% elastane for comfortable stretch movement.',
    features: ['13oz Comfort Stretch Denim', 'Hand-distressed Whiskering', '5-Pocket Classic Construction', 'Custom YKK Hardware'],
    shadesOrSizes: ['30', '32', '34', '36'],
    ingredients: '98% Cotton, 2% Elastane.',
    howToUse: 'Wash inside out in cold water to preserve wash tone.'
  },
  {
    id: 'elan-men-4',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Men',
    name: 'Fleece Lined Minimalist Hoodie',
    category: 'Men Apparel',
    price: 5800,
    originalPrice: 7500,
    discountBadge: '22% OFF',
    rating: 4.92,
    reviewsCount: 140,
    isBestSeller: true,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Plush 380 GSM brushed fleece hoodie with double-lined hood, kangaroo pocket, and clean embroidery detailing on chest.',
    features: ['380 GSM Heavyweight Brushed Fleece', 'Double-layer Thermal Hood', 'Ribbed Cuffs & Hem', 'Kangaroo Pouch Pocket'],
    shadesOrSizes: ['S', 'M', 'L', 'XL'],
    ingredients: '80% Cotton, 20% Polyester.',
    howToUse: 'Wash inside out. Do not tumble dry high.'
  },
  {
    id: 'elan-men-5',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Men',
    name: 'Embroidered Premium Linen Kurta',
    category: 'Men Apparel',
    price: 6200,
    originalPrice: 7900,
    discountBadge: '21% OFF',
    rating: 4.88,
    reviewsCount: 71,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Traditional meets contemporary: Pure linen short kurta with intricate neckline embroidery and Mandarin collar.',
    features: ['100% Breathable Pure Linen', 'Intricate Tonal Embroidery', 'Mandarin Band Collar', 'Side Slits for Flow'],
    shadesOrSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    ingredients: '100% Pure Natural Linen.',
    howToUse: 'Hand wash or delicate machine wash.'
  },

  // --- WOMEN ---
  {
    id: 'elan-women-1',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Women',
    name: 'Artisanal Printed Silk Touch Kurti',
    category: 'Women Apparel',
    price: 5200,
    originalPrice: 6800,
    discountBadge: '23% OFF',
    rating: 4.94,
    reviewsCount: 118,
    isBestSeller: true,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Vibrant silk-blend printed straight kurti adorned with subtle foil prints and delicate lace border accents along sleeve cuffs.',
    features: ['Luxurious Soft Silk Viscose Blend', 'Bespoke Floral Motif Prints', 'Straight Fit with V-Neckline', 'Elegant Side Split Silhouette'],
    shadesOrSizes: ['XS', 'S', 'M', 'L', 'XL'],
    ingredients: '60% Silk Viscose, 40% Cotton.',
    howToUse: 'Dry clean or gentle hand wash cold.'
  },
  {
    id: 'elan-women-2',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Women',
    name: 'Royal Velvet Embroidered Abaya',
    category: 'Women Apparel',
    price: 8900,
    originalPrice: 11500,
    discountBadge: '22% OFF',
    rating: 4.96,
    reviewsCount: 142,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Graceful open-front Abaya with metallic embroidery work on lapels and sleeves. Crafted from premium Nida fabric with matching belt and scarf.',
    features: ['Premium Breathable Nida Fabric', 'Handcrafted Gold Thread Embroidery', 'Includes Matching Sheila (Scarf)', 'Full-Length Flare'],
    shadesOrSizes: ['52', '54', '56', '58'],
    ingredients: '100% High Grade Nida Fabric.',
    howToUse: 'Gentle hand wash inside out.'
  },
  {
    id: 'elan-women-3',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Women',
    name: 'High-Waisted Straight Wide Leg Denim',
    category: 'Women Apparel',
    price: 6400,
    originalPrice: 8000,
    discountBadge: '20% OFF',
    rating: 4.82,
    reviewsCount: 76,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Retro-inspired high-waisted wide leg jeans with clean finished hem and figure-flattering waist sculpting seamwork.',
    features: ['High-rise 11" Rise', 'Relaxed Wide Leg Fit', '100% Rigid Premium Cotton Denim', 'Deep Vintage Wash'],
    shadesOrSizes: ['26', '28', '30', '32'],
    ingredients: '100% Cotton Denim.',
    howToUse: 'Machine wash cold with like colors.'
  },
  {
    id: 'elan-women-4',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Women',
    name: 'Ribbed Knit Square-Neck Crop Top',
    category: 'Women Apparel',
    price: 2800,
    originalPrice: 3600,
    discountBadge: '22% OFF',
    rating: 4.76,
    reviewsCount: 58,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Chic form-fitting ribbed crop top with elegant square neckline and double-layered fabric for complete opacity and support.',
    features: ['Soft Ribbed Cotton Stretch', 'Flattering Square Neckline', 'Double Layered Non-sheer', 'Cropped Waist Length'],
    shadesOrSizes: ['XS', 'S', 'M', 'L'],
    ingredients: '95% Organic Cotton, 5% Spandex.',
    howToUse: 'Machine wash cold.'
  },
  {
    id: 'elan-women-5',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Women',
    name: 'Flowing Tiered Chiffon Maxi Dress',
    category: 'Women Apparel',
    price: 7800,
    originalPrice: 9800,
    discountBadge: '20% OFF',
    rating: 4.91,
    reviewsCount: 89,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dreamy floral chiffon maxi dress featuring elasticated waist cinch, tiered skirt movement, and sheer bishop sleeves.',
    features: ['Lightweight Chiffon with Soft Lining', 'Cinched Drawstring Waist', 'Floor Length Tiered Silhouette', 'V-Neckline with Tie Detail'],
    shadesOrSizes: ['S', 'M', 'L', 'XL'],
    ingredients: '100% Poly-Chiffon Exterior, Rayon Lining.',
    howToUse: 'Hand wash cold or dry clean.'
  },

  // --- TEENS ---
  {
    id: 'elan-teens-1',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Teens',
    name: 'Cyberpunk Graphic Oversized Tee',
    category: 'Teens Apparel',
    price: 2900,
    originalPrice: 3800,
    discountBadge: '23% OFF',
    rating: 4.88,
    reviewsCount: 110,
    isBestSeller: true,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Bold urban street aesthetic tee featuring retro puff-print graphics and heavy vintage enzyme wash.',
    features: ['100% Heavy Cotton', 'Puff Print Typography', 'Drop-Shoulder Fit', 'Vintage Enzyme Wash'],
    shadesOrSizes: ['XS', 'S', 'M', 'L'],
    ingredients: '100% Cotton.',
    howToUse: 'Machine wash cool.'
  },
  {
    id: 'elan-teens-2',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Teens',
    name: 'Cargo Pocket Fleece Joggers',
    category: 'Teens Apparel',
    price: 4200,
    originalPrice: 5500,
    discountBadge: '23% OFF',
    rating: 4.8,
    reviewsCount: 67,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Utility meets cozy comfort: Fleece joggers with dual side flap cargo pockets, elastic waistband, and adjustable drawstrings.',
    features: ['Soft Fleece Lining', 'Dual Flap Utility Cargo Pockets', 'Cuffed Ankle Bottoms', 'Elasticized Waistband'],
    shadesOrSizes: ['XS', 'S', 'M', 'L'],
    ingredients: '70% Cotton, 30% Polyester.',
    howToUse: 'Machine wash cold.'
  },
  {
    id: 'elan-teens-3',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Teens',
    name: 'Acid Wash Oversized Hoodie',
    category: 'Teens Apparel',
    price: 4900,
    originalPrice: 6200,
    discountBadge: '21% OFF',
    rating: 4.92,
    reviewsCount: 130,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Trendy acid-washed oversized pullover hoodie with thermal hood lining and chest emblem badge.',
    features: ['Custom Acid Wash Process', 'Ultra Soft Interior Fleece', 'Unisex Slouchy Silhouette', 'Ribbed Sleeve Trim'],
    shadesOrSizes: ['XS', 'S', 'M', 'L'],
    ingredients: '80% Cotton, 20% Polyester.',
    howToUse: 'Wash separately on low cycle.'
  },
  {
    id: 'elan-teens-4',
    brand: 'Elan',
    brandSlug: 'elan',
    genderTab: 'Teens',
    name: 'Distressed Trucker Denim Jacket',
    category: 'Teens Apparel',
    price: 6500,
    originalPrice: 8200,
    discountBadge: '20% OFF',
    rating: 4.86,
    reviewsCount: 54,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Iconic trucker jacket constructed from durable 14oz denim with deliberate abrasion detailing and brass button hardware.',
    features: ['14oz Rigid Denim', 'Custom Antiqued Brass Buttons', 'Dual Button Flap Chest Pockets', 'Classic Boxy Cut'],
    shadesOrSizes: ['S', 'M', 'L'],
    ingredients: '100% Cotton Denim.',
    howToUse: 'Cold wash.'
  },

  // ==========================================
  // STRYDE (Footwear / Shoes)
  // ==========================================
  {
    id: 'stryde-1',
    brand: 'Stryde',
    brandSlug: 'stryde',
    name: 'Stryde Phantom Mesh Running Sneakers',
    category: 'Sneakers',
    price: 8500,
    originalPrice: 11000,
    discountBadge: '22% OFF',
    rating: 4.93,
    reviewsCount: 240,
    isBestSeller: true,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High-performance road running sneakers equipped with Stryde-Air™ responsive foam cushioning and breathable engineered knit upper.',
    features: ['Stryde-Air Cushioning Technology', 'Engineered Breathable Mesh Upper', 'High-Traction Rubber Outsole', 'Reflective Night Accents'],
    shadesOrSizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    ingredients: 'Synthetic Mesh Upper, EVA Midsole, High Density Rubber Sole.',
    howToUse: 'Wipe clean with a damp cloth.'
  },
  {
    id: 'stryde-2',
    brand: 'Stryde',
    brandSlug: 'stryde',
    name: 'Monarch Italian Leather Formal Oxford Shoes',
    category: 'Formal Shoes',
    price: 12000,
    originalPrice: 15500,
    discountBadge: '22% OFF',
    rating: 4.96,
    reviewsCount: 88,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Handcrafted Goodyear-welted formal shoes made from full-grain Italian calfskin leather with sleek cap-toe design.',
    features: ['100% Full-Grain Italian Calfskin', 'Hand-stitched Goodyear Welt', 'Cushioned Leather Footbed', 'Burnished Cap-Toe Finish'],
    shadesOrSizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
    ingredients: '100% Full Grain Leather, Leather Sole.',
    howToUse: 'Condition periodically with leather cream. Use shoe trees.'
  },
  {
    id: 'stryde-3',
    brand: 'Stryde',
    brandSlug: 'stryde',
    name: 'Urban Suede Penny Slip-On Loafers',
    category: 'Casual Loafers',
    price: 7500,
    originalPrice: 9500,
    discountBadge: '21% OFF',
    rating: 4.82,
    reviewsCount: 104,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Classic penny loafers made from soft velvety suede featuring memory foam arch support inserts for effortless all-day comfort.',
    features: ['Genuine Soft Suede Leather', 'Memory Foam Arch Support', 'Anti-Slip Driver Outsole', 'Easy Slip-On Design'],
    shadesOrSizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
    ingredients: 'Suede Upper, Rubber Sole.',
    howToUse: 'Protect with suede protector spray before first wear.'
  },
  {
    id: 'stryde-4',
    brand: 'Stryde',
    brandSlug: 'stryde',
    name: 'Stryde Apex Trainer Sports Shoes',
    category: 'Sports Shoes',
    price: 9200,
    originalPrice: 11800,
    discountBadge: '22% OFF',
    rating: 4.9,
    reviewsCount: 165,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Cross-training shoes engineered for heavy gym workouts, agility drills, and outdoor training with stabilized heel cage.',
    features: ['Lateral Stability TPU Heel Cage', 'Shock-absorbing Impact Midsole', 'Flexible Forefoot Grooves', 'Abrasion-resistant Upper'],
    shadesOrSizes: ['US 7.5', 'US 8.5', 'US 9.5', 'US 10.5', 'US 11.5'],
    ingredients: 'Synthetic Upper, TPU Frame, Rubber Sole.',
    howToUse: 'Air out after workouts.'
  },
  {
    id: 'stryde-5',
    brand: 'Stryde',
    brandSlug: 'stryde',
    name: 'Cushioned Ergonomic Strap Sandals',
    category: 'Sandals',
    price: 4500,
    originalPrice: 5800,
    discountBadge: '22% OFF',
    rating: 4.75,
    reviewsCount: 52,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Outdoor trail sandals with quick-drying nylon webbing straps and contoured anatomical footbed for wet/dry adventures.',
    features: ['Quick-drying Neoprene Lined Webbing', 'Triple Velcro Strap System', 'Anatomically Contoured Footbed', 'Wet-Grip Traction Outsole'],
    shadesOrSizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
    ingredients: 'Nylon Straps, EVA Footbed, Rubber Sole.',
    howToUse: 'Rinse with fresh water after saltwater exposure.'
  },
  {
    id: 'stryde-6',
    brand: 'Stryde',
    brandSlug: 'stryde',
    name: 'Rugged Chelsea Leather Ankle Boots',
    category: 'Boots',
    price: 11500,
    originalPrice: 14500,
    discountBadge: '20% OFF',
    rating: 4.91,
    reviewsCount: 114,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Weatherproof full-grain leather Chelsea boots with elastic side gores and durable lugged rubber soles.',
    features: ['Weatherproof Oiled Leather', 'Elastic Side Elastic Gores', 'Heavy-Duty Lug Rubber Outsole', 'Pull Tabs for Easy On/Off'],
    shadesOrSizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    ingredients: 'Oiled Bovine Leather, Rubber Lug Sole.',
    howToUse: 'Apply leather balm for moisture resistance.'
  },

  // ==========================================
  // ACCESSORIES & LIFESTYLE (Ronak Luxe)
  // ==========================================
  {
    id: 'accessories-1',
    brand: 'Ronak Luxe',
    brandSlug: 'accessories',
    name: 'Artisan Full-Grain Leather Bifold Wallet',
    category: 'Wallets',
    price: 3200,
    originalPrice: 4200,
    discountBadge: '24% OFF',
    rating: 4.92,
    reviewsCount: 142,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Handcrafted from vegetable-tanned full-grain cowhide with RFID blocking protection, 8 card slots, and dual currency compartments.',
    features: ['100% Genuine Full-Grain Leather', 'RFID Theft Protection', 'Dual Cash Currency Slots', 'Slim Pocket-Friendly Profile'],
    shadesOrSizes: ['Cognac Brown', 'Midnight Black', 'Vintage Tan'],
    ingredients: 'Bovine Leather, RFID Shielding Mesh, Cotton Twill Lining.',
    howToUse: 'Condition with leather cream twice a year.'
  },
  {
    id: 'accessories-2',
    brand: 'Ronak Luxe',
    brandSlug: 'accessories',
    name: 'Polarized Aviator Sunglasses (UV400)',
    category: 'Eyewear',
    price: 3800,
    originalPrice: 4800,
    discountBadge: '20% OFF',
    rating: 4.88,
    reviewsCount: 96,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Classic metallic gold teardrop aviators with polarized anti-glare scratch-resistant lenses and 100% UV400 sun protection.',
    features: ['100% UV400 Protection', 'Polarized Anti-Glare TAC Lenses', 'Lightweight Stainless Frame', 'Includes Hard Case & Microfiber Cloth'],
    shadesOrSizes: ['Gold / Dark Green Lens', 'Silver / Mirror Blue', 'Gunmetal / Smoke Black'],
    ingredients: 'Stainless Steel Alloy, TAC Polarized Lens, Silicone Nose Pads.',
    howToUse: 'Wipe with microfiber cloth. Store in hard case when not in use.'
  },
  {
    id: 'accessories-3',
    brand: 'Ronak Luxe',
    brandSlug: 'accessories',
    name: 'Quilted Crossbody Mini Leather Bag',
    category: 'Bags & Totes',
    price: 6800,
    originalPrice: 8500,
    discountBadge: '20% OFF',
    rating: 4.95,
    reviewsCount: 184,
    isBestSeller: true,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Elegant chevron-quilted nappa leather handbag with polished gold-tone hardware, twist lock, and adjustable chain crossbody strap.',
    features: ['Ultra-soft Quilted Nappa Leather', 'Gold-plated Twist Lock', 'Interior Zipper & Slip Pocket', 'Adjustable Shoulder / Crossbody Chain'],
    shadesOrSizes: ['Ivory Cream', 'Emerald Green', 'Classic Black', 'Blush Pink'],
    ingredients: 'Nappa Bovine Leather, Gold-plated Zinc Alloy, Satin Interior.',
    howToUse: 'Wipe gently with damp soft cloth.'
  },
  {
    id: 'accessories-4',
    brand: 'Ronak Luxe',
    brandSlug: 'accessories',
    name: 'Executive Minimalist Chronograph Watch',
    category: 'Watches',
    price: 7500,
    originalPrice: 9900,
    discountBadge: '25% OFF',
    rating: 4.9,
    reviewsCount: 110,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Sleek matte black stainless steel case with sapphire crystal glass, precision Japanese quartz movement, and interchangeable genuine leather strap.',
    features: ['3ATM Water Resistant', 'Scratch-Proof Sapphire Glass', 'Japanese Miyota Quartz Movement', 'Interchangeable Quick-Release Strap'],
    shadesOrSizes: ['Black Dial / Brown Leather', 'Silver Dial / Black Leather', 'All-Black Stealth'],
    ingredients: '316L Stainless Steel, Sapphire Crystal, Genuine Leather.',
    howToUse: 'Avoid submerging in hot water or steam.'
  },
  {
    id: 'accessories-5',
    brand: 'Ronak Luxe',
    brandSlug: 'accessories',
    name: 'Hand-Printed Pure Silk Luxury Scarf',
    category: 'Scarves',
    price: 2900,
    originalPrice: 3800,
    discountBadge: '23% OFF',
    rating: 4.85,
    reviewsCount: 78,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80'
    ],
    description: '100% mulberry silk twill square scarf featuring intricate floral baroque motifs and hand-rolled edges for versatile styling.',
    features: ['100% Pure Mulberry Silk Twill', 'Hand-Rolled Artisan Edges', 'Fade-Resistant Eco Reactive Dyes', '90cm x 90cm Square Dimension'],
    shadesOrSizes: ['Golden Baroque', 'Royal Indigo Blue', 'Emerald Flora'],
    ingredients: '100% Mulberry Silk.',
    howToUse: 'Dry clean or gentle hand wash in cold water with mild detergent.'
  },
  {
    id: 'accessories-6',
    brand: 'Ronak Luxe',
    brandSlug: 'accessories',
    name: 'Reversible Italian Leather Dress Belt',
    category: 'Belts',
    price: 2600,
    originalPrice: 3400,
    discountBadge: '23% OFF',
    rating: 4.79,
    reviewsCount: 65,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dual-tone Black and Cognac Brown reversible belt with brushed nickel twist buckle for effortless formal and casual styling.',
    features: ['2-in-1 Reversible Black & Brown', 'Solid Full-Grain Leather Strap', 'Heavy-Duty Twist Reversible Buckle', 'Precision Beveled Edge Finishing'],
    shadesOrSizes: ['32 - 34 Inch', '36 - 38 Inch', '40 - 42 Inch'],
    ingredients: 'Full-Grain Leather, Zinc Nickel Alloy Buckle.',
    howToUse: 'Pull and twist buckle 180 degrees to switch colors.'
  },
  {
    id: 'accessories-7',
    brand: 'Ronak Luxe',
    brandSlug: 'accessories',
    name: 'Velvet Cosmetic & Travel Vanity Case',
    category: 'Pouches & Cases',
    price: 2200,
    originalPrice: 2800,
    discountBadge: '21% OFF',
    rating: 4.93,
    reviewsCount: 130,
    isBestSeller: true,
    isNewArrival: false,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Waterproof lined plush velvet organizer pouch with custom gold zippers to safely carry skincare bottles and cosmetics on the go.',
    features: ['Plush Velvet Outer with Spill-Proof Lining', 'Heavy-Duty Gold Zipper Closure', 'Elastic Brush Slots & Inner Divider', 'Compact Travel Size'],
    shadesOrSizes: ['Dusty Rose', 'Midnight Navy', 'Emerald Green'],
    ingredients: 'Polyester Velvet, Waterproof PVC Lining, Brass Zipper.',
    howToUse: 'Wipe interior with damp cloth.'
  },
  {
    id: 'accessories-8',
    brand: 'Ronak Luxe',
    brandSlug: 'accessories',
    name: '18K Gold-Plated Herringbone Chain Necklace',
    category: 'Jewelry',
    price: 3400,
    originalPrice: 4500,
    discountBadge: '24% OFF',
    rating: 4.87,
    reviewsCount: 88,
    isBestSeller: false,
    isNewArrival: true,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Tarnish-free waterproof 18K gold-dipped flat herringbone snake chain with high polish shine and secure lobster claw clasp.',
    features: ['18K PVD Gold Plating (Tarnish-Proof)', 'Hypoallergenic & Nickel-Free', 'Water & Sweat Resistant', '45cm Length with 5cm Extension'],
    shadesOrSizes: ['3mm Width / 45cm', '5mm Width / 45cm'],
    ingredients: '316L Surgical Stainless Steel, 18K Yellow Gold PVD.',
    howToUse: 'Safe for daily wear and showers. Polish with dry cloth.'
  }
];

export const SUB_BRANDS = [
  {
    id: 'velora',
    name: 'Velora',
    tagline: 'Cosmetics & Skincare',
    description: 'Soft luxury, botanical science, and gentle formulas designed to awaken your inner glow.',
    accentColor: '#C5A059',
    badgeText: 'Beauty & Skincare',
    heroImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
    path: '/velora'
  },
  {
    id: 'elan',
    name: 'Elan',
    tagline: 'High Fashion & Apparel',
    description: 'Contemporary menswear, womenswear, and teen streetwear crafted with bold elegance.',
    accentColor: '#18181B',
    badgeText: 'Men • Women • Teens',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    path: '/elan'
  },
  {
    id: 'stryde',
    name: 'Stryde',
    tagline: 'Urban Footwear & Performance',
    description: 'Precision engineered sneakers, formal shoes, and boots built for power and motion.',
    accentColor: '#06B6D4',
    badgeText: 'Footwear & Athletic',
    heroImage: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
    path: '/stryde'
  }
];
