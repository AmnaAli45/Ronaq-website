from rest_framework import serializers
from .models import Brand, Category, Product, ProductVariant, ProductImage, SiteSettings, Banner

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'

class BannerSerializer(serializers.ModelSerializer):
    placement_display = serializers.CharField(source='get_placement_display', read_only=True)

    class Meta:
        model = Banner
        fields = '__all__'


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    brand_slug = serializers.ReadOnlyField(source='brand.slug')

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'brand', 'brand_name', 'brand_slug', 'parent')

class ProductVariantSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ('id', 'size_or_shade', 'color', 'sku', 'stock_quantity', 'price_override', 'price', 'is_active')

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image_url', 'is_primary', 'display_order')

class AdminProductVariantSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    sku = serializers.CharField(required=False, allow_blank=True, default='')
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ('id', 'size_or_shade', 'color', 'sku', 'stock_quantity', 'price_override', 'price', 'is_active')
        extra_kwargs = {
            'sku': {'required': False, 'allow_blank': True, 'validators': []},
        }


class AdminProductImageSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = ProductImage
        fields = ('id', 'image_url', 'is_primary', 'display_order')

class ProductListSerializer(serializers.ModelSerializer):
    brand = serializers.ReadOnlyField(source='brand.name')
    brand_slug = serializers.ReadOnlyField(source='brand.slug')
    category = serializers.ReadOnlyField(source='category.name')
    image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    price = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2)
    discount_price = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'brand', 'brand_slug', 'category',
            'price', 'discount_price', 'discount_badge', 'sku', 'rating',
            'reviews_count', 'is_bestseller', 'is_new_arrival', 'image', 'images'
        )

    def get_image(self, obj):
        primary_img = obj.images.filter(is_primary=True).first()
        if not primary_img:
            primary_img = obj.images.first()
        return primary_img.image_url if primary_img else ''

    def get_images(self, obj):
        img_urls = [img.image_url for img in obj.images.all().order_by('display_order', 'id') if img.image_url]
        return img_urls

class AdminProductListSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    brand_slug = serializers.ReadOnlyField(source='brand.slug')
    category_name = serializers.ReadOnlyField(source='category.name')
    primary_image = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()
    variants_count = serializers.SerializerMethodField()
    images_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'brand', 'brand_name', 'brand_slug',
            'category', 'category_name', 'base_price', 'discount_price',
            'discount_badge', 'sku', 'rating', 'reviews_count',
            'is_bestseller', 'is_new_arrival', 'is_active',
            'primary_image', 'images', 'total_stock', 'variants_count', 'images_count',
            'created_at', 'updated_at'
        )

    def get_primary_image(self, obj):
        primary_img = obj.images.filter(is_primary=True).first() or obj.images.first()
        return primary_img.image_url if primary_img else ''

    def get_images(self, obj):
        img_urls = [img.image_url for img in obj.images.all().order_by('display_order', 'id') if img.image_url]
        return img_urls

    def get_total_stock(self, obj):
        return sum(v.stock_quantity for v in obj.variants.filter(is_active=True))

    def get_variants_count(self, obj):
        return obj.variants.count()

    def get_images_count(self, obj):
        return obj.images.count()


class ProductDetailSerializer(serializers.ModelSerializer):
    brand = serializers.ReadOnlyField(source='brand.name')
    brand_slug = serializers.ReadOnlyField(source='brand.slug')
    brand_id = serializers.ReadOnlyField(source='brand.id')
    category = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')
    category_id = serializers.ReadOnlyField(source='category.id')
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    shades_or_sizes = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'brand', 'brand_id', 'brand_slug', 'category', 'category_id', 'category_slug',
            'base_price', 'discount_price', 'discount_badge', 'sku', 'rating', 'reviews_count',
            'is_bestseller', 'is_new_arrival', 'is_active', 'description', 'features', 'ingredients',
            'how_to_use', 'primary_image', 'images', 'variants', 'shades_or_sizes',
            'created_at', 'updated_at'
        )

    def get_primary_image(self, obj):
        primary_img = obj.images.filter(is_primary=True).first()
        if not primary_img:
            primary_img = obj.images.first()
        return primary_img.image_url if primary_img else ''

    def get_shades_or_sizes(self, obj):
        return [v.size_or_shade for v in obj.variants.filter(is_active=True)]

