from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from hr_module.models import EmployeeProfile, Attendance, LeaveRequest
from finance_module.models import Invoice, Account, FixedAsset
from inventory_module.models import Product, StockMovement
from purchasing_module.models import PurchaseOrder
from sales_module.models import SalesOrder

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_employees = EmployeeProfile.objects.count()
        total_invoices = Invoice.objects.count()
        total_products = Product.objects.count()
        total_sales_orders = SalesOrder.objects.count()
        total_purchase_orders = PurchaseOrder.objects.count()

        return Response({
            'total_employees': total_employees,
            'total_invoices': total_invoices,
            'total_products': total_products,
            'total_sales_orders': total_sales_orders,
            'total_purchase_orders': total_purchase_orders
        })
