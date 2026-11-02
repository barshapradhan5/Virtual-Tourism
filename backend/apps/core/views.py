from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db import connection

class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        db_ok = True
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_ok = False

        return Response({
            'status': 'healthy' if db_ok else 'degraded',
            'database': 'connected' if db_ok else 'disconnected',
            'app': 'Bharat Darshan 3D API',
            'version': '1.0'
        })

