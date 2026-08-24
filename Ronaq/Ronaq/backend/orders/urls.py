from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CheckoutView,
    OrderListView,
    OrderDetailView,
    CancelOrderView,
    AdminOrderListView,
    AdminUpdateOrderStatusView,
    TrackOrderView,
    DeliveryCityListView,
    AdminDeliveryCityViewSet,
)

router = DefaultRouter()
router.register(r'admin/cities', AdminDeliveryCityViewSet, basename='admin_delivery_cities')

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('track/', TrackOrderView.as_view(), name='track_order'),
    path('cities/', DeliveryCityListView.as_view(), name='delivery_cities'),
    path('', OrderListView.as_view(), name='order_list'),
    path('admin/all/', AdminOrderListView.as_view(), name='admin_order_list'),
    path('<int:id>/', OrderDetailView.as_view(), name='order_detail'),
    path('<int:id>/status/', AdminUpdateOrderStatusView.as_view(), name='admin_order_update_status'),
    path('<int:id>/cancel/', CancelOrderView.as_view(), name='order_cancel'),
    path('', include(router.urls)),
]


