# vim: set ts=4 sw=4 et: -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.core.urlresolvers import reverse
from datetime import datetime, timedelta, date
from django.db.models import Count
from django.forms.models import model_to_dict
from django.core import serializers
from django.utils.html import escape
from django.contrib.auth.hashers import make_password, check_password
from .models import *
import myutil 
import json

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

        '''
        with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), 'messages.json'), 'r') as f:
            messages = json.load(f)
            if messages:
                messages = list(messages['messages'])
        '''
        messages = []
        curJobIds = CurrentJob.objects.all().values('job_id')
        jmsgs = JobMessage.objects.all().filter(job__id__in=curJobIds).order_by('-last_modified')[:5]
        for jmsg in jmsgs:
            j = CurrentJob.objects.get(job__id=jmsg.job.id)
            jobname = j.org_name + ' / ' + j.title
            if len(jobname) > 25: 
                jobname = jobname[:25] + '..'
            messages.append({
                'content': jmsg.message[:50] + '..' if len(jmsg.message) > 30 else jmsg.message,
                'jobid': jmsg.job.id,
                'jobname': jobname,
            })

        # top rank jobs
        tJobs = CurrentJob.objects.all().order_by("-rank_to")[:30]
        toprank = 100
        for tJob in tJobs:
            if tJob.rank_to > 14:
                continue
            else:
                toprank = tJob.rank_to
                break
        tJobs = CurrentJob.objects.filter(rank_to=toprank).order_by('-rank_from')

        # newly added jobs
        twDate = UpdateRecord.objects.all()[0].last_update_day
        nJobs = JobTrend.objects.filter(date=twDate).order_by('-num')

        return render(
            request,
            'job/result.html', {
            'jobdata': jobdata,
            'historydata': historydata,
            'sysdata': sysdata,
            'placedata': json.dumps(placedata),
            'twDate': UpdateRecord.objects.all()[0].last_update_day.strftime('%Y/%m/%d'),
            'year': datetime.now().year,
            'title': '職缺列表',
            'messages': messages,
            'topranks': tJobs,
            'newjobs': nJobs,
        })
        
    elif request.method == 'POST':
        raise Http404()
    
def about(request):
    return render(
        request, 
        'job/about.html', {
        'year': datetime.now().year,
        'title':'關於', 
    })

def trend(request):
    return render(
        request, 
        'job/about.html', {
        'year': datetime.now().year,
        'title':'關於', 
    })

def item(request, job_id):
    isExpired = False
    try:
        job = CurrentJob.objects.get(job__id=job_id)
    except CurrentJob.DoesNotExist:
        isExpired = True
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return HttpResponseRedirect(reverse('job:index'))
    job = model_to_dict(job)
    
    places = WorkPlace.objects.values('work_place_id', 'work_place_name')
    placedata = {}
    for place in places:
        placedata[place['work_place_id']] = place['work_place_name']
    
    history_dates = list(JobHistory.objects.values('date_from', 'date_to').filter(job__id=job_id).order_by('date_from'))

    dthandler = lambda obj: (
        obj.isoformat() if isinstance(obj, date) else None
    )
    return render(
        request, 
        'job/item.html', {
        'year': datetime.now().year,
        'jobdata': json.dumps(job, default=dthandler),
        'placedata': json.dumps(placedata),
        'historydata': json.dumps(history_dates, default=dthandler),
        'isExpired': isExpired,
        'title':'單筆職缺資料', 
    })


def message(request, job_id):
    if request.is_ajax() and request.method == 'POST':
        if request.POST.get('action') == 'get':
            msgdata = []
            try:
                jmsgs = JobMessage.objects.filter(job__id=job_id).order_by('-last_modified')
                for jmsg in jmsgs:
                    msgdata.append({
                        'msg': jmsg.message,
                        'time': (jmsg.last_modified + timedelta(hours=8)).strftime('%Y/%m/%d %H:%M'),  # Taipei's timezone
                        'id': jmsg.id,
                    })
                return HttpResponse(json.dumps({'succeeded': True, 'messages': msgdata}), content_type='application/json')
            except:
                return HttpResponse(json.dumps({'succeeded': False}), content_type='application/json')
        elif request.POST.get('action') == 'add':
            pwd = request.POST.get('pwd')
            comment = request.POST.get('comment')
            if pwd and comment:
                comment = comment[:200] if len(comment) > 200 else comment
                comment = escape(comment)
                pwd = pwd[:20] if len(comment) > 20 else pwd
                pwd = make_password(pwd)
                jmsg = JobMessage(job=Job.objects.get(id=job_id), message=comment, password=pwd)
                jmsg.save()
                return HttpResponse(json.dumps({'succeeded': True}), content_type='application/json')
            else:
                return HttpResponse(json.dumps({'succeeded': False}), content_type='application/json')            
        elif request.POST.get('action') == 'delete':
            msgid = request.POST.get('msgid')
            pwd = request.POST.get('pwd')
            try:
                jmsg = JobMessage.objects.get(id=msgid, job__id=job_id)
                if check_password(pwd, jmsg.password):
                    jmsg.delete()
                    return HttpResponse(json.dumps({'succeeded': True}), content_type='application/json')
                else:
                    return HttpResponse(json.dumps({'succeeded': False}), content_type='application/json')
            except:
                return HttpResponse(json.dumps({'succeeded': False}), content_type='application/json')
        else:
            return HttpResponse(json.dumps({'succeeded': False}), content_type='application/json')
    else:
        raise Http404()
