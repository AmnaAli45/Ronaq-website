from django.test import TestCase
from django.core import mail
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from accounts.emails import generate_verification_token

User = get_user_model()

class UserAccountTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_user(self):
        user = User.objects.create_user(email='test@example.com', password='password123', first_name='Test', last_name='User')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('password123'))
        self.assertEqual(user.role, User.Role.CUSTOMER)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_email_verified)

    def test_create_superuser(self):
        admin = User.objects.create_superuser(email='admin@example.com', password='adminpassword')
        self.assertEqual(admin.email, 'admin@example.com')
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertEqual(admin.role, User.Role.ADMIN)
        self.assertTrue(admin.is_email_verified)

    def test_signup_triggers_welcome_email(self):
        mail.outbox = []
        response = self.client.post('/api/auth/signup/', {
            'email': 'newcustomer@example.com',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
            'first_name': 'Sophia',
            'last_name': 'Laurent'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 1)
        
        email = mail.outbox[0]
        self.assertIn('Welcome to Ronaq Luxury', email.subject)
        self.assertEqual(email.to, ['newcustomer@example.com'])
        self.assertIn('Sophia', email.body)
        self.assertIn('verify-email', email.body)
        self.assertNotIn('uid=NA', email.body)
        created_user = User.objects.get(email='newcustomer@example.com')
        expected_uid, _ = generate_verification_token(created_user)
        self.assertIn(f'uid={expected_uid}', email.body)

    def test_email_verification_flow(self):
        user = User.objects.create_user(email='verify@example.com', password='password123')
        self.assertFalse(user.is_email_verified)

        uid, token = generate_verification_token(user)
        response = self.client.post('/api/auth/verify-email/', {
            'uid': uid,
            'token': token
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)

    def test_email_verification_invalid_token(self):
        user = User.objects.create_user(email='verify_fail@example.com', password='password123')
        uid, _ = generate_verification_token(user)
        
        response = self.client.post('/api/auth/verify-email/', {
            'uid': uid,
            'token': 'invalid-token-123'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        user.refresh_from_db()
        self.assertFalse(user.is_email_verified)

    def test_resend_verification_email(self):
        user = User.objects.create_user(email='resend@example.com', password='password123')
        mail.outbox = []

        response = self.client.post('/api/auth/resend-verification/', {
            'email': 'resend@example.com'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['resend@example.com'])

    @patch('accounts.emails.EmailMultiAlternatives.send')
    def test_signup_resilient_when_email_fails(self, mock_send):
        mock_send.side_effect = Exception("SMTP Connection Timeout")
        
        response = self.client.post('/api/auth/signup/', {
            'email': 'resilient@example.com',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
            'first_name': 'Resilient',
            'last_name': 'User'
        }, format='json')

        # Signup must still succeed even if email fails
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='resilient@example.com').exists())

    def test_welcome_email_uses_configurable_frontend_url(self):
        user = User.objects.create_user(email='customurl@example.com', password='password123')
        mail.outbox = []

        with self.settings(FRONTEND_URL='https://ronaq.luxury.com/'):
            from accounts.emails import send_welcome_email
            send_welcome_email(user)

            self.assertEqual(len(mail.outbox), 1)
            email = mail.outbox[0]
            self.assertIn('https://ronaq.luxury.com/verify-email?uid=', email.body)
            self.assertNotIn('//verify-email', email.body)
