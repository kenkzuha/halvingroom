import requests
from django.shortcuts import render, redirect
from django.contrib.auth.models import User, auth
from django.contrib import messages
from .models import UserAsset

def index(request):
    user_assets = []
    total_value = 0.00
    if request.user.is_authenticated:
        user_assets = UserAsset.objects.filter(user=request.user)  # Fetch user's assets
        total_value = sum(asset.value for asset in user_assets)  # Calculate total value
    return render(request, 'index.html', {
        'current_user': request.session.get('site_user'),
        'user_assets': user_assets,
        'total_value': total_value  # Pass total value to the template
    })

def add_asset(request):
    if request.method == "POST":
        symbol = request.POST['symbol']
        holdings = float(request.POST['holdings'])

        # Fetch real-time price from Binance API
        response = requests.get(f'https://api.binance.com/api/v3/ticker/price?symbol={symbol}USDT')
        if response.status_code == 200:
            price_data = response.json()
            price = float(price_data['price'])
            value = holdings * price

            # Save the asset to the database
            user_asset = UserAsset(user=request.user, symbol=symbol, holdings=holdings, value=value, price=price)  # Ensure price is included
            user_asset.save()
            return redirect('index')  # Redirect to the index page after adding the asset
        else:
            messages.error(request, 'Failed to fetch the price. Please try again.')
            return redirect('index')

    return redirect('index')  # Redirect if not a POST request


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
