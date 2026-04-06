from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Property, Unit
from .serializers import (
    PropertySerializer, PropertyDetailSerializer, 
    UnitSerializer, UnitListSerializer
)
from apps.accounts.permissions import IsOrganizationMember

class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['property_type', 'city', 'is_active']
    search_fields = ['name', 'address', 'city']
    ordering_fields = ['created_at', 'name', 'total_units']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        # Get organizations where user is member
        org_ids = user.organizations.values_list('id', flat=True)
        owned_org_ids = user.owned_organizations.values_list('id', flat=True)
        all_org_ids = list(set(list(org_ids) + list(owned_org_ids)))
        
        return Property.objects.filter(organization_id__in=all_org_ids)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PropertyDetailSerializer
        return PropertySerializer
    
    def perform_create(self, serializer):

        """Create property with proper organization assignment"""
        print("=" * 50)
        print("Creating property with data:")
        print(self.request.data)
        print("=" * 50)


        # Set organization from user's current org (you'll need to pass this in request)
        organization_id = self.request.data.get('organization')
        if not organization_id:
            # Get user's first organization
            org = self.request.user.owned_organizations.first() or self.request.user.organizations.first()
            if not org:
                # Return clear error message
                raise serializers.ValidationError({
                    "organization": "You don't have any organization. Please create one first."
                })
            organization_id = org.id
            print(f"Using organization: {organization_id}")

        try:
            serializer.save(organization_id=organization_id)
            print("Property created successfully!")
        except Exception as e:
            print("Save error:", e)
        raise
                   
        
    
    @action(detail=True, methods=['get'])
    def occupancy_stats(self, request, pk=None):
        """Get detailed occupancy statistics"""
        property = self.get_object()
        units = property.units.all()
        
        stats = {
            'total_units': units.count(),
            'occupied': units.filter(status='occupied').count(),
            'vacant': units.filter(status='vacant').count(),
            'reserved': units.filter(status='reserved').count(),
            'maintenance': units.filter(status='maintenance').count(),
            'airbnb': units.filter(status='airbnb').count(),
            'occupancy_rate': (
                (units.filter(status='occupied').count() / units.count() * 100)
                if units.count() > 0 else 0
            ),
            'monthly_rent_potential': sum(u.monthly_rent for u in units),
            'monthly_rent_collected': sum(
                u.monthly_rent for u in units.filter(status='occupied')
            ),
        }
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def add_unit(self, request, pk=None):
        """Add a unit to this property"""
        property = self.get_object()
        data = request.data.copy()
        data['property'] = str(property.id)
        
        serializer = UnitSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            # Update property unit count
            property.update_unit_count()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated, IsOrganizationMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'unit_type', 'property', 'is_furnished', 'airbnb_enabled']
    search_fields = ['unit_number', 'description']
    ordering = ['property__name', 'unit_number']
    
    def get_queryset(self):
        user = self.request.user
        org_ids = user.organizations.values_list('id', flat=True)
        owned_org_ids = user.owned_organizations.values_list('id', flat=True)
        all_org_ids = list(set(list(org_ids) + list(owned_org_ids)))
        
        return Unit.objects.filter(property__organization_id__in=all_org_ids)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UnitListSerializer
        return UnitSerializer
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Quick status update"""
        unit = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Unit.STATUS_CHOICES):
            return Response(
                {'error': f'Invalid status. Choose from: {dict(Unit.STATUS_CHOICES).keys()}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        unit.status = new_status
        unit.save()
        return Response(UnitSerializer(unit).data)
    
    @action(detail=True, methods=['post'])
    def upload_photos(self, request, pk=None):
        """Upload photos for this unit"""
        unit = self.get_object()
        photos = request.FILES.getlist('photos')
        
        from .models import UnitPhoto
        uploaded = []
        for photo in photos:
            up = UnitPhoto.objects.create(unit=unit, photo=photo)
            uploaded.append({
                'id': str(up.id),
                'url': up.photo.url,
                'caption': up.caption
            })
        
        return Response({
            'message': f'{len(uploaded)} photos uploaded',
            'photos': uploaded
        }, status=status.HTTP_201_CREATED)
