from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rbac.models import Permission, Role, UserRole

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with default RBAC permissions, roles, and test users'

    def handle(self, *args, **kwargs):
        slugs = {
            'dashboard': ['dashboard.view'],
            'hr': [
                'hr.department.view', 'hr.department.create', 'hr.department.update', 'hr.department.delete',
                'hr.position.view', 'hr.position.create', 'hr.position.update', 'hr.position.delete',
                'hr.employee.view', 'hr.employee.create', 'hr.employee.update', 'hr.employee.delete',
                'hr.leave.view', 'hr.leave.create', 'hr.leave.approve',
                'hr.payroll.view', 'hr.payroll.create', 'hr.payroll.update', 'hr.payroll.delete', 'hr.payroll.publish',
            ],
            'finance': [
                'finance.account.view', 'finance.account.create', 'finance.account.update', 'finance.account.delete',
                'finance.journal.view', 'finance.journal.create', 'finance.journal.update', 'finance.journal.delete', 'finance.journal.post',
            ],
            'inventory': [
                'inventory.category.view', 'inventory.category.create', 'inventory.category.update', 'inventory.category.delete',
                'inventory.product.view', 'inventory.product.create', 'inventory.product.update', 'inventory.product.delete',
                'inventory.warehouse.view', 'inventory.warehouse.create', 'inventory.warehouse.update', 'inventory.warehouse.delete',
                'inventory.stock.view', 'inventory.movement.view', 'inventory.movement.create',
            ]
        }

        # 1. Create Permissions
        all_permissions = []
        perm_map = {}
        created_count = 0
        for category, slug_list in slugs.items():
            for slug in slug_list:
                perm, created = Permission.objects.get_or_create(slug=slug, defaults={'description': f'Access for {slug}'})
                all_permissions.append(perm)
                perm_map[slug] = perm
                if created:
                    created_count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} new permissions.'))

        # 2. Create Roles
        roles_config = {
            'Super Admin': all_permissions,
            'HR Manager': [perm_map[s] for s in slugs['hr'] + slugs['dashboard']],
            'Finance Admin': [perm_map[s] for s in slugs['finance'] + slugs['dashboard']],
            'Inventory Admin': [perm_map[s] for s in slugs['inventory'] + slugs['dashboard']],
        }

        role_objects = {}
        for role_name, perms in roles_config.items():
            role, created = Role.objects.get_or_create(
                name=role_name,
                defaults={'description': f'Auto-generated {role_name} role'}
            )
            role.permissions.set(perms)
            role_objects[role_name] = role
            action = "created" if created else "updated"
            self.stdout.write(self.style.SUCCESS(f'Successfully {action} {role_name} role.'))

        # 3. Create Users and Assign Roles
        users_config = {
            'superadmin': 'Super Admin',
            'hrmanager': 'HR Manager',
            'financeadmin': 'Finance Admin',
            'inventoryadmin': 'Inventory Admin'
        }

        for username, role_name in users_config.items():
            # Create user if not exists
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@erp.local',
                    'first_name': role_name.split()[0],
                    'last_name': role_name.split()[-1] if len(role_name.split()) > 1 else 'Admin',
                    'is_staff': True
                }
            )
            if created:
                user.set_password('password123')
                if username == 'superadmin':
                    user.is_superuser = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created user: {username} (password: password123)'))

            # Assign Role to User
            role = role_objects[role_name]
            user_role, ur_created = UserRole.objects.get_or_create(user=user, role=role)
            if ur_created:
                self.stdout.write(self.style.SUCCESS(f'Assigned role {role_name} to user {username}'))

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))

