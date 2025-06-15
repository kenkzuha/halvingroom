

from decimal import Decimal
from django import template

register = template.Library()

# app/templatetags/custom_filters.py (add this)
@register.filter
def smart_float(value):
    try:
        value = Decimal(str(value))
    except (TypeError, ValueError):
        return value
    
    if value == 0:
        return "0.0"
    
    if value < 0.0001:
        return format(value, '.8f').rstrip('0').rstrip('.') or '0.0'
    
    if value < 1:
        return format(value, '.6f').rstrip('0').rstrip('.') or '0.0'
    
    return format(value, ',.4f').rstrip('0').rstrip('.') or '0.0'   

@register.filter
def format_crypto_price(value):
    try:
        value = Decimal(str(value))
    except (TypeError, ValueError):
        return value

    if value >= 1:
        return f"{value:,.2f}"
    
    if value == 0:
        return "0.0"
    
    if value < Decimal('0.0001'):
        s = format(value, '.8f')
    else:
        s = format(value, '.6f')
    
    # Clean trailing zeros and ensure at least one decimal place
    s_clean = s.rstrip('0').rstrip('.')
    if '.' not in s_clean:
        s_clean += '.0'
    
    return s_clean