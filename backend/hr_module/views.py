import datetime
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import (
    User, Department, Position, EmployeeProfile, 
    Attendance, LeaveRequest, LeaveBalance, SalaryComponent, Payroll, OfficeLocation
)
from .utils import haversine
from .serializers import (
    UserSerializer, DepartmentSerializer, 
    PositionSerializer, EmployeeProfileSerializer,
    AttendanceSerializer, LeaveRequestSerializer,
    SalaryComponentSerializer, PayrollSerializer
)

def get_or_create_employee_profile(user):
    if hasattr(user, 'employee_profile'):
        return user.employee_profile
    
    dept = Department.objects.filter(name__icontains='Management').first() or Department.objects.first()
    pos = Position.objects.filter(name__icontains='Superadmin').first() or Position.objects.filter(name__icontains='Admin').first() or Position.objects.first()
    
    uid = user.id or 1
    profile = EmployeeProfile.objects.create(
        user=user,
        full_name=user.get_full_name() or user.username or "Administrator",
        nik_ktp=f"3171000000{uid:06d}",
        place_of_birth="Jakarta",
        date_of_birth=datetime.date(1990, 1, 1),
        gender="L",
        religion="Islam",
        marital_status="SINGLE",
        address="Kantor Pusat ERP",
        employee_id=f"ADM-{uid:04d}",
        join_date=timezone.now().date(),
        employment_status="PERMANENT",
        department=dept,
        position=pos
    )
    return profile

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id).exclude(is_superuser=True)

class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer

    def get_queryset(self):
        return Department.objects.exclude(name__iexact='Management')

class PositionViewSet(viewsets.ModelViewSet):
    serializer_class = PositionSerializer

    def get_queryset(self):
        return Position.objects.exclude(name__iexact='Superadmin')

class EmployeeProfileViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeProfileSerializer

    def get_queryset(self):
        return EmployeeProfile.objects.exclude(user=self.request.user).exclude(user__is_superuser=True)

    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        profile = get_or_create_employee_profile(request.user)

        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        # Handling PATCH / PUT
        data = request.data.copy()
        
        # Keamanan: Buang field kritikal agar tidak bisa diubah user sendiri
        forbidden_fields = ['employee_id', 'join_date', 'department', 'position', 'employment_status', 'user']
        for field in forbidden_fields:
            data.pop(field, None)

        serializer = self.get_serializer(profile, data=data, partial=(request.method == 'PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    parser_classes = [MultiPartParser, FormParser]

    def _validate_geofence(self, lat, lon):
        try:
            office = OfficeLocation.objects.first()
            if not office:
                return True, "" # No office defined, skip geofencing
            
            distance = haversine(float(lat), float(lon), float(office.latitude), float(office.longitude))
            if distance > office.radius_meters:
                return False, f"Anda berada di luar area kantor. Jarak: {int(distance)}m (Maks: {office.radius_meters}m)"
            return True, ""
        except Exception as e:
            return False, "Format koordinat tidak valid"

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        employee = get_or_create_employee_profile(request.user)
        today = timezone.now().date()
        
        if Attendance.objects.filter(employee=employee, date=today).exists():
            return Response({'error': 'Anda sudah melakukan check-in hari ini'}, status=status.HTTP_400_BAD_REQUEST)

        lat = request.data.get('latitude')
        lon = request.data.get('longitude')
        photo = request.data.get('photo')

        if not (lat and lon and photo):
            return Response({'error': 'Lokasi dan foto wajib disertakan'}, status=status.HTTP_400_BAD_REQUEST)

        is_valid, error_msg = self._validate_geofence(lat, lon)
        if not is_valid:
            return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

        is_late = False
        late_minutes = 0
        if employee.shift:
            now_time = timezone.now().time()
            shift_start = employee.shift.start_time
            tolerance = employee.shift.late_tolerance_minutes
            
            dt_now = datetime.datetime.combine(today, now_time)
            dt_start = datetime.datetime.combine(today, shift_start)
            
            diff = (dt_now - dt_start).total_seconds() / 60
            if diff > tolerance:
                is_late = True
                late_minutes = int(diff)

        attendance = Attendance.objects.create(
            employee=employee,
            check_in_lat=lat,
            check_in_long=lon,
            check_in_photo=photo,
            is_late=is_late,
            late_minutes=late_minutes
        )
        serializer = self.get_serializer(attendance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def check_out(self, request):
        employee = get_or_create_employee_profile(request.user)
        today = timezone.now().date()
        
        attendance = Attendance.objects.filter(employee=employee, date=today).first()
        if not attendance:
            return Response({'error': 'Anda belum check-in hari ini'}, status=status.HTTP_400_BAD_REQUEST)
        
        if attendance.check_out:
            return Response({'error': 'Anda sudah melakukan check-out hari ini'}, status=status.HTTP_400_BAD_REQUEST)

        lat = request.data.get('latitude')
        lon = request.data.get('longitude')
        photo = request.data.get('photo')

        if not (lat and lon and photo):
            return Response({'error': 'Lokasi dan foto wajib disertakan'}, status=status.HTTP_400_BAD_REQUEST)

        is_valid, error_msg = self._validate_geofence(lat, lon)
        if not is_valid:
            return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

        attendance.check_out = timezone.now()
        attendance.check_out_lat = lat
        attendance.check_out_long = lon
        attendance.check_out_photo = photo
        attendance.save()

        serializer = self.get_serializer(attendance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def today_status(self, request):
        employee = get_or_create_employee_profile(request.user)
        today = timezone.now().date()
        attendance = Attendance.objects.filter(employee=employee, date=today).first()
        
        if not attendance:
            return Response({'status': 'NOT_CHECKED_IN'})
        elif attendance.check_out:
            return Response({'status': 'CHECKED_OUT'})
        else:
            return Response({'status': 'CHECKED_IN'})

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer

    def create(self, request, *args, **kwargs):
        employee = get_or_create_employee_profile(request.user)
        data = request.data.copy()
        data['employee'] = employee.id

        start_date = data.get('start_date')
        end_date = data.get('end_date')
        leave_type = data.get('leave_type')
        
        if not (start_date and end_date and leave_type):
            return Response({'error': 'Data tidak lengkap'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Format tanggal salah (Y-M-D)'}, status=status.HTTP_400_BAD_REQUEST)

        duration = (end - start).days + 1

        if duration <= 0:
            return Response({'error': 'Tanggal selesai harus setelah tanggal mulai'}, status=status.HTTP_400_BAD_REQUEST)

        if leave_type == 'ANNUAL':
            year = start.year
            balance = LeaveBalance.objects.filter(employee=employee, year=year).first()
            if not balance:
                return Response({'error': f'Saldo cuti tahun {year} belum diatur'}, status=status.HTTP_400_BAD_REQUEST)
            if balance.remaining < duration:
                return Response({'error': f'Saldo cuti tidak mencukupi. Sisa: {balance.remaining}, Diajukan: {duration}'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def approve_spv(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != 'PENDING_SPV':
            return Response({'error': 'Status tidak valid untuk persetujuan supervisor'}, status=status.HTTP_400_BAD_REQUEST)
        
        leave_request.status = 'PENDING_MANAGER'
        leave_request.approved_by_spv = request.user
        leave_request.save()
        return Response({'message': 'Disetujui oleh Supervisor, menunggu Manager'})

    @action(detail=True, methods=['post'])
    def approve_manager(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != 'PENDING_MANAGER':
            return Response({'error': 'Status tidak valid untuk persetujuan atasan'}, status=status.HTTP_400_BAD_REQUEST)
        
        leave_request.status = 'PENDING_HR'
        leave_request.approved_by_manager = request.user
        leave_request.save()
        return Response({'message': 'Disetujui oleh Atasan, menunggu HR'})

    @action(detail=True, methods=['post'])
    def approve_hr(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != 'PENDING_HR':
            return Response({'error': 'Status tidak valid untuk persetujuan HR'}, status=status.HTTP_400_BAD_REQUEST)
        
        if leave_request.leave_type == 'ANNUAL':
            duration = (leave_request.end_date - leave_request.start_date).days + 1
            year = leave_request.start_date.year
            balance = LeaveBalance.objects.filter(employee=leave_request.employee, year=year).first()
            if balance:
                balance.used += duration
                balance.save()

        leave_request.status = 'APPROVED'
        leave_request.approved_by_hr = request.user
        leave_request.save()
        return Response({'message': 'Disetujui oleh HR, cuti aktif'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status in ['APPROVED', 'REJECTED']:
            return Response({'error': 'Cuti sudah diproses'}, status=status.HTTP_400_BAD_REQUEST)
        leave_request.status = 'REJECTED'
        leave_request.save()
        return Response({'message': 'Cuti ditolak'})

class SalaryComponentViewSet(viewsets.ModelViewSet):
    queryset = SalaryComponent.objects.all()
    serializer_class = SalaryComponentSerializer

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer

    @action(detail=False, methods=['post'])
    def generate_bulk(self, request):
        period_month = request.data.get('period_month')
        period_year = request.data.get('period_year')

        if not period_month or not period_year:
            return Response({'error': 'period_month and period_year are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Import celery task
        from .tasks import generate_bulk_payroll
        
        # Call celery task asynchronously
        task = generate_bulk_payroll.delay(period_month, period_year)
        
        return Response({
            'message': 'Payroll generation started',
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['get'], url_path='task_status/(?P<task_id>[^/.]+)')
    def task_status(self, request, task_id=None):
        from celery.result import AsyncResult
        
        task_result = AsyncResult(task_id)
        
        response_data = {
            'task_id': task_id,
            'state': task_result.state,
        }

        if task_result.state == 'PROGRESS':
            response_data.update(task_result.info) # contains current, total, percent, success, failed
        elif task_result.state == 'SUCCESS':
            response_data.update(task_result.result)
        elif task_result.state == 'FAILURE':
            response_data['error'] = str(task_result.info)
            
        return Response(response_data)

from rest_framework.views import APIView
from django.db.models import Count

class HRDashboardStatsView(APIView):
    def get(self, request):
        today = timezone.now().date()
        
        total_employees = EmployeeProfile.objects.count()
        present_today = Attendance.objects.filter(date=today).count()
        pending_leaves = LeaveRequest.objects.filter(status__in=['PENDING_SPV', 'PENDING_MANAGER', 'PENDING_HR']).count()
        
        return Response({
            'total_employees': total_employees,
            'present_today': present_today,
            'pending_leaves': pending_leaves
        })
