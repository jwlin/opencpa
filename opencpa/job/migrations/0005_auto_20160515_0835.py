# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('job', '0004_jobtrend_level'),
    ]

    operations = [
        migrations.AddField(
            model_name='currentjob',
            name='is_resume_required',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='job',
            name='is_resume_required',
            field=models.BooleanField(default=False),
        ),
    ]
