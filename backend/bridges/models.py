from django.contrib.gis.db import models

class Bridge(models.Model):
    STATUS_CHOICES = [
        ('good', 'Tốt'),
        ('repair', 'Đang sửa chữa'),
        ('closed', 'Đóng cửa'),
        ('unknown', 'Chưa biết'),
    ]
    # new data pictures 
    # picture = models.FileField(upload_to='media/')
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unknown')
    description = models.TextField(blank=True, null=True)
    center_point = models.PointField(null=True, blank=True)  
    built_year = models.IntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class BridgeSegment(models.Model):
    bridge = models.ForeignKey(Bridge, on_delete=models.CASCADE, related_name='segments')
    geometry = models.LineStringField()
    segment_name = models.CharField(max_length=255, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.bridge.name} - Segment {self.segment_name or self.order}"
