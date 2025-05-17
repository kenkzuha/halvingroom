from django.shortcuts import render, redirect
from django.contrib.auth.models import User, auth
from django.contrib import messages
from .models import UserAsset  # Import the UserAsset model
def index(request):
    user_assets = []
    if request.user.is_authenticated:
        user_assets = UserAsset.objects.filter(user=request.user)  # Fetch user's assets
    return render(request, 'index.html', {
        'current_user': request.session.get('site_user'),
        'user_assets': user_assets  # Pass user assets to the template
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

def add_asset(request):
    if request.method == "POST":
        name = request.POST['name']
        symbol = request.POST['symbol']
        price = request.POST['price']
        holdings = request.POST['holdings']
        value = float(price) * float(holdings)  # Calculate the total value
        # Create a new asset for the user
        user_asset = UserAsset(user=request.user, name=name, symbol=symbol, price=price, holdings=holdings, value=value)
        user_asset.save()
        return redirect('/')  # Redirect to the index page after adding the asset
    return render(request, 'add_asset.html')  # Render a form to add asset if GET request