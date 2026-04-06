from django.urls import path
from . import views

urlpatterns = [
    path('callback/', views.MpesaCallbackView.as_view(), name='mpesa-callback'),
    path('validate/', views.MpesaValidationView.as_view(), name='mpesa-validate'),
    path('confirm/', views.MpesaConfirmationView.as_view(), name='mpesa-confirm'),
]