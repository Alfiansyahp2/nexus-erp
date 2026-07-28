from rest_framework import serializers
from .models import Customer, SalesOrder, SalesOrderLine, DeliveryOrder, DeliveryOrderLine
from inventory_module.serializers import ProductSerializer, WarehouseSerializer
from finance_module.models import BusinessPartner

class CustomerSerializer(serializers.ModelSerializer):
    business_partner_name = serializers.CharField(source='business_partner.name', read_only=True)
    
    class Meta:
        model = Customer
        fields = '__all__'

    def create(self, validated_data):
        # Automatically sync with BusinessPartner in finance
        partner, created = BusinessPartner.objects.get_or_create(
            name=validated_data['name'],
            defaults={
                'partner_type': 'CUSTOMER',
                'email': validated_data.get('email'),
                'phone': validated_data.get('phone'),
                'address': validated_data.get('address')
            }
        )
        if not created and partner.partner_type == 'VENDOR':
            partner.partner_type = 'BOTH'
            partner.save()
            
        validated_data['business_partner'] = partner
        return super().create(validated_data)

    def update(self, instance, validated_data):
        customer = super().update(instance, validated_data)
        if customer.business_partner:
            partner = customer.business_partner
            partner.name = customer.name
            partner.email = customer.email
            partner.phone = customer.phone
            partner.address = customer.address
            partner.save()
        return customer


class SalesOrderLineSerializer(serializers.ModelSerializer):
    product_code = serializers.CharField(source='product.code', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = SalesOrderLine
        fields = ['id', 'product', 'product_code', 'product_name', 'quantity', 'uom', 'unit_price', 'subtotal', 'shipped_qty']
        read_only_fields = ['subtotal', 'shipped_qty']

class SalesOrderSerializer(serializers.ModelSerializer):
    lines = SalesOrderLineSerializer(many=True, required=False)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_code = serializers.CharField(source='customer.code', read_only=True)

    class Meta:
        model = SalesOrder
        fields = '__all__'
        read_only_fields = ['total_amount', 'status']

    def create(self, validated_data):
        lines_data = self.context.get('request').data.get('lines', [])
        so = SalesOrder.objects.create(**validated_data)
        
        total = 0
        for line_data in lines_data:
            line = SalesOrderLine.objects.create(
                sales_order=so,
                product_id=line_data['product'],
                quantity=line_data['quantity'],
                uom=line_data.get('uom'),
                unit_price=line_data['unit_price']
            )
            total += line.subtotal
            
        so.total_amount = total
        so.save()
        return so

    def update(self, instance, validated_data):
        lines_data = self.context.get('request').data.get('lines')
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if lines_data is not None:
            # Delete old lines
            instance.lines.all().delete()
            
            # Recreate lines
            total = 0
            for line_data in lines_data:
                line = SalesOrderLine.objects.create(
                    sales_order=instance,
                    product_id=line_data['product'],
                    quantity=line_data['quantity'],
                    uom=line_data.get('uom'),
                    unit_price=line_data['unit_price']
                )
                total += line.subtotal
            instance.total_amount = total
            
        instance.save()
        return instance


class DeliveryOrderLineSerializer(serializers.ModelSerializer):
    product_code = serializers.CharField(source='product.code', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    uom_name = serializers.CharField(source='so_line.uom', read_only=True)

    class Meta:
        model = DeliveryOrderLine
        fields = ['id', 'so_line', 'product', 'product_code', 'product_name', 'quantity', 'lot_number', 'notes', 'uom_name']

class DeliveryOrderSerializer(serializers.ModelSerializer):
    lines = DeliveryOrderLineSerializer(many=True, required=False)
    so_number = serializers.CharField(source='sales_order.document_number', read_only=True)
    customer_name = serializers.CharField(source='sales_order.customer.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)

    class Meta:
        model = DeliveryOrder
        fields = '__all__'
        read_only_fields = ['status']

    def create(self, validated_data):
        lines_data = self.context.get('request').data.get('lines', [])
        
        do = DeliveryOrder.objects.create(**validated_data)
        
        for line_data in lines_data:
            if float(line_data.get('quantity', 0)) > 0:
                DeliveryOrderLine.objects.create(
                    delivery_order=do,
                    so_line_id=line_data['so_line'],
                    product_id=line_data['product'],
                    quantity=line_data['quantity'],
                    lot_number=line_data.get('lot_number'),
                    notes=line_data.get('notes')
                )
                
        return do
