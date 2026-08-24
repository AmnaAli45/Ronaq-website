from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicReviewListView,
    PublicReviewSubmitView,
    ProductReviewListCreateView,
    AdminReviewViewSet
)

router = DefaultRouter()
router.register(r'admin/reviews', AdminReviewViewSet, basename='admin-review')

urlpatterns = [
    path('reviews/', PublicReviewListView.as_view(), name='public_reviews_list'),
    path('reviews/submit/', PublicReviewSubmitView.as_view(), name='public_review_submit'),
    path('products/<slug:slug>/reviews/', ProductReviewListCreateView.as_view(), name='product_reviews_list_create'),
    path('', include(router.urls)),
]
