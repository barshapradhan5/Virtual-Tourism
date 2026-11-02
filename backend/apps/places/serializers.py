from rest_framework import serializers
from .models import Category, State, Place, POI, Media, SceneAsset

class CategorySerializer(serializers.ModelSerializer):
    places_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'icon', 'theme_color', 'description', 'places_count')

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ('id', 'name', 'code')

class POISerializer(serializers.ModelSerializer):
    class Meta:
        model = POI
        fields = ('id', 'title', 'body', 'pos_x', 'pos_y', 'pos_z', 'radius', 'audio_url', 'order')

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ('id', 'image_url', 'caption', 'credit', 'order')

class SceneAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = SceneAsset
        fields = ('id', 'kind', 'asset_url', 'version', 'size_bytes')

class PlaceListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    state = StateSerializer(read_only=True)

    class Meta:
        model = Place
        fields = (
            'id', 'slug', 'name', 'category', 'state', 'short_description',
            'latitude', 'longitude', 'best_season', 'scene_mode', 'hero_image_url'
        )

class PlaceDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    state = StateSerializer(read_only=True)
    pois = POISerializer(many=True, read_only=True)
    media_items = MediaSerializer(many=True, read_only=True)
    scene_assets = SceneAssetSerializer(many=True, read_only=True)

    class Meta:
        model = Place
        fields = (
            'id', 'slug', 'name', 'category', 'state', 'short_description',
            'short_description_ai', 'history_notes', 'latitude', 'longitude',
            'best_season', 'scene_mode', 'hero_image_url', 'panorama_url',
            'spawn_x', 'spawn_y', 'spawn_z', 'pois', 'media_items', 'scene_assets'
        )

class SceneManifestSerializer(serializers.ModelSerializer):
    pois = POISerializer(many=True, read_only=True)
    scene_assets = SceneAssetSerializer(many=True, read_only=True)

    class Meta:
        model = Place
        fields = (
            'id', 'slug', 'name', 'scene_mode', 'panorama_url',
            'spawn_x', 'spawn_y', 'spawn_z', 'pois', 'scene_assets'
        )

