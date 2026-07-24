import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from inventory_module.models import (
    UOMCategory, UOM, ProductCategory, Product, Warehouse, StockLot, StockMovement
)

class Command(BaseCommand):
    help = 'Seeds initial inventory data (UOM, Categories, Products, and Initial Stock)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Mulai melakukan seeding data Inventory...")

        # 1. UOM Categories
        uom_unit, _ = UOMCategory.objects.get_or_create(name="Unit/Satuan")
        uom_weight, _ = UOMCategory.objects.get_or_create(name="Berat")
        uom_vol, _ = UOMCategory.objects.get_or_create(name="Volume")

        # 2. UOMs
        uom_pcs, _ = UOM.objects.get_or_create(category=uom_unit, name="Pcs", defaults={'ratio': 1.0})
        uom_box, _ = UOM.objects.get_or_create(category=uom_unit, name="Box (12 Pcs)", defaults={'ratio': 12.0})
        uom_kg, _ = UOM.objects.get_or_create(category=uom_weight, name="Kg", defaults={'ratio': 1.0})
        uom_g, _ = UOM.objects.get_or_create(category=uom_weight, name="Gram", defaults={'ratio': 0.001})
        uom_l, _ = UOM.objects.get_or_create(category=uom_vol, name="Liter", defaults={'ratio': 1.0})

        # 3. Product Categories
        cat_food, _ = ProductCategory.objects.get_or_create(name="Makanan/Minuman")
        cat_elec, _ = ProductCategory.objects.get_or_create(name="Elektronik")

        # 4. Products
        prod_indomie, _ = Product.objects.get_or_create(
            code="PRD-001",
            defaults={
                'name': "Mie Instan Goreng",
                'category': cat_food,
                'sku': "MIE-GOR-001",
                'base_uom': uom_pcs,
                'purchase_uom': uom_box,
                'unit_price': 3500,
                'cost_price': 3000
            }
        )

        prod_laptop, _ = Product.objects.get_or_create(
            code="PRD-002",
            defaults={
                'name': "Laptop Pro 15 inch",
                'category': cat_elec,
                'sku': "LPT-PRO-15",
                'base_uom': uom_pcs,
                'purchase_uom': uom_pcs,
                'unit_price': 15000000,
                'cost_price': 12000000
            }
        )

        # 5. Warehouse
        wh_main, _ = Warehouse.objects.get_or_create(
            code="WH-JKT",
            defaults={
                'name': "Gudang Utama Jakarta",
                'location': "Jakarta Pusat"
            }
        )

        # 6. Stock Lot (Batch)
        lot_a, _ = StockLot.objects.get_or_create(
            product=prod_indomie,
            lot_number="BATCH-2026-A",
            defaults={
                'manufacturing_date': datetime.date(2026, 1, 1),
                'expiry_date': datetime.date(2027, 1, 1)
            }
        )
        lot_b, _ = StockLot.objects.get_or_create(
            product=prod_indomie,
            lot_number="BATCH-2026-B",
            defaults={
                'manufacturing_date': datetime.date(2026, 2, 1),
                'expiry_date': datetime.date(2027, 2, 1)
            }
        )

        # 7. Initial Stock Movements (Simulasi Barang Masuk & Layer FIFO)
        if not StockMovement.objects.filter(reference_number="IN-001").exists():
            StockMovement.objects.create(
                reference_number="IN-001",
                product=prod_indomie,
                warehouse=wh_main,
                lot=lot_a,
                movement_type="IN",
                quantity=100,
                unit_cost=2800, # Beli pertama lebih murah
                date=datetime.date(2026, 7, 1)
            )
        
        if not StockMovement.objects.filter(reference_number="IN-002").exists():
            StockMovement.objects.create(
                reference_number="IN-002",
                product=prod_indomie,
                warehouse=wh_main,
                lot=lot_b,
                movement_type="IN",
                quantity=200,
                unit_cost=3000, # Beli kedua harga naik
                date=datetime.date(2026, 7, 15)
            )

        if not StockMovement.objects.filter(reference_number="IN-003").exists():
            StockMovement.objects.create(
                reference_number="IN-003",
                product=prod_laptop,
                warehouse=wh_main,
                movement_type="IN",
                quantity=10,
                unit_cost=12000000,
                date=datetime.date(2026, 7, 10)
            )

        self.stdout.write(self.style.SUCCESS("Seeding Inventory berhasil!"))
        self.stdout.write("\nSimulasi Stock Layers (FIFO) telah dibuat:")
        self.stdout.write(f"- 100 Pcs Mie Instan (Batch A) @ Rp 2.800")
        self.stdout.write(f"- 200 Pcs Mie Instan (Batch B) @ Rp 3.000")
