import uuid
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Lucide or custom icon name")
    theme_color = models.CharField(max_length=20, default="#1F5C3F")
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

class State(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)

    class Meta:
        db_table = 'states'
        ordering = ['name']

    def __str__(self):
        return self.name

class Place(models.Model):
    SCENE_MODE_CHOICES = (
        ('3d', 'Full 3D Scene'),
        ('panorama', '360 Panorama View'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=150, unique=True)
    name = models.CharField(max_length=200, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='places')
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True, related_name='places')
    
    short_description = models.TextField(help_text="Curated verified short description (approx 80-100 words)")
    short_description_ai = models.TextField(blank=True, help_text="AI generated description draft")
    history_notes = models.TextField(blank=True, help_text="Detailed history, mythology, architecture facts for AI grounding")
    
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    best_season = models.CharField(max_length=100, default="October to March")
    
    is_published = models.BooleanField(default=True)
    scene_mode = models.CharField(max_length=20, choices=SCENE_MODE_CHOICES, default='3d')
    hero_image_url = models.URLField(max_length=500, blank=True)
    panorama_url = models.URLField(max_length=500, blank=True)
    
    # Spawn coordinates for 3D world
    spawn_x = models.FloatField(default=0.0)
    spawn_y = models.FloatField(default=1.5)
    spawn_z = models.FloatField(default=8.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'places'
        ordering = ['name']

    def __str__(self):
        return self.name

class POI(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='pois')
    title = models.CharField(max_length=150)
    body = models.TextField()
    pos_x = models.FloatField(default=0.0)
    pos_y = models.FloatField(default=1.0)
    pos_z = models.FloatField(default=0.0)
    radius = models.FloatField(default=3.5, help_text="Interaction trigger distance in meters")
    audio_url = models.URLField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'pois'
        ordering = ['order', 'title']

    def __str__(self):
        return f"{self.title} ({self.place.name})"

class Media(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='media_items')
    image_url = models.URLField(max_length=500)
    caption = models.CharField(max_length=255, blank=True)
    credit = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'media'
        ordering = ['order']

    def __str__(self):
        return f"Media for {self.place.name} - {self.caption or self.image_url}"

class SceneAsset(models.Model):
    ASSET_KINDS = (
        ('glb', '3D Model (GLB)'),
        ('hdr', 'Skybox Environment (HDR/EXR)'),
        ('audio', 'Ambient Audio'),
        ('panorama', '360 Equirectangular Image'),
    )
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='scene_assets')
    kind = models.CharField(max_length=20, choices=ASSET_KINDS)
    asset_url = models.URLField(max_length=500)
    version = models.CharField(max_length=20, default="1.0")
    size_bytes = models.BigIntegerField(default=0)

    class Meta:
        db_table = 'scene_assets'

    def __str__(self):
        return f"{self.kind} asset for {self.place.name}"

