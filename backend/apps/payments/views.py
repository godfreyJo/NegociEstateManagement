from rest_framework import generics, permissions
from .models import RentInvoice, PaymentTransaction
from .serializers import RentInvoiceSerializer, PaymentTransactionSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class InvoiceListView(generics.ListCreateAPIView):
    queryset = RentInvoice.objects.all()
    serializer_class = RentInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

class TransactionListView(generics.ListCreateAPIView):
    queryset = PaymentTransaction.objects.all()
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]



@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(APIView):
    authentication_classes = []  # Public endpoint
    permission_classes = []
    
    def post(self, request):
        # Process M-Pesa callback
        print("M-Pesa Callback:", request.data)
        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})

@method_decorator(csrf_exempt, name='dispatch')
class MpesaValidationView(APIView):
    authentication_classes = []
    permission_classes = []
    
    def post(self, request):
        return Response({
            "ResultCode": 0,
            "ResultDesc": "Accepted",
            "ThirdPartyTransID": "0"
        })

@method_decorator(csrf_exempt, name='dispatch')
class MpesaConfirmationView(APIView):
    authentication_classes = []
    permission_classes = []
    
    def post(self, request):
        print("M-Pesa Confirmation:", request.data)
        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})
