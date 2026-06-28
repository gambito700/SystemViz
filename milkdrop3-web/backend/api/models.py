from django.db import models

class Preset(models.Model):
    name = models.CharField(max_length=255, unique=True)
    category = models.CharField(max_length=100, blank=True, default='')
    json_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
