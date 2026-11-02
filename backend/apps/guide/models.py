import uuid
from django.db import models
from django.conf import settings
from apps.places.models import Place

class GuideChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='guide_sessions')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='guide_sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'guide_chat_sessions'
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chat on {self.place.name} by {self.user}"

class GuideMessage(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
    )

    session = models.ForeignKey(GuideChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    is_fallback = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'guide_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role} in {self.session.id}: {self.content[:40]}..."

