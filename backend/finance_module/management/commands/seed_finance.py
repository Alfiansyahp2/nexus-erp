import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from finance_module.models import Account, JournalEntry, JournalItem

class Command(BaseCommand):
    help = 'Seeding data dummy untuk modul Finance (Chart of Accounts & Jurnal Umum)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Memulai proses seeding data finance...'))

        # 1. Seed Accounts (Chart of Accounts)
        accounts_data = [
            {'account_code': '101', 'name': 'Kas Besar', 'account_type': 'ASSET', 'description': 'Kas operasional utama'},
            {'account_code': '102', 'name': 'Bank Mandiri', 'account_type': 'ASSET', 'description': 'Rekening Bank Mandiri'},
            {'account_code': '103', 'name': 'Piutang Usaha', 'account_type': 'ASSET', 'description': 'Piutang pelanggan'},
            {'account_code': '201', 'name': 'Hutang Dagang', 'account_type': 'LIABILITY', 'description': 'Hutang ke supplier'},
            {'account_code': '301', 'name': 'Modal Disetor', 'account_type': 'EQUITY', 'description': 'Modal awal pemilik'},
            {'account_code': '401', 'name': 'Pendapatan Jasa', 'account_type': 'REVENUE', 'description': 'Pendapatan dari layanan'},
            {'account_code': '402', 'name': 'Pendapatan Penjualan', 'account_type': 'REVENUE', 'description': 'Pendapatan dari penjualan barang'},
            {'account_code': '501', 'name': 'Beban Gaji', 'account_type': 'EXPENSE', 'description': 'Beban gaji karyawan'},
            {'account_code': '502', 'name': 'Beban Listrik & Air', 'account_type': 'EXPENSE', 'description': 'Beban utilitas bulanan'},
        ]
        
        accounts_map = {}
        for acc_data in accounts_data:
            acc, created = Account.objects.get_or_create(
                account_code=acc_data['account_code'],
                defaults=acc_data
            )
            accounts_map[acc.account_code] = acc
        self.stdout.write(self.style.SUCCESS('Buku Besar (Chart of Accounts) berhasil dibuat.'))

        # 2. Seed Journal Entries
        # Bersihkan jurnal lama agar tidak duplikat error
        JournalEntry.objects.all().delete()
        
        today = datetime.now().date()
        
        # Jurnal 1: Penyetoran Modal
        je1 = JournalEntry.objects.create(
            date=today - timedelta(days=10),
            reference_number='JRN-MODAL-001',
            description='Penyetoran modal awal oleh pemilik'
        )
        # Debit Kas
        JournalItem.objects.create(journal_entry=je1, account=accounts_map['101'], description='Setoran tunai', debit=500000000, credit=0)
        # Kredit Modal
        JournalItem.objects.create(journal_entry=je1, account=accounts_map['301'], description='Setoran tunai', debit=0, credit=500000000)

        # Jurnal 2: Pendapatan Penjualan Tunai
        je2 = JournalEntry.objects.create(
            date=today - timedelta(days=5),
            reference_number='INV-2023-001',
            description='Penjualan 100 pcs barang secara tunai'
        )
        JournalItem.objects.create(journal_entry=je2, account=accounts_map['102'], description='Terima transfer bank', debit=15000000, credit=0)
        JournalItem.objects.create(journal_entry=je2, account=accounts_map['402'], description='Penjualan barang', debit=0, credit=15000000)

        # Jurnal 3: Pembayaran Beban Listrik
        je3 = JournalEntry.objects.create(
            date=today - timedelta(days=2),
            reference_number='PAY-UTIL-001',
            description='Pembayaran tagihan listrik dan air bulan ini'
        )
        JournalItem.objects.create(journal_entry=je3, account=accounts_map['502'], description='Tagihan PLN & PDAM', debit=2500000, credit=0)
        JournalItem.objects.create(journal_entry=je3, account=accounts_map['101'], description='Bayar kas', debit=0, credit=2500000)

        # Jurnal 4: Pengakuan Hutang Dagang (Beli barang belum lunas)
        je4 = JournalEntry.objects.create(
            date=today - timedelta(days=1),
            reference_number='PUR-2023-001',
            description='Pembelian bahan baku secara kredit'
        )
        # Assuming asset account for inventory, but we don't have one, let's just use Expense for simplicity in dummy data
        JournalItem.objects.create(journal_entry=je4, account=accounts_map['501'], description='Beban operasional lainnya', debit=10000000, credit=0)
        JournalItem.objects.create(journal_entry=je4, account=accounts_map['201'], description='Hutang ke PT ABC', debit=0, credit=10000000)


        self.stdout.write(self.style.SUCCESS('Jurnal Umum berhasil di-generate.'))
        self.stdout.write(self.style.SUCCESS('\nSeeding Finance Selesai! Buka halaman Journal Entries di aplikasi untuk melihat hasilnya.'))
