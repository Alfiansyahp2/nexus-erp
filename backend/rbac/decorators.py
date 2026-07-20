from functools import wraps
from django.core.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status

def require_permission(permission_slug):
    """
    Decorator for views that checks whether a user has a particular permission slug.
    Assumes the user is authenticated and we can access user.rbac_role.
    For Django REST Framework views, we can return a 403 response.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            user = request.user
            if not user.is_authenticated:
                return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Superuser bypass
            if user.is_superuser:
                return view_func(request, *args, **kwargs)

            # Check if user has the specific permission
            has_perm = False
            if hasattr(user, 'rbac_role') and user.rbac_role.role:
                if user.rbac_role.role.permissions.filter(slug=permission_slug).exists():
                    has_perm = True

            if not has_perm:
                return Response({'detail': f'You do not have permission to perform this action ({permission_slug}).'}, status=status.HTTP_403_FORBIDDEN)
                
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator
