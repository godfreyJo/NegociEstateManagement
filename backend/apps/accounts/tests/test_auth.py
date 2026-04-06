import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from .factories import UserFactory, OrganizationFactory, OrganizationMemberFactory

pytestmark = pytest.mark.django_db

class TestAuthentication:
    """Test authentication endpoints"""
    
    def setup_method(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.profile_url = reverse('profile')
    
    def test_user_registration_success(self):
        """Test successful user registration"""
        data = {
            'phone_number': '0712345678',
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'user_type': 'landlord',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        assert response.status_code == 201
        assert 'access' in response.data
        assert 'user' in response.data
        assert response.data['user']['phone_number'] == '0712345678'
    
    def test_user_registration_password_mismatch(self):
        """Test registration fails when passwords don't match"""
        data = {
            'phone_number': '0712345678',
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'user_type': 'landlord',
            'password': 'testpass123',
            'password_confirm': 'differentpass',
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        assert response.status_code == 400
        assert 'password' in str(response.data) or 'Passwords do not match' in str(response.data)
    
    def test_user_login_success(self):
        """Test successful login with JWT"""
        user = UserFactory(phone_number='0712345678')
        
        data = {
            'phone_number': '0712345678',
            'password': 'testpass123',
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data
    
    def test_user_login_invalid_credentials(self):
        """Test login fails with wrong password"""
        user = UserFactory(phone_number='0712345678')
        
        data = {
            'phone_number': '0712345678',
            'password': 'wrongpassword',
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        assert response.status_code == 401
    
    def test_profile_access_authenticated(self):
        """Test profile endpoint requires authentication"""
        user = UserFactory()
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get(self.profile_url)
        
        assert response.status_code == 200
        assert response.data['phone_number'] == user.phone_number
    
    def test_profile_access_unauthenticated(self):
        """Test profile endpoint rejects unauthenticated requests"""
        response = self.client.get(self.profile_url)
        
        assert response.status_code == 401

class TestOrganization:
    """Test organization endpoints"""
    
    def setup_method(self):
        self.client = APIClient()
        self.org_url = reverse('organizations')
    
    def test_create_organization(self):
        """Test creating organization as landlord"""
        user = UserFactory(user_type='landlord')
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        data = {'name': 'My Properties Ltd'}
        response = self.client.post(self.org_url, data, format='json')
        
        assert response.status_code == 201
        assert response.data['name'] == 'My Properties Ltd'
        assert response.data['owner']['id'] == str(user.id)
    
    def test_list_organizations(self):
        """Test listing user's organizations"""
        user = UserFactory()
        org = OrganizationFactory(owner=user)
        OrganizationMemberFactory(organization=org, user=user, role='owner')
        
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get(self.org_url)
        
        assert response.status_code == 200
        assert len(response.data) >= 1
