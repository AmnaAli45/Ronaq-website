from rest_framework import serializers
from .models import Review
from catalog.models import Product

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    product_slug = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id',
            'customer_name',
            'customer_location',
            'display_name',
            'user_name',
            'rating',
            'comment',
            'is_verified_purchase',
            'is_published',
            'is_featured',
            'product',
            'product_name',
            'product_slug',
            'product_image',
            'created_at',
            'updated_at'
        )

    def get_user_name(self, obj):
        if obj.user:
            if obj.user.first_name:
                return f"{obj.user.first_name} {obj.user.last_name[:1]}."
            return obj.user.email.split('@')[0]
        return ''

    def get_display_name(self, obj):
        if obj.customer_name:
            return obj.customer_name
        if obj.user:
            if obj.user.first_name:
                return f"{obj.user.first_name} {obj.user.last_name[:1]}."
            return obj.user.email.split('@')[0]
        return 'Verified Customer'

    def get_product_name(self, obj):
        return obj.product.name if obj.product else 'Store / General Brand'

    def get_product_slug(self, obj):
        return obj.product.slug if obj.product else ''

    def get_product_image(self, obj):
        if not obj.product:
            return ''
        primary = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        return primary.image_url if primary else ''


class AdminReviewSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    product_slug = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id',
            'customer_name',
            'customer_location',
            'display_name',
            'rating',
            'comment',
            'is_verified_purchase',
            'is_published',
            'is_featured',
            'product',
            'product_name',
            'product_slug',
            'product_image',
            'created_at',
            'updated_at'
        )

    def get_display_name(self, obj):
        if obj.customer_name:
            return obj.customer_name
        if obj.user:
            if obj.user.first_name:
                return f"{obj.user.first_name} {obj.user.last_name[:1]}."
            return obj.user.email.split('@')[0]
        return 'Verified Customer'

    def get_product_name(self, obj):
        return obj.product.name if obj.product else 'Store / General Brand'

    def get_product_slug(self, obj):
        return obj.product.slug if obj.product else ''

    def get_product_image(self, obj):
        if not obj.product:
            return ''
        primary = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        return primary.image_url if primary else ''

