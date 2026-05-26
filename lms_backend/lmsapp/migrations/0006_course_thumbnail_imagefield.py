from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lmsapp', '0005_add_avatar_imagefield_to_profile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='thumbnail',
            field=models.ImageField(blank=True, null=True, upload_to='thumbnails/', help_text='Course cover image'),
        ),
    ]
