# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('job', '0002_remove_job_work_addr'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='work_addr',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
