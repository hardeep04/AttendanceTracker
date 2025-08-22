from django.shortcuts import render, HttpResponse, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, logout, login
from django.contrib.auth.backends import ModelBackend
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password




# Create your views here.

def index(request):
    
    if request.user.is_anonymous:
        return redirect("/login")
    return render(request, 'index.html')

def loginUser(request):
    
    if request.method=="POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if not User.objects.filter(username=username).exists():
            return render(request, "login.html", {"error": "Username does not exists"})
        
        try:
            validate_password(password)
        except ValidationError as e:
            return render(request, "signup.html", {"error": e.messages[0]})
        
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("/")
        else:
            return render(request, 'login.html', {"error": "Incorrect password"})
    
    return render(request, 'login.html')

def logoutUser(request):
    logout(request)
    return redirect("/login")

def signupUser(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        password2 = request.POST.get("password2")

        if User.objects.filter(username=username).exists():
            return render(request, "signup.html", {"error": "Username already exists"})
        
        if password!=password2:
            return render(request, "signup.html", {"error": "Password didn't match"})

        try:
            validate_password(password)
        except ValidationError as e:
            return render(request, "signup.html", {"error": e.messages[0]})
        
        user = User.objects.create_user(username=username, password=password)
        user.save()
        user.backend = 'django.contrib.auth.backends.ModelBackend' 
        login(request, user)
        return redirect("/")

    return render(request, "signup.html")













from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Subject, Attendance
from .serializers import SubjectSerializer, AttendanceSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subject.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Attendance.objects.filter(subject__user=self.request.user)
