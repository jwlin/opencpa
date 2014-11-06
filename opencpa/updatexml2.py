import os, sys 
sys.path.append(os.path.join(os.path.abspath('..')))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "castman_net.settings")

from datetime import datetime, timedelta, date
from opencpa.models import *
from opencpa import myutil
import re

xml_url = 'https://web3.dgpa.gov.tw/WANT03FRONT/AP/WANTF00003.aspx'

flist = []
oklist = []

xml_jobs = myutil.getxml(xml_url)
print xml_jobs
'''
from time import time
t0 = time()
for xml_job in xml_jobs:
    sysname = xml_job['sysnam']
    if not myutil.filter(sysname):
        flist.append(sysname)
    else:
        oklist.append(sysname)
t1 = time()
print 'function vers1 takes %f' %(t1-t0)
print 'fileter done'        
for e in flist:
    print e
    
print '--- ok start'

for e in oklist:
    print e
'''
