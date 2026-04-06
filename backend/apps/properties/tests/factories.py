import factory
from apps.properties.models import Property, Unit
from apps.accounts.tests.factories import OrganizationFactory

class PropertyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Property
    
    organization = factory.SubFactory(OrganizationFactory)
    name = factory.Faker('street_name')
    address = factory.Faker('street_address')
    city = factory.Faker('city')
    county = 'Nairobi'
    property_type = 'apartment_block'
    total_units = 10

class UnitFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Unit
    
    property = factory.SubFactory(PropertyFactory)
    unit_number = factory.Sequence(lambda n: f'A{n}')
    unit_type = '1_bedroom'
    monthly_rent = 25000
    status = 'vacant'
