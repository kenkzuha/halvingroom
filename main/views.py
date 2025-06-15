import requests
from django.shortcuts import render, redirect
from django.contrib.auth.models import User, auth
from django.contrib import messages
from .models import UserAsset
from decimal import Decimal
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse # Make sure HttpResponse is imported

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
        user_assets = UserAsset.objects.filter(user=request.user)
        
        # This part handles a manual refresh via a GET parameter (e.g., ?refresh_prices=true)
        # It's kept here as it's part of your existing logic.
        if request.GET.get('refresh_prices') == 'true':
            for asset in user_assets:
                update_asset_price(asset)
            
            user_assets = UserAsset.objects.filter(user=request.user) # Re-fetch updated assets
            
        user_assets = sorted(user_assets, key=lambda asset: asset.value, reverse=True)
        total_value = sum(asset.value for asset in user_assets)
        
        if total_value > 0:
            for asset in user_assets:
                percentage = (asset.value / total_value) * 100
                asset_percentages.append({
                    'symbol': asset.symbol,
                    'percentage': percentage
                })
            
            asset_percentages.sort(key=lambda x: x['percentage'], reverse=True)
    
    # Create the HttpResponse object by rendering your template
    response = render(request, 'index.html', { # 'index.html' confirmed as your template name
        'user_assets': user_assets,
        'total_value': total_value,
        'asset_percentages': asset_percentages
    })
    
    # Add the Refresh header to trigger a full page reload every 5 minutes (300 seconds)
    # You can change '300' to any other interval in seconds.
    response['Refresh'] = '30' 

    return response

def edit_asset(request):
    if request.method == "POST" and request.user.is_authenticated:
        asset_id = request.POST['asset_id']
        holdings = Decimal(request.POST['holdings'])
        
        if holdings <= 0:
            messages.error(request, 'Holdings must be a positive number.')
            return redirect('index')
        asset = UserAsset.objects.get(id=asset_id, user=request.user)
        asset.holdings = holdings
        asset.value = asset.holdings * asset.price
        asset.save()
        messages.success(request, f'Updated {asset.symbol} holdings to {holdings}.')
        
    return redirect('index')

def delete_asset(request):
    if request.method == "POST" and request.user.is_authenticated:
        asset_id = request.POST['asset_id']
        asset = UserAsset.objects.get(id=asset_id, user=request.user)
        asset.delete()
        messages.success(request, f'Deleted {asset.symbol} from your portfolio.')
        
    return redirect('index')

def update_asset_price(asset):
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
@csrf_exempt
def refresh_prices(request):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'Not authenticated'}, status=401)
        
    if request.method == 'POST':
        assets = UserAsset.objects.filter(user=request.user)
        updated_count = 0
        
        for asset in assets:
            if update_asset_price(asset):
                updated_count += 1
                
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
        
        if holdings <= 0:
            messages.error(request, 'Holdings must be a positive number.')
            return redirect('index')
        
        try:
            response = requests.get(f'https://api.binance.com/api/v3/ticker/price?symbol={symbol}USDT')
            
            if response.status_code == 200:
                price_data = response.json()
                price = Decimal(price_data['price'])
            else:
                fallback_prices = {
                    'BTC': Decimal('103000'),
                    'ETH': Decimal('2500'),
                    'SOL': Decimal('170'),
                    'BNB': Decimal('650'),
                    'XRP': Decimal('2.35'),
                    'PEPE': Decimal('0.00001444'),
                    'USDT': Decimal('1'),
                    'SUI': Decimal('3')
                }
                price = fallback_prices.get(symbol, Decimal('0'))
                messages.warning(request, f'Could not fetch live price for {symbol}. Using fallback price.')
            
            value = holdings * price
            
            existing_asset = UserAsset.objects.filter(user=request.user, symbol=symbol).first()
            
            if existing_asset:
                existing_asset.holdings += holdings
                existing_asset.value = existing_asset.holdings * price
                existing_asset.price = price
                existing_asset.save()
                messages.success(request, f'Added {holdings} {symbol} to your existing holdings.')
            else:
                new_asset = UserAsset(
                    user=request.user,
                    symbol=symbol,
                    holdings=holdings,
                    value=value,
                    price=price
                )
                try: 
                    new_asset.save()
                    messages.success(request, f'Added {holdings} {symbol} to your portfolio.')
                except Exception as e:
                    messages.error(request, f"Error saving new asset: {str(e)}")
                
                
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