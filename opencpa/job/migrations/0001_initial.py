# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CurrentJob',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=200)),
                ('sysnam', models.CharField(max_length=200)),
                ('org_name', models.CharField(max_length=200)),
                ('person_kind', models.CharField(max_length=50)),
                ('rank_from', models.PositiveSmallIntegerField()),
                ('rank_to', models.PositiveSmallIntegerField()),
                ('num', models.PositiveSmallIntegerField()),
                ('gender', models.CharField(max_length=50)),
                ('work_places_id', models.CommaSeparatedIntegerField(max_length=500)),
                ('date_from', models.DateField()),
                ('date_to', models.DateField()),
                ('is_handicap', models.BooleanField()),
                ('is_orig', models.BooleanField()),
                ('is_local_orig', models.BooleanField()),
                ('is_training', models.BooleanField()),
                ('job_type', models.CharField(max_length=50)),
                ('email', models.CharField(max_length=1000, null=True)),
                ('work_quality', models.CharField(max_length=3000)),
                ('work_item', models.CharField(max_length=1000, null=True)),
                ('work_addr', models.CharField(max_length=200, null=True)),
                ('contact', models.CharField(max_length=3000, null=True)),
                ('url', models.CharField(max_length=100, null=True)),
                ('view_url', models.CharField(max_length=200)),
                ('isExpiring', models.BooleanField()),
                ('history_count', models.PositiveSmallIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=200)),
                ('sysnam', models.CharField(max_length=200)),
                ('org_name', models.CharField(max_length=200)),
                ('person_kind', models.CharField(max_length=50)),
                ('rank_from', models.PositiveSmallIntegerField()),
                ('rank_to', models.PositiveSmallIntegerField()),
                ('work_quality', models.CharField(max_length=3000)),
                ('work_item', models.CharField(max_length=1000, null=True)),
                ('work_addr', models.CharField(max_length=200, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='JobHistory',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date_from', models.DateField()),
                ('date_to', models.DateField()),
                ('job', models.ForeignKey(to='job.Job')),
            ],
        ),
        migrations.CreateModel(
            name='JobMessage',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('message', models.CharField(max_length=200)),
                ('last_modified', models.DateTimeField(auto_now=True)),
                ('password', models.CharField(max_length=20)),
                ('job', models.ForeignKey(to='job.Job')),
            ],
        ),
        migrations.CreateModel(
            name='JobTrend',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('sysnam', models.CharField(max_length=100)),
                ('date', models.DateField()),
                ('num', models.PositiveSmallIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='UpdateRecord',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('last_update_day', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='WorkPlace',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('work_place_id', models.PositiveSmallIntegerField()),
                ('work_place_name', models.CharField(max_length=30)),
            ],
        ),
        migrations.AddField(
            model_name='currentjob',
            name='job',
            field=models.ForeignKey(to='job.Job'),
        ),
    ]
