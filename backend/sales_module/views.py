from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
import datetime
from decimal import Decimal

from .models import Customer, SalesOrder, SalesOrderLine, DeliveryOrder, DeliveryOrderLine
from .serializers import CustomerSerializer, SalesOrderSerializer, DeliveryOrderSerializer
from inventory_module.models import StockMovement, StockLot
from finance_module.models import Invoice, InvoiceLine, Account

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        so = self.get_object()
        if so.status not in ['DRAFT', 'SENT']:
            return Response({'error': 'Hanya SO berstatus Draft / Sent yang dapat dikonfirmasi.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # In a real app we might check credit limit here.
        so.status = 'CONFIRMED'
        so.save()
        return Response(self.get_serializer(so).data)


class DeliveryOrderViewSet(viewsets.ModelViewSet):
    queryset = DeliveryOrder.objects.all()
    serializer_class = DeliveryOrderSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        do = self.get_object()
        
        if do.status != 'DRAFT':
            return Response({'error': 'Surat Jalan sudah dikonfirmasi atau dibatalkan.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not do.lines.exists():
            return Response({'error': 'Surat Jalan tidak memiliki barang/item.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update SO shipped_qty and Trigger Stock Movement (OUT)
        for do_line in do.lines.all():
            so_line = do_line.so_line
            
            # Add shipped qty
            so_line.shipped_qty += do_line.quantity
            so_line.save()

            lot_obj = None
            if do_line.lot_number:
                lot_obj = StockLot.objects.filter(product=do_line.product, lot_number=do_line.lot_number).first()

            # Trigger Stock Movement (OUT) -> this will auto-deduct StockBalance & compute COGS via valuation layer!
            StockMovement.objects.create(
                reference_number=do.document_number,
                product=do_line.product,
                warehouse=do.warehouse,
                lot=lot_obj,
                movement_type='OUT',
                quantity=do_line.quantity,
                # For OUT, unit_cost is calculated automatically by FIFO in inventory signals, so we can leave it 0 or pass SO unit price (though valuation uses COGS)
                unit_cost=so_line.unit_price, 
                date=do.shipment_date,
                notes=f"Shipment DO {do.document_number} to {do.sales_order.customer.name}"
            )

        # 2. Check if SO is fully completed
        so = do.sales_order
        all_shipped = True
        for line in so.lines.all():
            if line.shipped_qty < line.quantity:
                all_shipped = False
                break
                
        if all_shipped:
            so.status = 'COMPLETED'
            so.save()

        # 3. Trigger Finance Customer Invoice (AR Draft Invoice)
        customer = so.customer
        partner = customer.business_partner
        if partner:
            inv_doc_number = f"INV-{do.document_number}"
            # Ensure no duplicate invoice for the same DO
            if not Invoice.objects.filter(document_number=inv_doc_number).exists():
                revenue_acc = Account.objects.filter(account_type='REVENUE').first() or Account.objects.first()
                due_date = do.shipment_date + datetime.timedelta(days=customer.payment_terms_days)

                invoice = Invoice.objects.create(
                    invoice_type='CUSTOMER_INV',
                    document_number=inv_doc_number,
                    partner=partner,
                    date=do.shipment_date,
                    due_date=due_date,
                    status='DRAFT',
                    total_amount=0,
                    amount_due=0
                )

                total_inv = Decimal('0')
                for do_line in do.lines.all():
                    if do_line.quantity <= 0:
                        continue
                    subtotal = do_line.quantity * do_line.so_line.unit_price
                    InvoiceLine.objects.create(
                        invoice=invoice,
                        description=f"{do_line.product.name} [DO: {do.document_number}]",
                        account=revenue_acc,
                        quantity=do_line.quantity,
                        unit_price=do_line.so_line.unit_price,
                        subtotal=subtotal
                    )
                    total_inv += subtotal
                
                invoice.total_amount = total_inv
                invoice.amount_due = total_inv
                invoice.save()

        do.status = 'DONE'
        do.save()
        return Response({'status': 'Pengiriman dikonfirmasi, Stok Gudang dan Tagihan Piutang telah otomatis diperbarui.'})
