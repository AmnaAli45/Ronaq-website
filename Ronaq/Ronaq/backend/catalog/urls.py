from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BrandViewSet,
    CategoryViewSet,
    ProductViewSet,
    AdminProductViewSet,
    AdminImageUploadView,
    AdminCategoryViewSet,
    AdminVariantView,
    PublicSettingsView,
    AdminSettingsView,
    AdminBannerViewSet,
)
from reviews.views import ProductReviewListCreateView

router = DefaultRouter()
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'catalog/admin/products', AdminProductViewSet, basename='admin-product')
router.register(r'catalog/admin/categories', AdminCategoryViewSet, basename='admin-category')
router.register(r'catalog/admin/banners', AdminBannerViewSet, basename='admin-banner')

urlpatterns = [
    path('settings/', PublicSettingsView.as_view(), name='public_settings'),
    path('catalog/admin/settings/', AdminSettingsView.as_view(), name='admin_settings'),
    path('admin/settings/', AdminSettingsView.as_view(), name='admin_settings_alt'),
    path('catalog/admin/upload-image/', AdminImageUploadView.as_view(), name='admin_upload_image'),
    path('catalog/admin/variants/<int:id>/', AdminVariantView.as_view(), name='admin_variant_detail'),
    path('products/<slug:slug>/reviews/', ProductReviewListCreateView.as_view(), name='product_reviews'),
    path('', include(router.urls)),
]


