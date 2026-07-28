from django.db import models
from finance_module.models import BusinessPartner
from inventory_module.models import Product, Warehouse

class Customer(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    npwp = models.CharField(max_length=50, blank=True, null=True)
    
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    payment_terms_days = models.IntegerField(default=30)
    
    is_active = models.BooleanField(default=True)
    business_partner = models.OneToOneField(BusinessPartner, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sales_customer'
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}"

class SalesOrder(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent/Quoted'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed (Shipped)'),
        ('CANCELLED', 'Cancelled')
    )
    
    document_number = models.CharField(max_length=100, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='sales_orders')
    order_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sales_order'
        ordering = ['-order_date', '-id']

    def __str__(self):
        return self.document_number

class SalesOrderLine(models.Model):
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    uom = models.CharField(max_length=20, blank=True, null=True)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    shipped_qty = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'sales_order_line'

    def save(self, *args, **kwargs):
        self.subtotal = self.quantity * self.unit_price
        super().save(*args, **kwargs)

class DeliveryOrder(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('DONE', 'Done (Shipped)'),
        ('CANCELLED', 'Cancelled')
    )
    
    document_number = models.CharField(max_length=100, unique=True)
    sales_order = models.ForeignKey(SalesOrder, on_delete=models.PROTECT, related_name='deliveries')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT)
    shipment_date = models.DateField()
    courier_tracking = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    notes = models.TextField(blank=True, null=True)
    
    created_by_name = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sales_delivery_order'
        ordering = ['-shipment_date', '-id']

    def __str__(self):
        return self.document_number

class DeliveryOrderLine(models.Model):
    delivery_order = models.ForeignKey(DeliveryOrder, on_delete=models.CASCADE, related_name='lines')
    so_line = models.ForeignKey(SalesOrderLine, on_delete=models.PROTECT)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    lot_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        db_table = 'sales_delivery_order_line'
