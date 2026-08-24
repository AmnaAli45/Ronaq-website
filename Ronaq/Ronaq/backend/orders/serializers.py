from rest_framework import serializers
from .models import Order, OrderItem, DeliveryCity


class DeliveryCitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryCity
        fields = ('id', 'name', 'is_active', 'delivery_fee', 'estimated_days', 'created_at', 'updated_at')

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'variant', 'brand_name', 'product_name', 'variant_name', 'image_url', 'unit_price', 'quantity', 'total_price')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'shipping_full_name', 'shipping_email', 'shipping_phone',
            'shipping_address', 'city', 'postal_code', 'status', 'status_display',
            'payment_status', 'payment_status_display', 'payment_method', 'payment_method_display',
            'subtotal', 'shipping_fee', 'discount', 'total_amount', 'items', 'created_at', 'updated_at'
        )

class CheckoutSerializer(serializers.Serializer):
    shipping_full_name = serializers.CharField(max_length=150)
    shipping_email = serializers.EmailField()
    shipping_phone = serializers.CharField(max_length=30)
    shipping_address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    payment_method = serializers.CharField(required=False, default='COD')
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    discount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    items = serializers.ListField(child=serializers.DictField(), required=False, default=list)

    def validate_city(self, value):
        val = value.strip().lower()
        active_cities = list(DeliveryCity.objects.filter(is_active=True).values_list('name', flat=True))
        if not active_cities:
            active_cities = ['Lahore', 'Multan', 'Faisalabad', 'Gojra', 'Shahkot', 'Shukhupura', 'Sahiwal']

        match = next((c for c in active_cities if c.lower() == val), None)
        if not match:
            allowed_display = ", ".join(active_cities)
            raise serializers.ValidationError(
                f"Deliveries are currently available in: {allowed_display}."
            )
        return match

    def validate_payment_method(self, value):
        val = (value or '').strip().upper()
        if val in ('CARD', 'CREDIT', 'DEBIT', 'STRIPE'):
            raise serializers.ValidationError("Card payments are disabled. Only Cash on Delivery (COD) is accepted.")
        return 'COD'

