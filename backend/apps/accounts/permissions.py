from rest_framework import permissions

class IsOrganizationMember(permissions.BasePermission):
    """
    Check if user is a member of the property's organization
    """
    def has_object_permission(self, request, view, obj):
        # Check if obj has organization attribute
        if hasattr(obj, 'organization'):
            org = obj.organization
        elif hasattr(obj, 'property'):
            org = obj.property.organization
        else:
            return False
        
        # Check if user is owner or member
        return (
            org.owner == request.user or
            org.members.filter(id=request.user.id).exists()
        )
    
    def has_permission(self, request, view):
        # For list/create views, just check authentication
        return request.user and request.user.is_authenticated

class IsLandlord(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.user_type == 'landlord'

class IsPropertyManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.user_type in ['landlord', 'manager']
