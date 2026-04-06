from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

class SendNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        return Response({"status": "notification sent"})