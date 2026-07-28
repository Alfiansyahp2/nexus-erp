from django.core.management.base import BaseCommand
import datetime
from django.utils import timezone
from purchasing_module.models import Vendor, PurchaseRequest, PurchaseRequestLine, PurchaseOrder, PurchaseOrderLine, GoodsReceipt, GoodsReceiptLine
from inventory_module.models import Product, Warehouse
from finance_module.models import BusinessPartner
from hr_module.models import EmployeeProfile, Department
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds data for Purchasing Module (Vendors, PR, PO, GR)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("=== MEMULAI SEEDING PURCHASING ==="))
        
        # 1. FIXED DATA: Vendors
        self.stdout.write("1. Membuat Data Vendor (Supplier)...")
        vendors_data = [
            {'code': 'VEND-001', 'name': 'PT Sinar Jaya Abadi', 'email': 'sales@sinarjaya.com', 'phone': '021-5551234', 'terms': 30},
            {'code': 'VEND-002', 'name': 'CV Makmur Sentosa', 'email': 'info@makmur.co.id', 'phone': '021-7778899', 'terms': 14},
            {'code': 'VEND-003', 'name': 'Toko Material Sentral', 'email': 'toko@sentral.com', 'phone': '0812345678', 'terms': 0},
        ]
        
        vendor_objs = []
        for vd in vendors_data:
            partner, _ = BusinessPartner.objects.get_or_create(
                name=vd['name'],
                defaults={'partner_type': 'VENDOR', 'email': vd['email'], 'phone': vd['phone']}
            )
            
            vendor, created = Vendor.objects.get_or_create(
                code=vd['code'],
                defaults={
                    'name': vd['name'],
                    'email': vd['email'],
                    'phone': vd['phone'],
                    'payment_terms_days': vd['terms'],
                    'business_partner': partner
                }
            )
            vendor_objs.append(vendor)
            
        self.stdout.write(self.style.SUCCESS(f"Berhasil membuat {len(vendors_data)} Vendor."))

        # 2. DUMMY DATA: PR & PO
        self.stdout.write("2. Membuat Data Dummy PR & PO...")
        
        # Ensure we have a product
        product = Product.objects.first()
        if not product:
            self.stdout.write(self.style.ERROR("Tidak ada data produk. Silakan seed inventory terlebih dahulu."))
            return
            
        # Ensure we have a user
        admin = User.objects.filter(is_superuser=True).first() or User.objects.first()
        requested_by_emp = EmployeeProfile.objects.filter(user=admin).first() or EmployeeProfile.objects.first()
        dept = Department.objects.first()
        
        # PR 1 (Approved)
        pr1, created = PurchaseRequest.objects.get_or_create(
            document_number='PR/2026/08/001',
            defaults={
                'requested_by': requested_by_emp,
                'department': dept,
                'request_date': timezone.now().date(),
                'expected_delivery_date': timezone.now().date() + datetime.timedelta(days=7),
                'status': 'APPROVED',
                'notes': 'Pembelian rutin bulanan'
            }
        )
        if created:
            PurchaseRequestLine.objects.create(
                purchase_request=pr1,
                product=product,
                quantity=10,
                uom=product.base_uom,
                estimated_unit_cost=product.cost_price or 100000
            )
            
        # PR 2 (Draft)
        pr2, created = PurchaseRequest.objects.get_or_create(
            document_number='PR/2026/08/002',
            defaults={
                'requested_by': requested_by_emp,
                'department': dept,
                'request_date': timezone.now().date(),
                'status': 'DRAFT',
                'notes': 'Pengadaan darurat'
            }
        )
        if created:
            PurchaseRequestLine.objects.create(
                purchase_request=pr2,
                product=product,
                quantity=5,
                uom=product.base_uom,
                estimated_unit_cost=product.cost_price or 100000
            )

        # PO 1 (from PR 1)
        po1, created = PurchaseOrder.objects.get_or_create(
            document_number='PO/2026/08/001',
            defaults={
                'vendor': vendor_objs[0],
                'purchase_request': pr1,
                'order_date': timezone.now().date(),
                'expected_delivery_date': timezone.now().date() + datetime.timedelta(days=7),
                'status': 'SENT',
                'total_amount': (product.cost_price or 100000) * 10
            }
        )
        if created:
            PurchaseOrderLine.objects.create(
                purchase_order=po1,
                product=product,
                quantity=10,
                uom=product.base_uom,
                unit_price=product.cost_price or 100000
            )
            
        self.stdout.write(self.style.SUCCESS("Berhasil membuat dummy PR dan PO."))
        self.stdout.write(self.style.SUCCESS("=== SEEDING PURCHASING SELESAI ==="))
