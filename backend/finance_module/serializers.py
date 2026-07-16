from rest_framework import serializers
from .models import Account, JournalEntry, JournalItem

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class JournalItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalItem
        fields = ['id', 'account', 'description', 'debit', 'credit']

class JournalEntrySerializer(serializers.ModelSerializer):
    items = JournalItemSerializer(many=True)

    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'reference_number', 'description', 'created_at', 'created_by', 'items']
        read_only_fields = ['created_by']

    def validate(self, data):
        items = data.get('items', [])
        if not items:
            raise serializers.ValidationError("Journal entry must have at least one item.")
        
        total_debit = sum(item.get('debit', 0) for item in items)
        total_credit = sum(item.get('credit', 0) for item in items)

        if total_debit != total_credit:
            raise serializers.ValidationError(
                f"Total Debit ({total_debit}) must equal Total Credit ({total_credit})."
            )
        
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Optionally assign created_by from request.user
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
            
        journal_entry = JournalEntry.objects.create(**validated_data)
        
        for item_data in items_data:
            JournalItem.objects.create(journal_entry=journal_entry, **item_data)
            
        return journal_entry

