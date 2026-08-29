from django.db import models

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    theme_color = models.CharField(max_length=50, default='#000000')
    logo_url = models.URLField(max_length=500, blank=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='categories')
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')

    class Meta:
        verbose_name_plural = 'Categories'
        unique_together = ('slug', 'brand')

    def __str__(self):
        if self.brand:
            return f"{self.brand.name} -> {self.name}"
        return self.name

class Product(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_badge = models.CharField(max_length=50, blank=True, default='')
    sku = models.CharField(max_length=100, unique=True)
    rating = models.FloatField(default=5.0)
    reviews_count = models.IntegerField(default=0)
    is_bestseller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    features = models.JSONField(default=list, blank=True)
    ingredients = models.TextField(blank=True, default='')
    how_to_use = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.brand.name}] {self.name}"

    @property
    def current_price(self):
        return self.discount_price if self.discount_price is not None else self.base_price

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size_or_shade = models.CharField(max_length=100)
    color = models.CharField(max_length=50, blank=True, default='')
    sku = models.CharField(max_length=100, unique=True)
    stock_quantity = models.IntegerField(default=50)
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.product.name} - {self.size_or_shade} ({self.stock_quantity} in stock)"

    @property
    def price(self):
        if self.price_override is not None:
            return self.price_override
        return self.product.current_price


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.CharField(max_length=500)
    is_primary = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Image for {self.product.name}"


class SiteSettings(models.Model):
    # Brand Identity & Logo
    site_name = models.CharField(max_length=150, default='RONAK')
    site_tagline = models.CharField(max_length=255, default='Luxury Collective')
    site_description = models.TextField(default='Ronak is a premier luxury collective bringing together three distinct worlds of cosmetics, fashion, and athletic footwear under one standard of elegance.')
    logo_url = models.CharField(max_length=500, blank=True, default='/logo.png')
    custom_logo_text = models.CharField(max_length=100, blank=True, default='RONAK')
    subbrand_velora_tagline = models.CharField(max_length=100, default='Cosmetics & Skincare')
    subbrand_elan_tagline = models.CharField(max_length=100, default='Luxury Apparel')
    subbrand_stryde_tagline = models.CharField(max_length=100, default='Athletic Footwear')

    # Top Announcement Bar & Offers
    announcement_enabled = models.BooleanField(default=True)
    announcement_text = models.CharField(max_length=255, default='🎉 FREE EXPRESS COURIER SHIPPING on all orders over Rs. 2,500 across Pakistan')
    announcement_badge = models.CharField(max_length=100, default='SPECIAL OFFER')
    announcement_link = models.CharField(max_length=255, default='/velora')
    top_welcome_text = models.CharField(max_length=255, default='Welcome to RONAK — House of Premium Brands')

    # Contact & Helpline Phone
    phone_number = models.CharField(max_length=50, default='+92 300 1234567')
    phone_display = models.CharField(max_length=50, default='1-800-RONAK')
    whatsapp_number = models.CharField(max_length=50, default='+92 300 1234567')
    whatsapp_message = models.CharField(max_length=300, default='Hello! I am inquiring about products on Ronak.')
    whatsapp_floating_enabled = models.BooleanField(default=False)
    email = models.EmailField(max_length=150, default='support@ronak.com')
    address = models.CharField(max_length=255, default='Ronak Luxury HQ, Lahore, Pakistan')

    # Shipping Thresholds & Currency
    free_shipping_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=2500.00)
    currency_symbol = models.CharField(max_length=10, default='Rs.')


    # Social Media Links
    instagram_url = models.CharField(max_length=255, blank=True, default='https://instagram.com')
    facebook_url = models.CharField(max_length=255, blank=True, default='https://facebook.com')
    twitter_url = models.CharField(max_length=255, blank=True, default='https://twitter.com')
    youtube_url = models.CharField(max_length=255, blank=True, default='https://youtube.com')

    # Hero Banners Customization
    home_hero_title = models.CharField(max_length=255, default='One Destination. Three Iconic Sub-Brands.')
    home_hero_subtitle = models.TextField(default='Experience Velora skincare, Elan luxury apparel, and Stryde athletic footwear under Ronak’s unified multi-brand house.')
    home_hero_badge = models.CharField(max_length=150, default='The Premier Luxury Umbrella Brand')
    home_hero_image = models.CharField(max_length=500, default='https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80')

    velora_hero_title = models.CharField(max_length=255, default='Velora Cosmetics & Skincare')
    velora_hero_subtitle = models.TextField(default='Pure, dermatologically tested skincare and luminous makeup formulas crafted for glowing, healthy skin.')
    velora_hero_badge = models.CharField(max_length=150, default='Sub-Brand Spotlight')
    velora_hero_image = models.CharField(max_length=500, blank=True, default='')

    elan_hero_title = models.CharField(max_length=255, default='Elan Luxury Apparel & Fashion')
    elan_hero_subtitle = models.TextField(default='Bespoke tailoring, signature ready-to-wear silhouettes, and timeless couture created for the modern connoisseur.')
    elan_hero_badge = models.CharField(max_length=150, default='Haute Couture Collection')
    elan_hero_image = models.CharField(max_length=500, blank=True, default='')

    stryde_hero_title = models.CharField(max_length=255, default='Stryde Performance & Athletic Footwear')
    stryde_hero_subtitle = models.TextField(default='High-performance engineering, responsive cushioning, and sleek urban aesthetics built for all-day motion.')
    stryde_hero_badge = models.CharField(max_length=150, default='Athletic Innovation')
    stryde_hero_image = models.CharField(max_length=500, blank=True, default='')

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return f"Site Settings ({self.site_name})"

    @classmethod
    def get_settings(cls):
        obj = cls.objects.first()
        if not obj:
            obj = cls.objects.create()
        return obj


class Banner(models.Model):
    class Placement(models.TextChoices):
        HOME_HERO = 'HOME_HERO', 'Home Hero Banner'
        VELORA_HERO = 'VELORA_HERO', 'Velora Hero Banner'
        ELAN_HERO = 'ELAN_HERO', 'Elan Hero Banner'
        STRYDE_HERO = 'STRYDE_HERO', 'Stryde Hero Banner'
        PROMO_STRIP = 'PROMO_STRIP', 'Promotional Strip Banner'
        OFFER_POPUP = 'OFFER_POPUP', 'Offer Popup Banner'

    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True, default='')
    badge_text = models.CharField(max_length=150, blank=True, default='')
    placement = models.CharField(max_length=50, choices=Placement.choices, default=Placement.HOME_HERO)
    image_url = models.CharField(max_length=500)
    button_primary_text = models.CharField(max_length=100, blank=True, default='')
    button_primary_link = models.CharField(max_length=255, blank=True, default='')
    button_secondary_text = models.CharField(max_length=100, blank=True, default='')
    button_secondary_link = models.CharField(max_length=255, blank=True, default='')
    button_tertiary_text = models.CharField(max_length=100, blank=True, default='')
    button_tertiary_link = models.CharField(max_length=255, blank=True, default='')
    background_color = models.CharField(max_length=50, blank=True, default='#0f172a')
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"[{self.get_placement_display()}] {self.title}"