import random
from django.utils.text import slugify
from django.db import transaction

class AdminProductCreateUpdateSerializer(serializers.ModelSerializer):
    variants = AdminProductVariantSerializer(many=True, required=False)
    images = AdminProductImageSerializer(many=True, required=False)
    brand_id = serializers.IntegerField(write_only=True, required=False)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'brand', 'brand_id', 'category', 'category_id',
            'base_price', 'discount_price', 'discount_badge', 'sku', 'rating', 'reviews_count',
            'is_bestseller', 'is_new_arrival', 'is_active', 'description', 'features',
            'ingredients', 'how_to_use', 'variants', 'images'
        )
        extra_kwargs = {
            'slug': {'required': False},
            'sku': {'required': False},
            'brand': {'required': False},
            'category': {'required': False, 'allow_null': True},
        }

    def _generate_unique_slug(self, name, current_id=None):
        base_slug = slugify(name) or 'product'
        slug = base_slug
        counter = 1
        qs = Product.objects.filter(slug=slug)
        if current_id:
            qs = qs.exclude(id=current_id)
        while qs.exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
            qs = Product.objects.filter(slug=slug)
            if current_id:
                qs = qs.exclude(id=current_id)
        return slug

    def _generate_unique_sku(self, brand_name, current_id=None):
        prefix = (brand_name[:3] if brand_name else 'RNQ').upper()
        while True:
            rand_num = random.randint(1000, 9999)
            sku = f"{prefix}-{rand_num}"
            qs = Product.objects.filter(sku=sku)
            if current_id:
                qs = qs.exclude(id=current_id)
            if not qs.exists():
                return sku

    def _generate_variant_sku(self, product_sku, current_variant_id=None):
        base_sku = f"{product_sku}-V"
        counter = 1
        while True:
            sku = f"{base_sku}{counter}"
            qs = ProductVariant.objects.filter(sku=sku)
            if current_variant_id:
                qs = qs.exclude(id=current_variant_id)
            if not qs.exists():
                return sku
            counter += 1

    def create(self, validated_data):
        variants_data = validated_data.pop('variants', [])
        images_data = validated_data.pop('images', [])
        brand_id = validated_data.pop('brand_id', None)
        category_id = validated_data.pop('category_id', None)

        if brand_id:
            validated_data['brand'] = Brand.objects.get(id=brand_id)
        elif 'brand' not in validated_data:
            # Default to first brand if not specified
            validated_data['brand'] = Brand.objects.first()

        if category_id:
            validated_data['category'] = Category.objects.filter(id=category_id).first()

        if not validated_data.get('slug'):
            validated_data['slug'] = self._generate_unique_slug(validated_data['name'])

        if not validated_data.get('sku'):
            brand_name = validated_data['brand'].name if validated_data.get('brand') else 'RNQ'
            validated_data['sku'] = self._generate_unique_sku(brand_name)

        with transaction.atomic():
            product = Product.objects.create(**validated_data)

            # Create Variants
            if variants_data:
                for idx, v_data in enumerate(variants_data):
                    v_data.pop('id', None)
                    v_sku = v_data.get('sku') or self._generate_variant_sku(product.sku)
                    ProductVariant.objects.create(
                        product=product,
                        size_or_shade=v_data.get('size_or_shade', 'Standard'),
                        color=v_data.get('color', ''),
                        sku=v_sku,
                        stock_quantity=v_data.get('stock_quantity', 50),
                        price_override=v_data.get('price_override'),
                        is_active=v_data.get('is_active', True)
                    )
            else:
                # Create a default variant if none provided
                ProductVariant.objects.create(
                    product=product,
                    size_or_shade='Standard',
                    color='',
                    sku=f"{product.sku}-STD",
                    stock_quantity=50,
                    is_active=True
                )

            # Create Images
            if images_data:
                for idx, img_data in enumerate(images_data):
                    img_data.pop('id', None)
                    ProductImage.objects.create(
                        product=product,
                        image_url=img_data.get('image_url', ''),
                        is_primary=img_data.get('is_primary', idx == 0),
                        display_order=img_data.get('display_order', idx)
                    )

            return product

    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', None)
        images_data = validated_data.pop('images', None)
        brand_id = validated_data.pop('brand_id', None)
        category_id = validated_data.pop('category_id', None)

        if brand_id:
            instance.brand = Brand.objects.get(id=brand_id)
        if category_id is not None:
            instance.category = Category.objects.filter(id=category_id).first() if category_id else None

        # Check slug uniqueness if changed
        if 'name' in validated_data and not validated_data.get('slug'):
            if validated_data['name'] != instance.name:
                instance.slug = self._generate_unique_slug(validated_data['name'], current_id=instance.id)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        with transaction.atomic():
            instance.save()

            # Handle Variants update
            if variants_data is not None:
                existing_variant_ids = []
                for idx, v_data in enumerate(variants_data):
                    v_id = v_data.get('id')
                    if v_id and ProductVariant.objects.filter(id=v_id, product=instance).exists():
                        variant = ProductVariant.objects.get(id=v_id, product=instance)
                        v_sku = v_data.get('sku') or variant.sku or self._generate_variant_sku(instance.sku, current_variant_id=variant.id)
                        variant.size_or_shade = v_data.get('size_or_shade', variant.size_or_shade)
                        variant.color = v_data.get('color', variant.color)
                        variant.sku = v_sku
                        variant.stock_quantity = v_data.get('stock_quantity', variant.stock_quantity)
                        variant.price_override = v_data.get('price_override', variant.price_override)
                        variant.is_active = v_data.get('is_active', variant.is_active)
                        variant.save()
                        existing_variant_ids.append(variant.id)
                    else:
                        v_sku = v_data.get('sku') or self._generate_variant_sku(instance.sku)
                        new_variant = ProductVariant.objects.create(
                            product=instance,
                            size_or_shade=v_data.get('size_or_shade', 'Standard'),
                            color=v_data.get('color', ''),
                            sku=v_sku,
                            stock_quantity=v_data.get('stock_quantity', 50),
                            price_override=v_data.get('price_override'),
                            is_active=v_data.get('is_active', True)
                        )
                        existing_variant_ids.append(new_variant.id)

                # Delete variants that were removed
                if existing_variant_ids:
                    instance.variants.exclude(id__in=existing_variant_ids).delete()


            # Handle Images update
            if images_data is not None:
                existing_image_ids = []
                for idx, img_data in enumerate(images_data):
                    img_id = img_data.get('id')
                    img_url = img_data.get('image_url', '')
                    if not img_url:
                        continue
                    if img_id and ProductImage.objects.filter(id=img_id, product=instance).exists():
                        image = ProductImage.objects.get(id=img_id, product=instance)
                        image.image_url = img_url
                        image.is_primary = img_data.get('is_primary', idx == 0)
                        image.display_order = img_data.get('display_order', idx)
                        image.save()
                        existing_image_ids.append(image.id)
                    else:
                        new_img = ProductImage.objects.create(
                            product=instance,
                            image_url=img_url,
                            is_primary=img_data.get('is_primary', idx == 0),
                            display_order=img_data.get('display_order', idx)
                        )
                        existing_image_ids.append(new_img.id)

                # Delete images that were removed
                instance.images.exclude(id__in=existing_image_ids).delete()

            return instance

