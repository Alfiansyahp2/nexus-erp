from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        permissions = []
        if hasattr(user, 'rbac_role') and user.rbac_role.role:
            # Fetch all slugs associated with the user's role
            permissions = list(user.rbac_role.role.permissions.values_list('slug', flat=True))

        token['permissions'] = permissions
        token['username'] = user.username
        if hasattr(user, 'rbac_role') and user.rbac_role.role:
            token['role'] = user.rbac_role.role.name
        else:
            token['role'] = None

        return token
