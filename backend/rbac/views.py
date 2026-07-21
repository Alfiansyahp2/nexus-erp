from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import Permission, UserPermission
from .serializers import CustomTokenObtainPairSerializer, PermissionSerializer, UserSerializer
from .decorators import require_permission

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.all().order_by('slug')
    serializer_class = PermissionSerializer
    # Can add @require_permission here if needed, but standard IsAuthenticated could be enough.

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer

class UpdateUserPermissionsView(APIView):
    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        slugs = request.data.get('permissions', [])
        
        # Clear existing permissions
        UserPermission.objects.filter(user=user).delete()
        
        # Create new permissions
        permissions = Permission.objects.filter(slug__in=slugs)
        user_permissions = [UserPermission(user=user, permission=p) for p in permissions]
        UserPermission.objects.bulk_create(user_permissions)
        
        return Response({"message": "Permissions updated successfully", "permissions": slugs}, status=status.HTTP_200_OK)
