import datetime
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import (
    User, Department, Position, EmployeeProfile, 
    Attendance, LeaveRequest, SalaryComponent, Payroll, OfficeLocation
)
from .utils import haversine
from .serializers import (
    UserSerializer, DepartmentSerializer, 
    PositionSerializer, EmployeeProfileSerializer,
    AttendanceSerializer, LeaveRequestSerializer,
    SalaryComponentSerializer, PayrollSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

class EmployeeProfileViewSet(viewsets.ModelViewSet):
    queryset = EmployeeProfile.objects.all()
    serializer_class = EmployeeProfileSerializer

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
        user = request.user
        if not hasattr(user, 'employee_profile'):
            return Response({'error': 'Pengguna tidak memiliki profil pegawai'}, status=status.HTTP_400_BAD_REQUEST)
        
        employee = user.employee_profile
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

        attendance = Attendance.objects.create(
            employee=employee,
            check_in_lat=lat,
            check_in_long=lon,
            check_in_photo=photo
        )
        serializer = self.get_serializer(attendance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def check_out(self, request):
        user = request.user
        if not hasattr(user, 'employee_profile'):
            return Response({'error': 'Pengguna tidak memiliki profil pegawai'}, status=status.HTTP_400_BAD_REQUEST)
        
        employee = user.employee_profile
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
        user = request.user
        if not hasattr(user, 'employee_profile'):
            return Response({'status': 'NO_PROFILE'})
        
        employee = user.employee_profile
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

class SalaryComponentViewSet(viewsets.ModelViewSet):
    queryset = SalaryComponent.objects.all()
    serializer_class = SalaryComponentSerializer

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
