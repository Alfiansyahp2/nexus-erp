from django.core.management.base import BaseCommand
from rbac.models import Permission, Role

class Command(BaseCommand):
    help = 'Seeds the database with default RBAC permissions and a Super Admin role'

    def handle(self, *args, **kwargs):
        slugs = [
            # Dashboard
            'dashboard.view',
            
            # HR
            'hr.department.view', 'hr.department.create', 'hr.department.update', 'hr.department.delete',
            'hr.position.view', 'hr.position.create', 'hr.position.update', 'hr.position.delete',
            'hr.employee.view', 'hr.employee.create', 'hr.employee.update', 'hr.employee.delete',
            'hr.leave.view', 'hr.leave.create', 'hr.leave.approve',
            'hr.payroll.view', 'hr.payroll.create', 'hr.payroll.update', 'hr.payroll.delete', 'hr.payroll.publish',
            
            # Finance
            'finance.account.view', 'finance.account.create', 'finance.account.update', 'finance.account.delete',
            'finance.journal.view', 'finance.journal.create', 'finance.journal.update', 'finance.journal.delete', 'finance.journal.post',
            
            # Inventory
            'inventory.category.view', 'inventory.category.create', 'inventory.category.update', 'inventory.category.delete',
            'inventory.product.view', 'inventory.product.create', 'inventory.product.update', 'inventory.product.delete',
            'inventory.warehouse.view', 'inventory.warehouse.create', 'inventory.warehouse.update', 'inventory.warehouse.delete',
            'inventory.stock.view', 'inventory.movement.view', 'inventory.movement.create',
        ]

        created_count = 0
        all_permissions = []
        for slug in slugs:
            perm, created = Permission.objects.get_or_create(slug=slug, defaults={'description': f'Access for {slug}'})
            all_permissions.append(perm)
            if created:
                created_count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} new permissions.'))

        # Create a Super Admin role with all permissions if it doesn't exist
        super_admin_role, sa_created = Role.objects.get_or_create(
            name='Super Admin',
            defaults={'description': 'Administrator with all permissions'}
        )
        
        super_admin_role.permissions.set(all_permissions)
        
        if sa_created:
            self.stdout.write(self.style.SUCCESS('Successfully created Super Admin role and granted all permissions.'))
        else:
            self.stdout.write(self.style.SUCCESS('Updated Super Admin role with all permissions.'))
