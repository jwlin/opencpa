# vim: set ts=4 sw=4 et: -*- coding: utf-8 -*-

from django.test import TestCase
from myutil import split_sysnam, isResumeRequired

class MyUtilTest(TestCase):
    def test_split_sysnam(self):
        dataset = [
            u'具教育行政（含文化行政、新聞、博物館管理、圖書資訊管理、史料編纂）任用資格:',
            u'原子能、電力工程、電子工程、機械工程、衛生技術、環保技術:',
            u'土木工程及水利工程:',
            u'交通技術',
            u'電力工程或電子工程或機械工程：',
            u'資訊處理 :',
            u'警察官或消防行政 :',
            u'土木工程/建築工程',
            u'「一般行政」 :',
            u'業務類（一般行政） :',
        ]
        ans = [
            [u'教育行政', u'文化行政', u'新聞', u'博物館管理', u'圖書資訊管理', u'史料編纂'],
            [u'原子能', u'電力工程', u'電子工程', u'機械工程', u'衛生技術', u'環保技術'],
            [u'土木工程', u'水利工程'],
            [u'交通技術'],
            [u'電力工程', u'電子工程', u'機械工程'],
            [u'資訊處理'],
            [u'警察官', u'消防行政'],
            [u'土木工程', u'建築工程',],
            [u'一般行政'],
            [u'業務類一般行政']
        ]
        for i in xrange(len(dataset)):
            ss = split_sysnam(dataset[i])
            for j in xrange(len(ss)):
                self.assertEqual(ans[i][j], ss[j])
    
    def test_isResumeRequired(self):
        self.assertFalse(isResumeRequired('http://web3.dgpa.gov.tw/want03front/ap/wantf00001_1.aspx?work_id=1050500240'))
        self.assertTrue(isResumeRequired('http://web3.dgpa.gov.tw/want03front/ap/wantf00001_1.aspx?work_id=1050300230'))
        

