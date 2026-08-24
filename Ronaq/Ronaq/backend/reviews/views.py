from rest_framework import status, permissions, viewsets, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count, Q
from catalog.models import Product
from orders.models import OrderItem
from .models import Review
from .serializers import ReviewSerializer, AdminReviewSerializer

class IsAdminOrStaff(permissions.BasePermission):
    """
    Allows access only to authenticated users who are staff or have ADMIN/STAFF roles.
    """
    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return bool(user.is_staff or user.is_superuser or getattr(user, 'role', '') in ['ADMIN', 'STAFF'])


class PublicReviewListView(APIView):
    """
    Public endpoint to fetch published customer reviews for the right-side drawer & storefront.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = Review.objects.filter(is_published=True)

        product_param = request.query_params.get('product') or request.query_params.get('product_id')
        if product_param:
            if str(product_param).isdigit():
                queryset = queryset.filter(Q(product__id=int(product_param)) | Q(product__slug=str(product_param)))
            else:
                queryset = queryset.filter(product__slug=product_param)

        brand = request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(product__brand__slug=brand.lower())

        rating = request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=int(rating))

        featured_only = request.query_params.get('featured')
        if featured_only == 'true':
            queryset = queryset.filter(is_featured=True)

        # Calculate store-wide aggregate statistics
        all_published = Review.objects.filter(is_published=True)
        stats = all_published.aggregate(
            avg_rating=Avg('rating'),
            total_count=Count('id')
        )
        avg_rating = round(stats['avg_rating'] or 4.9, 1)
        total_count = stats['total_count'] or 0

        # Distribution breakdown
        distribution = {
            '5_star': all_published.filter(rating=5).count(),
            '4_star': all_published.filter(rating=4).count(),
            '3_star': all_published.filter(rating=3).count(),
            '2_star': all_published.filter(rating=2).count(),
            '1_star': all_published.filter(rating=1).count(),
        }

        limit = int(request.query_params.get('limit', 50))
        reviews = queryset.select_related('user', 'product', 'product__brand')[:limit]
        serializer = ReviewSerializer(reviews, many=True)

        return Response({
            'avg_rating': avg_rating,
            'total_reviews': total_count,
            'distribution': distribution,
            'results': serializer.data
        })


class PublicReviewSubmitView(APIView):
    """
    Allow customers to submit their verified feedback directly.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        rating = request.data.get('rating')
        comment = request.data.get('comment', '').strip()
        customer_name = request.data.get('customer_name', '').strip()
        customer_location = request.data.get('customer_location', 'Verified Buyer').strip()
        product_id = request.data.get('product_id') or request.data.get('product')

        if not rating or not comment:
            return Response({'error': 'Rating and review comment are required.'}, status=status.HTTP_400_BAD_REQUEST)

        product = None
        if product_id:
            try:
                product = Product.objects.filter(id=int(product_id)).first()
            except (ValueError, TypeError):
                product = Product.objects.filter(slug=str(product_id)).first()

        user = request.user if (request.user and request.user.is_authenticated) else None

        review = Review.objects.create(
            user=user,
            customer_name=customer_name or (user.first_name if user else 'Verified Customer'),
            customer_location=customer_location or 'Pakistan',
            product=product,
            rating=min(5, max(1, int(rating))),
            comment=comment,
            is_verified_purchase=True,
            is_published=True,
            is_featured=True
        )

        if product:
            avg_rating = product.reviews.filter(is_published=True).aggregate(Avg('rating'))['rating__avg'] or 5.0
            product.rating = round(avg_rating, 2)
            product.reviews_count = product.reviews.filter(is_published=True).count()
            product.save()

        return Response({
            'message': 'Thank you! Your review has been published.',
            'review': ReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)


class ProductReviewListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, slug):
        product = get_object_or_404(Product, slug=slug)
        reviews = product.reviews.filter(is_published=True)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, slug):
        product = get_object_or_404(Product, slug=slug)
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not rating:
            return Response({'error': 'rating is required.'}, status=status.HTTP_400_BAD_REQUEST)

        has_purchased = OrderItem.objects.filter(
            order__user=request.user,
            product=product
        ).exists()

        review = Review.objects.create(
            user=request.user,
            customer_name=f"{request.user.first_name} {request.user.last_name[:1]}." if request.user.first_name else request.user.email.split('@')[0],
            product=product,
            rating=int(rating),
            comment=comment,
            is_verified_purchase=has_purchased,
            is_published=True,
            is_featured=True
        )

        avg_rating = product.reviews.filter(is_published=True).aggregate(Avg('rating'))['rating__avg'] or 5.0
        product.rating = round(avg_rating, 2)
        product.reviews_count = product.reviews.filter(is_published=True).count()
        product.save()

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


class AdminReviewViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet to fully Add, Edit, Delete, Toggle Publish, and Manage all Reviews.
    """
    queryset = Review.objects.all().select_related('user', 'product', 'product__brand').order_by('-created_at')
    serializer_class = AdminReviewSerializer
    permission_classes = [IsAdminOrStaff]
    filter_backends = [filters.SearchFilter]
    search_fields = ['customer_name', 'comment', 'product__name', 'customer_location']

    def perform_create(self, serializer):
        product_id = self.request.data.get('product_id') or self.request.data.get('product')
        product = None
        if product_id:
            try:
                product = Product.objects.filter(id=int(product_id)).first()
            except (ValueError, TypeError):
                product = Product.objects.filter(slug=str(product_id)).first()

        review = serializer.save(
            user=self.request.user,
            product=product,
            customer_name=self.request.data.get('customer_name', 'Valued Customer'),
            customer_location=self.request.data.get('customer_location', 'Verified Buyer'),
            is_verified_purchase=self.request.data.get('is_verified_purchase', True),
            is_published=self.request.data.get('is_published', True),
            is_featured=self.request.data.get('is_featured', True),
        )

        if product:
            avg_rating = product.reviews.filter(is_published=True).aggregate(Avg('rating'))['rating__avg'] or 5.0
            product.rating = round(avg_rating, 2)
            product.reviews_count = product.reviews.filter(is_published=True).count()
            product.save()

    def perform_update(self, serializer):
        product_id = self.request.data.get('product_id')
        extra_kwargs = {}
        if product_id is not None:
            if product_id == '' or product_id == 'none':
                extra_kwargs['product'] = None
            else:
                try:
                    extra_kwargs['product'] = Product.objects.filter(id=int(product_id)).first()
                except (ValueError, TypeError):
                    pass

        review = serializer.save(**extra_kwargs)
        if review.product:
            avg_rating = review.product.reviews.filter(is_published=True).aggregate(Avg('rating'))['rating__avg'] or 5.0
            review.product.rating = round(avg_rating, 2)
            review.product.reviews_count = review.product.reviews.filter(is_published=True).count()
            review.product.save()

    @action(detail=True, methods=['post'], url_path='toggle-publish')
    def toggle_publish(self, request, pk=None):
        review = self.get_object()
        review.is_published = not review.is_published
        review.save()
        return Response({
            'message': f"Review {'published' if review.is_published else 'hidden'} successfully.",
            'is_published': review.is_published,
            'review': AdminReviewSerializer(review).data
        })

    @action(detail=True, methods=['post'], url_path='toggle-feature')
    def toggle_feature(self, request, pk=None):
        review = self.get_object()
        review.is_featured = not review.is_featured
        review.save()
        return Response({
            'message': f"Review {'featured' if review.is_featured else 'unfeatured'} successfully.",
            'is_featured': review.is_featured,
            'review': AdminReviewSerializer(review).data
        })

