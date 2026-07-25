from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rbac.models import Permission, Role, UserRole, UserPermission

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with default RBAC permissions, roles, and user permissions'

    def handle(self, *args, **kwargs):
        slugs = {
            'dashboard': ['dashboard.view'],
            'hr': [
                'hr.department.view', 'hr.department.create', 'hr.department.update', 'hr.department.delete',
                'hr.position.view', 'hr.position.create', 'hr.position.update', 'hr.position.delete',
                'hr.employee.view', 'hr.employee.create', 'hr.employee.update', 'hr.employee.delete',
                'hr.leave.view', 'hr.leave.create', 'hr.leave.approve',
                'hr.payroll.view', 'hr.payroll.create', 'hr.payroll.update', 'hr.payroll.delete', 'hr.payroll.publish',
                'hr.attendance.view', 'hr.attendance.create', 'hr.attendance.update', 'hr.attendance.delete',
                'hr.shift.view', 'hr.shift.create', 'hr.shift.update', 'hr.shift.delete',
                'hr.loan.view', 'hr.loan.create', 'hr.loan.update', 'hr.loan.delete',
                'hr.salary_component.view', 'hr.salary_component.create', 'hr.salary_component.update',
            ],
            'finance': [
                'finance.account.view', 'finance.account.create', 'finance.account.update', 'finance.account.delete',
                'finance.journal.view', 'finance.journal.create', 'finance.journal.update', 'finance.journal.delete', 'finance.journal.post',
                'finance.invoice.view', 'finance.invoice.create', 'finance.invoice.update', 'finance.invoice.delete',
                'finance.payment.view', 'finance.payment.create', 'finance.payment.update', 'finance.payment.delete',
                'finance.fixed_asset.view', 'finance.fixed_asset.create', 'finance.fixed_asset.update', 'finance.fixed_asset.delete',
                'finance.bank_statement.view', 'finance.bank_statement.create', 'finance.bank_statement.update', 'finance.bank_statement.delete',
            ],
            'inventory': [
                'inventory.category.view', 'inventory.category.create', 'inventory.category.update', 'inventory.category.delete',
                'inventory.product.view', 'inventory.product.create', 'inventory.product.update', 'inventory.product.delete',
                'inventory.warehouse.view', 'inventory.warehouse.create', 'inventory.warehouse.update', 'inventory.warehouse.delete',
                'inventory.stock.view', 'inventory.movement.view', 'inventory.movement.create',
            ],
            'purchasing': [
                'purchasing.vendor.view', 'purchasing.vendor.create', 'purchasing.vendor.update', 'purchasing.vendor.delete',
                'purchasing.pr.view', 'purchasing.pr.create', 'purchasing.pr.update', 'purchasing.pr.approve',
                'purchasing.po.view', 'purchasing.po.create', 'purchasing.po.update', 'purchasing.po.confirm',
                'purchasing.gr.view', 'purchasing.gr.create', 'purchasing.gr.confirm',
            ],
            'settings': [
                'settings.view', 'settings.manage_users', 'settings.manage_roles'
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

        # 2. Define Templates (Roles as templates)
        roles_config = {
            'Super Admin': all_permissions,
            'HR Manager': [perm_map[s] for s in slugs['hr'] + slugs['dashboard']],
            'Finance Admin': [perm_map[s] for s in slugs['finance'] + slugs['dashboard']],
            'Inventory Admin': [perm_map[s] for s in slugs['inventory'] + slugs['dashboard']],
            'Purchasing Admin': [perm_map[s] for s in slugs['purchasing'] + slugs['inventory'] + slugs['dashboard']],
        }

        role_objects = {}
        for role_name, perms in roles_config.items():
            role, created = Role.objects.get_or_create(
                name=role_name,
                defaults={'description': f'Auto-generated {role_name} role'}
            )
            role.permissions.set(perms)
            role_objects[role_name] = role

        # 3. Create Users and Assign UserPermissions
        users_config = {
            'superadmin': 'Super Admin',
            'hrmanager': 'HR Manager',
            'financeadmin': 'Finance Admin',
            'inventoryadmin': 'Inventory Admin',
            'purchasingadmin': 'Purchasing Admin'
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

            # Assign Role to User (for UI display purposes / legacy)
            role = role_objects[role_name]
            UserRole.objects.get_or_create(user=user, role=role)

            # Map the exact permissions from the template into UserPermission directly
            user_perms_to_create = []
            for p in roles_config[role_name]:
                if not UserPermission.objects.filter(user=user, permission=p).exists():
                    user_perms_to_create.append(UserPermission(user=user, permission=p))
            
            if user_perms_to_create:
                UserPermission.objects.bulk_create(user_perms_to_create)
                self.stdout.write(self.style.SUCCESS(f'Granted {len(user_perms_to_create)} direct permissions to user {username} based on {role_name} template'))

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))

