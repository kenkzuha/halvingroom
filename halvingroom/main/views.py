from django.shortcuts import render, redirect
from django.contrib.auth.models import User, auth
from django.contrib import messages

# Create your views here.
def index(request):
    return render(request, 'index.html', {
        'current_user': request.session.get('site_user')
    })

def signup(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        confirm = request.POST['confirmPassword']

        if password == confirm:
            if User.objects.filter(username=username).exists():
                messages.info(request, 'Username already Used')
                return redirect('signup')
            else:
                user = User.objects.create_user(username=username, password=password)
                user.save()
                return redirect('login')

    return render(request, 'signup.html')

def login(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(username=username, password=password)

        if user is not None:
            auth.login(request, user)
            return redirect('/')
        else:
            messages.info(request, 'Username/Password invalid')
            return redirect('login')
        
    return render(request, 'login.html')   

def logout(request):
    auth.logout(request)
    return redirect('/')