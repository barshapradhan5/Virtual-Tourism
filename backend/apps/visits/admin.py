from django.contrib import admin
from .models import VisitSession, Favourite, Rating

@admin.register(VisitSession)
class VisitSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'place', 'started_at', 'duration_s')
    list_filter = ('place', 'started_at')

@admin.register(Favourite)
class FavouriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'place', 'created_at')

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'place', 'score', 'created_at')

