from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from .models import ProductCategory, Product, Warehouse, StockBalance, StockMovement
from .serializers import (
    ProductCategorySerializer, ProductSerializer, WarehouseSerializer,
    StockBalanceSerializer, StockMovementSerializer
)

class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]

class StockBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for StockBalance.
    Balance can only be modified through StockMovement.
    """
    queryset = StockBalance.objects.all()
    serializer_class = StockBalanceSerializer
    permission_classes = [IsAuthenticated]

class StockMovementViewSet(mixins.CreateModelMixin,
                           mixins.ListModelMixin,
                           mixins.RetrieveModelMixin,
                           viewsets.GenericViewSet):
    """
    Stock movements can be created and read, but not updated or deleted to preserve audit trails.
    """
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]

from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from .models import StockLot

class InventoryDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        
        # Metrics
        total_products = Product.objects.count()
        total_warehouses = Warehouse.objects.count()
        active_lots = StockLot.objects.count()
        total_movements = StockMovement.objects.count()
        
        # Charts: Movement Trends (Last 7 Days)
        movement_trends = []
        for i in range(7, -1, -1):
            day = today - timedelta(days=i)
            move_in = StockMovement.objects.filter(date=day, movement_type='IN').count()
            move_out = StockMovement.objects.filter(date=day, movement_type='OUT').count()
            movement_trends.append({
                'date': day.strftime('%d %b'),
                'in': move_in,
                'out': move_out
            })
            
        # Charts: Product Category Distribution
        cat_dist = Product.objects.values('category__name').annotate(value=Count('id'))
        category_distribution = [{'name': d['category__name'], 'value': d['value']} for d in cat_dist if d['category__name']]
        
        # Recent Activity: Recent Stock Movements
        recent_movements_qs = StockMovement.objects.select_related('product', 'warehouse').order_by('-created_at')[:5]
        recent_activity = []
        for mov in recent_movements_qs:
            recent_activity.append({
                'id': mov.id,
                'reference_number': mov.reference_number,
                'product': mov.product.name,
                'warehouse': mov.warehouse.name,
                'type': mov.get_movement_type_display(),
                'quantity': float(mov.quantity)
            })
            
        return Response({
            'metrics': {
                'total_products': total_products,
                'total_warehouses': total_warehouses,
                'active_lots': active_lots,
                'total_movements': total_movements
            },
            'charts': {
                'movement_trends': movement_trends,
                'category_distribution': category_distribution
            },
            'recent_activity': recent_activity
        })
