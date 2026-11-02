from django.urls import path
from .views import AskGuideView, SessionHistoryView

urlpatterns = [
    path('ask/', AskGuideView.as_view(), name='ask_guide'),
    path('session/<uuid:session_id>/', SessionHistoryView.as_view(), name='session_history'),
]

