# from django.contrib.gis.db import models

# class Bridge(models.Model):
#     STATUS_CHOICES = [
#         ('good', 'Tốt'),
#         ('repair', 'Đang sửa chữa'),
#         ('closed', 'Đóng cửa'),
#         ('unknown', 'Chưa biết'),
#     ]
#     # new data pictures 
#     # picture = models.FileField(upload_to='media/')
#     name = models.CharField(max_length=255)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unknown')
#     description = models.TextField(blank=True, null=True)
#     center_point = models.PointField(null=True, blank=True)  
#     built_year = models.IntegerField(null=True, blank=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.name

# class BridgeSegment(models.Model):
#     bridge = models.ForeignKey(Bridge, on_delete=models.CASCADE, related_name='segments')
#     geometry = models.LineStringField()
#     segment_name = models.CharField(max_length=255, blank=True, null=True)
#     order = models.PositiveIntegerField(default=0)

#     def __str__(self):
#         return f"{self.bridge.name} - Segment {self.segment_name or self.order}"

from django.contrib.gis.db import models

class Bridge(models.Model):
    STATUS_CHOICES = [
        ('good', 'Tốt'),
        ('repair', 'Đang sửa chữa'),
        ('closed', 'Đóng cửa'),
        ('unknown', 'Chưa biết'),
    ]

    BRIDGE_TYPES = [
        ('beam', 'Cầu dầm'),
        ('arch', 'Cầu vòm'),
        ('suspension', 'Cầu treo'),
        ('cable_stayed', 'Cầu dây văng'),
        ('other', 'Khác'),
    ]

    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unknown')
    description = models.TextField(blank=True, null=True)
    
    image_url = models.URLField(max_length=500, blank=True, null=True)  
    material = models.CharField(max_length=100, blank=True, null=True) 
    bridge_type = models.CharField(max_length=50, choices=BRIDGE_TYPES, default='other')
    
    length = models.FloatField(null=True, blank=True)  # mét
    width = models.FloatField(null=True, blank=True)   # mét
    district = models.CharField(max_length=100, blank=True, null=True)
    
    built_year = models.IntegerField(null=True, blank=True)
    center_point = models.PointField(null=True, blank=True)  
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
