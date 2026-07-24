from django.core.management import call_command
from django.core.management.base import BaseCommand
from hr_module.models import User, EmployeeProfile, Payroll
import datetime

class Command(BaseCommand):
    help = 'Master Seeder that runs all seeders in order'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("=== MEMULAI MASTER SEEDING HR ==="))
        
        call_command('seed_01_core')
        call_command('seed_02_users')
        call_command('seed_03_dummy_data')
        
        self.stdout.write(self.style.SUCCESS("=== MASTER SEEDING BERHASIL! ==="))

        # Menampilkan summary seperti script lama
        try:
            staff_user = User.objects.get(username='staff')
            staff_profile = EmployeeProfile.objects.get(user=staff_user)
            payroll = Payroll.objects.get(
                employee=staff_profile, 
                period_month=datetime.date.today().month, 
                period_year=datetime.date.today().year
            )
            
            self.stdout.write(f"\n[HASIL KALKULASI PAYROLL ENGINE (PRODUKSI)]")
            self.stdout.write(f"Karyawan: {staff_profile.full_name}")
            self.stdout.write(f"1. Gross Salary : Rp {payroll.base_salary + payroll.total_allowance}")
            self.stdout.write(f"2. PPh 21 Progresif : -Rp {payroll.tax_deduction}")
            self.stdout.write(f"3. BPJS Dinamis     : -Rp {payroll.bpjs_deduction}")
            self.stdout.write(f"4. Penalti Telat: -Rp {payroll.absence_deduction}")
            self.stdout.write(f"5. Cicilan Kasbon: -Rp {payroll.loan_deduction}")
            self.stdout.write(self.style.SUCCESS(f">> NET SALARY   : Rp {payroll.net_salary}"))
            
            self.stdout.write("\n[AKUN TEST UNTUK FRONTEND]")
            self.stdout.write("1. Username: hr_admin | Password: password123 (Bisa approve HR & cek Payroll)")
            self.stdout.write("2. Username: manager  | Password: password123 (Bisa approve Manager cuti)")
            self.stdout.write("3. Username: spv      | Password: password123 (Bisa approve Supervisor cuti)")
            self.stdout.write("4. Username: staff    | Password: password123 (Bisa test check-in & ajukan cuti)")
        except Exception as e:
            pass
