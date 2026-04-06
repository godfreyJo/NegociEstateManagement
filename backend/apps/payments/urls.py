from django.urls import path
from . import views

urlpatterns = [
    path('invoices/', views.InvoiceListView.as_view(), name='invoice-list'),
    path('transactions/', views.TransactionListView.as_view(), name='transaction-list'),
    
]