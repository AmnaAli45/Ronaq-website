from django.db import models

class Payment(models.Model):
    class Status(models.TextChoices):
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
        PENDING = 'PENDING', 'Pending'

    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='payments')
    payment_method = models.CharField(max_length=50)
    transaction_reference = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.transaction_reference} - {self.order.order_number} ({self.status})"
