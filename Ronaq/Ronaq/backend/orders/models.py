import uuid
from django.db import models
from django.conf import settings

def generate_order_number():
    return f"RNQ-{uuid.uuid4().hex[:8].upper()}"

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        PACKED = 'PACKED', 'Packed'
        SHIPPED = 'SHIPPED', 'Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'
        RETURNED = 'RETURNED', 'Returned'

    class PaymentStatus(models.TextChoices):
        UNPAID = 'UNPAID', 'Unpaid'
        PAID = 'PAID', 'Paid'
        REFUNDED = 'REFUNDED', 'Refunded'

    class PaymentMethod(models.TextChoices):
        COD = 'COD', 'Cash on Delivery'
        CARD = 'CARD', 'Credit / Debit Card'

    order_number = models.CharField(max_length=50, unique=True, default=generate_order_number)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    shipping_full_name = models.CharField(max_length=150)
    shipping_email = models.EmailField()
    shipping_phone = models.CharField(max_length=30)
    shipping_address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True, default='')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.COD)
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} ({self.get_status_display()})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('catalog.Product', on_delete=models.SET_NULL, null=True, blank=True)
    variant = models.ForeignKey('catalog.ProductVariant', on_delete=models.SET_NULL, null=True, blank=True)
    brand_name = models.CharField(max_length=100, blank=True, default='')
    product_name = models.CharField(max_length=255)
    variant_name = models.CharField(max_length=100, blank=True, default='')
    image_url = models.CharField(max_length=500, blank=True, default='')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} ({self.variant_name})"

class DeliveryCity(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    estimated_days = models.CharField(max_length=50, default='2-4 Business Days', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Delivery Cities'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"

