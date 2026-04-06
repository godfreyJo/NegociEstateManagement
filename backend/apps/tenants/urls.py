from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.TenantProfileViewSet, basename='tenant-profile')
router.register(r'leases', views.LeaseViewSet, basename='lease')

urlpatterns = [
    path('', include(router.urls)),
]