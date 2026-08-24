from django.contrib import admin
from .models import Brand, Category, Product, ProductVariant, ProductImage

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'theme_color')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'brand', 'parent')
    list_filter = ('brand',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'base_price', 'discount_price', 'sku', 'rating', 'is_bestseller', 'is_active')
    list_filter = ('brand', 'category', 'is_bestseller', 'is_new_arrival', 'is_active')
    search_fields = ('name', 'sku', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline, ProductImageInline]

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'size_or_shade', 'color', 'sku', 'stock_quantity', 'price_override', 'is_active')
    list_filter = ('product__brand', 'is_active')
    search_fields = ('product__name', 'sku', 'size_or_shade')
