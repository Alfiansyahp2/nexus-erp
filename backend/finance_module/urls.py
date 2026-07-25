from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccountViewSet, JournalEntryViewSet, AccountingPeriodViewSet,
    BusinessPartnerViewSet, InvoiceViewSet, PaymentViewSet,
    FixedAssetViewSet, DepreciationBoardViewSet, BankStatementViewSet
)

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'journals', JournalEntryViewSet)
router.register(r'accounting-periods', AccountingPeriodViewSet)
router.register(r'partners', BusinessPartnerViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'fixed-assets', FixedAssetViewSet)
router.register(r'depreciations', DepreciationBoardViewSet)
router.register(r'bank-statements', BankStatementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
