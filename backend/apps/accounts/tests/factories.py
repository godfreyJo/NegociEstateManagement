import factory
from django.contrib.auth import get_user_model
from apps.accounts.models import Organization, OrganizationMember

User = get_user_model()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    
    phone_number = factory.Sequence(lambda n: f'071234567{n:02d}')
    email = factory.LazyAttribute(lambda obj: f'{obj.phone_number}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    user_type = 'landlord'
    username = factory.LazyAttribute(lambda obj: obj.phone_number)
    
    @factory.post_generation
    def set_password(obj, create, extracted, **kwargs):
        if create:
            obj.set_password('testpass123')
            obj.save()

class OrganizationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Organization
    
    name = factory.Faker('company')
    subscription_plan = 'free'

class OrganizationMemberFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = OrganizationMember
    
    role = 'owner'
