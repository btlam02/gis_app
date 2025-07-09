from django.urls import path
from .views import BridgeListCreateAPIView, BridgeDetailAPIView

urlpatterns = [
    path('', BridgeListCreateAPIView.as_view(), name='bridge-list'),         # /api/bridges/
    path('<int:pk>/', BridgeDetailAPIView.as_view(), name='bridge-detail'),  # /api/bridges/1/
]