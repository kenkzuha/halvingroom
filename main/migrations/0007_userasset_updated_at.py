# Generated by Django 5.2.2 on 2025-06-14 09:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0006_userasset_created_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='userasset',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
