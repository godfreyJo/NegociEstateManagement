from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Organization, OrganizationMember

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['phone_number', 'username', 'first_name', 'last_name', 'user_type', 'is_active']
    list_filter = ['user_type', 'is_active', 'created_at']
    search_fields = ['phone_number', 'username', 'first_name', 'last_name', 'email']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Nagocis Info', {
            'fields': ('user_type', 'phone_number', 'id_number', 'company_name', 'business_registration')
        }),
    )

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'subscription_plan', 'created_at']
    search_fields = ['name', 'owner__phone_number']

@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ['organization', 'user', 'role', 'joined_at']
    list_filter = ['role']