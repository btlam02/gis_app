from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Bridge, BridgeSegment
from rest_framework import serializers

class BridgeSegmentGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = BridgeSegment
        geo_field = "geometry"
        fields = ['id', 'segment_name', 'order']

class BridgeSerializer(serializers.ModelSerializer):
    segments = BridgeSegmentGeoSerializer(many=True, read_only=True)
    center_point = serializers.SerializerMethodField()

    class Meta:
        model = Bridge
        fields = ['id', 'name', 'status', 'description', 'center_point', 'built_year', 'updated_at', 'segments']

    def get_center_point(self, obj):
        if obj.center_point:
            return {
                "type": "Point",
                "coordinates": [obj.center_point.x, obj.center_point.y]  
            }
        return None
