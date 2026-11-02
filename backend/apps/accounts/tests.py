from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

class AccountsApiTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_login(self):
        # Register
        reg_payload = {
            "email": "traveler@bharat.com",
            "password": "StrongPassword123!",
            "display_name": "Namaste Explorer"
        }
        res_reg = self.client.post('/api/v1/auth/register/', reg_payload)
        self.assertEqual(res_reg.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res_reg.data)
        self.assertIn('user', res_reg.data)

        # Login
        login_payload = {
            "email": "traveler@bharat.com",
            "password": "StrongPassword123!"
        }
        res_login = self.client.post('/api/v1/auth/login/', login_payload)
        self.assertEqual(res_login.status_code, status.HTTP_200_OK)
        self.assertIn('access', res_login.data)

