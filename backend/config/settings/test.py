from .base import *

DEBUG = True
SECRET_KEY = 'test-secret-key'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Faster password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable Celery in tests
CELERY_TASK_ALWAYS_EAGER = True

# Email backend
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
