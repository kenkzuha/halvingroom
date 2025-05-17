from django.db import models
from django.contrib.auth.models import User
class UserAsset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=10)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    holdings = models.DecimalField(max_digits=10, decimal_places=4)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    def __str__(self):
        return f"{self.name} ({self.symbol})"