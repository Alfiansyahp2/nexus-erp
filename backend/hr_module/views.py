from rest_framework import viewsets
from .models import (
    User, Department, Position, EmployeeProfile, 
    Attendance, LeaveRequest, SalaryComponent, Payroll
)
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

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer

class SalaryComponentViewSet(viewsets.ModelViewSet):
    queryset = SalaryComponent.objects.all()
    serializer_class = SalaryComponentSerializer

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
