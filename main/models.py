from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserAsset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=10)
    holdings = models.DecimalField(max_digits=20, decimal_places=10)
    value = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    price = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.symbol}"


class Activity(models.Model):
    ACTION_CHOICES = [
        ('add', 'Added'),
        ('edit', 'Edited'),
        ('delete', 'Deleted'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    symbol = models.CharField(max_length=10)
    quantity = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)
    value = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Activities'

    def __str__(self):
        return f"{self.user.username} {self.get_action_display()} {self.quantity} {self.symbol}"

class PortfolioSnapshot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_value = models.DecimalField(max_digits=20, decimal_places=2)
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.total_value} at {self.timestamp}"