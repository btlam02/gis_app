# bridges/serializers.py

from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Bridge, BridgeSegment
import uuid
import mimetypes
import cloudinary.uploader  # sử dụng Cloudinary

class BridgeSegmentGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = BridgeSegment
        geo_field = "geometry"
        fields = ['id', 'segment_name', 'order']

class BridgeSerializer(serializers.ModelSerializer):
    segments = BridgeSegmentGeoSerializer(many=True, read_only=True)
    image = serializers.ImageField(write_only=True, required=False)
    center_point = serializers.SerializerMethodField()

    class Meta:
        model = Bridge
        fields = [
            'id', 'name', 'status', 'description', 'image_url', 'material',
            'bridge_type', 'length', 'width', 'district',
            'built_year', 'updated_at', 'center_point', 'segments', 'image'
        ]
        read_only_fields = ['image_url', 'updated_at', 'segments', 'center_point']

    def get_center_point(self, obj):
        if obj.center_point:
            return {
                "type": "Point",
                "coordinates": [obj.center_point.x, obj.center_point.y]
            }
        return None

    def upload_to_cloudinary(self, image, bridge_name):
        result = cloudinary.uploader.upload(
            image,
            folder="bridges",
            public_id=f"{bridge_name}_{uuid.uuid4()}",
            resource_type="image"
        )
        return result.get("secure_url")

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        bridge = Bridge.objects.create(**validated_data)
        if image:
            bridge.image_url = self.upload_to_cloudinary(image, bridge.name)
            bridge.save()
        return bridge

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if image:
            instance.image_url = self.upload_to_cloudinary(image, instance.name)
        instance.save()
        return instance
