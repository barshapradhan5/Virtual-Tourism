from django.db.models import Count, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Category, State, Place
from .serializers import (
    CategorySerializer, StateSerializer, PlaceListSerializer,
    PlaceDetailSerializer, SceneManifestSerializer
)

class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.annotate(places_count=Count('places', filter=Q(places__is_published=True)))

class StateListView(generics.ListAPIView):
    queryset = State.objects.all()
    serializer_class = StateSerializer
    permission_classes = [permissions.AllowAny]

class PlaceListView(generics.ListAPIView):
    serializer_class = PlaceListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Place.objects.filter(is_published=True).select_related('category', 'state')
        category_slug = self.request.query_params.get('category')
        state_code = self.request.query_params.get('state')
        search_query = self.request.query_params.get('q')

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if state_code:
            queryset = queryset.filter(state__code__iexact=state_code)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(short_description__icontains=search_query) |
                Q(state__name__icontains=search_query)
            )
        return queryset

class PlaceDetailView(generics.RetrieveAPIView):
    queryset = Place.objects.filter(is_published=True).select_related('category', 'state').prefetch_related('pois', 'media_items', 'scene_assets')
    serializer_class = PlaceDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

class SceneManifestView(APIView):
    """
    Returns the 3D / panorama scene manifest: spawn point, POIs, assets, collision config.
    Requires authentication per PRD / Technical Architecture.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        try:
            place = Place.objects.prefetch_related('pois', 'scene_assets').get(slug=slug, is_published=True)
        except Place.DoesNotExist:
            return Response({'detail': 'Place not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = SceneManifestSerializer(place)
        data = serializer.data
        data['environment'] = {
            'sky_preset': 'sunset' if 'beach' in place.category.slug or 'temple' in place.category.slug else 'daylight',
            'ambient_light_intensity': 0.7,
            'ground_color': '#111A16',
            'fog_color': '#0A0F0D',
            'fog_near': 15.0,
            'fog_far': 60.0
        }
        return Response(data)

