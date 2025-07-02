# users/urls.py
from django.urls import path
from .views import (
    UserRegisterView, UserLoginView, UserLogoutView,
    UserListView, UserDetailView
)

urlpatterns = [
    path('register/', UserRegisterView.as_view()),
    path('login/', UserLoginView.as_view()),
    path('logout/', UserLogoutView.as_view()),
    path('users/', UserListView.as_view()),
    path('users/<int:pk>/', UserDetailView.as_view()),
]
