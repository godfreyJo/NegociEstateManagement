from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

class DashboardMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            "total_units": 0,
            "occupied_units": 0,
            "occupancy_rate": 0,
            "expected_rent": 0,
            "collected_rent": 0,
            "collection_rate": 0,
            "outstanding_rent": 0,
            "open_tickets": 0,
            "active_bookings": 0,
        })

class FinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            "total_revenue": 0,
            "total_expenses": 0,
            "net_profit": 0,
        })