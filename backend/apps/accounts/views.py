from rest_framework import generics, permissions, status
from django.db import models
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken 
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import Organization, OrganizationMember
from .serializers import (
    UserSerializer, UserRegistrationSerializer, 
    OrganizationSerializer, OrganizationMemberSerializer
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create default organization for landlords
        if user.user_type == 'landlord':
            org = Organization.objects.create(
                name=f"{user.company_name or user.first_name}'s Properties",
                owner=user
            )
            OrganizationMember.objects.create(
                organization=org,
                user=user,
                role='owner'
            )
        # GENERATE TOKENS FOR THE NEW USER
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)
    


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'phone_number'  # Tell it to use phone_number instead of username

    def validate(self, attrs):
        # Map phone_number to the username field expected by simplejwt
        attrs['username'] = attrs.get('phone_number')
        return super().validate(attrs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class OrganizationListCreateView(generics.ListCreateAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Organization.objects.filter(
            models.Q(owner=self.request.user) | 
            models.Q(members=self.request.user)
        ).distinct()
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Organization.objects.filter(owner=self.request.user)