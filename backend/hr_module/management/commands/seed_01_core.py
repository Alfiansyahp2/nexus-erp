import datetime
from django.core.management.base import BaseCommand
from hr_module.models import OfficeLocation, Department, Position, Shift, TaxBracket, CompanySettings

class Command(BaseCommand):
    help = 'Seeds core HR data (Office, Departments, Shifts, Settings)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding 01 - Core Data...")

        OfficeLocation.objects.get_or_create(
            name="Kantor Pusat Jakarta",
            defaults={'latitude': -6.2088, 'longitude': 106.8456, 'radius_meters': 500}
        )
        
        dept_it, _ = Department.objects.get_or_create(name="IT Department", defaults={'description': "Tim Teknologi"})
        dept_hr, _ = Department.objects.get_or_create(name="HR Department", defaults={'description': "Tim Personalia"})
        
        Position.objects.get_or_create(name="IT Manager", department=dept_it)
        Position.objects.get_or_create(name="Software Engineer", department=dept_it)
        Position.objects.get_or_create(name="HR Manager", department=dept_hr)

        Shift.objects.get_or_create(
            name="Regular Shift",
            defaults={'start_time': datetime.time(9, 0), 'end_time': datetime.time(17, 0), 'late_tolerance_minutes': 15}
        )

        TaxBracket.objects.get_or_create(min_income=0, max_income=60000000, defaults={'tax_rate': 5.0})
        TaxBracket.objects.get_or_create(min_income=60000000, max_income=250000000, defaults={'tax_rate': 15.0})
        TaxBracket.objects.get_or_create(min_income=250000000, max_income=500000000, defaults={'tax_rate': 25.0})
        TaxBracket.objects.get_or_create(min_income=500000000, max_income=None, defaults={'tax_rate': 30.0})

        CompanySettings.objects.get_or_create(id=1, defaults={'bpjs_kesehatan_rate': 1.0, 'bpjs_ketenagakerjaan_rate': 2.0})

        self.stdout.write(self.style.SUCCESS("Seeding 01 selesai!"))
