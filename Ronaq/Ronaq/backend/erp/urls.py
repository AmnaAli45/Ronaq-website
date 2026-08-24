from django.urls import path
from .views import (
    ERPAnalyticsView,
    ERPProductListView,
    ERPOrderListView,
    ERPUpdateOrderStatusView,
    ERPInventoryAdjustView
)

urlpatterns = [
    path('analytics/', ERPAnalyticsView.as_view(), name='erp_analytics'),
    path('products/', ERPProductListView.as_view(), name='erp_products'),
    path('orders/', ERPOrderListView.as_view(), name='erp_orders'),
    path('orders/<int:id>/status/', ERPUpdateOrderStatusView.as_view(), name='erp_order_status'),
    path('inventory/adjust/', ERPInventoryAdjustView.as_view(), name='erp_inventory_adjust'),
]
