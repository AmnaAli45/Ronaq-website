from django.contrib import admin
from .models import Order, OrderItem
from .emails import send_order_status_update_email

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'variant', 'brand_name', 'product_name', 'variant_name', 'unit_price', 'quantity', 'total_price')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'shipping_full_name', 'city', 'total_amount', 'status', 'payment_status', 'payment_method', 'created_at')
    list_filter = ('status', 'payment_status', 'payment_method', 'city', 'created_at')
    search_fields = ('order_number', 'shipping_full_name', 'shipping_email', 'shipping_phone', 'city')
    list_editable = ('status', 'payment_status')
    inlines = [OrderItemInline]
    actions = ['mark_as_confirmed', 'mark_as_packed', 'mark_as_shipped', 'mark_as_delivered', 'mark_as_cancelled']

    @admin.action(description='Mark selected orders as Confirmed')
    def mark_as_confirmed(self, request, queryset):
        for order in queryset:
            order.status = Order.Status.CONFIRMED
            order.save()

    @admin.action(description='Mark selected orders as Packed')
    def mark_as_packed(self, request, queryset):
        for order in queryset:
            order.status = Order.Status.PACKED
            order.save()

    @admin.action(description='Mark selected orders as Shipped (In Transit)')
    def mark_as_shipped(self, request, queryset):
        for order in queryset:
            order.status = Order.Status.SHIPPED
            order.save()

    @admin.action(description='Mark selected orders as Delivered (Paid)')
    def mark_as_delivered(self, request, queryset):
        for order in queryset:
            order.status = Order.Status.DELIVERED
            order.payment_status = Order.PaymentStatus.PAID
            order.save()

    @admin.action(description='Mark selected orders as Cancelled')
    def mark_as_cancelled(self, request, queryset):
        for order in queryset:
            order.status = Order.Status.CANCELLED
            order.save()


