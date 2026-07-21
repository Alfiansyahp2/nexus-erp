from django.urls import path
from .views import PermissionListView, UserListView, UpdateUserPermissionsView

urlpatterns = [
    path('permissions/', PermissionListView.as_view(), name='permission-list'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/permissions/', UpdateUserPermissionsView.as_view(), name='update-user-permissions'),
]
