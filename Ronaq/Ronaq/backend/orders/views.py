from rest_framework import status, permissions, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem, DeliveryCity
from .serializers import OrderSerializer, CheckoutSerializer, DeliveryCitySerializer
from .emails import send_order_confirmation_email, send_order_status_update_email
from cart.models import Cart, CartItem
from catalog.models import Product, ProductVariant
from inventory.models import StockMovement


class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                request.user.is_staff or 
                request.user.is_superuser or 
                getattr(request.user, 'role', '') in ['STAFF', 'ADMIN']
            )
        )


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_items = list(cart.items.select_related('variant', 'variant__product', 'variant__product__brand').all())

        raw_items = data.get('items') or request.data.get('items') or []

        # If DB cart is empty, try populating from supplied raw_items
        if not cart_items and raw_items:
            for raw_item in raw_items:
                variant = None
                variant_id = raw_item.get('variant_id') or raw_item.get('variantId')
                if variant_id and str(variant_id).isdigit():
                    variant = ProductVariant.objects.filter(id=int(variant_id)).first()

                if not variant:
                    prod_identifier = (
                        raw_item.get('product_id') or 
                        raw_item.get('product_slug') or 
                        (raw_item.get('product', {}).get('id') if isinstance(raw_item.get('product'), dict) else raw_item.get('product'))
                    )
                    if prod_identifier:
                        if str(prod_identifier).isdigit():
                            product = Product.objects.filter(id=int(prod_identifier)).first()
                        else:
                            product = Product.objects.filter(slug=str(prod_identifier)).first()

                        if product:
                            variant_str = raw_item.get('variant_name') or raw_item.get('variant')
                            if variant_str:
                                variant = product.variants.filter(size_or_shade=variant_str).first()
                            if not variant:
                                variant = product.variants.first()

                qty = int(raw_item.get('quantity', 1))
                if variant:
                    CartItem.objects.update_or_create(
                        cart=cart,
                        variant=variant,
                        defaults={'quantity': qty}
                    )

            cart_items = list(cart.items.select_related('variant', 'variant__product', 'variant__product__brand').all())

        # If still no items at all:
        if not cart_items and not raw_items:
            return Response({'error': 'Your cart is empty. Please add items before placing an order.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            discount_amount = float(data.get('discount', 0.0))

            if cart_items:
                # Check stock availability for all items
                for item in cart_items:
                    if item.quantity > item.variant.stock_quantity:
                        return Response({
                            'error': f"Insufficient stock for {item.variant.product.name} ({item.variant.size_or_shade}). Only {item.variant.stock_quantity} available."
                        }, status=status.HTTP_400_BAD_REQUEST)

                subtotal = sum(item.total_price for item in cart_items)
                shipping_fee = 0.00 if float(subtotal) >= 50 else 10.00
                applied_discount = min(float(subtotal), max(0.0, discount_amount))
                total_amount = max(0.0, float(subtotal) - applied_discount + shipping_fee)

                order = Order.objects.create(
                    user=request.user,
                    shipping_full_name=data['shipping_full_name'],
                    shipping_email=data['shipping_email'],
                    shipping_phone=data['shipping_phone'],
                    shipping_address=data['shipping_address'],
                    city=data['city'],
                    postal_code=data.get('postal_code', ''),
                    payment_method=Order.PaymentMethod.COD,
                    payment_status=Order.PaymentStatus.UNPAID,
                    subtotal=subtotal,
                    shipping_fee=shipping_fee,
                    discount=applied_discount,
                    total_amount=total_amount,
                    status=Order.Status.CONFIRMED
                )

                for item in cart_items:
                    variant = item.variant
                    product = variant.product
                    primary_img = product.images.filter(is_primary=True).first() or product.images.first()
                    img_url = primary_img.image_url if primary_img else ''

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        variant=variant,
                        brand_name=product.brand.name,
                        product_name=product.name,
                        variant_name=variant.size_or_shade,
                        image_url=img_url,
                        unit_price=variant.price,
                        quantity=item.quantity,
                        total_price=item.total_price
                    )

                    # Deduct stock
                    variant.stock_quantity -= item.quantity
                    variant.save()

                    # Audit trail log
                    StockMovement.objects.create(
                        variant=variant,
                        movement_type=StockMovement.MovementType.ORDER,
                        quantity=-item.quantity,
                        reason=f"Order #{order.order_number}",
                        linked_order_number=order.order_number,
                        created_by=request.user
                    )

                # Clear cart
                cart.items.all().delete()

            else:
                # Direct order creation from raw_items (fallback if DB cart couldn't populate)
                subtotal = 0.0
                for it in raw_items:
                    price = float(it.get('unit_price') or it.get('price') or 0.0)
                    qty = int(it.get('quantity', 1))
                    subtotal += price * qty

                shipping_fee = 0.00 if subtotal >= 50 else 10.00
                applied_discount = min(subtotal, max(0.0, discount_amount))
                total_amount = max(0.0, subtotal - applied_discount + shipping_fee)

                order = Order.objects.create(
                    user=request.user,
                    shipping_full_name=data['shipping_full_name'],
                    shipping_email=data['shipping_email'],
                    shipping_phone=data['shipping_phone'],
                    shipping_address=data['shipping_address'],
                    city=data['city'],
                    postal_code=data.get('postal_code', ''),
                    payment_method=Order.PaymentMethod.COD,
                    payment_status=Order.PaymentStatus.UNPAID,
                    subtotal=subtotal,
                    shipping_fee=shipping_fee,
                    discount=applied_discount,
                    total_amount=total_amount,
                    status=Order.Status.CONFIRMED
                )

                for it in raw_items:
                    price = float(it.get('unit_price') or it.get('price') or 0.0)
                    qty = int(it.get('quantity', 1))
                    product_obj = it.get('product') if isinstance(it.get('product'), dict) else {}
                    p_name = it.get('product_name') or product_obj.get('name') or 'Luxury Product'
                    b_name = it.get('brand_name') or product_obj.get('brand') or 'Ronaq Luxury'
                    v_name = it.get('variant_name') or it.get('variant') or 'Standard'
                    img = it.get('image') or it.get('image_url') or product_obj.get('image') or ''

                    variant = None
                    variant_id = it.get('variant_id') or it.get('variantId')
                    if variant_id and str(variant_id).isdigit():
                        variant = ProductVariant.objects.filter(id=int(variant_id)).first()

                    product = None
                    if variant:
                        product = variant.product
                    else:
                        prod_identifier = (
                            it.get('product_id') or 
                            it.get('product_slug') or 
                            product_obj.get('id') or 
                            product_obj.get('slug')
                        )
                        if prod_identifier:
                            if str(prod_identifier).isdigit():
                                product = Product.objects.filter(id=int(prod_identifier)).first()
                            else:
                                product = Product.objects.filter(slug=str(prod_identifier)).first()
                        if product:
                            variant = product.variants.filter(size_or_shade=v_name).first() or product.variants.first()

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        variant=variant,
                        brand_name=product.brand.name if product else b_name,
                        product_name=product.name if product else p_name,
                        variant_name=variant.size_or_shade if variant else v_name,
                        image_url=img or (product.images.first().image_url if (product and product.images.exists()) else ''),
                        unit_price=variant.price if variant else price,
                        quantity=qty,
                        total_price=(float(variant.price) if variant else price) * qty
                    )

                    if variant:
                        variant.stock_quantity = max(0, variant.stock_quantity - qty)
                        variant.save()
                        StockMovement.objects.create(
                            variant=variant,
                            movement_type=StockMovement.MovementType.ORDER,
                            quantity=-qty,
                            reason=f"Order #{order.order_number}",
                            linked_order_number=order.order_number,
                            created_by=request.user
                        )

                cart.items.all().delete()

        # Send order confirmation email (non-blocking)
        send_order_confirmation_email(order)

        return Response({
            'message': 'Order placed successfully!',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            Q(user=self.request.user) | Q(shipping_email__iexact=self.request.user.email)
        ).prefetch_related('items').distinct().order_by('-created_at')

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Order.objects.filter(
            Q(user=self.request.user) | Q(shipping_email__iexact=self.request.user.email)
        ).prefetch_related('items').distinct()

class TrackOrderView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        order_num = request.query_params.get('order_number', '').strip()

        if not order_num:
            return Response({'error': 'Please enter an Order Reference Number.'}, status=status.HTTP_400_BAD_REQUEST)

        clean_num = order_num.replace('#', '').strip()
        order = Order.objects.filter(
            Q(order_number__iexact=clean_num) |
            Q(order_number__iexact=f"RNQ-{clean_num}") |
            Q(order_number__icontains=clean_num)
        ).prefetch_related('items').first()

        if not order:
            return Response({
                'error': f"No order found with Reference Number '{order_num}'. Please double check the ID."
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)



class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        order = get_object_or_404(Order, id=id, user=request.user)

        if order.status in [Order.Status.SHIPPED, Order.Status.DELIVERED, Order.Status.CANCELLED, Order.Status.RETURNED]:
            return Response({
                'error': f"Cannot cancel order in '{order.get_status_display()}' status."
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order.status = Order.Status.CANCELLED
            if order.payment_status == Order.PaymentStatus.PAID:
                order.payment_status = Order.PaymentStatus.REFUNDED
            order.save()

            # Restore stock
            for item in order.items.all():
                if item.variant:
                    item.variant.stock_quantity += item.quantity
                    item.variant.save()

                    StockMovement.objects.create(
                        variant=item.variant,
                        movement_type=StockMovement.MovementType.RETURN,
                        quantity=item.quantity,
                        reason=f"Order #{order.order_number} cancelled by customer",
                        linked_order_number=order.order_number,
                        created_by=request.user
                    )

        return Response({
            'message': 'Order cancelled successfully and stock restored.',
            'order': OrderSerializer(order).data
        })

class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        qs = Order.objects.all().prefetch_related('items').order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            qs = qs.filter(status=status_param.upper())
        
        search_param = self.request.query_params.get('search')
        if search_param:
            search_param = search_param.strip()
            qs = qs.filter(
                Q(order_number__icontains=search_param) |
                Q(shipping_full_name__icontains=search_param) |
                Q(shipping_email__icontains=search_param) |
                Q(shipping_phone__icontains=search_param) |
                Q(city__icontains=search_param)
            )
        return qs

class AdminUpdateOrderStatusView(APIView):
    permission_classes = [IsAdminOrStaff]

    def patch(self, request, id):
        order = get_object_or_404(Order, id=id)
        new_status = request.data.get('status')
        new_payment_status = request.data.get('payment_status')

        old_status = order.status
        updated = False

        if new_status and new_status in Order.Status.values:
            if new_status != old_status:
                with transaction.atomic():
                    # Handle inventory when cancelling / re-opening
                    if new_status == Order.Status.CANCELLED and old_status != Order.Status.CANCELLED:
                        for item in order.items.all():
                            if item.variant:
                                item.variant.stock_quantity += item.quantity
                                item.variant.save()
                                StockMovement.objects.create(
                                    variant=item.variant,
                                    movement_type=StockMovement.MovementType.RETURN,
                                    quantity=item.quantity,
                                    reason=f"Order #{order.order_number} cancelled by Admin",
                                    linked_order_number=order.order_number,
                                    created_by=request.user
                                )
                    elif old_status == Order.Status.CANCELLED and new_status != Order.Status.CANCELLED:
                        for item in order.items.all():
                            if item.variant:
                                item.variant.stock_quantity -= item.quantity
                                item.variant.save()
                                StockMovement.objects.create(
                                    variant=item.variant,
                                    movement_type=StockMovement.MovementType.ORDER,
                                    quantity=-item.quantity,
                                    reason=f"Order #{order.order_number} re-opened by Admin",
                                    linked_order_number=order.order_number,
                                    created_by=request.user
                                )

                    order.status = new_status
                    if new_status == Order.Status.DELIVERED and order.payment_method == Order.PaymentMethod.COD:
                        order.payment_status = Order.PaymentStatus.PAID
                    order.save()
                    updated = True

        if new_payment_status and new_payment_status in Order.PaymentStatus.values:
            order.payment_status = new_payment_status
            order.save()
            updated = True

        return Response({
            'message': f"Order #{order.order_number} status updated to {order.get_status_display()}.",
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)


class DeliveryCityListView(generics.ListAPIView):
    """
    Public endpoint for customers to get the list of active delivery cities for checkout.
    """
    queryset = DeliveryCity.objects.filter(is_active=True).order_by('name')
    serializer_class = DeliveryCitySerializer
    permission_classes = [permissions.AllowAny]


class AdminDeliveryCityViewSet(viewsets.ModelViewSet):
    """
    Admin endpoint to list, add, edit, toggle active status, and delete delivery cities.
    """
    queryset = DeliveryCity.objects.all().order_by('name')
    serializer_class = DeliveryCitySerializer
    permission_classes = [IsAdminOrStaff]
    lookup_field = 'id'


