# Generated by Django 5.2.1 on 2025-05-17 18:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_remove_userasset_name_remove_userasset_price_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userasset',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=20),
        ),
    ]
