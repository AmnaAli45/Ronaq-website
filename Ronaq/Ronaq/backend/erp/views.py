from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q, F
from django.shortcuts import get_object_or_404
from catalog.models import Brand, Product, ProductVariant
from orders.models import Order, OrderItem
from inventory.models import StockMovement
from catalog.serializers import ProductDetailSerializer
from orders.serializers import OrderSerializer

class IsStaffOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.role in ['STAFF', 'ADMIN']))

class ERPAnalyticsView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        total_revenue = Order.objects.filter(payment_status=Order.PaymentStatus.PAID).aggregate(total=Sum('total_amount'))['total'] or 0.00
        total_orders = Order.objects.count()

        # Sales by Brand
        sales_by_brand = {}
        for brand in Brand.objects.all():
            brand_sales = OrderItem.objects.filter(
                product__brand=brand,
                order__payment_status=Order.PaymentStatus.PAID
            ).aggregate(total=Sum('total_price'))['total'] or 0.00
            sales_by_brand[brand.name] = float(brand_sales)

        # Orders status breakdown
        status_breakdown = dict(Order.objects.values('status').annotate(count=Count('id')).values_list('status', 'count'))

        # Low stock variants (quantity <= 10)
        low_stock_variants = ProductVariant.objects.filter(stock_quantity__lte=10, is_active=True).select_related('product', 'product__brand')
        low_stock_list = [{
            'id': v.id,
            'product_name': v.product.name,
            'brand': v.product.brand.name,
            'variant': v.size_or_shade,
            'sku': v.sku,
            'stock': v.stock_quantity
        } for v in low_stock_variants]

        # Best sellers
        best_sellers_qs = OrderItem.objects.values('product__name', 'brand_name').annotate(
            total_qty=Sum('quantity'),
            total_sales=Sum('total_price')
        ).order_by('-total_qty')[:5]

        return Response({
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'sales_by_brand': sales_by_brand,
            'status_breakdown': status_breakdown,
            'low_stock_count': len(low_stock_list),
            'low_stock_items': low_stock_list,
            'best_sellers': list(best_sellers_qs)
        })

class ERPProductListView(generics.ListCreateAPIView):
    permission_classes = [IsStaffOrAdmin]
    serializer_class = ProductDetailSerializer

    def get_queryset(self):
        qs = Product.objects.all().prefetch_related('variants', 'images', 'brand')
        brand_slug = self.request.query_params.get('brand')
        if brand_slug:
            qs = qs.filter(brand__slug__iexact=brand_slug)
        return qs

class ERPOrderListView(generics.ListAPIView):
    permission_classes = [IsStaffOrAdmin]
    serializer_class = OrderSerializer

    def get_queryset(self):
        qs = Order.objects.all().prefetch_related('items')
        brand_slug = self.request.query_params.get('brand')
        if brand_slug:
            qs = qs.filter(items__product__brand__slug__iexact=brand_slug).distinct()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status__iexact=status_filter)
        return qs

class ERPUpdateOrderStatusView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def patch(self, request, id):
        order = get_object_or_404(Order, id=id)
        new_status = request.data.get('status')
        if not new_status or new_status not in Order.Status.values:
            return Response({'error': f'Invalid status. Allowed: {Order.Status.values}'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        if new_status == Order.Status.DELIVERED:
            order.payment_status = Order.PaymentStatus.PAID
        order.save()

        return Response({
            'message': f'Order status updated to {new_status}',
            'order': OrderSerializer(order).data
        })

class ERPInventoryAdjustView(APIView):
    permission_classes = [IsStaffOrAdmin]

    def post(self, request):
        variant_id = request.data.get('variant_id')
        adjustment_qty = request.data.get('quantity')
        reason = request.data.get('reason', 'Manual Adjustment')

        if not variant_id or adjustment_qty is None:
            return Response({'error': 'variant_id and quantity are required.'}, status=status.HTTP_400_BAD_REQUEST)

        variant = get_object_or_404(ProductVariant, id=variant_id)
        adjustment_qty = int(adjustment_qty)

        variant.stock_quantity += adjustment_qty
        if variant.stock_quantity < 0:
            variant.stock_quantity = 0
        variant.save()

        StockMovement.objects.create(
            variant=variant,
            movement_type=StockMovement.MovementType.ADJUSTMENT,
            quantity=adjustment_qty,
            reason=reason,
            created_by=request.user
        )

        return Response({
            'message': f'Stock updated for {variant.product.name} ({variant.size_or_shade}). New stock: {variant.stock_quantity}',
            'stock_quantity': variant.stock_quantity
        })
