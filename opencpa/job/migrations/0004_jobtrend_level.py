# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('job', '0003_job_work_addr'),
    ]

    operations = [
        migrations.AddField(
            model_name='jobtrend',
            name='level',
            field=models.PositiveSmallIntegerField(default=3, choices=[(1, '\u7c21\u4efb'), (2, '\u85a6\u4efb'), (3, '\u59d4\u4efb')]),
        ),
    ]
