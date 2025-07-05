from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Bridge
from .serializers import BridgeSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'

class BridgeListCreateAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        bridges = Bridge.objects.all()
        serializer = BridgeSerializer(bridges, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BridgeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BridgeDetailAPIView(APIView):
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, pk):
        return get_object_or_404(Bridge, pk=pk)

    def get(self, request, pk):
        bridge = self.get_object(pk)
        serializer = BridgeSerializer(bridge)
        return Response(serializer.data)

    def put(self, request, pk):
        bridge = self.get_object(pk)
        serializer = BridgeSerializer(bridge, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        bridge = self.get_object(pk)
        bridge.delete()
        return Response({'message': 'Đã xoá cầu'}, status=status.HTTP_204_NO_CONTENT)
