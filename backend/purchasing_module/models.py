from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from hr_module.models import Department, EmployeeProfile
from inventory_module.models import Product, UOM, Warehouse, StockLot
from finance_module.models import BusinessPartner

class Vendor(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    npwp = models.CharField(max_length=30, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)
    bank_account_name = models.CharField(max_length=100, blank=True, null=True)
    payment_terms_days = models.IntegerField(default=30)
    is_active = models.BooleanField(default=True)
    business_partner = models.OneToOneField(
        BusinessPartner, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='vendor_profile'
    )

    class Meta:
        db_table = 'pur_vendor'
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"

@receiver(post_save, sender=Vendor)
def sync_vendor_to_business_partner(sender, instance, created, **kwargs):
    if not instance.business_partner:
        partner = BusinessPartner.objects.filter(name__iexact=instance.name).first()
        if not partner:
            partner = BusinessPartner.objects.create(
                name=instance.name,
                partner_type='VENDOR',
                email=instance.email,
                phone=instance.phone,
                address=instance.address
            )
        else:
            if partner.partner_type == 'CUSTOMER':
                partner.partner_type = 'BOTH'
                partner.save()
        Vendor.objects.filter(pk=instance.pk).update(business_partner=partner)
    else:
        partner = instance.business_partner
        partner.name = instance.name
        partner.email = instance.email
        partner.phone = instance.phone
        partner.address = instance.address
        partner.save()


class PurchaseRequest(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('PO_CREATED', 'PO Created'),
    )

    document_number = models.CharField(max_length=100, unique=True)
    request_date = models.DateField()
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    requested_by = models.ForeignKey(EmployeeProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    expected_delivery_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pur_purchase_request'
        ordering = ['-request_date', '-created_at']

    def __str__(self):
        return self.document_number


class PurchaseRequestLine(models.Model):
    purchase_request = models.ForeignKey(PurchaseRequest, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=1)
    uom = models.ForeignKey(UOM, on_delete=models.PROTECT, null=True, blank=True)
    estimated_unit_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    notes = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'pur_purchase_request_line'

    def save(self, *args, **kwargs):
        if not self.uom and self.product:
            self.uom = self.product.purchase_uom or self.product.base_uom
        if not self.estimated_unit_cost and self.product:
            self.estimated_unit_cost = self.product.cost_price
        super().save(*args, **kwargs)


class PurchaseOrder(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent to Vendor'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed (Received)'),
        ('CANCELLED', 'Cancelled'),
    )

    document_number = models.CharField(max_length=100, unique=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name='purchase_orders')
    order_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    purchase_request = models.ForeignKey(PurchaseRequest, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_orders')
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pur_purchase_order'
        ordering = ['-order_date', '-created_at']

    def __str__(self):
        return f"{self.document_number} - {self.vendor.name}"


class PurchaseOrderLine(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=1)
    received_qty = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    uom = models.ForeignKey(UOM, on_delete=models.PROTECT, null=True, blank=True)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    class Meta:
        db_table = 'pur_purchase_order_line'

    def save(self, *args, **kwargs):
        if not self.uom and self.product:
            self.uom = self.product.purchase_uom or self.product.base_uom
        self.subtotal = Decimal(str(self.quantity)) * Decimal(str(self.unit_price))
        super().save(*args, **kwargs)


class GoodsReceipt(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('DONE', 'Done (Received)'),
        ('CANCELLED', 'Cancelled'),
    )

    document_number = models.CharField(max_length=100, unique=True)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.PROTECT, related_name='goods_receipts')
    receipt_date = models.DateField()
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT)
    delivery_note_number = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    received_by = models.ForeignKey(EmployeeProfile, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pur_goods_receipt'
        ordering = ['-receipt_date', '-created_at']

    def __str__(self):
        return f"{self.document_number} (PO: {self.purchase_order.document_number})"


class GoodsReceiptLine(models.Model):
    goods_receipt = models.ForeignKey(GoodsReceipt, on_delete=models.CASCADE, related_name='lines')
    po_line = models.ForeignKey(PurchaseOrderLine, on_delete=models.PROTECT, related_name='receipt_lines')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    uom = models.ForeignKey(UOM, on_delete=models.PROTECT, null=True, blank=True)
    lot_number = models.CharField(max_length=100, blank=True, null=True)
    expiry_date = models.DateField(null=True, blank=True)
    notes = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'pur_goods_receipt_line'

    def save(self, *args, **kwargs):
        if not self.uom and self.product:
            self.uom = self.product.purchase_uom or self.product.base_uom
        super().save(*args, **kwargs)
