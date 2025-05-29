from django.urls import path
from .views import BridgeListAPIView

urlpatterns = [
    path('view/', BridgeListAPIView.as_view(), name='bridge-detail'),
]
