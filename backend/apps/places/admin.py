from django.contrib import admin
from .models import Category, State, Place, POI, Media, SceneAsset

class POIInline(admin.StackedInline):
    model = POI
    extra = 1

class MediaInline(admin.TabularInline):
    model = Media
    extra = 1

class SceneAssetInline(admin.TabularInline):
    model = SceneAsset
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'theme_color', 'order')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'name')

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code')

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'state', 'scene_mode', 'is_published')
    list_filter = ('category', 'state', 'scene_mode', 'is_published')
    search_fields = ('name', 'short_description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [POIInline, MediaInline, SceneAssetInline]

@admin.register(POI)
class POIAdmin(admin.ModelAdmin):
    list_display = ('title', 'place', 'pos_x', 'pos_y', 'pos_z', 'radius')
    list_filter = ('place',)
    search_fields = ('title', 'body')

