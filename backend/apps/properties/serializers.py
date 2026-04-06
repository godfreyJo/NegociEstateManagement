from rest_framework import serializers
from .models import Property, Unit, PropertyPhoto, UnitPhoto

class PropertyPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyPhoto
        fields = ['id', 'photo', 'caption', 'is_primary', 'uploaded_at']

class UnitPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitPhoto
        fields = ['id', 'photo', 'caption', 'is_primary', 'uploaded_at']

class UnitSerializer(serializers.ModelSerializer):
    photos = UnitPhotoSerializer(many=True, read_only=True)
    property_name = serializers.CharField(source='property.name', read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Unit
        fields = [
            'id', 'property', 'property_name', 'unit_number', 'unit_type',
            'floor', 'size_sqm', 'description', 'monthly_rent', 'deposit_amount',
            'status', 'is_furnished', 'amenities', 'is_available',
            'airbnb_enabled', 'airbnb_daily_rate', 'airbnb_cleaning_fee',
            'layout_x', 'layout_y', 'photos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'organization']

class UnitListSerializer(serializers.ModelSerializer):
    """Simplified unit serializer for list views"""
    class Meta:
        model = Unit
        fields = ['id', 'unit_number', 'unit_type', 'monthly_rent', 'status', 'is_available']

class PropertySerializer(serializers.ModelSerializer):
    photos = PropertyPhotoSerializer(many=True, read_only=True)
    units_count = serializers.IntegerField(source='units.count', read_only=True)
    occupied_units = serializers.SerializerMethodField()
    vacancy_rate = serializers.SerializerMethodField()
    main_photo = serializers.SerializerMethodField() 
    
    class Meta:
        model = Property
        fields = [
            'id', 'organization', 'name', 'property_type', 'description',
            'address', 'city', 'county', 'country', 'postal_code',
            'total_units', 'year_built', 'amenities',
            'bank_account', 'mpesa_paybill', 'mpesa_till',
            'is_active', 'photos','main_photo', 'units_count', 'occupied_units', 'vacancy_rate',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_main_photo(self, obj):
        """Get the primary photo or first photo"""
        primary = obj.photos.filter(is_primary=True).first()
        if primary:
            return PropertyPhotoSerializer(primary).data
        first = obj.photos.first()
        if first:
            return PropertyPhotoSerializer(first).data
        return None
    
    def get_occupied_units(self, obj):
        return obj.units.filter(status='occupied').count()
    
    def get_vacancy_rate(self, obj):
        total = obj.units.count()
        if total == 0:
            return 0
        vacant = obj.units.filter(status='vacant').count()
        return round((vacant / total) * 100, 2)

class PropertyDetailSerializer(PropertySerializer):
    units = UnitSerializer(many=True, read_only=True)
    
    class Meta(PropertySerializer.Meta):
        fields = PropertySerializer.Meta.fields + ['units']
