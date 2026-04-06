from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/properties/', include('apps.properties.urls')),
    path('api/tenants/', include('apps.tenants.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/maintenance/', include('apps.maintenance.urls')),
    path('api/communications/', include('apps.communications.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/airbnb/', include('apps.airbnb.urls')),
    path('api/expenses/', include('apps.expenses.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    
    # M-Pesa Webhook (public endpoint)
    path('webhook/mpesa/', include('apps.payments.webhook_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

