from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lmsapp', '0004_add_avatar_url_to_profile'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='avatars/', help_text='Profile picture'),
        ),
    ]
