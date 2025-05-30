import requests
from django.shortcuts import render, redirect
from django.contrib.auth.models import User, auth
from django.contrib import messages
from .models import UserAsset
from decimal import Decimal
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def get_price_change_percent(symbol):
    url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol}"
    response = requests.get(url)
    data = response.json()
    return float(data['priceChangePercent'])

def index(request):
    user_assets = []
    total_value = Decimal('0.00')
    asset_percentages = []
    
    if request.user.is_authenticated:
        # Fetch user's assets
        user_assets = UserAsset.objects.filter(user=request.user)
        
        # Update prices from API if requested
        if request.GET.get('refresh_prices') == 'true':
            for asset in user_assets:
                update_asset_price(asset)
            
            # Refetch assets after price update
            user_assets = UserAsset.objects.filter(user=request.user)
        
        # Calculate total value
        total_value = sum(asset.value for asset in user_assets)
        
        # Calculate asset percentages for allocation display
        if total_value > 0:
            for asset in user_assets:
                percentage = (asset.value / total_value) * 100
                asset_percentages.append({
                    'symbol': asset.symbol,
                    'percentage': percentage
                })
            
            # Sort asset percentages from big to small
            asset_percentages.sort(key=lambda x: x['percentage'], reverse=True)
    
    return render(request, 'index.html', {
        'user_assets': user_assets,
        'total_value': total_value,
        'asset_percentages': asset_percentages
    })

def edit_asset(request):
    if request.method == "POST" and request.user.is_authenticated:
        asset_id = request.POST['asset_id']
        holdings = Decimal(request.POST['holdings'])
        
        # Validate holdings
        if holdings <= 0:
            messages.error(request, 'Holdings must be a positive number.')
            return redirect('index')
        
        # Update the asset
        asset = UserAsset.objects.get(id=asset_id, user=request.user)
        asset.holdings = holdings
        asset.value = asset.holdings * asset.price  # Update value based on new holdings
        asset.save()
        messages.success(request, f'Updated {asset.symbol} holdings to {holdings}.')
        
    return redirect('index')

def delete_asset(request):
    if request.method == "POST" and request.user.is_authenticated:
        asset_id = request.POST['asset_id']
        
        # Delete the asset
        asset = UserAsset.objects.get(id=asset_id, user=request.user)
        asset.delete()
        messages.success(request, f'Deleted {asset.symbol} from your portfolio.')
        
    return redirect('index')


def update_asset_price(asset):
    """Update the price and value of an asset from the Binance API"""
    try:
        response = requests.get(f'https://api.binance.com/api/v3/ticker/price?symbol={asset.symbol}USDT')
        
        if response.status_code == 200:
            price_data = response.json()
            price = Decimal(price_data['price'])
            
            asset.price = price
            asset.value = asset.holdings * price
            asset.save()
            return True
        return False
    except Exception:
        return False

@csrf_exempt  # Only for testing - you should use proper CSRF protection in production
def refresh_prices(request):
    """API endpoint to refresh all asset prices"""
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'Not authenticated'}, status=401)
        
    if request.method == 'POST':
        assets = UserAsset.objects.filter(user=request.user)
        updated_count = 0
        
        # Update each asset's price
        for asset in assets:
            if update_asset_price(asset):
                updated_count += 1
                
        # Calculate new total
        total_value = sum(asset.value for asset in UserAsset.objects.filter(user=request.user))
                
        return JsonResponse({
            'success': True, 
            'updated_count': updated_count,
            'total_value': float(total_value)
        })
        
    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=400)

def add_asset(request):
    if request.method == "POST" and request.user.is_authenticated:
        symbol = request.POST['symbol']
        holdings = Decimal(request.POST['holdings'])
        
        # Validation for holdings
        if holdings <= 0:
            messages.error(request, 'Holdings must be a positive number.')
            return redirect('index')
        
        try:
            # Try to fetch real-time price from Binance API
            response = requests.get(f'https://api.binance.com/api/v3/ticker/price?symbol={symbol}USDT')
            
            if response.status_code == 200:
                price_data = response.json()
                price = Decimal(price_data['price'])
            else:
                # Fallback prices if API fails
                fallback_prices = {
                    'BTC': Decimal('103000'),
                    'ETH': Decimal('2500'),
                    'SOL': Decimal('170'),
                    'BNB': Decimal('650'),
                    'XRP': Decimal('2.35'),
                    'PEPE': Decimal('0.00001444'),
                    'USDT': Decimal('1')
                }
                price = fallback_prices.get(symbol, Decimal('0'))
                messages.warning(request, f'Could not fetch live price for {symbol}. Using fallback price.')
            
            # Calculate value
            value = holdings * price
            
            # Check if asset already exists for the user
            existing_asset = UserAsset.objects.filter(user=request.user, symbol=symbol).first()
            
            if existing_asset:
                # Update existing asset
                existing_asset.holdings += holdings
                existing_asset.value = existing_asset.holdings * price
                existing_asset.price = price  # Update with latest price
                existing_asset.save()
                messages.success(request, f'Added {holdings} {symbol} to your existing holdings.')
            else:
                # Create new asset
                new_asset = UserAsset(
                    user=request.user,
                    symbol=symbol,
                    holdings=holdings,
                    value=value,
                    price=price
                )
                new_asset.save()
                messages.success(request, f'Added {holdings} {symbol} to your portfolio.')
                
        except Exception as e:
            messages.error(request, f'Error adding asset: {str(e)}')
            
    return redirect('index')

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