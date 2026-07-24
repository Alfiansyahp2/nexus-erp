from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal

class UOMCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'inv_uom_category'

    def __str__(self):
        return self.name

class UOM(models.Model):
    category = models.ForeignKey(UOMCategory, on_delete=models.CASCADE, related_name='uoms')
    name = models.CharField(max_length=50)
    ratio = models.DecimalField(max_digits=12, decimal_places=4, default=1.0)

    class Meta:
        db_table = 'inv_uom'

    def __str__(self):
        return self.name

class ProductCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'inv_category'

    def __str__(self):
        return self.name

class Product(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(ProductCategory, on_delete=models.PROTECT, related_name='products')
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    
    # Advanced UOM system
    base_uom = models.ForeignKey(UOM, on_delete=models.SET_NULL, null=True, related_name='base_products')
    purchase_uom = models.ForeignKey(UOM, on_delete=models.SET_NULL, null=True, related_name='purchase_products')
    
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inv_product'

    def __str__(self):
        return f"{self.code} - {self.name}"

class StockLot(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='lots')
    lot_number = models.CharField(max_length=100)
    manufacturing_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'inv_stock_lot'
        unique_together = ('product', 'lot_number')

    def __str__(self):
        return f"{self.lot_number} ({self.product.name})"

class Warehouse(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inv_warehouse'

    def __str__(self):
        return f"{self.code} - {self.name}"

class StockBalance(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_balances')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stock_balances')
    lot = models.ForeignKey(StockLot, on_delete=models.SET_NULL, null=True, blank=True, related_name='stock_balances')
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inv_stock_balance'
        unique_together = ('product', 'warehouse', 'lot')

    def __str__(self):
        lot_str = f" [Lot: {self.lot.lot_number}]" if self.lot else ""
        return f"{self.product.name} @ {self.warehouse.name}{lot_str}: {self.quantity}"

class StockValuationLayer(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    lot = models.ForeignKey(StockLot, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    remaining_qty = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inv_stock_valuation_layer'
        ordering = ['created_at']

    def __str__(self):
        return f"Layer {self.product.name} - Qty: {self.remaining_qty}/{self.quantity} @ {self.unit_cost}"

class StockAdjustment(models.Model):
    reference_number = models.CharField(max_length=100, unique=True)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=20, choices=[('DRAFT', 'Draft'), ('DONE', 'Done')], default='DRAFT')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inv_stock_adjustment'

    def __str__(self):
        return self.reference_number

class StockAdjustmentLine(models.Model):
    adjustment = models.ForeignKey(StockAdjustment, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    lot = models.ForeignKey(StockLot, on_delete=models.SET_NULL, null=True, blank=True)
    theoretical_qty = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    real_qty = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'inv_stock_adjustment_line'

    @property
    def difference(self):
        return self.real_qty - self.theoretical_qty

class StockMovement(models.Model):
    MOVEMENT_TYPES = (
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
        ('TRANSFER', 'Transfer'),
        ('ADJUSTMENT', 'Adjustment'),
    )

    reference_number = models.CharField(max_length=100)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='movements')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name='movements')
    lot = models.ForeignKey(StockLot, on_delete=models.SET_NULL, null=True, blank=True)
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.DecimalField(max_digits=12, decimal_places=2) # Absolute quantity
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0) # For IN movements
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inv_stock_movement'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.reference_number} - {self.movement_type} {self.quantity} of {self.product.name}"

@receiver(post_save, sender=StockMovement)
def handle_stock_movement(sender, instance, created, **kwargs):
    if created:
        # 1. Update Stock Balance
        balance, _ = StockBalance.objects.get_or_create(
            product=instance.product,
            warehouse=instance.warehouse,
            lot=instance.lot,
            defaults={'quantity': 0}
        )
        
        if instance.movement_type in ['IN', 'ADJUSTMENT']:
            # Assume ADJUSTMENT IN is positive, OUT is handled by negative? 
            # If quantity is always positive in DB, we need to know direction for ADJUSTMENT.
            # Let's say ADJUSTMENT with positive quantity adds, negative quantity reduces.
            balance.quantity += instance.quantity
        elif instance.movement_type in ['OUT', 'TRANSFER']:
            balance.quantity -= instance.quantity
            
        balance.save()

        # 2. Handle FIFO Valuation Layers
        if instance.movement_type == 'IN':
            StockValuationLayer.objects.create(
                product=instance.product,
                warehouse=instance.warehouse,
                lot=instance.lot,
                quantity=instance.quantity,
                unit_cost=instance.unit_cost,
                remaining_qty=instance.quantity
            )
        elif instance.movement_type in ['OUT', 'TRANSFER']:
            # FIFO deduction
            qty_to_deduct = instance.quantity
            layers = StockValuationLayer.objects.filter(
                product=instance.product, 
                warehouse=instance.warehouse,
                remaining_qty__gt=0
            ).order_by('created_at')

            for layer in layers:
                if qty_to_deduct <= 0:
                    break
                if layer.remaining_qty >= qty_to_deduct:
                    layer.remaining_qty -= qty_to_deduct
                    layer.save()
                    qty_to_deduct = 0
                else:
                    qty_to_deduct -= layer.remaining_qty
                    layer.remaining_qty = 0
                    layer.save()
