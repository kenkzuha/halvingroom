from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('login/', views.login, name="login"),
    path('signup/', views.signup, name="signup"),
    path('logout/', views.logout, name='logout'),
    path('add_asset/', views.add_asset, name='add_asset'),
    path('refresh_prices', views.refresh_prices, name='refresh_prices'),
    path('edit_asset/', views.edit_asset, name='edit_asset'),  
    path('delete_asset/', views.delete_asset, name='delete_asset'), 
    
]