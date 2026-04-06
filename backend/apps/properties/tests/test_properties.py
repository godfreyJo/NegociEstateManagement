import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.tests.factories import UserFactory, OrganizationFactory, OrganizationMemberFactory
from .factories import PropertyFactory, UnitFactory

pytestmark = pytest.mark.django_db

class TestPropertyAPI:
    """Test Property API endpoints"""
    
    def setup_method(self):
        self.client = APIClient()
        self.list_url = reverse('property-list')
    
    def test_list_properties_authenticated(self):
        """Test listing properties requires auth"""
        user = UserFactory()
        org = OrganizationFactory()
        OrganizationMemberFactory(organization=org, user=user)
        
        # Create properties
        PropertyFactory(organization=org, name='Test Property')
        
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == 200
    
    def test_create_property(self):
        """Test creating a new property"""
        user = UserFactory()
        org = OrganizationFactory(owner=user)
        
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {
            'organization': str(org.id),
            'name': 'Sunset Apartments',
            'address': '123 Test Street',
            'city': 'Nairobi',
            'county': 'Nairobi',
            'property_type': 'apartment_block',
            'total_units': 20,
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == 201
        assert response.data['name'] == 'Sunset Apartments'
    
    def test_property_detail(self):
        """Test retrieving property details"""
        user = UserFactory()
        org = OrganizationFactory(owner=user)
        prop = PropertyFactory(organization=org, name='Test Property')
        
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        detail_url = reverse('property-detail', kwargs={'pk': prop.id})
        response = self.client.get(detail_url)
        
        assert response.status_code == 200
        assert response.data['name'] == 'Test Property'

class TestUnitAPI:
    """Test Unit API endpoints"""
    
    def setup_method(self):
        self.client = APIClient()
    
    def test_list_units(self):
        """Test listing units"""
        user = UserFactory()
        org = OrganizationFactory(owner=user)
        prop = PropertyFactory(organization=org)
        UnitFactory(property=prop, unit_number='101')
        UnitFactory(property=prop, unit_number='102')
        
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        url = reverse('unit-list')
        response = self.client.get(url)
        
        assert response.status_code == 200
        assert len(response.data['results']) == 2
    
    def test_create_unit(self):
        """Test creating a unit"""
        user = UserFactory()
        org = OrganizationFactory(owner=user)
        prop = PropertyFactory(organization=org)
        
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {
            'property': str(prop.id),
            'unit_number': 'A1',
            'unit_type': '2_bedroom',
            'monthly_rent': 35000,
            'status': 'vacant',
        }
        
        url = reverse('unit-list')
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == 201
        assert response.data['unit_number'] == 'A1'
