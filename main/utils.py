# utils.py
from django.utils import timezone
from .models import PortfolioSnapshot
from decimal import Decimal

def take_portfolio_snapshot(user):
    """
    Takes a snapshot of the user's current portfolio value
    """
    assets = user.userasset_set.all()
    total_value = sum(asset.value for asset in assets)
    
    if total_value > 0:
        PortfolioSnapshot.objects.create(
            user=user,
            total_value=total_value
        )
        return True
    return False

def fetch_historical_data(user, period='24h'):
    """
    Fetches historical portfolio data for the given period
    Returns: {'labels': [], 'data': [], 'min': float, 'max': float}
    """
    now = timezone.now()
    
    if period == '24h':
        start_time = now - timezone.timedelta(hours=24)
        time_format = '%H:%M'
    elif period == '7d':
        start_time = now - timezone.timedelta(days=7)
        time_format = '%m/%d'
    elif period == '30d':
        start_time = now - timezone.timedelta(days=30)
        time_format = '%m/%d'
    else:  # all
        start_time = None
        time_format = '%m/%d'
    
    snapshots = PortfolioSnapshot.objects.filter(user=user)
    if start_time:
        snapshots = snapshots.filter(timestamp__gte=start_time)
    
    snapshots = snapshots.order_by('timestamp')
    
    labels = [s.timestamp.strftime(time_format) for s in snapshots]
    data = [float(s.total_value) for s in snapshots]
    
    if not data:
        return {
            'labels': [],
            'data': [],
            'min': 0,
            'max': 100
        }
    
    return {
        'labels': labels,
        'data': data,
        'min': min(data) * 0.98,
        'max': max(data) * 1.02
    }