from celery import shared_task
from django.db.models import Sum
from decimal import Decimal
import time
from .models import EmployeeProfile, Payroll, TaxBracket, CompanySettings

@shared_task(bind=True)
def generate_bulk_payroll(self, period_month, period_year):
    employees = EmployeeProfile.objects.exclude(employment_status='RESIGNED')
    total_employees = employees.count()
    
    if total_employees == 0:
        return {'status': 'Completed', 'message': 'No employees found.', 'total': 0, 'success': 0, 'failed': 0}

    success_count = 0
    failed_count = 0

    for idx, employee in enumerate(employees):
        try:
            # Check if payroll already exists for this period to avoid duplicates
            if Payroll.objects.filter(employee=employee, period_month=period_month, period_year=period_year).exists():
                success_count += 1
                continue
                
            salary_component = getattr(employee, 'salary_components', None)
            if not salary_component:
                failed_count += 1
                continue
                
            # Create the payroll object (the .save() method in models.py handles the complex logic)
            Payroll.objects.create(
                employee=employee,
                period_month=period_month,
                period_year=period_year,
                base_salary=salary_component.base_salary,
                total_allowance=salary_component.get_total_allowance(),
                status='DRAFT'
            )
            success_count += 1
        except Exception as e:
            failed_count += 1
            
        # Update progress every iteration
        self.update_state(
            state='PROGRESS',
            meta={
                'current': idx + 1,
                'total': total_employees,
                'percent': int(((idx + 1) / total_employees) * 100),
                'success': success_count,
                'failed': failed_count
            }
        )
        # Optional: slight sleep to simulate heavy load in local dev or prevent db thrashing
        # time.sleep(0.1)

    return {
        'status': 'Completed',
        'current': total_employees,
        'total': total_employees,
        'percent': 100,
        'success': success_count,
        'failed': failed_count
    }
