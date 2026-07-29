from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductCategoryViewSet, ProductViewSet, WarehouseViewSet,
    StockBalanceViewSet, StockMovementViewSet, InventoryDashboardStatsView
)

router = DefaultRouter()
router.register(r'categories', ProductCategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'warehouses', WarehouseViewSet)
router.register(r'stock-balances', StockBalanceViewSet, basename='stock-balance')
router.register(r'stock-movements', StockMovementViewSet, basename='stock-movement')

urlpatterns = [
    path('dashboard-stats/', InventoryDashboardStatsView.as_view(), name='inventory-dashboard-stats'),
    path('', include(router.urls)),
]
