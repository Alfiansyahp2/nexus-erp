from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from rbac.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hr/', include('hr_module.urls')),
    path('api/finance/', include('finance_module.urls')),
    path('api/inventory/', include('inventory_module.urls')),
    path('api/rbac/', include('rbac.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
