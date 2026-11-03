from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        "status": "healthy",
        "service": "Bharat Darshan 3D API",
        "version": "1.0.0"
    })

urlpatterns = [
    path('', health_check, name='root_health'),
    path('health/', health_check, name='health_check'),
    path('api/health/', health_check, name='api_health_check'),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/places/', include('apps.places.urls')),
    path('api/v1/visits/', include('apps.visits.urls')),
    path('api/v1/guide/', include('apps.guide.urls')),
    path('api/v1/core/', include('apps.core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

