from django.urls import path
from .views import (
    CartDetailView,
    AddToCartView,
    UpdateCartItemView,
    RemoveCartItemView,
    ClearCartView
)

urlpatterns = [
    path('', CartDetailView.as_view(), name='cart_detail'),
    path('add/', AddToCartView.as_view(), name='cart_add'),
    path('update/<int:item_id>/', UpdateCartItemView.as_view(), name='cart_update'),
    path('remove/<int:item_id>/', RemoveCartItemView.as_view(), name='cart_remove'),
    path('clear/', ClearCartView.as_view(), name='cart_clear'),
]
