from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.PropertyViewSet, basename='property')
router.register(r'units', views.UnitViewSet, basename='unit')

urlpatterns = [
    path('', include(router.urls)),
]