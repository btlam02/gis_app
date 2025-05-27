from django.contrib import admin
from django.urls import path, include

# api
from users.views import UserRegisterView

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/users/', include('users.urls')), 
    

]
