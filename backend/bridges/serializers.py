# bridges/serializers.py

from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Bridge, BridgeSegment
import uuid
import mimetypes
import cloudinary.uploader  # sử dụng Cloudinary
from django.contrib.gis.geos import GEOSGeometry 


class BridgeSegmentGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = BridgeSegment
        geo_field = "geometry"
        fields = ['id', 'segment_name', 'order']

class BridgeSerializer(serializers.ModelSerializer):
    segments = BridgeSegmentGeoSerializer(many=True, required=False)
    image = serializers.ImageField(write_only=True, required=False)
    center_point = serializers.SerializerMethodField()
    center_point_wkt = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Bridge
        fields = [
            'id', 'name', 'status', 'description', 'image_url', 'material',
            'bridge_type', 'length', 'width', 'district',
            'built_year', 'updated_at',
            'center_point',        # read-only
            'center_point_wkt',    # write-only
            'segments', 'image'
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

    def create(self, validated_data):  # ✅ Đặt đúng chỗ bên trong class
        image = validated_data.pop('image', None)
        center_point_wkt = validated_data.pop('center_point_wkt', None)
        segments_data = self.initial_data.get('segments', [])

        if center_point_wkt:
            try:
                validated_data['center_point'] = GEOSGeometry(center_point_wkt)
            except Exception as e:
                raise serializers.ValidationError({
                    "center_point": f"Không thể chuyển WKT: {str(e)}"
                })

        bridge = Bridge.objects.create(**validated_data)

        if image:
            bridge.image_url = self.upload_to_cloudinary(image, bridge.name)
            bridge.save()

        if segments_data: 
            import json
            segments = json.loads(segments_data) if isinstance(segments_data, str) else segments_data
            for segment in segments:
                geometry_data = segment.get("geometry")
                if geometry_data:
                    try:
                        geometry = GEOSGeometry(json.dumps(geometry_data))
                        BridgeSegment.objects.create(
                            bridge=bridge,
                            geometry=geometry,
                            segment_name=segment.get("segment_name", ""),
                            order=segment.get("order", 0)
                        )
                    except Exception as e:
                        raise serializers.ValidationError({
                            "segments": f"Lỗi chuyển geometry: {str(e)}"
                        })

        return bridge

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        center_point_wkt = validated_data.pop('center_point_wkt', None)

        if center_point_wkt:
            try:
                instance.center_point = GEOSGeometry(center_point_wkt)
            except Exception as e:
                raise serializers.ValidationError({
                    "center_point": f"Lỗi chuyển đổi WKT: {str(e)}"
                })

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if image:
            instance.image_url = self.upload_to_cloudinary(image, instance.name)

        instance.save()
        return instance