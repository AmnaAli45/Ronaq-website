import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

logger = logging.getLogger(__name__)

def generate_verification_token(user):
    """Generate base64 encoded uid and secure token for email verification."""
    user_id = getattr(user, 'pk', None) or getattr(user, 'id', None)
    if user_id is None:
        raise ValueError(f"Cannot generate verification token: user '{user}' has no valid primary key or ID.")
    uid = urlsafe_base64_encode(force_bytes(user_id))
    token = default_token_generator.make_token(user)
    return uid, token

def send_welcome_email(user, request=None):
    """
    Send a Welcome to Ronaq confirmation email to the newly registered user.
    Includes an optional email verification link.
    Non-blocking: logs any error without raising an exception.
    """
    try:
        if not user.email:
            logger.warning("Cannot send welcome email: user has no email address.")
            return False

        frontend_url = (
            getattr(settings, 'FRONTEND_URL', None)
            or getattr(settings, 'BASE_URL', None)
            or 'http://localhost:5173'
        ).rstrip('/')
        uid, token = generate_verification_token(user)
        verification_url = f"{frontend_url}/verify-email?uid={uid}&token={token}"

        subject = "Welcome to Ronaq Luxury"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Ronaq Luxury <no-reply@ronaq.com>')
        to_email = [user.email]

        context = {
            'user': user,
            'verification_url': verification_url,
            'site_url': frontend_url,
        }

        html_content = render_to_string('emails/welcome.html', context)
        text_content = strip_tags(html_content)

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=to_email,
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)

        logger.info("Welcome email sent successfully to %s", user.email)
        return True

    except Exception as e:
        logger.exception("Failed to send welcome email to %s: %s", getattr(user, 'email', 'unknown'), str(e))
        return False
