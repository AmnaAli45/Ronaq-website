from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE, null=True, blank=True, related_name='reviews')
    customer_name = models.CharField(max_length=150, blank=True, default='')
    customer_location = models.CharField(max_length=100, blank=True, default='Verified Customer')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], default=5)
    comment = models.TextField(blank=True, default='')
    is_verified_purchase = models.BooleanField(default=True)
    is_published = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        name = self.customer_name or (self.user.email if self.user else 'Anonymous')
        prod = self.product.name if self.product else 'General Brand Review'
        return f"Review ({self.rating}/5) by {name} - {prod}"

