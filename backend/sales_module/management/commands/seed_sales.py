from django.core.management.base import BaseCommand
import datetime
from django.utils import timezone
from sales_module.models import Customer, SalesOrder, SalesOrderLine, DeliveryOrder, DeliveryOrderLine
from inventory_module.models import Product, Warehouse
from finance_module.models import BusinessPartner
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds data for Sales Module (Customers, SO, DO)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("=== MEMULAI SEEDING SALES ==="))
        
        # 1. FIXED DATA: Customers
        self.stdout.write("1. Membuat Data Pelanggan (Customer)...")
        customers_data = [
            {'code': 'CUST-001', 'name': 'Bapak Budi (Individu)', 'email': 'budi@gmail.com', 'phone': '08111222333', 'terms': 0, 'limit': 0},
            {'code': 'CUST-002', 'name': 'PT Teknologi Masa Depan', 'email': 'purchasing@tmd.co.id', 'phone': '021-99887766', 'terms': 30, 'limit': 50000000},
            {'code': 'CUST-003', 'name': 'Toko Gadget Murah', 'email': 'admin@gadgetmurah.com', 'phone': '08554444333', 'terms': 14, 'limit': 15000000},
        ]
        
        customer_objs = []
        for cd in customers_data:
            partner, _ = BusinessPartner.objects.get_or_create(
                name=cd['name'],
                defaults={'partner_type': 'CUSTOMER', 'email': cd['email'], 'phone': cd['phone']}
            )
            
            customer, created = Customer.objects.get_or_create(
                code=cd['code'],
                defaults={
                    'name': cd['name'],
                    'email': cd['email'],
                    'phone': cd['phone'],
                    'payment_terms_days': cd['terms'],
                    'credit_limit': cd['limit'],
                    'business_partner': partner
                }
            )
            customer_objs.append(customer)
            
        self.stdout.write(self.style.SUCCESS(f"Berhasil membuat {len(customers_data)} Customer."))

        # 2. DUMMY DATA: SO & DO
        self.stdout.write("2. Membuat Data Dummy SO & DO...")
        
        # Ensure we have a product and warehouse
        product = Product.objects.first()
        if not product:
            self.stdout.write(self.style.ERROR("Tidak ada data produk. Silakan seed inventory terlebih dahulu."))
            return
            
        warehouse = Warehouse.objects.first()
        if not warehouse:
            self.stdout.write(self.style.ERROR("Tidak ada data gudang. Silakan seed inventory terlebih dahulu."))
            return
        
        # SO 1 (Confirmed)
        so1, created = SalesOrder.objects.get_or_create(
            document_number='SO/2026/08/001',
            defaults={
                'customer': customer_objs[1],
                'order_date': timezone.now().date(),
                'expected_delivery_date': timezone.now().date() + datetime.timedelta(days=3),
                'status': 'CONFIRMED',
                'notes': 'Pesanan prioritas'
            }
        )
        if created:
            SalesOrderLine.objects.create(
                sales_order=so1,
                product=product,
                quantity=5,
                uom=product.base_uom.name if product.base_uom else '',
                unit_price=product.unit_price or 150000
            )
            so1.total_amount = (product.unit_price or 150000) * 5
            so1.save()
            
        # SO 2 (Draft)
        so2, created = SalesOrder.objects.get_or_create(
            document_number='SO/2026/08/002',
            defaults={
                'customer': customer_objs[2],
                'order_date': timezone.now().date(),
                'status': 'DRAFT',
                'notes': 'Menunggu konfirmasi pembayaran DP'
            }
        )
        if created:
            SalesOrderLine.objects.create(
                sales_order=so2,
                product=product,
                quantity=20,
                uom=product.base_uom.name if product.base_uom else '',
                unit_price=product.unit_price or 150000
            )
            so2.total_amount = (product.unit_price or 150000) * 20
            so2.save()
            
        self.stdout.write(self.style.SUCCESS("Berhasil membuat dummy SO."))
        self.stdout.write(self.style.SUCCESS("=== SEEDING SALES SELESAI ==="))
