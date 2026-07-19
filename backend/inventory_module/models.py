from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

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
    unit_of_measure = models.CharField(max_length=50) # e.g. PCS, KG, BOX
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inv_product'

    def __str__(self):
        return f"{self.code} - {self.name}"

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
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inv_stock_balance'
        unique_together = ('product', 'warehouse')

    def __str__(self):
        return f"{self.product.name} @ {self.warehouse.name}: {self.quantity}"

class StockMovement(models.Model):
    MOVEMENT_TYPES = (
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
        ('TRANSFER', 'Transfer'),
        ('ADJUSTMENT', 'Adjustment'),
    )

    reference_number = models.CharField(max_length=100, unique=True)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='movements')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.DecimalField(max_digits=12, decimal_places=2) # Always positive in input, but logic handles it
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inv_stock_movement'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.reference_number} - {self.movement_type} {self.quantity} of {self.product.name}"

@receiver(post_save, sender=StockMovement)
def update_stock_balance(sender, instance, created, **kwargs):
    if created:
        # Get or create balance record
        balance, _ = StockBalance.objects.get_or_create(
            product=instance.product,
            warehouse=instance.warehouse,
            defaults={'quantity': 0}
        )
        
        # Calculate new quantity based on movement type
        if instance.movement_type in ['IN', 'ADJUSTMENT']:
            # For adjustment, we could treat it as absolute new value, but typically it's an additive/subtractive adjustment.
            # Assuming 'quantity' can be negative for negative adjustments, or we just add the quantity.
            # Wait, if ADJUSTMENT can decrease, it might be better to let user input negative quantity for adjustment.
            # IN is always positive addition.
            balance.quantity += instance.quantity
        elif instance.movement_type in ['OUT', 'TRANSFER']:
            # OUT and TRANSFER reduce the stock in the source warehouse
            balance.quantity -= instance.quantity
            
        balance.save()
