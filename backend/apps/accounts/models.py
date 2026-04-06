import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    USER_TYPES = (
        ('landlord', 'Landlord'),
        ('manager', 'Property Manager'),
        ('agent', 'Agent'),
        ('tenant', 'Tenant'),
        ('technician', 'Technician'),
        ('admin', 'System Admin'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=20, choices=USER_TYPES)
    phone_number = models.CharField(max_length=15, unique=True)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    id_number = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Business info
    company_name = models.CharField(max_length=255, blank=True)
    business_registration = models.CharField(max_length=50, blank=True)
    
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['username', 'email', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'

class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_organizations')
    members = models.ManyToManyField(User, through='OrganizationMember', related_name='organizations')
    subscription_plan = models.CharField(max_length=50, default='free')
    subscription_expires = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'organizations'
        ordering = ['-created_at']

class OrganizationMember(models.Model):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('manager', 'Manager'),
        ('accountant', 'Accountant'),
        ('viewer', 'Viewer'),
    )
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    permissions = models.JSONField(default=dict)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'organization_members'
        unique_together = ['organization', 'user']



@receiver(post_save, sender='accounts.User')
def create_user_organization(sender, instance, created, **kwargs):
    """Auto-create an organization for landlords and managers when they register"""
    if created and instance.user_type in ['landlord', 'manager']:
        from .models import Organization
        # Create organization with user's name
        organization_name = f"{instance.first_name}'s Properties" if instance.first_name else f"{instance.phone_number}'s Properties"
        
        org, org_created = Organization.objects.get_or_create(
            name=organization_name,
            owner=instance,
            defaults={'name': organization_name, 'owner': instance}
        )
        
        if org_created:
            # Add user as member
            org.members.add(instance)
            print(f"✅ Created organization '{org.name}' for user {instance.phone_number}")
        else:
            print(f"⚠️ Organization already exists: {org.name}")