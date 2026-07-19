from django.db import models

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

    def __str__(self):
        return f"{self.account_code} - {self.name}"

class JournalEntry(models.Model):
    date = models.DateField()
    reference_number = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    # We use a string reference for the User model to avoid circular imports
    created_by = models.ForeignKey('hr_module.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    class StatusChoices(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        POSTED = 'POSTED', 'Posted'
        
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.DRAFT)

    def __str__(self):
        return f"Journal {self.reference_number} - {self.date}"

class JournalItem(models.Model):
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='items')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='journal_items')
    description = models.CharField(max_length=255, blank=True, null=True)
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.account.name} | D: {self.debit} | K: {self.credit}"
