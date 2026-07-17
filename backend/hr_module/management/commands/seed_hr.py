import datetime
import random
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from hr_module.models import User, Department, Position, EmployeeProfile

class Command(BaseCommand):
    help = 'Seed database with static and dummy data for HR module'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting HR seeder...')

        # 1. Seed Departments
        self.stdout.write('Seeding Departments...')
        departments_data = ['IT', 'Human Resources', 'Finance', 'Operations', 'Sales']
        departments = {}
        for dept_name in departments_data:
            dept, created = Department.objects.get_or_create(name=dept_name, defaults={'description': f'{dept_name} Department'})
            departments[dept_name] = dept

        # 2. Seed Positions
        self.stdout.write('Seeding Positions...')
        positions_data = [
            {'name': 'Software Engineer', 'dept': 'IT'},
            {'name': 'IT Manager', 'dept': 'IT'},
            {'name': 'HR Specialist', 'dept': 'Human Resources'},
            {'name': 'HR Manager', 'dept': 'Human Resources'},
            {'name': 'Accountant', 'dept': 'Finance'},
            {'name': 'Finance Manager', 'dept': 'Finance'},
        ]
        positions = {}
        for pos_data in positions_data:
            pos, created = Position.objects.get_or_create(
                name=pos_data['name'], 
                department=departments[pos_data['dept']],
                defaults={'description': f"{pos_data['name']} Role"}
            )
            positions[pos_data['name']] = pos

        # 3. Seed Users and Employee Profiles
        self.stdout.write('Seeding Dummy Users and Employees...')
        dummy_users = [
            {'username': 'it.manager', 'email': 'it.manager@erp.local', 'role': User.Role.HR_ADMIN, 'name': 'Budi Santoso', 'pos': 'IT Manager', 'gender': 'L'},
            {'username': 'john.doe', 'email': 'john.doe@erp.local', 'role': User.Role.EMPLOYEE, 'name': 'John Doe', 'pos': 'Software Engineer', 'gender': 'L'},
            {'username': 'jane.smith', 'email': 'jane.smith@erp.local', 'role': User.Role.EMPLOYEE, 'name': 'Jane Smith', 'pos': 'HR Specialist', 'gender': 'P'},
            {'username': 'siti.aminah', 'email': 'siti.aminah@erp.local', 'role': User.Role.HR_ADMIN, 'name': 'Siti Aminah', 'pos': 'Finance Manager', 'gender': 'P'},
        ]
        
        for idx, u_data in enumerate(dummy_users):
            user, created = User.objects.get_or_create(
                username=u_data['username'],
                defaults={
                    'email': u_data['email'],
                    'password': make_password('password123'),
                    'role': u_data['role'],
                    'first_name': u_data['name'].split()[0],
                    'last_name': ' '.join(u_data['name'].split()[1:])
                }
            )
            
            if created:
                # Create profile
                EmployeeProfile.objects.create(
                    user=user,
                    full_name=u_data['name'],
                    nik_ktp=f"3201{random.randint(100000000000, 999999999999)}",
                    place_of_birth='Jakarta',
                    date_of_birth=datetime.date(1990 + idx, 5, 10),
                    gender=u_data['gender'],
                    religion='Islam',
                    marital_status='SINGLE',
                    address='Jl. Jendral Sudirman No. 1, Jakarta',
                    employee_id=f"EMP-2026-{str(idx+1).zfill(3)}",
                    join_date=datetime.date(2023, 1, 15),
                    department=positions[u_data['pos']].department,
                    position=positions[u_data['pos']],
                    employment_status='PERMANENT'
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded HR module!'))
        self.stdout.write('Login for dummy users: username (e.g. john.doe) / password123')
