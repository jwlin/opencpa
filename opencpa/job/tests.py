# vim: set ts=4 sw=4 et: -*- coding: utf-8 -*-

from django.test import TestCase


class MyUtilTest(TestCase):
    def test_split_sysnam(self):
        from myutil import split_sysnam as split
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
        for data in dataset:
            print 'sysname=', data
            for name in split(data):
                print name
