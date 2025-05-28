from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken


from .models import User
from .serializers import UserSerializer, UserLoginSerializer

# Create your views here.
class UserRegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            return JsonResponse({
                'message': 'Đăng ký thành công!'
            }, status=status.HTTP_201_CREATED)

        else:
            return JsonResponse({
                'error_message': 'Email đã được sử dụng để đăng ký',
                'errors_code': 400,
            }, status=status.HTTP_400_BAD_REQUEST)
        

class UserLoginView(APIView): 
    def post(self, request): 
        serializer= UserLoginSerializer(data = request.data)
 
        if serializer.is_valid():
            user = authenticate(
                request,
                username = serializer.validated_data['email'],
                password = serializer.validated_data['password'],
            )
            if user:
                refresh = TokenObtainPairSerializer.get_token(user)
                data = {
                'email': user.email, 
                'refresh_token': str(refresh),
                'access_token': str(refresh.access_token),
                'access_expires': int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                'refresh_expires': int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
                }
                return Response(data, status = status.HTTP_200_OK)
        
            return Response({
                'error_message': 'Thông tin xác thực không hợp lệ',
                'errors_code': 401,
            }, status=status.HTTP_401_UNAUTHORIZED)
    
        return Response({
        'error_message':serializer.errors,
        'errors_code': 400,
        }, status=status.HTTP_400_BAD_REQUEST)


# class UserLoginView(APIView): 
#     def post(self, request): 
#         serializer = UserLoginSerializer(data=request.data)
#         if serializer.is_valid():
#             user = authenticate(
#                 request,
#                 username=serializer.validated_data['email'],
#                 password=serializer.validated_data['password'],
#             )
#             if user:
#                 refresh = TokenObtainPairSerializer.get_token(user)
#                 access_token = str(refresh.access_token)
#                 refresh_token = str(refresh)

#                 response = JsonResponse({'email': user.email}, status=status.HTTP_200_OK)

#                 # Set HTTP-only cookies
#                 response.set_cookie(
#                     key='access_token',
#                     value=access_token,
#                     httponly=True,
#                     secure=True,  # nên dùng True nếu bạn dùng HTTPS
#                     samesite='Lax'
#                 )
#                 response.set_cookie(
#                     key='refresh_token',
#                     value=refresh_token,
#                     httponly=True,
#                     secure=True,
#                     samesite='Lax'
#                 )
#                 return response

#             return Response({'error': 'Thông tin xác thực không hợp lệ'}, status=401)
#         return Response(serializer.errors, status=400)   

class UserLogoutView(APIView): 
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
            try:
                refresh_token = request.data["refresh"]
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(status=status.HTTP_205_RESET_CONTENT)
            except Exception as e:
                return Response(status=status.HTTP_400_BAD_REQUEST)

# class UserLogoutView(APIView): 
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request):
#         try:
#             refresh_token = request.COOKIES.get("refresh_token")
#             token = RefreshToken(refresh_token)
#             token.blacklist()

#             response = Response({"message": "Đã đăng xuất"}, status=205)
#             response.delete_cookie('access_token')
#             response.delete_cookie('refresh_token')
#             return response
#         except Exception as e:
#             return Response(status=400)


# DS Users (Admin)
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
            return Response({'message': 'Đã xoá người dùng'}, status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Phân quyền chỉ cho Admin'}, status=status.HTTP_403_FORBIDDEN)
