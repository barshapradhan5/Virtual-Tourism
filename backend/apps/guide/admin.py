from django.contrib import admin
from .models import GuideChatSession, GuideMessage

class GuideMessageInline(admin.TabularInline):
    model = GuideMessage
    extra = 0
    readonly_fields = ('role', 'content', 'is_fallback', 'created_at')

@admin.register(GuideChatSession)
class GuideChatSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'place', 'created_at')
    list_filter = ('place', 'created_at')
    inlines = [GuideMessageInline]

