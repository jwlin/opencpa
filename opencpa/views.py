# vim: set ts=4 sw=4 et: -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import HttpResponse
from datetime import datetime, timedelta, date
from opencpa.models import *
from django.db.models import Count
from django.core import serializers
import os
import urllib2
import re
import myutil 
import json

xml_url = 'http://web3.dgpa.gov.tw/WANT03FRONT/AP/WANTF00003.aspx?GETJOB=Y'

def index(request):
    #return HttpResponse("BLAST Page: create.")
    """
	check today == last update
	if yes, 
		display from db
		read from current_job
		select form job_history, work_quality. qork_item
	if not, 
		read xml
		for each row in xml
			get job id (compare with job_repo)
			put job id and other in current_job
			put job id and date_from date_to in job_history
    """
    if request.method == 'GET':
        # ensure data in CurrentJob is up to date
        twDate = (datetime.utcnow() + timedelta(hours=8)).date()
        ur = UpdateRecord.objects.all()[0]
        if twDate != ur.last_update_day: # data is old, update them
            xml_jobs = myutil.getxml(xml_url)
            CurrentJob.objects.all().delete()
            for xml_job in xml_jobs:
                c_job = CurrentJob()
                c_job.title = xml_job['title']
                c_job.sysnam = xml_job['sysnam']
                c_job.org_name = xml_job['org_name']
                c_job.person_kind = xml_job['person_kind']
                c_job.rank_from = int(xml_job['rank']['from'])
                c_job.rank_to = int(xml_job['rank']['to'])
                c_job.work_quality = xml_job['work_quality']
                c_job.work_item = xml_job['work_item']

                # get the unique job_id of this job
                c_job.job, created = Job.objects.get_or_create(
                    title = c_job.title,
                    sysnam = c_job.sysnam,
                    org_name = c_job.org_name,
                    person_kind = c_job.person_kind,
                    rank_from = c_job.rank_from,
                    rank_to = c_job.rank_to,
                    work_quality = c_job.work_quality,
                    work_item = c_job.work_item
                )
                
                searchObj = re.search( r'(\d+)', xml_job['num'], re.M|re.I)
                if searchObj:
                    c_job.num = int(searchObj.group())
                else:
                    c_job.num = 0
                
                c_job.gender = xml_job['gender']
                c_job.work_places_id = xml_job['work_places'][0]
                c_job.date_from = xml_job['date_from']
                c_job.date_to = xml_job['date_to']
                c_job.is_handicap = xml_job['is_handicap']
                c_job.is_orig = xml_job['is_orig']
                c_job.is_local_orig = xml_job['is_local_orig']
                c_job.is_training = xml_job['is_training']
                c_job.job_type = xml_job['type']
                c_job.email = xml_job['email']
                c_job.work_quality = xml_job['work_quality']
                #c_job.work_item = xml_job['work_item']
                c_job.work_addr = xml_job['work_addr']
                c_job.contact = xml_job['contact']
                c_job.url = xml_job['url']
                c_job.view_url = xml_job['view_url']
                
                if ( c_job.date_to <= (twDate + timedelta(days=3)) ):
                    c_job.isExpiring = True
                else:
                    c_job.isExpiring = False

                job_his, created = JobHistory.objects.get_or_create(
                    job = c_job.job,
                    date_from = c_job.date_from,
                    date_to = c_job.date_to
                )

                c_job.history_count = JobHistory.objects.filter(job = c_job.job).count()

                c_job.save()

            ur.last_update_day = twDate
            ur.save()
        
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
            'opencpa/result.html', {
            'jobdata': jobdata,
            'historydata': historydata,
            'sysdata': sysdata,
            'placedata': json.dumps(placedata),
            'twDate': twDate.strftime('%Y/%m/%d'),
        })
        
    elif request.method == 'POST':
        return HttpResponse("Invalid Request")
    
def about(request):
    return render(request, 'opencpa/about.html')
