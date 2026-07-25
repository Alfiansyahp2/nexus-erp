import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from finance_module.models import (
    AccountingPeriod, Account, JournalEntry, JournalItem, 
    BusinessPartner, Invoice, InvoiceLine, Payment
)

class Command(BaseCommand):
    help = 'Seeds initial Finance data (COA, Partner, Invoices, Payments)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Mulai melakukan seeding data Finance...")

        # 1. Accounting Period
        period_july, _ = AccountingPeriod.objects.get_or_create(
            year=2026, month=7, defaults={'status': 'OPEN'}
        )

        # 2. Chart of Accounts (COA)
        acc_cash, _ = Account.objects.get_or_create(account_code="1-110", defaults={'name': 'Cash in Bank', 'account_type': 'ASSET'})
        acc_ar, _ = Account.objects.get_or_create(account_code="1-210", defaults={'name': 'Account Receivable (AR)', 'account_type': 'ASSET'})
        acc_ap, _ = Account.objects.get_or_create(account_code="2-110", defaults={'name': 'Account Payable (AP)', 'account_type': 'LIABILITY'})
        acc_revenue, _ = Account.objects.get_or_create(account_code="4-110", defaults={'name': 'Sales Revenue', 'account_type': 'REVENUE'})
        acc_cogs, _ = Account.objects.get_or_create(account_code="5-110", defaults={'name': 'Cost of Goods Sold (COGS)', 'account_type': 'EXPENSE'})
        acc_elec_exp, _ = Account.objects.get_or_create(account_code="6-110", defaults={'name': 'Electricity Expense', 'account_type': 'EXPENSE'})

        # 3. Business Partners
        vendor_pln, _ = BusinessPartner.objects.get_or_create(
            name="PT PLN Persero",
            defaults={'partner_type': 'VENDOR', 'email': 'billing@pln.co.id'}
        )
        customer_abc, _ = BusinessPartner.objects.get_or_create(
            name="Toko ABC",
            defaults={'partner_type': 'CUSTOMER', 'email': 'purchasing@tokoabc.com'}
        )

        # 4. Create Vendor Bill (Hutang Listrik)
        bill, created_bill = Invoice.objects.get_or_create(
            document_number="BILL/2026/07/001",
            defaults={
                'invoice_type': 'VENDOR_BILL',
                'partner': vendor_pln,
                'date': datetime.date(2026, 7, 5),
                'due_date': datetime.date(2026, 7, 20),
                'status': 'OPEN',
                'total_amount': Decimal('1500000.00'),
                'amount_due': Decimal('1500000.00'),
            }
        )
        if created_bill:
            InvoiceLine.objects.create(
                invoice=bill,
                description="Tagihan Listrik Bulan Juni",
                account=acc_elec_exp,
                quantity=1,
                unit_price=Decimal('1500000.00')
            )
            # Create Journal for Bill (Expense Dr, AP Cr)
            je_bill = JournalEntry.objects.create(
                date=bill.date,
                reference_number=f"JE-{bill.document_number}",
                description="Pengakuan Hutang Listrik PLN",
                status='POSTED',
                period=period_july
            )
            JournalItem.objects.create(journal_entry=je_bill, account=acc_elec_exp, debit=Decimal('1500000.00'), credit=0)
            JournalItem.objects.create(journal_entry=je_bill, account=acc_ap, debit=0, credit=Decimal('1500000.00'))
            bill.journal_entry = je_bill
            bill.save()

        # 5. Create Payment for Vendor Bill
        if not Payment.objects.filter(payment_number="PAY-OUT-001").exists():
            pay_out = Payment.objects.create(
                payment_number="PAY-OUT-001",
                payment_type="OUTBOUND",
                partner=vendor_pln,
                date=datetime.date(2026, 7, 10),
                amount=Decimal('1500000.00'),
                payment_method=acc_cash,
                invoice=bill
            )
            # Create Journal for Payment (AP Dr, Cash Cr)
            je_pay_out = JournalEntry.objects.create(
                date=pay_out.date,
                reference_number=f"JE-{pay_out.payment_number}",
                description="Pembayaran Hutang Listrik PLN",
                status='POSTED',
                period=period_july
            )
            JournalItem.objects.create(journal_entry=je_pay_out, account=acc_ap, debit=Decimal('1500000.00'), credit=0)
            JournalItem.objects.create(journal_entry=je_pay_out, account=acc_cash, debit=0, credit=Decimal('1500000.00'))
            pay_out.journal_entry = je_pay_out
            pay_out.save()

            # Update Bill Status
            bill.amount_due = 0
            bill.status = 'PAID'
            bill.save()

        # 6. Create Customer Invoice (Piutang Penjualan)
        inv, created_inv = Invoice.objects.get_or_create(
            document_number="INV/2026/07/001",
            defaults={
                'invoice_type': 'CUSTOMER_INV',
                'partner': customer_abc,
                'date': datetime.date(2026, 7, 12),
                'due_date': datetime.date(2026, 7, 26),
                'status': 'OPEN',
                'total_amount': Decimal('5000000.00'),
                'amount_due': Decimal('5000000.00'),
            }
        )
        if created_inv:
            InvoiceLine.objects.create(
                invoice=inv,
                description="Penjualan 100 Pcs Indomie @ 50.000",
                account=acc_revenue,
                quantity=100,
                unit_price=Decimal('50000.00')
            )
            # Create Journal for Sales (AR Dr, Revenue Cr)
            je_inv = JournalEntry.objects.create(
                date=inv.date,
                reference_number=f"JE-{inv.document_number}",
                description="Piutang Penjualan Toko ABC",
                status='POSTED',
                period=period_july
            )
            JournalItem.objects.create(journal_entry=je_inv, account=acc_ar, debit=Decimal('5000000.00'), credit=0)
            JournalItem.objects.create(journal_entry=je_inv, account=acc_revenue, debit=0, credit=Decimal('5000000.00'))
            inv.journal_entry = je_inv
            inv.save()

        self.stdout.write(self.style.SUCCESS("Seeding Finance berhasil!"))
        self.stdout.write("\nData Simulasi yang Dibuat:")
        self.stdout.write(f"- COA Standar (Cash, AP, AR, Revenue, Expense)")
        self.stdout.write(f"- 1 Vendor Bill (Hutang) senilai Rp 1.500.000 -> Status: PAID")
        self.stdout.write(f"- 1 Customer Invoice (Piutang) senilai Rp 5.000.000 -> Status: OPEN")
