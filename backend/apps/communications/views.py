from rest_framework import generics, permissions
from .models import Message
from .serializers import MessageSerializer

class MessageListView(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]