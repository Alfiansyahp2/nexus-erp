from rest_framework import viewsets
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

class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all().order_by('-date', '-created_at')
    serializer_class = JournalEntrySerializer

class AccountingPeriodViewSet(viewsets.ModelViewSet):
    queryset = AccountingPeriod.objects.all().order_by('-year', '-month')
    serializer_class = AccountingPeriodSerializer

class BusinessPartnerViewSet(viewsets.ModelViewSet):
    queryset = BusinessPartner.objects.all().order_by('name')
    serializer_class = BusinessPartnerSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-date')
    serializer_class = InvoiceSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-date')
    serializer_class = PaymentSerializer

class FixedAssetViewSet(viewsets.ModelViewSet):
    queryset = FixedAsset.objects.all().order_by('-purchase_date')
    serializer_class = FixedAssetSerializer

class DepreciationBoardViewSet(viewsets.ModelViewSet):
    queryset = DepreciationBoard.objects.all().order_by('date')
    serializer_class = DepreciationBoardSerializer

class BankStatementViewSet(viewsets.ModelViewSet):
    queryset = BankStatement.objects.all().order_by('-date_start')
    serializer_class = BankStatementSerializer
