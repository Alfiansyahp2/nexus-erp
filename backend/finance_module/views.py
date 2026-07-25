from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rbac.permissions import HasRBACPermission
from .models import (
    Account, JournalEntry, AccountingPeriod, BusinessPartner,
    Invoice, Payment, FixedAsset, DepreciationBoard, BankStatement
)
from .serializers import (
    AccountSerializer, JournalEntrySerializer, AccountingPeriodSerializer,
    BusinessPartnerSerializer, InvoiceSerializer, PaymentSerializer,
    FixedAssetSerializer, DepreciationBoardSerializer, BankStatementSerializer
)

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, HasRBACPermission]
    permission_slugs = {
        'list': 'finance.account.view',
        'retrieve': 'finance.account.view',
        'create': 'finance.account.create',
        'update': 'finance.account.update',
        'partial_update': 'finance.account.update',
        'destroy': 'finance.account.delete',
    }

class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all().order_by('-date', '-created_at')
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated, HasRBACPermission]
    permission_slugs = {
        'list': 'finance.journal.view',
        'retrieve': 'finance.journal.view',
        'create': 'finance.journal.create',
        'update': 'finance.journal.update',
        'partial_update': 'finance.journal.update',
        'destroy': 'finance.journal.delete',
    }

class AccountingPeriodViewSet(viewsets.ModelViewSet):
    queryset = AccountingPeriod.objects.all().order_by('-year', '-month')
    serializer_class = AccountingPeriodSerializer
    permission_classes = [IsAuthenticated]

class BusinessPartnerViewSet(viewsets.ModelViewSet):
    queryset = BusinessPartner.objects.all().order_by('name')
    serializer_class = BusinessPartnerSerializer
    permission_classes = [IsAuthenticated]

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-date')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, HasRBACPermission]
    permission_slugs = {
        'list': 'finance.invoice.view',
        'retrieve': 'finance.invoice.view',
        'create': 'finance.invoice.create',
        'update': 'finance.invoice.update',
        'partial_update': 'finance.invoice.update',
        'destroy': 'finance.invoice.delete',
    }

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-date')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, HasRBACPermission]
    permission_slugs = {
        'list': 'finance.payment.view',
        'retrieve': 'finance.payment.view',
        'create': 'finance.payment.create',
        'update': 'finance.payment.update',
        'partial_update': 'finance.payment.update',
        'destroy': 'finance.payment.delete',
    }

class FixedAssetViewSet(viewsets.ModelViewSet):
    queryset = FixedAsset.objects.all().order_by('-purchase_date')
    serializer_class = FixedAssetSerializer
    permission_classes = [IsAuthenticated, HasRBACPermission]
    permission_slugs = {
        'list': 'finance.fixed_asset.view',
        'retrieve': 'finance.fixed_asset.view',
        'create': 'finance.fixed_asset.create',
        'update': 'finance.fixed_asset.update',
        'partial_update': 'finance.fixed_asset.update',
        'destroy': 'finance.fixed_asset.delete',
    }

class DepreciationBoardViewSet(viewsets.ModelViewSet):
    queryset = DepreciationBoard.objects.all().order_by('date')
    serializer_class = DepreciationBoardSerializer
    permission_classes = [IsAuthenticated]

class BankStatementViewSet(viewsets.ModelViewSet):
    queryset = BankStatement.objects.all().order_by('-date_start')
    serializer_class = BankStatementSerializer
    permission_classes = [IsAuthenticated, HasRBACPermission]
    permission_slugs = {
        'list': 'finance.bank_statement.view',
        'retrieve': 'finance.bank_statement.view',
        'create': 'finance.bank_statement.create',
        'update': 'finance.bank_statement.update',
        'partial_update': 'finance.bank_statement.update',
        'destroy': 'finance.bank_statement.delete',
    }
