from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from hr_module.models import EmployeeProfile, Attendance, LeaveRequest
from finance_module.models import Invoice, Account, FixedAsset
from inventory_module.models import Product, StockMovement
from purchasing_module.models import PurchaseOrder
from sales_module.models import SalesOrder

from django.utils import timezone
from datetime import timedelta
from django.db.models import Count

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        last_week = today - timedelta(days=7)
        last_month = today - timedelta(days=30)
        two_months_ago = today - timedelta(days=60)

        # Basic Totals
        total_employees = EmployeeProfile.objects.count()
        total_invoices = Invoice.objects.count()
        total_products = Product.objects.count()
        total_sales_orders = SalesOrder.objects.count()
        total_purchase_orders = PurchaseOrder.objects.count()

        # Trends (Growth over last 30 days compared to previous 30 days)
        so_this_month = SalesOrder.objects.filter(order_date__gte=last_month).count()
        so_last_month = SalesOrder.objects.filter(order_date__gte=two_months_ago, order_date__lt=last_month).count()
        so_growth = round(((so_this_month - so_last_month) / (so_last_month or 1)) * 100, 1)

        po_this_month = PurchaseOrder.objects.filter(order_date__gte=last_month).count()
        po_last_month = PurchaseOrder.objects.filter(order_date__gte=two_months_ago, order_date__lt=last_month).count()
        po_growth = round(((po_this_month - po_last_month) / (po_last_month or 1)) * 100, 1)

        # Chart Data: Order Trends (Last 7 Days)
        order_trends = []
        for i in range(7, -1, -1):
            day = today - timedelta(days=i)
            sales = SalesOrder.objects.filter(order_date=day).count()
            purchases = PurchaseOrder.objects.filter(order_date=day).count()
            order_trends.append({
                'date': day.strftime('%d %b'),
                'sales': sales,
                'purchases': purchases
            })

        # Chart Data: Department Distribution
        dept_dist = EmployeeProfile.objects.values('department__name').annotate(value=Count('id')).filter(department__isnull=False)
        department_distribution = [{'name': d['department__name'], 'value': d['value']} for d in dept_dist]

        # Recent Activity Table Data
        recent_sales = SalesOrder.objects.select_related('customer').order_by('-created_at')[:5]
        recent_activity = []
        for so in recent_sales:
            recent_activity.append({
                'id': so.id,
                'document_number': so.document_number,
                'customer': so.customer.name if so.customer else 'Unknown',
                'status': so.status,
                'date': so.order_date.strftime('%Y-%m-%d')
            })

        return Response({
            'metrics': {
                'total_employees': total_employees,
                'total_products': total_products,
                'sales_orders': { 'value': total_sales_orders, 'trend': so_growth },
                'purchase_orders': { 'value': total_purchase_orders, 'trend': po_growth },
            },
            'charts': {
                'order_trends': order_trends,
                'department_distribution': department_distribution
            },
            'recent_activity': recent_activity
        })
