import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from inventory_module.models import ProductCategory, Warehouse, Product, StockMovement

class Command(BaseCommand):
    help = 'Seeding data dummy untuk modul Inventory (Kategori, Gudang, Produk, Mutasi)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Memulai proses seeding data inventory...'))

        # 1. Seed Categories
        categories_data = [
            {'name': 'Elektronik', 'description': 'Barang-barang elektronik dan gadget'},
            {'name': 'Pakaian', 'description': 'Pakaian pria, wanita, dan anak-anak'},
            {'name': 'Bahan Pokok', 'description': 'Sembako dan kebutuhan dapur sehari-hari'},
            {'name': 'Alat Tulis Kantor', 'description': 'Perlengkapan ATK untuk perusahaan'}
        ]
        
        categories = {}
        for cat_data in categories_data:
            cat, created = ProductCategory.objects.get_or_create(
                name=cat_data['name'], 
                defaults={'description': cat_data['description']}
            )
            categories[cat.name] = cat
        self.stdout.write(self.style.SUCCESS('Kategori berhasil dibuat.'))

        # 2. Seed Warehouses
        warehouses_data = [
            {'code': 'WH-JKT', 'name': 'Gudang Pusat Jakarta', 'location': 'Jakarta Selatan', 'address': 'Jl. Jend. Sudirman Kav 1'},
            {'code': 'WH-SBY', 'name': 'Gudang Cabang Surabaya', 'location': 'Surabaya', 'address': 'Jl. Pahlawan No 10'},
            {'code': 'WH-BDG', 'name': 'Gudang Transit Bandung', 'location': 'Bandung', 'address': 'Jl. Asia Afrika No 5'}
        ]
        
        warehouses = []
        for wh_data in warehouses_data:
            wh, created = Warehouse.objects.get_or_create(
                code=wh_data['code'],
                defaults=wh_data
            )
            warehouses.append(wh)
        self.stdout.write(self.style.SUCCESS('Gudang berhasil dibuat.'))

        # 3. Seed Products
        products_data = [
            {'code': 'PRD-EL-001', 'name': 'Laptop ThinkPad X1', 'category': categories['Elektronik'], 'sku': 'TP-X1-2023', 'unit_of_measure': 'PCS', 'cost_price': 15000000, 'unit_price': 18000000},
            {'code': 'PRD-EL-002', 'name': 'Mouse Wireless Logitech', 'category': categories['Elektronik'], 'sku': 'LOGI-M170', 'unit_of_measure': 'PCS', 'cost_price': 100000, 'unit_price': 150000},
            {'code': 'PRD-CL-001', 'name': 'Kemeja Polos Pria', 'category': categories['Pakaian'], 'sku': 'KMJ-PLS-L', 'unit_of_measure': 'PCS', 'cost_price': 50000, 'unit_price': 100000},
            {'code': 'PRD-BP-001', 'name': 'Beras Premium 5KG', 'category': categories['Bahan Pokok'], 'sku': 'BRS-PRM-5', 'unit_of_measure': 'SAK', 'cost_price': 60000, 'unit_price': 75000},
            {'code': 'PRD-AT-001', 'name': 'Kertas HVS A4 80gr', 'category': categories['Alat Tulis Kantor'], 'sku': 'HVS-A4-80', 'unit_of_measure': 'RIM', 'cost_price': 40000, 'unit_price': 55000},
        ]
        
        products = []
        for prod_data in products_data:
            prod, created = Product.objects.get_or_create(
                code=prod_data['code'],
                defaults=prod_data
            )
            products.append(prod)
        self.stdout.write(self.style.SUCCESS('Produk berhasil dibuat.'))

        # 4. Seed Stock Movements (Dummy Transactions)
        # Hapus mutasi lama (agar tidak duplicate referensi saat run ulang)
        StockMovement.objects.all().delete()
        
        today = datetime.now().date()
        
        # Buat transaksi IN awal untuk mengisi stok
        for i, prod in enumerate(products):
            # Barang masuk ke Gudang Pusat
            StockMovement.objects.create(
                reference_number=f'IN-{today.strftime("%Y%m%d")}-{(i+1):03d}',
                product=prod,
                warehouse=warehouses[0], # Gudang Pusat
                movement_type='IN',
                quantity=random.randint(100, 500),
                date=today - timedelta(days=5),
                notes='Stok awal dari supplier'
            )
            
            # Simulasi transfer ke Gudang Cabang (jika i genap)
            if i % 2 == 0:
                StockMovement.objects.create(
                    reference_number=f'TRF-{today.strftime("%Y%m%d")}-{(i+1):03d}',
                    product=prod,
                    warehouse=warehouses[0], # Dari Gudang Pusat
                    movement_type='TRANSFER',
                    quantity=50,
                    date=today - timedelta(days=3),
                    notes='Kirim ke Surabaya'
                )
                StockMovement.objects.create(
                    reference_number=f'RCV-{today.strftime("%Y%m%d")}-{(i+1):03d}',
                    product=prod,
                    warehouse=warehouses[1], # Masuk Gudang Cabang
                    movement_type='IN',
                    quantity=50,
                    date=today - timedelta(days=2),
                    notes='Terima dari Gudang Pusat'
                )
                
            # Simulasi penjualan (OUT)
            StockMovement.objects.create(
                reference_number=f'OUT-{today.strftime("%Y%m%d")}-{(i+1):03d}',
                product=prod,
                warehouse=warehouses[0],
                movement_type='OUT',
                quantity=random.randint(5, 20),
                date=today - timedelta(days=1),
                notes='Penjualan ke kustomer'
            )

        self.stdout.write(self.style.SUCCESS('Riwayat Mutasi (IN, OUT, TRANSFER) dan Saldo Stok berhasil di-generate.'))
        self.stdout.write(self.style.SUCCESS('\nSeeding Inventory Selesai! Buka halaman Stock Balances di aplikasi untuk melihat hasilnya.'))
