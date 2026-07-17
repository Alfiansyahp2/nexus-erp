from django.core.management.base import BaseCommand
from finance_module.models import Account

class Command(BaseCommand):
    help = 'Seed database with static Chart of Accounts for Finance module'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding Static Chart of Accounts (Finance)...')
        coa_data = [
            {'code': '1110', 'name': 'Kas Kecil', 'type': 'ASSET'},
            {'code': '1120', 'name': 'Bank BCA', 'type': 'ASSET'},
            {'code': '1130', 'name': 'Piutang Usaha', 'type': 'ASSET'},
            {'code': '1210', 'name': 'Inventaris Kantor', 'type': 'ASSET'},
            
            {'code': '2110', 'name': 'Hutang Usaha', 'type': 'LIABILITY'},
            {'code': '2120', 'name': 'Hutang Gaji', 'type': 'LIABILITY'},
            {'code': '2130', 'name': 'Hutang Pajak', 'type': 'LIABILITY'},
            
            {'code': '3110', 'name': 'Modal Saham', 'type': 'EQUITY'},
            {'code': '3120', 'name': 'Laba Ditahan', 'type': 'EQUITY'},
            
            {'code': '4110', 'name': 'Pendapatan Jasa', 'type': 'REVENUE'},
            {'code': '4120', 'name': 'Pendapatan Lain-lain', 'type': 'REVENUE'},
            
            {'code': '5110', 'name': 'Beban Gaji & Tunjangan', 'type': 'EXPENSE'},
            {'code': '5120', 'name': 'Beban Sewa Kantor', 'type': 'EXPENSE'},
            {'code': '5130', 'name': 'Beban Listrik & Air', 'type': 'EXPENSE'},
            {'code': '5140', 'name': 'Beban Penyusutan', 'type': 'EXPENSE'},
        ]
        
        for account in coa_data:
            Account.objects.get_or_create(
                account_code=account['code'],
                defaults={
                    'name': account['name'],
                    'account_type': account['type'],
                    'is_active': True
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Finance module!'))
