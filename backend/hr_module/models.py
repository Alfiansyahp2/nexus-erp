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

class Attendance(models.Model):
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(auto_now_add=True)
    check_in = models.DateTimeField(auto_now_add=True)
    check_out = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee.full_name} - {self.date}"

class LeaveRequest(models.Model):
    class LeaveType(models.TextChoices):
        SICK = 'SICK', 'Sakit'
        ANNUAL = 'ANNUAL', 'Cuti Tahunan'
        UNPAID = 'UNPAID', 'Izin di Luar Tanggungan'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Menunggu Persetujuan'
        APPROVED = 'APPROVED', 'Disetujui'
        REJECTED = 'REJECTED', 'Ditolak'

    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    attachment = models.FileField(upload_to='leave_attachments/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type} ({self.status})"

class SalaryComponent(models.Model):
    employee = models.OneToOneField(EmployeeProfile, on_delete=models.CASCADE, related_name='salary_components')
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    meal_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    position_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def get_total_allowance(self):
        return self.transport_allowance + self.meal_allowance + self.position_allowance

    def __str__(self):
        return f"Salary Component: {self.employee.full_name}"

class Payroll(models.Model):
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='payrolls')
    period_month = models.IntegerField() # e.g. 1 for January
    period_year = models.IntegerField()  # e.g. 2026
    
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    total_allowance = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Deductions
    tax_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0) # PPh 21
    bpjs_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    absence_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('DRAFT', 'Draft'),
        ('PAID', 'Terbayar')
    ], default='DRAFT')

    class Meta:
        unique_together = ('employee', 'period_month', 'period_year')

    def save(self, *args, **kwargs):
        total_deduction = self.tax_deduction + self.bpjs_deduction + self.absence_deduction
        self.net_salary = (self.base_salary + self.total_allowance) - total_deduction
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payroll {self.employee.full_name} - {self.period_month}/{self.period_year}"
