from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Wishlist, WishlistItem
from catalog.models import ProductVariant, Product
from .serializers import CartSerializer, CartItemSerializer, WishlistSerializer, WishlistItemSerializer

class CartDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        variant_id = request.data.get('variant_id') or request.data.get('variant')
        quantity = int(request.data.get('quantity', 1))

        if not variant_id:
            return Response({'error': 'variant_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        variant = get_object_or_404(ProductVariant, id=variant_id)
        cart, _ = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, variant=variant)
        new_quantity = quantity if created else (cart_item.quantity + quantity)

        if new_quantity > variant.stock_quantity:
            return Response({
                'error': f'Only {variant.stock_quantity} units available in stock.'
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = new_quantity
        cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UpdateCartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
        quantity = request.data.get('quantity')

        if quantity is None:
            return Response({'error': 'quantity is required.'}, status=status.HTTP_400_BAD_REQUEST)

        quantity = int(quantity)
        if quantity <= 0:
            cart_item.delete()
        else:
            if quantity > cart_item.variant.stock_quantity:
                return Response({
                    'error': f'Only {cart_item.variant.stock_quantity} units available in stock.'
                }, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = quantity
            cart_item.save()

        cart = Cart.objects.get(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class RemoveCartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
        cart_item.delete()
        cart = Cart.objects.get(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class ClearCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

# Wishlist Views
class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data)

class AddToWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id') or request.data.get('product')
        if not product_id:
            return Response({'error': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if str(product_id).isdigit():
            product = get_object_or_404(Product, id=int(product_id))
        else:
            product = get_object_or_404(Product, slug=product_id)

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)

        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RemoveFromWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, id):
        wishlist = get_object_or_404(Wishlist, user=request.user)
        if str(id).isdigit():
            WishlistItem.objects.filter(wishlist=wishlist, product_id=int(id)).delete()
            WishlistItem.objects.filter(wishlist=wishlist, id=int(id)).delete()
        else:
            WishlistItem.objects.filter(wishlist=wishlist, product__slug=id).delete()
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data)

