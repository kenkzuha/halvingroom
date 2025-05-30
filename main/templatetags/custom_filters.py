# main/templatetags/custom_filters.py

from decimal import Decimal
from django import template

register = template.Library()

@register.filter
def smart_float(value):
    """Remove trailing zeros and unnecessary decimal points"""
    if isinstance(value, (int, float, Decimal)):
        formatted = f"{float(value):.8f}".rstrip('0').rstrip('.')
        return formatted
    return value
