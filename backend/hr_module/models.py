from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
        HR_ADMIN = 'HR_ADMIN', 'HR Admin / Manager'
        EMPLOYEE = 'EMPLOYEE', 'Employee'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)

class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Position(models.Model):
    name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='positions')
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    
    # Data Pribadi
    full_name = models.CharField(max_length=255)
    nik_ktp = models.CharField(max_length=16, unique=True)
    place_of_birth = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[('L', 'Laki-Laki'), ('P', 'Perempuan')])
    religion = models.CharField(max_length=50)
    marital_status = models.CharField(max_length=50, choices=[
        ('SINGLE', 'Belum Kawin'),
        ('MARRIED', 'Kawin'),
        ('WIDOWED', 'Cerai Mati'),
        ('DIVORCED', 'Cerai Hidup')
    ])
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    address = models.TextField()

    # Data Kepegawaian
    employee_id = models.CharField(max_length=50, unique=True) # NIP
    join_date = models.DateField()
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True)
    employment_status = models.CharField(max_length=50, choices=[
        ('CONTRACT', 'Kontrak'),
        ('PERMANENT', 'Tetap'),
        ('PROBATION', 'Probation')
    ])
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')

    # Data Finansial & Legal
    npwp = models.CharField(max_length=30, blank=True, null=True)
    bpjs_kesehatan = models.CharField(max_length=30, blank=True, null=True)
    bpjs_ketenagakerjaan = models.CharField(max_length=30, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)

    # Kontak Darurat
    emergency_contact_name = models.CharField(max_length=255)
    emergency_contact_relation = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"
