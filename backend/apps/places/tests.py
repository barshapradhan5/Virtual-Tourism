from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.places.models import Category, Place, State

User = get_user_model()

class PlacesApiTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Monuments", slug="monuments", order=1)
        self.state = State.objects.create(name="Uttar Pradesh", code="UP")
        self.place = Place.objects.create(
            name="Taj Mahal",
            slug="taj-mahal",
            category=self.category,
            state=self.state,
            short_description="Iconic white marble mausoleum.",
            latitude=27.1751,
            longitude=78.0421
        )
        self.user = User.objects.create_user(email="test@user.com", password="password123")

    def test_list_places(self):
        response = self.client.get('/api/v1/places/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['slug'], 'taj-mahal')

    def test_place_detail(self):
        response = self.client.get('/api/v1/places/taj-mahal/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Taj Mahal')

    def test_scene_manifest_unauthenticated(self):
        response = self.client.get('/api/v1/places/taj-mahal/scene/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_scene_manifest_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/places/taj-mahal/scene/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('environment', response.data)

