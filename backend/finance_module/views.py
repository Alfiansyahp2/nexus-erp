from rest_framework import viewsets
from .models import Account, JournalEntry
from .serializers import AccountSerializer, JournalEntrySerializer

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all().order_by('-date', '-created_at')
    serializer_class = JournalEntrySerializer

