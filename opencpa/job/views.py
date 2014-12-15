# vim: set ts=4 sw=4 et: -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import HttpResponse
from datetime import datetime, timedelta, date
from django.db.models import Count
from django.core import serializers
from .models import *
import os
import urllib2
import re
import myutil 
import json

#xml_url = 'http://web3.dgpa.gov.tw/WANT03FRONT/AP/WANTF00003.aspx?GETJOB=Y'

def index(request):
    if request.method == 'GET':
        
        # retrieve and display data in CurrentJob
        jobdata = serializers.serialize('json', CurrentJob.objects.all())

        # retrieve jobhistory for count >= 2 and job_id in current job list
        reopenjobs = JobHistory.objects.values('job_id').annotate(total=Count('id')).filter(total__gt=1).order_by('-total')
        hisjob_list = []
        currentjob_list = list(CurrentJob.objects.values('job_id'))
        for job in reopenjobs:
            if {'job_id': job['job_id']} in currentjob_list:
                hisjob_dates = list(JobHistory.objects.values('date_from', 'date_to').filter(job_id=job['job_id']))
                hisjob_list.append([job['job_id'], hisjob_dates])
        
        dthandler = lambda obj: (
            obj.isoformat() if isinstance(obj, date) else None
        )
        historydata = json.dumps(hisjob_list, default=dthandler)

        # count sysname, order by counts DESC, and categorize by tech or admin type
        c_sysnams = CurrentJob.objects.values('sysnam').annotate(total=Count('id')).order_by('-total')
        syslist = [[],[]] # syslist[0] for admin, syslist[1] for tech
        for c_sys in c_sysnams:
            syslist[ myutil.judge_type(c_sys['sysnam']) ].append(
                c_sys['sysnam'] + ' ('+ str(c_sys['total']) + ')'
            )
        sysdata = json.dumps(syslist)

        places = WorkPlace.objects.values('work_place_id', 'work_place_name')
        placedata = {}
        for place in places:
            placedata[place['work_place_id']] = place['work_place_name']

        return render(
            request,
            'job/result.html', {
            'jobdata': jobdata,
            'historydata': historydata,
            'sysdata': sysdata,
            'placedata': json.dumps(placedata),
            'twDate': UpdateRecord.objects.all()[0].last_update_day.strftime('%Y/%m/%d'),
        })
        
    elif request.method == 'POST':
        return HttpResponse("Invalid Request")
    
def about(request):
    return render(request, 'job/about.html')
