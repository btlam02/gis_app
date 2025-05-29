from rest_framework.generics import ListAPIView
from .models import Bridge
from .serializers import BridgeSerializer

class BridgeListAPIView(ListAPIView):
    queryset = Bridge.objects.all()
    serializer_class = BridgeSerializer
