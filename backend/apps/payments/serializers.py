from rest_framework import serializers
from .models import RentInvoice, PaymentTransaction

class RentInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentInvoice
        fields = '__all__'

class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = '__all__'