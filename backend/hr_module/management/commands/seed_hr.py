import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from hr_module.models import (
    User, Department, Position, Shift, EmployeeProfile, OfficeLocation,
    LeaveBalance, EmployeeLoan, SalaryComponent, Payroll, Attendance
)

class Command(BaseCommand):
    help = 'Seeds the database with initial HR data for testing Phase 1-4 features'

    def handle(self, *args, **kwargs):
        self.stdout.write("Mulai melakukan seeding data HR...")

        # 1. Gunakan metodologi get_or_create agar tidak merusak data existing (Non-Destructive Seeding)
        # Jangan pernah menggunakan .delete() di skrip production
        
        # 2. Setup Office
        office, _ = OfficeLocation.objects.get_or_create(
            name="Kantor Pusat Jakarta",
            defaults={
                'latitude': -6.2088,
                'longitude': 106.8456,
                'radius_meters': 500
            }
        )
        
        # 3. Setup Departemen & Posisi
        dept_it, _ = Department.objects.get_or_create(name="IT Department", defaults={'description': "Tim Teknologi"})
        dept_hr, _ = Department.objects.get_or_create(name="HR Department", defaults={'description': "Tim Personalia"})
        
        pos_manager, _ = Position.objects.get_or_create(name="IT Manager", department=dept_it)
        pos_staff, _ = Position.objects.get_or_create(name="Software Engineer", department=dept_it)
        pos_hr, _ = Position.objects.get_or_create(name="HR Manager", department=dept_hr)

        # 4. Setup Shift
        shift_regular, _ = Shift.objects.get_or_create(
            name="Regular Shift",
            defaults={
                'start_time': datetime.time(9, 0),
                'end_time': datetime.time(17, 0),
                'late_tolerance_minutes': 15
            }
        )

        # 5. Create Users (Safely)
        def create_user_safe(username, email, role):
            user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'role': role})
            if created:
                user.set_password('password123')
                user.save()
            return user

        hr_user = create_user_safe('hr_admin', 'hr@erp.com', User.Role.HR_ADMIN)
        manager_user = create_user_safe('manager', 'manager@erp.com', User.Role.EMPLOYEE)
        staff_user = create_user_safe('staff', 'staff@erp.com', User.Role.EMPLOYEE)

        # 6. Create Employee Profiles
        hr_profile, _ = EmployeeProfile.objects.get_or_create(
            user=hr_user, defaults={
                'full_name': "Budi HR", 'nik_ktp': "1234567890123456", 
                'place_of_birth': "Jakarta", 'date_of_birth': datetime.date(1990, 1, 1),
                'gender': "L", 'religion': "Islam", 'marital_status': "SINGLE",
                'address': "Jl. HR", 'employee_id': "HR-001", 'join_date': datetime.date(2020, 1, 1),
                'department': dept_hr, 'position': pos_hr, 'employment_status': "PERMANENT",
                'shift': shift_regular
            }
        )

        manager_profile, _ = EmployeeProfile.objects.get_or_create(
            user=manager_user, defaults={
                'full_name': "Siti Manager", 'nik_ktp': "1234567890123457", 
                'place_of_birth': "Bandung", 'date_of_birth': datetime.date(1985, 2, 2),
                'gender': "P", 'religion': "Islam", 'marital_status': "MARRIED",
                'address': "Jl. Manager", 'employee_id': "IT-M01", 'join_date': datetime.date(2018, 1, 1),
                'department': dept_it, 'position': pos_manager, 'employment_status': "PERMANENT",
                'shift': shift_regular
            }
        )

        staff_profile, _ = EmployeeProfile.objects.get_or_create(
            user=staff_user, defaults={
                'full_name': "Andi Staff", 'nik_ktp': "1234567890123458", 
                'place_of_birth': "Surabaya", 'date_of_birth': datetime.date(1995, 3, 3),
                'gender': "L", 'religion': "Islam", 'marital_status': "SINGLE",
                'address': "Jl. Staff", 'employee_id': "IT-S01", 'join_date': datetime.date(2022, 1, 1),
                'department': dept_it, 'position': pos_staff, 'employment_status': "CONTRACT",
                'manager': manager_profile, 'shift': shift_regular
            }
        )

        # 7. Setup Leave Balance
        LeaveBalance.objects.get_or_create(
            employee=staff_profile,
            year=datetime.date.today().year,
            defaults={'annual_allocation': 12, 'used': 0}
        )

        # 8. Setup Salary Component
        SalaryComponent.objects.get_or_create(
            employee=staff_profile,
            defaults={
                'base_salary': 10000000,
                'transport_allowance': 1000000,
                'meal_allowance': 1000000,
                'position_allowance': 0
            }
        )

        # 9. Kasbon (Employee Loan)
        EmployeeLoan.objects.get_or_create(
            employee=staff_profile,
            defaults={
                'amount': 5000000,
                'installment_per_period': 1000000,
                'remaining_amount': 5000000
            }
        )

        # 10. Simulasi Absensi (Telat 30 menit)
        attendance, _ = Attendance.objects.get_or_create(
            employee=staff_profile,
            date=datetime.date.today(),
            defaults={
                'check_in_lat': -6.2088,
                'check_in_long': 106.8456,
                'is_late': True,
                'late_minutes': 30
            }
        )
        
        # 11. Create Payroll DRAFT
        payroll, _ = Payroll.objects.get_or_create(
            employee=staff_profile,
            period_month=datetime.date.today().month,
            period_year=datetime.date.today().year,
            defaults={
                'base_salary': 10000000,
                'total_allowance': 2000000,
                'status': 'DRAFT'
            }
        )

        self.stdout.write(self.style.SUCCESS("Seeding berhasil!"))
        self.stdout.write(f"\n[HASIL KALKULASI PAYROLL ENGINE]")
        self.stdout.write(f"Karyawan: {staff_profile.full_name}")
        self.stdout.write(f"1. Gross Salary : Rp {payroll.base_salary + payroll.total_allowance}")
        self.stdout.write(f"2. PPh21 (5%)   : -Rp {payroll.tax_deduction}")
        self.stdout.write(f"3. BPJS (3%)    : -Rp {payroll.bpjs_deduction}")
        self.stdout.write(f"4. Penalti Telat: -Rp {payroll.absence_deduction} (30 menit x Rp 500)")
        self.stdout.write(f"5. Cicilan Kasbon: -Rp {payroll.loan_deduction}")
        self.stdout.write(self.style.SUCCESS(f">> NET SALARY   : Rp {payroll.net_salary}"))
        
        self.stdout.write("\n[AKUN TEST UNTUK FRONTEND]")
        self.stdout.write("1. Username: hr_admin | Password: password123 (Bisa approve HR & cek Payroll)")
        self.stdout.write("2. Username: manager  | Password: password123 (Bisa approve Atasan cuti)")
        self.stdout.write("3. Username: staff    | Password: password123 (Bisa test check-in & ajukan cuti)")
