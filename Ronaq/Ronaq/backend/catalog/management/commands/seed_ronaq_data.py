import json
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from catalog.models import Brand, Category, Product, ProductVariant, ProductImage
from inventory.models import StockMovement

User = get_user_model()

RAW_PRODUCTS = [
  # VELORA
  {
    "id": "velora-1",
    "brand": "Velora",
    "brandSlug": "velora",
    "name": "Sunscreen SPF 50+ Invisible Shield",
    "category": "SPF & Protection",
    "price": 24.00,
    "originalPrice": 32.00,
    "discountBadge": "25% OFF",
    "rating": 4.9,
    "reviewsCount": 128,
    "isBestSeller": True,
    "isNewArrival": False,
    "image": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Ultra-lightweight, non-greasy broad spectrum SPF 50 sun protection infused with Hyaluronic Acid and Niacinamide. Leaves zero white cast and provides a radiant, hydrated finish.",
    "features": ["SPF 50+ PA++++ Broad Spectrum", "Non-Greasy & Zero White Cast", "Infused with Ceramides & Vitamin E", "Dermatologically Tested & Cruelty Free"],
    "shadesOrSizes": ["50ml Tube", "100ml Jumbo Pump"],
    "ingredients": "Water, Ethylhexyl Methoxycinnamate, Niacinamide, Glycerin, Hyaluronic Acid, Titanium Dioxide, Tocopherol (Vitamin E), Centella Asiatica Extract.",
    "howToUse": "Apply generously 15 minutes before sun exposure. Reapply every 2 hours or after swimming and sweating."
  },
  {
    "id": "velora-2",
    "brand": "Velora",
    "brandSlug": "velora",
    "name": "Gentle Hydrating Face Wash",
    "category": "Cleansers",
    "price": 18.00,
    "originalPrice": 22.00,
    "discountBadge": "18% OFF",
    "rating": 4.8,
    "reviewsCount": 94,
    "isBestSeller": True,
    "isNewArrival": False,
    "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Sulfate-free foaming gel cleanser enriched with Chamomile and Green Tea. Gently dissolves impurities and makeup without stripping natural skin moisture.",
    "features": ["pH Balanced Formula (5.5)", "Sulfate & Paraben Free", "Calming Botanical Extracts", "Ideal for All Skin Types"],
    "shadesOrSizes": ["150ml Bottle", "250ml Refill Pack"],
    "ingredients": "Aqua, Sodium Cocoyl Isethionate, Chamomilla Recutita Flower Extract, Camellia Sinensis (Green Tea) Leaf Extract, Panthenol, Glycerin.",
    "howToUse": "Pump a small amount onto damp hands. Gently massage onto face in circular motions for 60 seconds. Rinse thoroughly with lukewarm water."
  },
  {
    "id": "velora-3",
    "brand": "Velora",
    "brandSlug": "velora",
    "name": "Vitamin C Glow Elixir Serum",
    "category": "Serums",
    "price": 34.00,
    "originalPrice": 45.00,
    "discountBadge": "24% OFF",
    "rating": 4.95,
    "reviewsCount": 210,
    "isBestSeller": True,
    "isNewArrival": True,
    "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Stabilized 15% L-Ascorbic Acid Serum powered by Ferulic Acid and Vitamin E. Target hyperpigmentation, boost collagen production, and reveal luminous skin tone.",
    "features": ["15% Pure Vitamin C Concentrate", "Boosts Radiance & Evens Skin Tone", "Protects Against Environmental Stressors", "Quick-absorbing Oil-free Texture"],
    "shadesOrSizes": ["30ml Bottle", "50ml Bottle"],
    "ingredients": "Water, Ascorbic Acid, Ferulic Acid, Tocopherol, Sodium Hyaluronate, Propanediol, Phenoxyethanol.",
    "howToUse": "Apply 3-4 drops in the morning on clean skin before moisturizer and SPF."
  },
  {
    "id": "velora-4",
    "brand": "Velora",
    "brandSlug": "velora",
    "name": "Niacinamide 10% Clarifying Serum",
    "category": "Serums",
    "price": 28.00,
    "originalPrice": 35.00,
    "discountBadge": "20% OFF",
    "rating": 4.7,
    "reviewsCount": 86,
    "isBestSeller": False,
    "isNewArrival": True,
    "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "High-strength 10% Niacinamide with 1% Zinc PCA. Minimizes enlarged pores, regulates sebum production, and smooths skin texture.",
    "features": ["Reduces Visible Pore Size", "Controls Excess Oil & Shine", "Calms Blemishes & Redness"],
    "shadesOrSizes": ["30ml Bottle"],
    "ingredients": "Aqua, Niacinamide, Zinc PCA, Dimethyl Isosorbide, Ethoxydiglycol, Xanthan Gum.",
    "howToUse": "Apply 2-3 drops morning and evening to entire face after cleansing."
  },
  # ELAN
  {
    "id": "elan-1",
    "brand": "Elan",
    "brandSlug": "elan",
    "name": "Oversized Heavyweight Cotton Hoodie",
    "category": "Men",
    "price": 65.00,
    "originalPrice": 85.00,
    "discountBadge": "23% OFF",
    "rating": 4.85,
    "reviewsCount": 174,
    "isBestSeller": True,
    "isNewArrival": True,
    "image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Premium 450 GSM organic French Terry fleece hoodie. Designed with a boxy relaxed drop-shoulder silhouette, double-lined hood, and deep kangaroo pocket.",
    "features": ["450 GSM 100% Organic French Terry Cotton", "Pre-shrunk Fabric for Zero Shrinkage", "Ribbed Cuffs & Waistband", "Minimalist Embroidered Chest Logo"],
    "shadesOrSizes": ["S", "M", "L", "XL"],
    "ingredients": "100% Premium Organic Cotton",
    "howToUse": "Machine wash cold inside out with like colors. Tumble dry low or hang dry."
  },
  {
    "id": "elan-2",
    "brand": "Elan",
    "brandSlug": "elan",
    "name": "Relaxed Linen Blend Button-Down Shirt",
    "category": "Men",
    "price": 52.00,
    "originalPrice": 68.00,
    "discountBadge": "23% OFF",
    "rating": 4.75,
    "reviewsCount": 112,
    "isBestSeller": False,
    "isNewArrival": True,
    "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Breathable 55% Linen 45% Cotton blend shirt designed for warm weather sophistication. Features a casual camp collar and mother-of-pearl buttons.",
    "features": ["55% Natural Linen / 45% Organic Cotton", "Cool & Breathable Weave", "Relaxed Fit"],
    "shadesOrSizes": ["S", "M", "L", "XL"],
    "ingredients": "55% Linen, 45% Cotton",
    "howToUse": "Machine wash cool. Iron on medium heat while slightly damp for best crispness."
  },
  {
    "id": "elan-3",
    "brand": "Elan",
    "brandSlug": "elan",
    "name": "Tailored High-Waisted Wide Leg Trousers",
    "category": "Women",
    "price": 78.00,
    "originalPrice": 98.00,
    "discountBadge": "20% OFF",
    "rating": 4.9,
    "reviewsCount": 145,
    "isBestSeller": True,
    "isNewArrival": False,
    "image": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Elegantly draped wide-leg trousers featuring front pleats, slant pockets, and a clean tailored waistband.",
    "features": ["High-Waisted Structured Silhouette", "Front Pleat Detailing", "Side Pockets & Concealed Zip"],
    "shadesOrSizes": ["XS", "S", "M", "L"],
    "ingredients": "65% Recycled Polyester, 30% Viscose, 5% Elastane",
    "howToUse": "Dry clean recommended or gentle hand wash."
  },
  # STRYDE
  {
    "id": "stryde-1",
    "brand": "Stryde",
    "brandSlug": "stryde",
    "name": "Apex Runner Pro Performance Sneakers",
    "category": "Running",
    "price": 120.00,
    "originalPrice": 150.00,
    "discountBadge": "20% OFF",
    "rating": 4.92,
    "reviewsCount": 230,
    "isBestSeller": True,
    "isNewArrival": True,
    "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Engineered for high-mileage road running with responsive NitroFoam cushioning and breathable FlyKnit upper. Superior energy return with durable grip outsole.",
    "features": ["NitroFoam Responsive Midsole Cushioning", "Breathable 3D FlyKnit Upper", "High-Abrasion Rubber Outsole", "Weight: 240g"],
    "shadesOrSizes": ["US 8", "US 9", "US 10", "US 11", "US 12"],
    "ingredients": "FlyKnit Textile Upper, Nitrogen-infused EVA Foam Midsole, Rubber Outsole.",
    "howToUse": "Spot clean with damp cloth and mild sneaker cleaner. Air dry."
  },
  {
    "id": "stryde-2",
    "brand": "Stryde",
    "brandSlug": "stryde",
    "name": "Urban Retro Leather Low-Top Sneakers",
    "category": "Lifestyle",
    "price": 95.00,
    "originalPrice": 120.00,
    "discountBadge": "21% OFF",
    "rating": 4.8,
    "reviewsCount": 168,
    "isBestSeller": True,
    "isNewArrival": False,
    "image": "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
    "additionalImages": [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Classic vintage court silhouette crafted from full-grain Italian leather with cushioned orthotic insoles and durable vulcanized rubber soles.",
    "features": ["100% Full-Grain Premium Leather Upper", "Orthotic Cushion Footbed", "Vulcanized Rubber Sole"],
    "shadesOrSizes": ["US 7", "US 8", "US 9", "US 10", "US 11"],
    "ingredients": "Full-grain Leather, Cotton Laces, Rubber Sole",
    "howToUse": "Apply leather conditioner monthly. Protect with water-repellent spray."
  }
]

class Command(BaseCommand):
    help = 'Seeds database with initial Ronaq multi-brand catalog data, brands, categories, and demo users.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting Ronaq database seeding...'))

        # 1. Create Superuser / Admin
        admin_user, admin_created = User.objects.get_or_create(
            email='admin@ronaq.com',
            defaults={
                'first_name': 'Ronaq',
                'last_name': 'Admin',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True
            }
        )
        if admin_created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created Admin user: admin@ronaq.com / admin123'))
        else:
            self.stdout.write('Admin user admin@ronaq.com already exists.')

        # 2. Create Customer User
        customer_user, customer_created = User.objects.get_or_create(
            email='customer@ronaq.com',
            defaults={
                'first_name': 'Sample',
                'last_name': 'Customer',
                'phone_number': '+1 555 123 4567',
                'address': '123 Main Street, Suite 4',
                'city': 'New York',
                'postal_code': '10001',
                'role': User.Role.CUSTOMER
            }
        )
        if customer_created:
            customer_user.set_password('customer123')
            customer_user.save()
            self.stdout.write(self.style.SUCCESS('Created Customer user: customer@ronaq.com / customer123'))

        # 3. Create Brands
        brands_data = [
            {'name': 'Velora', 'slug': 'velora', 'description': 'Cosmetics & Skincare', 'theme_color': '#d97706'},
            {'name': 'Elan', 'slug': 'elan', 'description': 'Clothing & Apparel', 'theme_color': '#059669'},
            {'name': 'Stryde', 'slug': 'stryde', 'description': 'Footwear & Athletic Shoes', 'theme_color': '#2563eb'},
        ]

        brand_objs = {}
        for b in brands_data:
            obj, _ = Brand.objects.get_or_create(
                slug=b['slug'],
                defaults={'name': b['name'], 'description': b['description'], 'theme_color': b['theme_color']}
            )
            brand_objs[b['slug']] = obj

        # 4. Seed Products, Categories, Variants, Images
        for pdata in RAW_PRODUCTS:
            brand = brand_objs[pdata['brandSlug']]
            cat_obj, _ = Category.objects.get_or_create(
                name=pdata['category'],
                brand=brand,
                defaults={'slug': pdata['category'].lower().replace(' ', '-').replace('&', 'and')}
            )

            product, p_created = Product.objects.get_or_create(
                sku=f"SKU-{pdata['id'].upper()}",
                defaults={
                    'brand': brand,
                    'category': cat_obj,
                    'name': pdata['name'],
                    'slug': pdata['id'],
                    'base_price': pdata['price'],
                    'discount_price': pdata['originalPrice'] if pdata['price'] < pdata['originalPrice'] else None,
                    'discount_badge': pdata.get('discountBadge', ''),
                    'rating': pdata['rating'],
                    'reviews_count': pdata['reviewsCount'],
                    'is_bestseller': pdata['isBestSeller'],
                    'is_new_arrival': pdata['isNewArrival'],
                    'description': pdata['description'],
                    'features': pdata.get('features', []),
                    'ingredients': pdata.get('ingredients', ''),
                    'how_to_use': pdata.get('howToUse', '')
                }
            )

            # Product Images
            ProductImage.objects.get_or_create(
                product=product,
                image_url=pdata['image'],
                defaults={'is_primary': True, 'display_order': 0}
            )
            for idx, add_img in enumerate(pdata.get('additionalImages', [])):
                if add_img != pdata['image']:
                    ProductImage.objects.get_or_create(
                        product=product,
                        image_url=add_img,
                        defaults={'is_primary': False, 'display_order': idx + 1}
                    )

            # Variants
            for sz in pdata.get('shadesOrSizes', ['Standard']):
                v_sku = f"SKU-{pdata['id'].upper()}-{sz.replace(' ', '').upper()}"
                variant, v_created = ProductVariant.objects.get_or_create(
                    product=product,
                    size_or_shade=sz,
                    defaults={'sku': v_sku, 'stock_quantity': 50}
                )
                if v_created:
                    StockMovement.objects.create(
                        variant=variant,
                        movement_type=StockMovement.MovementType.IN,
                        quantity=50,
                        reason="Initial Stock Import",
                        created_by=admin_user
                    )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Ronaq database!'))
