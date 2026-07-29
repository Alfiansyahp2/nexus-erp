from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VendorViewSet, PurchaseRequestViewSet,
    PurchaseOrderViewSet, GoodsReceiptViewSet, PurchasingDashboardStatsView
)

router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'requests', PurchaseRequestViewSet, basename='purchaserequest')
router.register(r'orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'receipts', GoodsReceiptViewSet, basename='goodsreceipt')

urlpatterns = [
    path('dashboard-stats/', PurchasingDashboardStatsView.as_view(), name='purchasing-dashboard-stats'),
    path('', include(router.urls)),
]
