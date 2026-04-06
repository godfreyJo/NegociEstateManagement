import uuid
from django.db import models

class MaintenanceRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.ForeignKey('properties.Unit', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=20, default='medium')
    status = models.CharField(max_length=20, default='reported')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'maintenance_requests'