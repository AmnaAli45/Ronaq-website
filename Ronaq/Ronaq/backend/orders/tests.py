from django.test import TestCase
from django.core import mail
from django.contrib.auth import get_user_model
from catalog.models import Brand, Category, Product, ProductVariant
from cart.models import Cart, CartItem
from orders.models import Order
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch

User = get_user_model()

class OrderCheckoutTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='buyer@example.com', password='password123')
        self.brand = Brand.objects.create(name='Velora', slug='velora')
        self.category = Category.objects.create(name='Serums', slug='serums', brand=self.brand)
        self.product = Product.objects.create(
            brand=self.brand,
            category=self.category,
            name='Test Serum',
            slug='test-serum',
            base_price=30.00,
            sku='SKU-TEST-1'
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            size_or_shade='30ml',
            sku='SKU-TEST-1-30ML',
            price_override=30.00,
            stock_quantity=10
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_checkout_flow_and_confirmation_email(self):
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, variant=self.variant, quantity=2)
        mail.outbox = []

        response = self.client.post('/api/orders/checkout/', {
            'shipping_full_name': 'Buyer Name',
            'shipping_email': 'buyer@example.com',
            'shipping_phone': '1234567890',
            'shipping_address': '123 Luxury Ave',
            'city': 'Lahore',
            'payment_method': 'COD'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 8)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(CartItem.objects.filter(cart=cart).count(), 0)

        # Verify confirmation email was sent
        self.assertEqual(len(mail.outbox), 1)
        confirmation_email = mail.outbox[0]
        order = Order.objects.first()
        self.assertIn(f"Order Confirmation #{order.order_number}", confirmation_email.subject)
        self.assertEqual(confirmation_email.to, ['buyer@example.com'])
        self.assertIn('Test Serum', confirmation_email.body)
        self.assertIn('123 Luxury Ave', confirmation_email.body)
        self.assertIn('Buyer Name', confirmation_email.body)

    def test_checkout_requires_authentication(self):
        anonymous_client = APIClient()
        response = anonymous_client.post('/api/orders/checkout/', {
            'shipping_full_name': 'Anonymous Buyer',
            'shipping_email': 'anon@example.com',
            'shipping_phone': '1234567890',
            'shipping_address': '123 St',
            'city': 'Lahore',
            'payment_method': 'COD'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_checkout_allowed_cities_validation(self):
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, variant=self.variant, quantity=1)

        # Unsupported city should fail
        response = self.client.post('/api/orders/checkout/', {
            'shipping_full_name': 'Buyer Name',
            'shipping_email': 'buyer@example.com',
            'shipping_phone': '1234567890',
            'shipping_address': '123 Luxury Ave',
            'city': 'Karachi',
            'payment_method': 'COD'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Deliveries are currently only available in the following cities', str(response.data))

        # Allowed city (e.g. Multan, Faisalabad, Gojra, Shahkot, Shukhupura, Sahiwal, Lahore) should succeed
        for allowed_city in ['Lahore', 'Multan', 'Faisalabad', 'Gojra', 'Shahkot', 'Shukhupura', 'Sahiwal']:
            cart, _ = Cart.objects.get_or_create(user=self.user)
            if not cart.items.exists():
                CartItem.objects.create(cart=cart, variant=self.variant, quantity=1)
            res = self.client.post('/api/orders/checkout/', {
                'shipping_full_name': 'Buyer Name',
                'shipping_email': 'buyer@example.com',
                'shipping_phone': '1234567890',
                'shipping_address': '123 Main St',
                'city': allowed_city,
                'payment_method': 'COD'
            }, format='json')
            self.assertEqual(res.status_code, status.HTTP_201_CREATED, f"Failed for allowed city: {allowed_city}")

    def test_checkout_promocode_discount_application(self):
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, variant=self.variant, quantity=2)  # $60.00 subtotal

        response = self.client.post('/api/orders/checkout/', {
            'shipping_full_name': 'Buyer Name',
            'shipping_email': 'buyer@example.com',
            'shipping_phone': '1234567890',
            'shipping_address': '123 Luxury Ave',
            'city': 'Lahore',
            'payment_method': 'COD',
            'coupon_code': 'RONAQ10',
            'discount': 6.00
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.order_by('-created_at').first()
        self.assertEqual(float(order.subtotal), 60.00)
        self.assertEqual(float(order.discount), 6.00)
        self.assertEqual(float(order.total_amount), 54.00)

    def test_checkout_rejects_card_payment(self):
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, variant=self.variant, quantity=1)

        response = self.client.post('/api/orders/checkout/', {
            'shipping_full_name': 'Buyer Name',
            'shipping_email': 'buyer@example.com',
            'shipping_phone': '1234567890',
            'shipping_address': '123 Luxury Ave',
            'city': 'Lahore',
            'payment_method': 'CARD'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Only Cash on Delivery (COD) is accepted', str(response.data))

    def test_order_status_change_triggers_update_email(self):
        order = Order.objects.create(
            user=self.user,
            shipping_full_name='Buyer Name',
            shipping_email='buyer@example.com',
            shipping_phone='1234567890',
            shipping_address='123 Luxury Ave',
            city='Lahore',
            subtotal=60.00,
            shipping_fee=0.00,
            total_amount=60.00,
            status=Order.Status.CONFIRMED
        )
        mail.outbox = []

        # Change status to SHIPPED
        order.status = Order.Status.SHIPPED
        order.save()

        self.assertEqual(len(mail.outbox), 1)
        status_email = mail.outbox[0]
        self.assertIn(f"Order #{order.order_number} Status Update: Shipped", status_email.subject)
        self.assertEqual(status_email.to, ['buyer@example.com'])
        self.assertIn('Dispatched & In Transit', status_email.body)

    def test_cancel_order_triggers_cancellation_email(self):
        order = Order.objects.create(
            user=self.user,
            shipping_full_name='Buyer Name',
            shipping_email='buyer@example.com',
            shipping_phone='1234567890',
            shipping_address='123 Luxury Ave',
            city='Lahore',
            subtotal=60.00,
            shipping_fee=0.00,
            total_amount=60.00,
            status=Order.Status.CONFIRMED
        )
        mail.outbox = []

        response = self.client.post(f'/api/orders/{order.id}/cancel/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.CANCELLED)

        self.assertEqual(len(mail.outbox), 1)
        cancel_email = mail.outbox[0]
        self.assertIn(f"Order #{order.order_number} Status Update: Cancelled", cancel_email.subject)
        self.assertIn('Order Cancelled', cancel_email.body)

    @patch('orders.emails.EmailMultiAlternatives.send')
    def test_checkout_resilient_when_email_fails(self, mock_send):
        mock_send.side_effect = Exception("SMTP Gateway Error")
        
        cart, _ = Cart.objects.get_or_create(user=self.user)
        CartItem.objects.create(cart=cart, variant=self.variant, quantity=1)

        response = self.client.post('/api/orders/checkout/', {
            'shipping_full_name': 'Resilient Buyer',
            'shipping_email': 'buyer@example.com',
            'shipping_phone': '1234567890',
            'shipping_address': '123 Test St',
            'city': 'Lahore',
            'payment_method': 'COD'
        }, format='json')

        # Checkout succeeds and order is created despite email failure
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.filter(shipping_full_name='Resilient Buyer').count(), 1)

    def test_order_emails_use_configurable_frontend_url(self):
        order = Order.objects.create(
            user=self.user,
            shipping_full_name='Buyer Name',
            shipping_email='buyer@example.com',
            shipping_phone='1234567890',
            shipping_address='123 Luxury Ave',
            city='Lahore',
            subtotal=60.00,
            shipping_fee=0.00,
            total_amount=60.00,
            status=Order.Status.CONFIRMED
        )
        mail.outbox = []

        with self.settings(FRONTEND_URL='https://ronaq.luxury.com/'):
            from orders.emails import send_order_confirmation_email, send_order_status_update_email
            send_order_confirmation_email(order)
            self.assertEqual(len(mail.outbox), 1)
            self.assertIn('https://ronaq.luxury.com/cart', mail.outbox[0].body)
            self.assertNotIn('//cart', mail.outbox[0].body)

            mail.outbox = []
            send_order_status_update_email(order, old_status='CONFIRMED', new_status='SHIPPED')
            self.assertEqual(len(mail.outbox), 1)
            self.assertIn('https://ronaq.luxury.com/cart', mail.outbox[0].body)
            self.assertNotIn('//cart', mail.outbox[0].body)

    def test_admin_order_list_and_status_update_flow(self):
        admin_user = User.objects.create_user(
            email='admin@example.com',
            password='adminpassword123',
            is_staff=True,
            role=User.Role.ADMIN
        )
        order = Order.objects.create(
            user=self.user,
            shipping_full_name='Buyer Name',
            shipping_email='buyer@example.com',
            shipping_phone='1234567890',
            shipping_address='123 Luxury Ave',
            city='Lahore',
            subtotal=60.00,
            shipping_fee=0.00,
            total_amount=60.00,
            payment_method=Order.PaymentMethod.COD,
            payment_status=Order.PaymentStatus.UNPAID,
            status=Order.Status.CONFIRMED
        )

        # 1. Non-staff customer cannot access admin orders
        customer_client = APIClient()
        customer_client.force_authenticate(user=self.user)
        res_forbidden = customer_client.get('/api/orders/admin/all/')
        self.assertEqual(res_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Staff user can list all orders
        admin_client = APIClient()
        admin_client.force_authenticate(user=admin_user)
        res_admin_list = admin_client.get('/api/orders/admin/all/')
        self.assertEqual(res_admin_list.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res_admin_list.data) >= 1)

        # 3. Admin updates order status to SHIPPED
        mail.outbox = []
        res_update = admin_client.patch(f'/api/orders/{order.id}/status/', {
            'status': 'SHIPPED'
        }, format='json')
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.SHIPPED)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(f"Order #{order.order_number} Status Update: Shipped", mail.outbox[0].subject)

        # 4. Admin updates order status to DELIVERED (auto-marks COD payment as PAID)
        res_delivered = admin_client.patch(f'/api/orders/{order.id}/status/', {
            'status': 'DELIVERED'
        }, format='json')
        self.assertEqual(res_delivered.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.DELIVERED)
        self.assertEqual(order.payment_status, Order.PaymentStatus.PAID)

    def test_track_order_endpoint_for_customers(self):
        order = Order.objects.create(
            user=self.user,
            shipping_full_name='Track Customer',
            shipping_email='tracker@example.com',
            shipping_phone='03001234567',
            shipping_address='789 Fashion Street',
            city='Multan',
            subtotal=89.00,
            shipping_fee=0.00,
            total_amount=89.00,
            status=Order.Status.SHIPPED
        )

        anon_client = APIClient()

        # 1. Track by order number and email
        res1 = anon_client.get(f'/api/orders/track/?order_number={order.order_number}&email=tracker@example.com')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(res1.data['order']['order_number'], order.order_number)
        self.assertEqual(res1.data['order']['status'], 'SHIPPED')

        # 2. Track with partial prefix (without RNQ-)
        clean_code = order.order_number.replace('RNQ-', '')
        res2 = anon_client.get(f'/api/orders/track/?order_number={clean_code}')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.data['order']['order_number'], order.order_number)

        # 3. Invalid order number returns 404
        res_404 = anon_client.get('/api/orders/track/?order_number=INVALID-12345')
        self.assertEqual(res_404.status_code, status.HTTP_404_NOT_FOUND)

    def test_checkout_with_raw_items_when_db_cart_is_empty(self):
        # Ensure DB cart is completely empty
        cart, _ = Cart.objects.get_or_create(user=self.user)
        cart.items.all().delete()
        self.assertEqual(cart.items.count(), 0)

        raw_items = [
            {
                'variant_id': self.variant.id,
                'product_id': self.product.id,
                'product_name': self.product.name,
                'variant_name': self.variant.size_or_shade,
                'unit_price': 30.00,
                'quantity': 2,
                'image': 'https://example.com/serum.jpg'
            }
        ]

        response = self.client.post('/api/orders/checkout/', {
            'shipping_full_name': 'Guest Turned User',
            'shipping_email': 'buyer@example.com',
            'shipping_phone': '03001234567',
            'shipping_address': '456 Gulberg III',
            'city': 'Lahore',
            'payment_method': 'COD',
            'items': raw_items
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 8)
        self.assertEqual(Order.objects.filter(shipping_email='buyer@example.com').count(), 1)
        placed_order = Order.objects.filter(shipping_email='buyer@example.com').first()
        self.assertEqual(placed_order.items.count(), 1)
        self.assertEqual(placed_order.items.first().product, self.product)

    def test_checkout_fails_when_both_db_cart_and_raw_items_are_empty(self):
        cart, _ = Cart.objects.get_or_create(user=self.user)
        cart.items.all().delete()

        response = self.client.post('/api/orders/checkout/', {
            'shipping_full_name': 'Empty Buyer',
            'shipping_email': 'empty@example.com',
            'shipping_phone': '03001234567',
            'shipping_address': '456 Gulberg III',
            'city': 'Lahore',
            'payment_method': 'COD',
            'items': []
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cart is empty', str(response.data).lower())



