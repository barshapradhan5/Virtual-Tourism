from rest_framework import serializers
from .models import VisitSession, Favourite, Rating
from apps.places.serializers import PlaceListSerializer

class VisitSessionSerializer(serializers.ModelSerializer):
    place_detail = PlaceListSerializer(source='place', read_only=True)

    class Meta:
        model = VisitSession
        fields = ('id', 'place', 'place_detail', 'started_at', 'ended_at', 'duration_s', 'device_info')
        read_only_fields = ('id', 'started_at')

class FavouriteSerializer(serializers.ModelSerializer):
    place_detail = PlaceListSerializer(source='place', read_only=True)

    class Meta:
        model = Favourite
        fields = ('id', 'place', 'place_detail', 'created_at')
        read_only_fields = ('id', 'created_at')

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ('id', 'place', 'score', 'comment', 'created_at')
        read_only_fields = ('id', 'created_at')

