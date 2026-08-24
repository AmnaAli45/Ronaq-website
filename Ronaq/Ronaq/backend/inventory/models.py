from django.db import models
from django.conf import settings

class Supplier(models.Model):
    name = models.CharField(max_length=150)
    contact_person = models.CharField(max_length=100, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=30, blank=True, default='')
    address = models.TextField(blank=True, default='')

    def __str__(self):
        return self.name

class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        IN = 'IN', 'Stock In'
        OUT = 'OUT', 'Stock Out'
        ADJUSTMENT = 'ADJUSTMENT', 'Adjustment'
        RETURN = 'RETURN', 'Customer Return'
        ORDER = 'ORDER', 'Order Deduction'

    variant = models.ForeignKey('catalog.ProductVariant', on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity = models.IntegerField(help_text="Positive for additions, negative for deductions.")
    reason = models.CharField(max_length=255, blank=True, default='')
    linked_order_number = models.CharField(max_length=100, blank=True, default='')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='stock_movements')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_movement_type_display()}: {self.quantity} for {self.variant.product.name} ({self.variant.size_or_shade})"
