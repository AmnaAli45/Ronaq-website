import uuid
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from orders.models import Order
from .models import Payment

class ConfirmPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        simulate_status = request.data.get('status', 'SUCCESS') # 'SUCCESS' or 'FAILED'

        if not order_id:
            return Response({'error': 'order_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, id=order_id, user=request.user)
        tx_ref = f"TXN-{uuid.uuid4().hex[:10].upper()}"

        payment_status = Payment.Status.SUCCESS if simulate_status == 'SUCCESS' else Payment.Status.FAILED

        payment = Payment.objects.create(
            order=order,
            payment_method=order.payment_method,
            transaction_reference=tx_ref,
            amount=order.total_amount,
            status=payment_status
        )

        if payment_status == Payment.Status.SUCCESS:
            order.payment_status = Order.PaymentStatus.PAID
            order.save()

        return Response({
            'message': f'Payment processed with status: {payment_status}',
            'transaction_reference': tx_ref,
            'payment_status': payment_status,
            'order_id': order.id
        })
