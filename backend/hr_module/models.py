from django.db import models
from django.contrib.auth.models import AbstractUser
from decimal import Decimal

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

class Shift(models.Model):
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    late_tolerance_minutes = models.IntegerField(default=15)
    
    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"

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
    supervisor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_employees')
    shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')

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

class OfficeLocation(models.Model):
    name = models.CharField(max_length=100, default="Kantor Pusat")
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    radius_meters = models.IntegerField(default=100)

    def __str__(self):
        return self.name

class Attendance(models.Model):
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(auto_now_add=True)
    check_in = models.DateTimeField(auto_now_add=True)
    check_in_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    check_in_long = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    check_in_photo = models.ImageField(upload_to='attendance_photos/check_in/', null=True, blank=True)
    
    is_late = models.BooleanField(default=False)
    late_minutes = models.IntegerField(default=0)
    
    check_out = models.DateTimeField(null=True, blank=True)
    check_out_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    check_out_long = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    check_out_photo = models.ImageField(upload_to='attendance_photos/check_out/', null=True, blank=True)
    
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
        PENDING_SPV = 'PENDING_SPV', 'Menunggu Persetujuan Supervisor'
        PENDING_MANAGER = 'PENDING_MANAGER', 'Menunggu Persetujuan Manager'
        PENDING_HR = 'PENDING_HR', 'Menunggu Verifikasi HR'
        APPROVED = 'APPROVED', 'Disetujui'
        REJECTED = 'REJECTED', 'Ditolak'

    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    attachment = models.FileField(upload_to='leave_attachments/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING_SPV)
    approved_by_spv = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='spv_approved_leaves')
    approved_by_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='manager_approved_leaves')
    approved_by_hr = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='hr_approved_leaves')

    def __str__(self):
        return f"{self.employee.full_name} - {self.leave_type} ({self.status})"

class LeaveBalance(models.Model):
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='leave_balances')
    year = models.IntegerField()
    annual_allocation = models.IntegerField(default=12)
    used = models.IntegerField(default=0)
    
    @property
    def remaining(self):
        return self.annual_allocation - self.used

    class Meta:
        unique_together = ('employee', 'year')

    def __str__(self):
        return f"{self.employee.full_name} ({self.year}) - Sisa: {self.remaining}"

class EmployeeLoan(models.Model):
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='loans')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    installment_per_period = models.DecimalField(max_digits=12, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_paid_off = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Loan {self.employee.full_name} - Sisa: {self.remaining_amount}"

class TaxBracket(models.Model):
    min_income = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    max_income = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        ordering = ['min_income']

    def __str__(self):
        return f"Tax {self.tax_rate}% (Min: {self.min_income} - Max: {self.max_income})"

class CompanySettings(models.Model):
    bpjs_kesehatan_rate = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    bpjs_ketenagakerjaan_rate = models.DecimalField(max_digits=5, decimal_places=2, default=2.0)

    def save(self, *args, **kwargs):
        if not self.pk and CompanySettings.objects.exists():
            raise Exception('There can be only one CompanySettings instance')
        return super(CompanySettings, self).save(*args, **kwargs)

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
    loan_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('DRAFT', 'Draft'),
        ('PAID', 'Terbayar')
    ], default='DRAFT')

    class Meta:
        unique_together = ('employee', 'period_month', 'period_year')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = 'DRAFT'
        if not is_new:
            old_payroll = Payroll.objects.get(pk=self.pk)
            old_status = old_payroll.status

        if self.status == 'DRAFT':
            gross_monthly = self.base_salary + self.total_allowance
            gross_annual = gross_monthly * 12
            
            # 1. Progressive PPh 21
            tax_brackets = TaxBracket.objects.all().order_by('min_income')
            annual_tax = Decimal('0')
            remaining_income = gross_annual
            
            for bracket in tax_brackets:
                if remaining_income > bracket.min_income:
                    taxable_amount = remaining_income - bracket.min_income
                    if bracket.max_income:
                        bracket_range = bracket.max_income - bracket.min_income
                        taxable_amount = min(taxable_amount, bracket_range)
                    
                    annual_tax += taxable_amount * (bracket.tax_rate / Decimal('100.0'))
            
            self.tax_deduction = annual_tax / Decimal('12.0')

            # 2. BPJS from CompanySettings
            settings = CompanySettings.objects.first()
            if settings:
                bpjs_kes_rate = settings.bpjs_kesehatan_rate / Decimal('100.0')
                bpjs_tk_rate = settings.bpjs_ketenagakerjaan_rate / Decimal('100.0')
                self.bpjs_deduction = self.base_salary * (bpjs_kes_rate + bpjs_tk_rate)
            else:
                self.bpjs_deduction = self.base_salary * Decimal('0.03') # Fallback
            
            # 3. Absence Penalty (500 per late minute)
            from django.db.models import Sum
            late_agg = self.employee.attendances.filter(
                date__month=self.period_month, 
                date__year=self.period_year
            ).aggregate(Sum('late_minutes'))
            total_late_minutes = late_agg['late_minutes__sum'] or 0
            self.absence_deduction = Decimal(str(total_late_minutes * 500))

            # 4. Loan deduction estimation
            loans = self.employee.loans.filter(is_paid_off=False)
            total_loan_deduction = Decimal('0')
            for loan in loans:
                total_loan_deduction += min(loan.installment_per_period, loan.remaining_amount)
            self.loan_deduction = total_loan_deduction

        total_deduction = self.tax_deduction + self.bpjs_deduction + self.absence_deduction + self.loan_deduction
        self.net_salary = (self.base_salary + self.total_allowance) - total_deduction
        super().save(*args, **kwargs)

        # Process actual loan repayment if paid
        if old_status == 'DRAFT' and self.status == 'PAID':
            loans = self.employee.loans.filter(is_paid_off=False)
            for loan in loans:
                deduction = min(loan.installment_per_period, loan.remaining_amount)
                if deduction > 0:
                    loan.remaining_amount -= deduction
                    if loan.remaining_amount <= 0:
                        loan.is_paid_off = True
                    loan.save()

    def __str__(self):
        return f"Payroll {self.employee.full_name} - {self.period_month}/{self.period_year}"
