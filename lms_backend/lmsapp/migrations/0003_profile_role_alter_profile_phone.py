# Migration: add role to Profile, make phone optional for email-based login

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lmsapp', '0002_course_student_teacher_lesson_assignment_enrollment_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='role',
            field=models.CharField(
                choices=[('admin', 'Admin'), ('instructor', 'Instructor'), ('student', 'Student')],
                default='student',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='profile',
            name='phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
