from django.db import models

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
