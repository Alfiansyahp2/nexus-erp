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

from rest_framework.views import APIView
from rest_framework.response import Response

class FinanceDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count
        
        today = timezone.now().date()

        total_accounts = Account.objects.count()
        total_invoices = Invoice.objects.count()
        total_assets = FixedAsset.objects.count()
        total_journals = JournalEntry.objects.count()
        
        # Trends
        unpaid_invoices = Invoice.objects.filter(status__in=['DRAFT', 'OPEN']).count()
        
        # Chart Data: Invoices Trend (Last 7 Days)
        invoice_trends = []
        for i in range(7, -1, -1):
            day = today - timedelta(days=i)
            vendor_bills = Invoice.objects.filter(date=day, invoice_type='VENDOR_BILL').count()
            customer_inv = Invoice.objects.filter(date=day, invoice_type='CUSTOMER_INV').count()
            invoice_trends.append({
                'date': day.strftime('%d %b'),
                'vendor_bills': vendor_bills,
                'customer_invoices': customer_inv
            })

        # Chart Data: Account Type Distribution
        account_dist = Account.objects.values('account_type').annotate(value=Count('id'))
        account_distribution = [{'name': d['account_type'], 'value': d['value']} for d in account_dist]

        # Recent Activity: Pending Invoices
        recent_invoices_qs = Invoice.objects.select_related('partner').exclude(status='PAID').order_by('-date')[:5]
        recent_activity = []
        for inv in recent_invoices_qs:
            recent_activity.append({
                'id': inv.id,
                'document_number': inv.document_number,
                'partner': inv.partner.name if inv.partner else 'Unknown',
                'type': inv.get_invoice_type_display(),
                'status': inv.get_status_display(),
                'amount': f"Rp {inv.total_amount:,.2f}"
            })

        return Response({
            'metrics': {
                'total_accounts': total_accounts,
                'total_invoices': total_invoices,
                'unpaid_invoices': unpaid_invoices,
                'total_assets': total_assets,
                'total_journals': total_journals
            },
            'charts': {
                'invoice_trends': invoice_trends,
                'account_distribution': account_distribution
            },
            'recent_activity': recent_activity
        })
