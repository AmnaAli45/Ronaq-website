import os
import uuid
from rest_framework import viewsets, permissions, filters, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
from django.utils.text import slugify

from .models import Brand, Category, Product, ProductVariant, ProductImage, SiteSettings, Banner
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    AdminProductListSerializer,
    AdminProductCreateUpdateSerializer,
    AdminProductVariantSerializer,
    AdminProductImageSerializer,
    SiteSettingsSerializer,
    BannerSerializer,
)


class IsAdminOrStaff(permissions.BasePermission):
    """
    Allows access only to authenticated users who are staff or have ADMIN/STAFF roles.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                request.user.is_staff or 
                request.user.is_superuser or 
                getattr(request.user, 'role', '') in ['STAFF', 'ADMIN']
            )
        )


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
    lookup_field = 'slug'

    def get_queryset(self):
        qs = super().get_queryset()
        brand_slug = self.request.query_params.get('brand')
        if brand_slug:
            qs = qs.filter(brand__slug__iexact=brand_slug)
        return qs



class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).prefetch_related('images', 'variants')
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        # Filter by brand
        brand = params.get('brand')
        if brand:
            qs = qs.filter(brand__slug__iexact=brand)

        # Filter by category
        category = params.get('category')
        if category:
            qs = qs.filter(Q(category__slug__iexact=category) | Q(category__name__iexact=category))

        # Search query
        search = params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search) | Q(sku__icontains=search))

        # Filter by price range
        min_price = params.get('min_price')
        if min_price:
            try:
                qs = qs.filter(base_price__gte=float(min_price))
            except ValueError:
                pass

        max_price = params.get('max_price')
        if max_price:
            try:
                qs = qs.filter(base_price__lte=float(max_price))
            except ValueError:
                pass

        # Sort / Ordering
        sort = params.get('sort')
        if sort == 'price_asc':
            qs = qs.order_by('base_price')
        elif sort == 'price_desc':
            qs = qs.order_by('-base_price')
        elif sort == 'newest':
            qs = qs.order_by('-created_at')
        elif sort == 'bestselling':
            qs = qs.order_by('-is_bestseller', '-rating')

        return qs


# ==========================================
# ADMIN CATALOG ENDPOINTS
# ==========================================

class AdminProductViewSet(viewsets.ModelViewSet):
    """
    Full CRUD management for products by Admin / Staff users.
    Supports lookup by ID or slug.
    """
    queryset = Product.objects.all().prefetch_related('images', 'variants', 'brand', 'category').order_by('-created_at')
    permission_classes = [IsAdminOrStaff]
    lookup_field = 'slug'

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_val = self.kwargs[lookup_url_kwarg]

        if str(lookup_val).isdigit():
            obj = get_object_or_404(queryset, id=int(lookup_val))
        else:
            obj = get_object_or_404(queryset, slug=lookup_val)

        self.check_object_permissions(self.request, obj)
        return obj

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminProductListSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        return AdminProductCreateUpdateSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        # Filter by Brand
        brand = params.get('brand')
        if brand and brand.lower() != 'all':
            qs = qs.filter(Q(brand__slug__iexact=brand) | Q(brand__name__iexact=brand))

        # Filter by Category
        category = params.get('category')
        if category and category.lower() != 'all':
            qs = qs.filter(Q(category__slug__iexact=category) | Q(category__name__iexact=category))

        # Filter by Active Status
        status_filter = params.get('status')
        if status_filter == 'active':
            qs = qs.filter(is_active=True)
        elif status_filter == 'inactive':
            qs = qs.filter(is_active=False)

        # Search by keyword
        search = params.get('search')
        if search:
            search = search.strip()
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(sku__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search) |
                Q(brand__name__icontains=search)
            )

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        detail_serializer = ProductDetailSerializer(product)
        return Response({
            'message': f"Product '{product.name}' created successfully!",
            'product': detail_serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        detail_serializer = ProductDetailSerializer(product)
        return Response({
            'message': f"Product '{product.name}' updated successfully!",
            'product': detail_serializer.data
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        instance.delete()
        return Response({
            'message': f"Product '{name}' deleted successfully."
        }, status=status.HTTP_200_OK)


class AdminImageUploadView(APIView):
    """
    Upload image files directly to the server (media/products/).
    Returns the public image URL.
    """
    permission_classes = [IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get('image') or request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No image file was provided in the upload request.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check max file size (10MB)
        if uploaded_file.size > 10 * 1024 * 1024:
            return Response({'error': 'Image file size must not exceed 10MB.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file extension
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif']
        if ext not in allowed_extensions:
            return Response({
                'error': f"Unsupported image format '{ext}'. Allowed: {', '.join(allowed_extensions)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique filename
        filename = f"{uuid.uuid4().hex}{ext}"
        relative_path = f"products/{filename}"

        # Ensure directory exists in media folder
        media_products_dir = settings.MEDIA_ROOT / 'products'
        os.makedirs(media_products_dir, exist_ok=True)

        saved_path = default_storage.save(relative_path, uploaded_file)
        relative_url = f"{settings.MEDIA_URL}{saved_path}".replace('\\', '/')
        absolute_url = request.build_absolute_uri(relative_url)

        # Optional: auto-link to a product if product_id or product_slug provided
        product_id = request.data.get('product_id') or request.data.get('product_slug')
        image_obj_data = None
        if product_id:
            product = None
            if str(product_id).isdigit():
                product = Product.objects.filter(id=int(product_id)).first()
            else:
                product = Product.objects.filter(slug=str(product_id)).first()

            if product:
                is_primary = not product.images.exists() or request.data.get('is_primary') in [True, 'true', '1']
                display_order = product.images.count()
                img_obj = ProductImage.objects.create(
                    product=product,
                    image_url=absolute_url,
                    is_primary=is_primary,
                    display_order=display_order
                )
                image_obj_data = AdminProductImageSerializer(img_obj).data

        return Response({
            'message': 'Image uploaded successfully!',
            'image_url': absolute_url,
            'relative_url': relative_url,
            'filename': filename,
            'image_object': image_obj_data
        }, status=status.HTTP_201_CREATED)


class AdminCategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD for Categories by Admin / Staff.
    """
    queryset = Category.objects.all().select_related('brand').order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrStaff]
    pagination_class = None
    lookup_field = 'id'

    def create(self, request, *args, **kwargs):
        name = str(request.data.get('name', '')).strip()
        brand_id = request.data.get('brand') or request.data.get('brand_id')

        if not name:
            return Response({'error': 'Category name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        brand = None
        if brand_id:
            if str(brand_id).isdigit():
                brand = Brand.objects.filter(id=int(brand_id)).first()
            else:
                brand = Brand.objects.filter(slug=str(brand_id)).first()

        base_slug = slugify(name) or f"category-{uuid.uuid4().hex[:6]}"
        
        # Check if category with this name already exists for this brand
        existing = Category.objects.filter(name__iexact=name, brand=brand).first()
        if existing:
            return Response({
                'message': f"Category '{existing.name}' already exists.",
                'category': CategorySerializer(existing).data
            }, status=status.HTTP_200_OK)

        slug = base_slug
        counter = 1
        while Category.objects.filter(slug=slug, brand=brand).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        category = Category.objects.create(
            name=name,
            slug=slug,
            brand=brand
        )

        return Response({
            'message': f"Category '{category.name}' created successfully.",
            'category': CategorySerializer(category).data
        }, status=status.HTTP_201_CREATED)



class AdminVariantView(APIView):
    """
    Manage individual product variants (quick stock adjust, price override update, delete).
    """
    permission_classes = [IsAdminOrStaff]

    def patch(self, request, id):
        variant = get_object_or_404(ProductVariant, id=id)
        stock = request.data.get('stock_quantity')
        price_override = request.data.get('price_override')
        is_active = request.data.get('is_active')
        size_or_shade = request.data.get('size_or_shade')

        if stock is not None:
            variant.stock_quantity = max(0, int(stock))
        if price_override is not None:
            variant.price_override = float(price_override) if price_override != '' else None
        if is_active is not None:
            variant.is_active = bool(is_active)
        if size_or_shade:
            variant.size_or_shade = str(size_or_shade)

        variant.save()
        return Response({
            'message': f"Variant '{variant.size_or_shade}' updated.",
            'variant': AdminProductVariantSerializer(variant).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, id):
        variant = get_object_or_404(ProductVariant, id=id)
        name = variant.size_or_shade
        variant.delete()
        return Response({'message': f"Variant '{name}' deleted."}, status=status.HTTP_200_OK)


# ==========================================
# SITE SETTINGS & BANNERS VIEWS
# ==========================================

class PublicSettingsView(APIView):
    """
    Public endpoint to get active site settings and active banners.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings_obj = SiteSettings.get_settings()
        settings_data = SiteSettingsSerializer(settings_obj).data
        banners_qs = Banner.objects.filter(is_active=True).order_by('display_order', '-created_at')
        banners_data = BannerSerializer(banners_qs, many=True).data

        return Response({
            'settings': settings_data,
            'banners': banners_data
        }, status=status.HTTP_200_OK)


class AdminSettingsView(APIView):
    """
    Admin endpoint to view and update site-wide settings (offers, header, logo, phone, WhatsApp, hero banners, footer).
    """
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        settings_obj = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(settings_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        return self._update(request, partial=False)

    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial=False):
        settings_obj = SiteSettings.get_settings()
        serializer = SiteSettingsSerializer(settings_obj, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'message': 'Store settings updated successfully!',
            'settings': serializer.data
        }, status=status.HTTP_200_OK)


class AdminBannerViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for store banners.
    """
    queryset = Banner.objects.all().order_by('display_order', '-created_at')
    serializer_class = BannerSerializer
    permission_classes = [IsAdminOrStaff]


