import logging
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Order
from .emails import send_order_status_update_email

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Order)
def order_pre_save_status_tracker(sender, instance, **kwargs):
    """
    Cache the original status of an order before it is saved so that
    status transitions can be detected in post_save.
    """
    if instance.pk:
        try:
            previous = Order.objects.filter(pk=instance.pk).values('status').first()
            instance._previous_status = previous['status'] if previous else None
        except Exception as e:
            logger.exception("Error tracking previous order status: %s", e)
            instance._previous_status = None
    else:
        instance._previous_status = None

@receiver(post_save, sender=Order)
def order_post_save_status_notification(sender, instance, created, **kwargs):
    """
    Trigger a status update email if the order status changed on an existing order.
    Note: Initial order placement sends the Order Confirmation email from checkout.
    """
    if not created:
        previous_status = getattr(instance, '_previous_status', None)
        if previous_status and previous_status != instance.status:
            logger.info(
                "Order #%s status changed from %s to %s. Triggering notification email.",
                instance.order_number,
                previous_status,
                instance.status
            )
            send_order_status_update_email(instance, old_status=previous_status, new_status=instance.status)
