from rest_framework import serializers
from .models import (
    Account, JournalEntry, JournalItem, AccountingPeriod,
    BusinessPartner, Invoice, InvoiceLine, Payment,
    FixedAsset, DepreciationBoard, BankStatement, BankStatementLine
)

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class JournalItemSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    class Meta:
        model = JournalItem
        fields = ['id', 'account', 'account_name', 'description', 'debit', 'credit']

class JournalEntrySerializer(serializers.ModelSerializer):
    items = JournalItemSerializer(many=True, read_only=True)
    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'reference_number', 'description', 'status', 'period', 'created_at', 'items']

class AccountingPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountingPeriod
        fields = '__all__'

class BusinessPartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessPartner
        fields = '__all__'

class InvoiceLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    class Meta:
        model = InvoiceLine
        fields = ['id', 'description', 'account', 'account_name', 'quantity', 'unit_price', 'subtotal']

class InvoiceSerializer(serializers.ModelSerializer):
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    lines = InvoiceLineSerializer(many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_type', 'document_number', 'partner', 'partner_name', 'date', 'due_date', 'status', 'total_amount', 'amount_due', 'journal_entry', 'lines']

class PaymentSerializer(serializers.ModelSerializer):
    partner_name = serializers.CharField(source='partner.name', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    invoice_number = serializers.CharField(source='invoice.document_number', read_only=True)
    class Meta:
        model = Payment
        fields = ['id', 'payment_number', 'payment_type', 'partner', 'partner_name', 'date', 'amount', 'payment_method', 'payment_method_name', 'invoice', 'invoice_number', 'journal_entry']

class FixedAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixedAsset
        fields = '__all__'

class DepreciationBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepreciationBoard
        fields = '__all__'

class BankStatementLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankStatementLine
        fields = '__all__'

class BankStatementSerializer(serializers.ModelSerializer):
    lines = BankStatementLineSerializer(many=True, read_only=True)
    class Meta:
        model = BankStatement
        fields = '__all__'
