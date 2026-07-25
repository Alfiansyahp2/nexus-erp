import datetime
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Vendor, PurchaseRequest, PurchaseRequestLine,
    PurchaseOrder, PurchaseOrderLine,
    GoodsReceipt, GoodsReceiptLine
)
from .serializers import (
    VendorSerializer, PurchaseRequestSerializer, PurchaseRequestLineSerializer,
    PurchaseOrderSerializer, PurchaseOrderLineSerializer,
    GoodsReceiptSerializer, GoodsReceiptLineSerializer
)
from hr_module.views import get_or_create_employee_profile
from inventory_module.models import Product, UOM, Warehouse, StockLot, StockMovement
from finance_module.models import Account, Invoice, InvoiceLine


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    search_fields = ['code', 'name', 'email', 'phone', 'npwp']
    filterset_fields = ['is_active']


class PurchaseRequestViewSet(viewsets.ModelViewSet):
    queryset = PurchaseRequest.objects.all()
    serializer_class = PurchaseRequestSerializer
    search_fields = ['document_number', 'notes']
    filterset_fields = ['status', 'department']

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        lines_data = data.pop('lines', [])
        
        # Set default requested_by if not provided
        if 'requested_by' not in data or not data['requested_by']:
            employee = get_or_create_employee_profile(request.user)
            data['requested_by'] = employee.id
            if employee.department and ('department' not in data or not data['department']):
                data['department'] = employee.department.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        pr = serializer.save()

        for line_item in lines_data:
            PurchaseRequestLine.objects.create(
                purchase_request=pr,
                product_id=line_item['product'],
                quantity=line_item.get('quantity', 1),
                uom_id=line_item.get('uom'),
                estimated_unit_cost=line_item.get('estimated_unit_cost', 0),
                notes=line_item.get('notes', '')
            )

        return Response(self.get_serializer(pr).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        lines_data = data.pop('lines', None)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        pr = serializer.save()

        if lines_data is not None:
            pr.lines.all().delete()
            for line_item in lines_data:
                PurchaseRequestLine.objects.create(
                    purchase_request=pr,
                    product_id=line_item['product'],
                    quantity=line_item.get('quantity', 1),
                    uom_id=line_item.get('uom'),
                    estimated_unit_cost=line_item.get('estimated_unit_cost', 0),
                    notes=line_item.get('notes', '')
                )

        return Response(self.get_serializer(pr).data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        pr = self.get_object()
        if pr.status != 'DRAFT':
            return Response({'error': 'Hanya PR berstatus Draft yang dapat diajukan.'}, status=status.HTTP_400_BAD_REQUEST)
        pr.status = 'SUBMITTED'
        pr.save()
        return Response(self.get_serializer(pr).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        pr = self.get_object()
        if pr.status != 'SUBMITTED':
            return Response({'error': 'Hanya PR berstatus Submitted yang dapat disetujui.'}, status=status.HTTP_400_BAD_REQUEST)
        pr.status = 'APPROVED'
        pr.save()
        return Response(self.get_serializer(pr).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        pr = self.get_object()
        if pr.status != 'SUBMITTED':
            return Response({'error': 'Hanya PR berstatus Submitted yang dapat ditolak.'}, status=status.HTTP_400_BAD_REQUEST)
        pr.status = 'REJECTED'
        pr.save()
        return Response(self.get_serializer(pr).data)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    search_fields = ['document_number', 'notes']
    filterset_fields = ['status', 'vendor', 'purchase_request']

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        lines_data = data.pop('lines', [])

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        po = serializer.save()

        total = Decimal('0')
        for line_item in lines_data:
            qty = Decimal(str(line_item.get('quantity', 1)))
            price = Decimal(str(line_item.get('unit_price', 0)))
            po_line = PurchaseOrderLine.objects.create(
                purchase_order=po,
                product_id=line_item['product'],
                quantity=qty,
                uom_id=line_item.get('uom'),
                unit_price=price
            )
            total += po_line.subtotal

        po.total_amount = total
        po.save()

        # Update PR status if linked
        if po.purchase_request and po.purchase_request.status == 'APPROVED':
            po.purchase_request.status = 'PO_CREATED'
            po.purchase_request.save()

        return Response(self.get_serializer(po).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        lines_data = data.pop('lines', None)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        po = serializer.save()

        if lines_data is not None:
            po.lines.all().delete()
            total = Decimal('0')
            for line_item in lines_data:
                qty = Decimal(str(line_item.get('quantity', 1)))
                price = Decimal(str(line_item.get('unit_price', 0)))
                po_line = PurchaseOrderLine.objects.create(
                    purchase_order=po,
                    product_id=line_item['product'],
                    quantity=qty,
                    uom_id=line_item.get('uom'),
                    unit_price=price
                )
                total += po_line.subtotal
            po.total_amount = total
            po.save()

        return Response(self.get_serializer(po).data)

    @action(detail=False, methods=['post'])
    @transaction.atomic
    def create_from_pr(self, request):
        pr_id = request.data.get('purchase_request_id')
        vendor_id = request.data.get('vendor_id')
        document_number = request.data.get('document_number')
        order_date = request.data.get('order_date') or timezone.now().date()
        expected_delivery_date = request.data.get('expected_delivery_date')

        if not (pr_id and vendor_id and document_number):
            return Response({'error': 'PR ID, Vendor ID, dan Nomor Dokumen wajib diisi.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pr = PurchaseRequest.objects.get(pk=pr_id)
        except PurchaseRequest.DoesNotExist:
            return Response({'error': 'Purchase Request tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)

        if pr.status != 'APPROVED':
            return Response({'error': 'Hanya PR berstatus Approved yang dapat dibuatkan PO.'}, status=status.HTTP_400_BAD_REQUEST)

        po = PurchaseOrder.objects.create(
            document_number=document_number,
            vendor_id=vendor_id,
            order_date=order_date,
            expected_delivery_date=expected_delivery_date or pr.expected_delivery_date,
            status='DRAFT',
            purchase_request=pr,
            notes=f"Created automatically from {pr.document_number}"
        )

        total = Decimal('0')
        for pr_line in pr.lines.all():
            po_line = PurchaseOrderLine.objects.create(
                purchase_order=po,
                product=pr_line.product,
                quantity=pr_line.quantity,
                uom=pr_line.uom,
                unit_price=pr_line.estimated_unit_cost
            )
            total += po_line.subtotal

        po.total_amount = total
        po.save()

        pr.status = 'PO_CREATED'
        pr.save()

        return Response(self.get_serializer(po).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def send_to_vendor(self, request, pk=None):
        po = self.get_object()
        if po.status != 'DRAFT':
            return Response({'error': 'Hanya PO berstatus Draft yang dapat dikirim.'}, status=status.HTTP_400_BAD_REQUEST)
        po.status = 'SENT'
        po.save()
        return Response(self.get_serializer(po).data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        po = self.get_object()
        if po.status not in ['DRAFT', 'SENT']:
            return Response({'error': 'Hanya PO berstatus Draft / Sent yang dapat dikonfirmasi.'}, status=status.HTTP_400_BAD_REQUEST)
        po.status = 'CONFIRMED'
        po.save()
        return Response(self.get_serializer(po).data)


class GoodsReceiptViewSet(viewsets.ModelViewSet):
    queryset = GoodsReceipt.objects.all()
    serializer_class = GoodsReceiptSerializer
    search_fields = ['document_number', 'delivery_note_number', 'notes']
    filterset_fields = ['status', 'purchase_order', 'warehouse']

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        lines_data = data.pop('lines', [])

        if 'received_by' not in data or not data['received_by']:
            employee = get_or_create_employee_profile(request.user)
            data['received_by'] = employee.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        gr = serializer.save()

        for line_item in lines_data:
            po_line_id = line_item.get('po_line')
            if not po_line_id:
                # auto find po_line if not explicitly provided
                po_line = gr.purchase_order.lines.filter(product_id=line_item['product']).first()
                if not po_line:
                    continue
                po_line_id = po_line.id

            GoodsReceiptLine.objects.create(
                goods_receipt=gr,
                po_line_id=po_line_id,
                product_id=line_item['product'],
                quantity=Decimal(str(line_item.get('quantity', 0))),
                uom_id=line_item.get('uom'),
                lot_number=line_item.get('lot_number', ''),
                expiry_date=line_item.get('expiry_date') or None,
                notes=line_item.get('notes', '')
            )

        return Response(self.get_serializer(gr).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if instance.status == 'DONE':
            return Response({'error': 'GR yang sudah selesai tidak dapat diubah.'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        lines_data = data.pop('lines', None)

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        gr = serializer.save()

        if lines_data is not None:
            gr.lines.all().delete()
            for line_item in lines_data:
                po_line_id = line_item.get('po_line')
                if not po_line_id:
                    po_line = gr.purchase_order.lines.filter(product_id=line_item['product']).first()
                    if not po_line:
                        continue
                    po_line_id = po_line.id

                GoodsReceiptLine.objects.create(
                    goods_receipt=gr,
                    po_line_id=po_line_id,
                    product_id=line_item['product'],
                    quantity=Decimal(str(line_item.get('quantity', 0))),
                    uom_id=line_item.get('uom'),
                    lot_number=line_item.get('lot_number', ''),
                    expiry_date=line_item.get('expiry_date') or None,
                    notes=line_item.get('notes', '')
                )

        return Response(self.get_serializer(gr).data)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def confirm(self, request, pk=None):
        gr = self.get_object()
        if gr.status != 'DRAFT':
            return Response({'error': 'Hanya Goods Receipt berstatus Draft yang dapat dikonfirmasi.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update PO Line Received Quantities & Trigger Inventory Stock In
        for gr_line in gr.lines.all():
            if gr_line.quantity <= 0:
                continue

            # Update PO Line
            po_line = gr_line.po_line
            po_line.received_qty += gr_line.quantity
            po_line.save()

            # Handle StockLot if provided
            lot_obj = None
            if gr_line.lot_number:
                lot_obj, _ = StockLot.objects.get_or_create(
                    product=gr_line.product,
                    lot_number=gr_line.lot_number,
                    defaults={'expiry_date': gr_line.expiry_date}
                )

            # Trigger Stock Movement (IN) -> this will auto-update StockBalance & valuation layer!
            StockMovement.objects.create(
                reference_number=gr.document_number,
                product=gr_line.product,
                warehouse=gr.warehouse,
                lot=lot_obj,
                movement_type='IN',
                quantity=gr_line.quantity,
                unit_cost=po_line.unit_price,
                date=gr.receipt_date,
                notes=f"GRN from PO {gr.purchase_order.document_number} (Vendor: {gr.purchase_order.vendor.name})"
            )

        # 2. Check if PO is fully completed
        po = gr.purchase_order
        all_received = True
        for line in po.lines.all():
            if line.received_qty < line.quantity:
                all_received = False
                break
        if all_received:
            po.status = 'COMPLETED'
            po.save()

        # 3. Trigger Finance Vendor Bill (AP Draft Invoice)
        vendor = po.vendor
        partner = vendor.business_partner
        if partner:
            bill_doc_number = f"BILL-{gr.document_number}"
            # ensure no duplicate bill
            if not Invoice.objects.filter(document_number=bill_doc_number).exists():
                expense_acc = Account.objects.filter(account_type='EXPENSE').first() or Account.objects.first()
                due_date = gr.receipt_date + datetime.timedelta(days=vendor.payment_terms_days)

                bill = Invoice.objects.create(
                    invoice_type='VENDOR_BILL',
                    document_number=bill_doc_number,
                    partner=partner,
                    date=gr.receipt_date,
                    due_date=due_date,
                    status='DRAFT',
                    total_amount=0,
                    amount_due=0
                )

                total_bill = Decimal('0')
                for gr_line in gr.lines.all():
                    if gr_line.quantity <= 0:
                        continue
                    subtotal = gr_line.quantity * gr_line.po_line.unit_price
                    InvoiceLine.objects.create(
                        invoice=bill,
                        description=f"{gr_line.product.name} [GRN: {gr.document_number}]",
                        account=expense_acc,
                        quantity=gr_line.quantity,
                        unit_price=gr_line.po_line.unit_price,
                        subtotal=subtotal
                    )
                    total_bill += subtotal

                bill.total_amount = total_bill
                bill.amount_due = total_bill
                bill.save()

        gr.status = 'DONE'
        gr.save()

        return Response(self.get_serializer(gr).data, status=status.HTTP_200_OK)
