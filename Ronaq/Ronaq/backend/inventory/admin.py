from django.contrib import admin
from .models import Supplier, StockMovement

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_person', 'email', 'phone')
    search_fields = ('name', 'contact_person', 'email')

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('variant', 'movement_type', 'quantity', 'reason', 'linked_order_number', 'created_at', 'created_by')
    list_filter = ('movement_type', 'created_at', 'variant__product__brand')
    search_fields = ('variant__product__name', 'variant__sku', 'linked_order_number', 'reason')
