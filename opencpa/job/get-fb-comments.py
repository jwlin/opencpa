# vim: set ts=4 sw=4 et: -*- coding: utf-8 -*-

import os, sys
sys.path.append(os.path.join(os.path.abspath('..')))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "opencpa.settings.production")

import requests, time, json, codecs
from datetime import datetime
from job.models import *


current_jobs = CurrentJob.objects.all().values('job')   # ex. [{'job': 3}, {'job': 2645}, {'job': 2820}, ...]
print 'get comments for ', len(current_jobs), ' current jobs ...'
server = 'http://opencpa.castman.net'
messages = []
for c in current_jobs:
    job_url = server + '/' + str(c['job'])
    resp = requests.get('https://graph.facebook.com/comments/?ids=' + job_url)
    # print '#', c['job'], ':', resp.json()
    data = resp.json()
    if data and data[job_url]['comments']['data']:
        for item in data[job_url]['comments']['data']:
            j = CurrentJob.objects.get(job__id=c['job'])
            jobname = j.org_name + '/' + j.title
            if len(jobname) > 15:
                jobname = jobname[:15] + '..'
            msg = item['message'][:30] + '..' if len(item['message']) > 30 else item['message']
            messages.append({
                'jobid': c['job'],
                'jobname': jobname,
                'content': msg,
                'created_time': datetime.strptime(item['created_time'], '%Y-%m-%dT%H:%M:%S+0000'),
            })
    time.sleep(0.5)

messages = sorted(messages, key=lambda k:k['created_time'], reverse=True)

for m in messages:
    m.pop('created_time', None)

messages = messages[:5] if len(messages) > 5 else messages

d = {'messages': messages}
with codecs.open('messages.json', 'w', encoding='utf-8') as f:
    f.write(json.dumps(d, indent=4))

