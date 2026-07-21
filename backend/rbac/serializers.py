from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Permission, Role, UserPermission

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Get direct user permissions
        permissions = list(user.rbac_user_permissions.values_list('permission__slug', flat=True))
        
        token['permissions'] = permissions
        token['username'] = user.username
        
        # We can optionally still return the Role for UI purposes (if UserRole exists)
        if hasattr(user, 'rbac_role') and user.rbac_role.role:
            token['role'] = user.rbac_role.role.name
        else:
            token['role'] = None

        return token

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'slug', 'description']

class UserPermissionSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(source='permission.slug', read_only=True)
    
    class Meta:
        model = UserPermission
        fields = ['id', 'permission', 'slug']

class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    role_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'permissions', 'role_name']

    def get_permissions(self, obj):
        return list(obj.rbac_user_permissions.values_list('permission__slug', flat=True))

    def get_role_name(self, obj):
        if hasattr(obj, 'rbac_role') and obj.rbac_role.role:
            return obj.rbac_role.role.name
        return None
