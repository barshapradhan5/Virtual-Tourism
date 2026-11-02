from django.urls import path
from .views import (
    StartVisitView, UpdateVisitView, VisitHistoryView,
    FavouriteListView, ToggleFavouriteView
)

urlpatterns = [
    path('', StartVisitView.as_view(), name='start_visit'),
    path('<uuid:id>/', UpdateVisitView.as_view(), name='update_visit'),
    path('history/', VisitHistoryView.as_view(), name='visit_history'),
    path('favourites/', FavouriteListView.as_view(), name='favourite_list'),
    path('favourites/toggle/', ToggleFavouriteView.as_view(), name='toggle_favourite'),
]

