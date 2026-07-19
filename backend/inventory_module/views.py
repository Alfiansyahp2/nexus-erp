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
