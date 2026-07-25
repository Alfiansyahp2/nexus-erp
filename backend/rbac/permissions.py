from rest_framework import permissions

class HasRBACPermission(permissions.BasePermission):
    """
    Custom permission to check if the user has the required RBAC slug for a given action.
    Viewsets should define a `permission_slugs` dictionary mapping action names to slugs, e.g.:
    permission_slugs = {
        'list': 'finance.invoice.view',
        'retrieve': 'finance.invoice.view',
        'create': 'finance.invoice.create',
        'update': 'finance.invoice.update',
        'partial_update': 'finance.invoice.update',
        'destroy': 'finance.invoice.delete',
    }
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.is_superuser or getattr(request.user, 'role', '') == 'SUPER_ADMIN':
            return True
            
        slugs_map = getattr(view, 'permission_slugs', {})
        required_slug = slugs_map.get(view.action)
        
        if not required_slug:
            # If no slug is specified for this action, allow by default if authenticated
            return True
            
        # Check if user has this permission slug via rbac_user_permissions
        return request.user.rbac_user_permissions.filter(permission__slug=required_slug).exists()
