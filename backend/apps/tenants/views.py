from rest_framework import viewsets, permissions
from .models import TenantProfile, Lease
from .serializers import TenantProfileSerializer, LeaseSerializer

class TenantProfileViewSet(viewsets.ModelViewSet):
    queryset = TenantProfile.objects.all()
    serializer_class = TenantProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

class LeaseViewSet(viewsets.ModelViewSet):
    queryset = Lease.objects.all()
    serializer_class = LeaseSerializer
    permission_classes = [permissions.IsAuthenticated]