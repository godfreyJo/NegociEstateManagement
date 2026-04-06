from django.urls import path
from . import views

urlpatterns = [
    path('send/', views.SendNotificationView.as_view(), name='send-notification'),
]