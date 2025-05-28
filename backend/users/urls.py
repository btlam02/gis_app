from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserRegisterView, UserListView, UserDetailView, UserLoginView, UserLogoutView


urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),  # JWT login
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('users/', UserListView.as_view()),  # GET all users (admin only)
    path('users/<int:pk>/', UserDetailView.as_view()),  # GET/PUT/DELETE user
    
]





