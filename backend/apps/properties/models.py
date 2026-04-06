import uuid
from django.db import models
from django.contrib.gis.db import models as gis_models

class Property(models.Model):
    PROPERTY_TYPES = (
        ('apartment_block', 'Apartment Block'),
        ('estate', 'Residential Estate'),
        ('commercial', 'Commercial Building'),
        ('mixed_use', 'Mixed Use'),
        ('single_unit', 'Single Unit'),
        ('townhouse', 'Townhouse Complex'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey('accounts.Organization', on_delete=models.CASCADE, related_name='properties', null=True, blank=True)
    
    # Basic Info
    name = models.CharField(max_length=255)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES,  default='apartment_block')
    description = models.TextField(blank=True)
    
    # Address
    address = models.TextField()
    city = models.CharField(max_length=100)
    county = models.CharField(max_length=100, default='Nairobi')
    country = models.CharField(max_length=100, default='Kenya')
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Geolocation (optional)
    location = gis_models.PointField(geography=True, null=True, blank=True)
    
    # Property Details
    total_units = models.PositiveIntegerField(default=0)
    year_built = models.PositiveIntegerField(null=True, blank=True)
    amenities = models.JSONField(default=list, blank=True)  # ['parking', 'gym', 'pool']
    
    # Financial Settings
    bank_account = models.CharField(max_length=50, blank=True)
    mpesa_paybill = models.CharField(max_length=20, blank=True)
    mpesa_till = models.CharField(max_length=20, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'properties'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.city})"
    
    def update_unit_count(self):
        """Update total_units based on actual units"""
        self.total_units = self.units.count()
        self.save(update_fields=['total_units'])

class Unit(models.Model):
    UNIT_TYPES = (
        ('bedsitter', 'Bedsitter'),
        ('1_bedroom', '1 Bedroom'),
        ('2_bedroom', '2 Bedroom'),
        ('3_bedroom', '3 Bedroom'),
        ('4_bedroom', '4 Bedroom+'),
        ('shop', 'Shop/Retail'),
        ('office', 'Office Space'),
        ('warehouse', 'Warehouse'),
        ('studio', 'Studio Apartment'),
        ('penthouse', 'Penthouse'),
    )
    
    STATUS_CHOICES = (
        ('vacant', 'Vacant'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('maintenance', 'Under Maintenance'),
        ('airbnb', 'Short-term/Airbnb'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent_property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='units')
    
    # Unit Details
    unit_number = models.CharField(max_length=20)
    unit_type = models.CharField(max_length=20, choices=UNIT_TYPES, default='1_bedroom')
    floor = models.PositiveIntegerField(default=0)
    size_sqm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    
    # Financial
    monthly_rent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deposit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='vacant')
    is_furnished = models.BooleanField(default=False)
    amenities = models.JSONField(default=list, blank=True)
    
    # Airbnb Settings
    airbnb_enabled = models.BooleanField(default=False)
    airbnb_daily_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    airbnb_cleaning_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Visual Layout (future feature)
    layout_x = models.FloatField(null=True, blank=True)
    layout_y = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'units'
        unique_together = ['parent_property', 'unit_number']
        ordering = ['unit_number']
    
    def __str__(self):
        return f"{self.parent_property.name} - Unit {self.unit_number}"
    
    @property
    def is_available(self):
        return self.status == 'vacant'

class PropertyPhoto(models.Model):
    parent_property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='properties/%Y/%m/')
    caption = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'property_photos'

class UnitPhoto(models.Model):
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='units/%Y/%m/')
    caption = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'unit_photos'
