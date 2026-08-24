from rest_framework import serializers
from .models import Cart, CartItem, Wishlist, WishlistItem
from catalog.serializers import ProductVariantSerializer, ProductListSerializer

class CartItemSerializer(serializers.ModelSerializer):
    variant_details = ProductVariantSerializer(source='variant', read_only=True)
    product_id = serializers.ReadOnlyField(source='variant.product.id')
    product_name = serializers.ReadOnlyField(source='variant.product.name')
    product_slug = serializers.ReadOnlyField(source='variant.product.slug')
    brand = serializers.ReadOnlyField(source='variant.product.brand.name')
    brand_slug = serializers.ReadOnlyField(source='variant.product.brand.slug')
    size_or_shade = serializers.ReadOnlyField(source='variant.size_or_shade')
    unit_price = serializers.DecimalField(source='variant.price', max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    image = serializers.SerializerMethodField()
    stock_quantity = serializers.ReadOnlyField(source='variant.stock_quantity')

    class Meta:
        model = CartItem
        fields = (
            'id', 'variant', 'variant_details', 'product_id', 'product_name', 'product_slug',
            'brand', 'brand_slug', 'size_or_shade', 'unit_price', 'quantity', 'total_price',
            'image', 'stock_quantity', 'added_at'
        )

    def get_image(self, obj):
        img = obj.variant.product.images.filter(is_primary=True).first()
        if not img:
            img = obj.variant.product.images.first()
        return img.image_url if img else ''

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    estimated_shipping = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'subtotal', 'estimated_shipping', 'total', 'items_count', 'updated_at')

    def get_estimated_shipping(self, obj):
        return 0.00 if obj.subtotal >= 50 or obj.subtotal == 0 else 10.00

    def get_total(self, obj):
        shipping = self.get_estimated_shipping(obj)
        return float(obj.subtotal) + shipping

    def get_items_count(self, obj):
        return sum(item.quantity for item in obj.items.all())

class WishlistItemSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)

    class Meta:
        model = WishlistItem
        fields = ('id', 'product', 'product_details', 'added_at')

class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'items')
