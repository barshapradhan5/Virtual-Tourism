import uuid
from django.db import models
from django.conf import settings
from apps.places.models import Place

class VisitSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='visit_sessions')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='visit_sessions')
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_s = models.PositiveIntegerField(default=0)
    device_info = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'visit_sessions'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user} visited {self.place.name} at {self.started_at}"

class Favourite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favourites')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='favourited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favourites'
        unique_together = ('user', 'place')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.place.name}"

class Rating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='ratings')
    score = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ratings'
        unique_together = ('user', 'place')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.score}★ by {self.user} on {self.place.name}"

