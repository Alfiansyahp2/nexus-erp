from rest_framework import serializers
from .models import (
    Vendor, PurchaseRequest, PurchaseRequestLine,
    PurchaseOrder, PurchaseOrderLine,
    GoodsReceipt, GoodsReceiptLine
)

class VendorSerializer(serializers.ModelSerializer):
    business_partner_id = serializers.ReadOnlyField(source='business_partner.id')
    business_partner_name = serializers.ReadOnlyField(source='business_partner.name')

    class Meta:
        model = Vendor
        fields = '__all__'


class PurchaseRequestLineSerializer(serializers.ModelSerializer):
    product_code = serializers.ReadOnlyField(source='product.code')
    product_name = serializers.ReadOnlyField(source='product.name')
    uom_name = serializers.ReadOnlyField(source='uom.name')

    class Meta:
        model = PurchaseRequestLine
        fields = '__all__'
        read_only_fields = ['purchase_request']


class PurchaseRequestSerializer(serializers.ModelSerializer):
    lines = PurchaseRequestLineSerializer(many=True, read_only=True)
    department_name = serializers.ReadOnlyField(source='department.name')
    requested_by_name = serializers.ReadOnlyField(source='requested_by.full_name')

    class Meta:
        model = PurchaseRequest
        fields = '__all__'


class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    product_code = serializers.ReadOnlyField(source='product.code')
    product_name = serializers.ReadOnlyField(source='product.name')
    uom_name = serializers.ReadOnlyField(source='uom.name')

    class Meta:
        model = PurchaseOrderLine
        fields = '__all__'
        read_only_fields = ['purchase_order']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    lines = PurchaseOrderLineSerializer(many=True, read_only=True)
    vendor_code = serializers.ReadOnlyField(source='vendor.code')
    vendor_name = serializers.ReadOnlyField(source='vendor.name')
    pr_number = serializers.ReadOnlyField(source='purchase_request.document_number')

    class Meta:
        model = PurchaseOrder
        fields = '__all__'


class GoodsReceiptLineSerializer(serializers.ModelSerializer):
    product_code = serializers.ReadOnlyField(source='product.code')
    product_name = serializers.ReadOnlyField(source='product.name')
    uom_name = serializers.ReadOnlyField(source='uom.name')
    po_line_ordered_qty = serializers.ReadOnlyField(source='po_line.quantity')
    po_line_received_qty = serializers.ReadOnlyField(source='po_line.received_qty')

    class Meta:
        model = GoodsReceiptLine
        fields = '__all__'
        read_only_fields = ['goods_receipt']


class GoodsReceiptSerializer(serializers.ModelSerializer):
    lines = GoodsReceiptLineSerializer(many=True, read_only=True)
    po_number = serializers.ReadOnlyField(source='purchase_order.document_number')
    vendor_name = serializers.ReadOnlyField(source='purchase_order.vendor.name')
    warehouse_name = serializers.ReadOnlyField(source='warehouse.name')
    received_by_name = serializers.ReadOnlyField(source='received_by.full_name')

    class Meta:
        model = GoodsReceipt
        fields = '__all__'
