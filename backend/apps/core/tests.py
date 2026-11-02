from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class HealthCheckTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check(self):
        response = self.client.get('/api/v1/core/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertEqual(response.data['database'], 'connected')

