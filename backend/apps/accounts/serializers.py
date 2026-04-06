from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Organization, OrganizationMember

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'email', 'first_name', 'last_name', 
                  'user_type', 'profile_photo', 'company_name', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['phone_number', 'email', 'first_name', 'last_name', 
                  'user_type', 'password', 'password_confirm', 'company_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['phone_number'],
            **validated_data
        )
        user.is_active = True  # ENSURE USER IS ACTIVE
        user.save()
        return user

class OrganizationSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = ['id', 'name', 'owner', 'subscription_plan', 'member_count', 'created_at']
    
    def get_member_count(self, obj):
        return obj.members.count()

class OrganizationMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    organization = OrganizationSerializer(read_only=True)
    
    class Meta:
        model = OrganizationMember
        fields = ['id', 'organization', 'user', 'role', 'permissions', 'joined_at']