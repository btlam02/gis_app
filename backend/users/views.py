from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import User
from .serializers import UserSerializer
from django.shortcuts import get_object_or_404
from django.http import JsonResponse

# Create your views here.
class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            return JsonResponse({
                'message': 'Register successful!'
            }, status=status.HTTP_201_CREATED)

        else:
            return JsonResponse({
                'error_message': 'This email has already exist!',
                'errors_code': 400,
            }, status=status.HTTP_400_BAD_REQUEST)
        


# Danh sách user (admin-only)
class UserListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

# Xem/Sửa/Xoá user (user chính chủ hoặc admin)
class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self, pk):
        return get_object_or_404(User, pk=pk)

    def get(self, request, pk):
        user = self.get_object(pk)
        if request.user == user or request.user.is_superuser:
            serializer = UserSerializer(user)
            return Response(serializer.data)
        return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    def put(self, request, pk):
        user = self.get_object(pk)
        if request.user == user or request.user.is_superuser:
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if request.user.is_superuser:
            user.delete()
            return Response({'message': 'User deleted.'}, status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Only admin can delete users'}, status=status.HTTP_403_FORBIDDEN)
