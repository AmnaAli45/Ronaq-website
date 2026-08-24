import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

def get_order_recipient_email(order):
    """Resolve recipient email from order shipping details or linked user."""
    if order.shipping_email:
        return order.shipping_email
    if order.user and order.user.email:
        return order.user.email
    return None

def send_order_confirmation_email(order):
    """
    Send an Order Confirmation email upon successful checkout.
    Contains full itemized breakdown, prices, address, and order tracking.
    Non-blocking: logs any error without raising an exception.
    """
    try:
        recipient = get_order_recipient_email(order)
        if not recipient:
            logger.warning("Cannot send order confirmation email: Order #%s has no recipient email.", order.order_number)
            return False

        frontend_url = (
            getattr(settings, 'FRONTEND_URL', None)
            or getattr(settings, 'BASE_URL', None)
            or 'http://localhost:5173'
        ).rstrip('/')
        subject = f"Order Confirmation #{order.order_number} - Ronaq Luxury"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Ronaq Luxury <no-reply@ronaq.com>')
        to_email = [recipient]

        context = {
            'order': order,
            'site_url': frontend_url,
        }

        html_content = render_to_string('emails/order_confirmation.html', context)
        text_content = strip_tags(html_content)

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=to_email,
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)

        logger.info("Order confirmation email sent successfully for Order #%s to %s", order.order_number, recipient)
        return True

    except Exception as e:
        logger.exception("Failed to send order confirmation email for Order #%s: %s", getattr(order, 'order_number', 'unknown'), str(e))
        return False

def send_order_status_update_email(order, old_status=None, new_status=None):
    """
    Send a Status Update email when an order's status changes (Shipped, Delivered, Cancelled, etc.).
    Non-blocking: logs any error without raising an exception.
    """
    try:
        recipient = get_order_recipient_email(order)
        if not recipient:
            logger.warning("Cannot send status update email: Order #%s has no recipient email.", order.order_number)
            return False

        current_status_display = order.get_status_display()
        frontend_url = (
            getattr(settings, 'FRONTEND_URL', None)
            or getattr(settings, 'BASE_URL', None)
            or 'http://localhost:5173'
        ).rstrip('/')
        subject = f"Order #{order.order_number} Status Update: {current_status_display} - Ronaq Luxury"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Ronaq Luxury <no-reply@ronaq.com>')
        to_email = [recipient]

        context = {
            'order': order,
            'old_status': old_status,
            'new_status': new_status or order.status,
            'site_url': frontend_url,
        }

        html_content = render_to_string('emails/order_status_update.html', context)
        text_content = strip_tags(html_content)

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=to_email,
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)

        logger.info("Order status update email sent successfully for Order #%s (%s) to %s", order.order_number, current_status_display, recipient)
        return True

    except Exception as e:
        logger.exception("Failed to send order status update email for Order #%s: %s", getattr(order, 'order_number', 'unknown'), str(e))
        return False
