from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductCategoryViewSet, ProductViewSet, WarehouseViewSet

router = DefaultRouter()
router.register(r'categories', ProductCategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'warehouses', WarehouseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
