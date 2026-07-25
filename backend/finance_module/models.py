from django.db import models

class AccountingPeriod(models.Model):
    class StatusChoices(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        CLOSED = 'CLOSED', 'Closed'
        
    year = models.IntegerField()
    month = models.IntegerField()
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.OPEN)
    
    class Meta:
        db_table = 'fin_accounting_period'
        unique_together = ('year', 'month')

    def __str__(self):
        return f"{self.year}-{self.month:02d} ({self.status})"

class Account(models.Model):
    class AccountType(models.TextChoices):
        ASSET = 'ASSET', 'Asset'
        LIABILITY = 'LIABILITY', 'Liability'
        EQUITY = 'EQUITY', 'Equity'
        REVENUE = 'REVENUE', 'Revenue'
        EXPENSE = 'EXPENSE', 'Expense'

    account_code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=20, choices=AccountType.choices)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'fin_account'
        ordering = ['account_code']

    def __str__(self):
        return f"{self.account_code} - {self.name}"

class JournalEntry(models.Model):
    class StatusChoices(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        POSTED = 'POSTED', 'Posted'

    date = models.DateField()
    reference_number = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.DRAFT)
    period = models.ForeignKey(AccountingPeriod, on_delete=models.PROTECT, null=True, blank=True)
    created_by = models.ForeignKey('hr_module.User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fin_journal_entry'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"Journal {self.reference_number} - {self.date}"

class JournalItem(models.Model):
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='items')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='journal_items')
    description = models.CharField(max_length=255, blank=True, null=True)
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    class Meta:
        db_table = 'fin_journal_item'

    def __str__(self):
        return f"{self.account.name} | D: {self.debit} | K: {self.credit}"

# --- ACCOUNTS PAYABLE & RECEIVABLE ---

class BusinessPartner(models.Model):
    # This can act as Vendor (AP) or Customer (AR)
    PARTNER_TYPE = (('VENDOR', 'Vendor'), ('CUSTOMER', 'Customer'), ('BOTH', 'Both'))
    
    name = models.CharField(max_length=255)
    partner_type = models.CharField(max_length=10, choices=PARTNER_TYPE)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'fin_business_partner'

    def __str__(self):
        return self.name

class Invoice(models.Model):
    INVOICE_TYPE = (('VENDOR_BILL', 'Vendor Bill (AP)'), ('CUSTOMER_INV', 'Customer Invoice (AR)'))
    STATUS = (('DRAFT', 'Draft'), ('OPEN', 'Open'), ('PAID', 'Paid'), ('CANCELLED', 'Cancelled'))

    invoice_type = models.CharField(max_length=20, choices=INVOICE_TYPE)
    document_number = models.CharField(max_length=100, unique=True)
    partner = models.ForeignKey(BusinessPartner, on_delete=models.PROTECT)
    date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS, default='DRAFT')
    
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    amount_due = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    journal_entry = models.OneToOneField(JournalEntry, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'fin_invoice'
        ordering = ['-date']

    def __str__(self):
        return f"{self.document_number} - {self.partner.name}"

class InvoiceLine(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='lines')
    description = models.CharField(max_length=255)
    account = models.ForeignKey(Account, on_delete=models.PROTECT) # Expense or Revenue account
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    class Meta:
        db_table = 'fin_invoice_line'

    def save(self, *args, **kwargs):
        self.subtotal = self.quantity * self.unit_price
        super().save(*args, **kwargs)

class Payment(models.Model):
    PAYMENT_TYPE = (('INBOUND', 'Inbound (Receive)'), ('OUTBOUND', 'Outbound (Send)'))
    
    payment_number = models.CharField(max_length=100, unique=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE)
    partner = models.ForeignKey(BusinessPartner, on_delete=models.PROTECT)
    date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_method = models.ForeignKey(Account, on_delete=models.PROTECT) # Bank/Cash, removed limit_choices_to for simplicity
    
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    journal_entry = models.OneToOneField(JournalEntry, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'fin_payment'

    def __str__(self):
        return f"{self.payment_number} - {self.amount}"

# --- BANKING ---

class BankStatement(models.Model):
    statement_number = models.CharField(max_length=100, unique=True)
    bank_account = models.ForeignKey(Account, on_delete=models.PROTECT)
    date_start = models.DateField()
    date_end = models.DateField()
    starting_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    ending_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'fin_bank_statement'

    def __str__(self):
        return f"Statement {self.statement_number}"

class BankStatementLine(models.Model):
    statement = models.ForeignKey(BankStatement, on_delete=models.CASCADE, related_name='lines')
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2) # Positive for in, negative for out
    
    # Reconciliation link
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'fin_bank_statement_line'
        ordering = ['date']

# --- FIXED ASSETS ---

class FixedAsset(models.Model):
    asset_name = models.CharField(max_length=255)
    asset_code = models.CharField(max_length=50, unique=True)
    purchase_date = models.DateField()
    purchase_value = models.DecimalField(max_digits=15, decimal_places=2)
    salvage_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    useful_life_months = models.IntegerField()
    
    fixed_asset_account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='fixed_assets')
    depreciation_expense_account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='depreciation_expenses')
    accumulated_depreciation_account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='accumulated_depreciations')

    class Meta:
        db_table = 'fin_fixed_asset'

    def __str__(self):
        return self.asset_name

class DepreciationBoard(models.Model):
    asset = models.ForeignKey(FixedAsset, on_delete=models.CASCADE, related_name='depreciations')
    date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    is_posted = models.BooleanField(default=False)
    journal_entry = models.OneToOneField(JournalEntry, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'fin_depreciation_board'
        ordering = ['date']
