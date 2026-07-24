import datetime
from django.core.management.base import BaseCommand
from hr_module.models import User, EmployeeProfile, LeaveBalance, SalaryComponent, EmployeeLoan, Attendance, Payroll

class Command(BaseCommand):
    help = 'Seeds dummy data for testing (Leave, Salary, Loan, Attendance, Payroll)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding 03 - Dummy Data...")
        
        staff_user = User.objects.get(username='staff')
        staff_profile = EmployeeProfile.objects.get(user=staff_user)

        LeaveBalance.objects.get_or_create(
            employee=staff_profile,
            year=datetime.date.today().year,
            defaults={'annual_allocation': 12, 'used': 0}
        )

        SalaryComponent.objects.get_or_create(
            employee=staff_profile,
            defaults={
                'base_salary': 10000000,
                'transport_allowance': 1000000,
                'meal_allowance': 1000000,
                'position_allowance': 0
            }
        )

        EmployeeLoan.objects.get_or_create(
            employee=staff_profile,
            defaults={
                'amount': 5000000,
                'installment_per_period': 1000000,
                'remaining_amount': 5000000
            }
        )

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

        self.stdout.write(self.style.SUCCESS("Seeding 03 selesai!"))
