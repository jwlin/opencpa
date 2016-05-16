# vim: set ts=4 sw=4 et: -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.core.urlresolvers import reverse
from datetime import datetime, timedelta, date
from django.db.models import Count, Sum
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
                hisjob_dates = list(JobHistory.objects.values('date_from', 'date_to').filter(job_id=job['job_id']))[-5:]
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

        '''
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
        '''

        # newly added jobs
        yesterday = UpdateRecord.objects.all()[0].last_update_day + timedelta(days=-1)
        jts = JobTrend.objects.filter(date=yesterday).values('sysnam').annotate(num=Sum('num')).order_by('-num')
        newjobs = []
        for jt in jts:
            newjobs.append({'sysnam': jt['sysnam'], 'num': jt['num'], 'type': myutil.judge_type(jt['sysnam'])})


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
            #'topranks': tJobs,
            'newjobs': newjobs,
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
    jts = JobTrend.objects.all().values('sysnam').annotate(num=Sum('num')).order_by('num')
    trend_data = [[], []]  # 0 is for admin_data, 1 is for tech_data
    for jt in jts:
        type_index = myutil.judge_type(jt['sysnam'])  # 0 is for admin_data, 1 is for tech_data
        names = myutil.split_sysnam(jt['sysnam'])
        for name in names:
            found = False
            for pair in trend_data[type_index]:
                if pair['label'] == name:
                    pair['y'] = int(pair['y']) + int(jt['num'])
                    found = True
                    break
            if not found:
                trend_data[type_index].append({'y': jt['num'], 'label': name})
        for i in range(len(trend_data)):
            trend_data[i] = sorted(trend_data[i], key=lambda k: int(k['y']))

    table_data_list = [[],[]]
    for i in range(len(trend_data)):
        for pair in trend_data[i]:
            table_data_list[i].append([pair['label'], pair['y']])
    '''
    for data_list in trend_data:
        for data in data_list:
            print data['y'], data['label']
    '''
    return render(
        request, 
        'job/trend.html', {
        'year': datetime.now().year,
        'title':'各職系開缺數統計', 
        #'adminTop10': json.dumps(trend_data[0][-10:]),
        #'techTop10': json.dumps(trend_data[1][-10:]),
        'admin_list': json.dumps(table_data_list[0]),
        'tech_list': json.dumps(table_data_list[1]),
        'to_date': datetime.now().strftime("%Y/%m/%d")
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
                pwd = pwd[:20] if len(pwd) > 20 else pwd
                pwd = make_password(pwd)
                jmsg = JobMessage(job=Job.objects.get(id=job_id), message=comment, password=pwd)
                jmsg.save()
                return HttpResponse(json.dumps({'succeeded': True}), content_type='application/json')
            else:
                return HttpResponse(json.dumps({'succeeded': False}), content_type='application/json')            
        elif request.POST.get('action') == 'delete':
            msgid = request.POST.get('msgid')
            pwd = request.POST.get('pwd')
            pwd = pwd[:20] if len(pwd) > 20 else pwd
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


def dept(request):
    jobs = Job.objects.all().values('org_name').annotate(num=Count('id')).order_by('num')
    job_data_list = list()
    for job in jobs:
        job_data_list.append([job['org_name'], job['num']])

    return render(
        request, 
        'job/dept.html', {
        'year': datetime.now().year,
        'title':'各機關開缺數統計', 
        'job_list': json.dumps(job_data_list),
        'to_date': datetime.now().strftime("%Y/%m/%d")
    })


def dept_ajax(request):
    if request.is_ajax() and request.method == 'POST':
        if request.POST.get('action') == 'get':
            try:
                job_data_list = list()
                if request.POST.get('sysnam'):
                    dept = escape(request.POST.get('dept'))
                    sysnam= escape(request.POST.get('sysnam'))
                    jobs = Job.objects.filter(org_name=dept, sysnam=sysnam)
                    for job in jobs:
                        latest_date = list(JobHistory.objects.filter(job__id=job.id).values('date_from').order_by('-date_from'))[0]
                        latest_date = latest_date['date_from'].strftime('%Y/%m/%d')
                        job_data_list.append([job.org_name, job.sysnam, latest_date, job.title, job.rank_from, job.rank_to, job.work_addr, job.id])
                else:  # only request.POST.get('dept')
                    dept = escape(request.POST.get('dept'))
                    jobs = Job.objects.filter(org_name=dept).values('sysnam').annotate(num=Count('id')).order_by('num')
                    for job in jobs:
                        job_data_list.append([job['sysnam'], job['num']])
                return HttpResponse(json.dumps({'succeeded': True, 'data': job_data_list}), content_type='application/json')
            except Exception as e:
                return HttpResponse(json.dumps({'succeeded': False}), content_type='application/json')
