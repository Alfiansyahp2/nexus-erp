from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VendorViewSet, PurchaseRequestViewSet,
    PurchaseOrderViewSet, GoodsReceiptViewSet
)

router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'requests', PurchaseRequestViewSet, basename='purchaserequest')
router.register(r'orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'receipts', GoodsReceiptViewSet, basename='goodsreceipt')

urlpatterns = [
    path('', include(router.urls)),
]
