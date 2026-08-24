from django.urls import path
from .views import (
    WishlistView,
    AddToWishlistView,
    RemoveFromWishlistView
)

urlpatterns = [
    path('', WishlistView.as_view(), name='wishlist_detail'),
    path('add/', AddToWishlistView.as_view(), name='wishlist_add'),
    path('remove/<int:id>/', RemoveFromWishlistView.as_view(), name='wishlist_remove'),
]
