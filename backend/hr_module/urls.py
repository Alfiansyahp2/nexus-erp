from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, DepartmentViewSet, PositionViewSet, 
    EmployeeProfileViewSet, AttendanceViewSet, LeaveRequestViewSet,
    SalaryComponentViewSet, PayrollViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'employees', EmployeeProfileViewSet)
router.register(r'attendances', AttendanceViewSet)
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'salary-components', SalaryComponentViewSet)
router.register(r'payrolls', PayrollViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
