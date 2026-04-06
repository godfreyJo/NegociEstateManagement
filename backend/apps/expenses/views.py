from rest_framework import generics, permissions
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseListView(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]