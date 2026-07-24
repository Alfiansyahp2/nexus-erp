import datetime
from django.core.management.base import BaseCommand
from hr_module.models import User, EmployeeProfile, Department, Position, Shift

class Command(BaseCommand):
    help = 'Seeds users and employee profiles'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding 02 - Users & Profiles...")

        def create_user_safe(username, email, role):
            user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'role': role})
            if created:
                user.set_password('password123')
                user.save()
            return user

        hr_user = create_user_safe('hr_admin', 'hr@erp.com', User.Role.HR_ADMIN)
        manager_user = create_user_safe('manager', 'manager@erp.com', User.Role.EMPLOYEE)
        spv_user = create_user_safe('spv', 'spv@erp.com', User.Role.EMPLOYEE)
        staff_user = create_user_safe('staff', 'staff@erp.com', User.Role.EMPLOYEE)

        dept_hr = Department.objects.get(name="HR Department")
        dept_it = Department.objects.get(name="IT Department")
        pos_hr = Position.objects.get(name="HR Manager")
        pos_manager = Position.objects.get(name="IT Manager")
        pos_staff = Position.objects.get(name="Software Engineer")
        shift_regular = Shift.objects.get(name="Regular Shift")

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

        spv_profile, _ = EmployeeProfile.objects.get_or_create(
            user=spv_user, defaults={
                'full_name': "Budi SPV", 'nik_ktp': "1234567890123459", 
                'place_of_birth': "Malang", 'date_of_birth': datetime.date(1990, 4, 4),
                'gender': "L", 'religion': "Islam", 'marital_status': "MARRIED",
                'address': "Jl. SPV", 'employee_id': "IT-S02", 'join_date': datetime.date(2020, 1, 1),
                'department': dept_it, 'position': pos_staff, 'employment_status': "PERMANENT",
                'manager': manager_profile, 'shift': shift_regular
            }
        )

        staff_profile, _ = EmployeeProfile.objects.get_or_create(
            user=staff_user, defaults={
                'full_name': "Andi Staff", 'nik_ktp': "1234567890123458", 
                'place_of_birth': "Surabaya", 'date_of_birth': datetime.date(1995, 3, 3),
                'gender': "L", 'religion': "Islam", 'marital_status': "SINGLE",
                'address': "Jl. Staff", 'employee_id': "IT-S01", 'join_date': datetime.date(2022, 1, 1),
                'department': dept_it, 'position': pos_staff, 'employment_status': "CONTRACT",
                'manager': manager_profile, 'supervisor': spv_profile, 'shift': shift_regular
            }
        )

        self.stdout.write(self.style.SUCCESS("Seeding 02 selesai!"))
