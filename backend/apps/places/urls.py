from django.urls import path
from .views import CategoryListView, StateListView, PlaceListView, PlaceDetailView, SceneManifestView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('states/', StateListView.as_view(), name='state_list'),
    path('', PlaceListView.as_view(), name='place_list'),
    path('<slug:slug>/', PlaceDetailView.as_view(), name='place_detail'),
    path('<slug:slug>/scene/', SceneManifestView.as_view(), name='scene_manifest'),
]

