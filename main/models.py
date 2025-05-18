from django.db import models
from django.contrib.auth.models import User

class UserAsset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=10)
    holdings = models.DecimalField(max_digits=20, decimal_places=10)
    value = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    price = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.user.username} - {self.symbol}"
