# vim: set ts=4 sw=4 et: -*- coding: utf-8 -*-

import glob, re, json, codecs, urllib2
import xml.etree.ElementTree as ET
import datetime

def getxml(xml_path):
    xml_file = urllib2.urlopen(xml_path)
    tree = ET.parse(xml_file)
    root = tree.getroot()
    unqualified_list = [u'約僱人員',u'駐外人員',u'代理教師',u'代課教師',u'實習老師',u'其他人員',u'聘用人員']; # 非公務人員
    jobs = []
    for row in root.findall('ROW'):
        person_kind = row.find('PERSON_KIND').text
        if row.find('SYSNAM').text:
            sysnam = row.find('SYSNAM').text.replace(u'職系', '')
            sysnam = sysnam.replace(u'ㄧ', u'一')
        else:
            sysnam = None
        # 僅處理公務人員 (不在 unqualifiedList 中) 且 sysnam 非空
        if (person_kind not in unqualified_list) and (sysnam is not None):

            # 將多個工作地轉為 list of (id, name)
            # 工作地為 21-連江, 88-澎湖, 89-金門, 20-基隆, 增加數值以便正確排序
            work_places = []
            work_places_id = map(int, re.findall(r'\d+', row.find('WORK_PLACE_TYPE').text))
            work_places_name = re.findall(ur'[\u4E00-\u9fa5]+', row.find('WORK_PLACE_TYPE').text)
            for i in range(0, len(work_places_id)):
                if work_places_id[i] in [21, 88, 89]:
                    work_places_id[i] += 80
                elif work_places_id[i] == 20:
                    work_places_id[i] = 24
            work_places.append(work_places_id)
            work_places.append(work_places_name)

            job = {
                'org_name': row.find('ORG_NAME').text,
                'person_kind': person_kind,
                'sysnam': sysnam,
                'rank': convertRank(row.find('RANK').text),
                'title': row.find('TITLE').text,
                'num': replaceChNum(row.find('NUMBER_OF').text),
                'gender': row.find('GENDER_TYPE').text,
                'work_places': work_places,
                'date_from': convertDate(row.find('DATE_FROM').text),
                'date_to': convertDate(row.find('DATE_TO').text),
                'is_handicap': convertBoolean(row.find('IS_HANDICAP').text),
                'is_orig': convertBoolean(row.find('IS_ORIGINAL').text),
                'is_local_orig': convertBoolean(row.find('IS_LOCAL_ORIGINAL').text),
                'is_training': convertBoolean(row.find('IS_TRANING').text),
                'type': row.find('TYPE').text,
                'email': row.find('VITAE_EMAIL').text,
                'work_quality': row.find('WORK_QUALITY').text,
                'work_item': row.find('WORK_ITEM').text,
                'work_addr': row.find('WORK_ADDRESS').text,
                'contact': row.find('CONTACT_METHOD').text,
                'url': row.find('URL_LINK').text,
                'view_url': row.find('VIEW_URL').text,
            }
            jobs.append(job)
    xml_file.close()
    return jobs

# replace Chinese Number with digital one
def replaceChNum(s):
    pattern1 = [u'一',u'二',u'三',u'四',u'五',u'六',u'七',u'八',u'九',u'十']
    pattern2 = [u'壹',u'貳',u'參',u'肆',u'伍',u'陸',u'柒',u'捌',u'玖',u'拾']
    replacement = ['1','2','3','4','5','6','7','8','9','10']
    for i in range(0,10):
        s = s.replace(pattern1[i], replacement[i])
        s = s.replace(pattern2[i], replacement[i])
    s = s.replace(u'乙', '1')
    # delete extra 0. ex. 104 -> 14
    s = re.sub('(10[0-9])',lambda m: m.group(0).replace('10', '1'), s)
    return s

# convert RANK field to a rank obj.
# ex. "委任第五職等或薦任第六職等至第七職等" -> rank{from: 5, to: 7};
def convertRank(s):
    if s == None:
        return {'from': 0, 'to': 0}

    s = replaceChNum(s)
    ranks = map(int, re.findall(r'\d+', s))

    if len(ranks) == 0:
        return {'from': 0, 'to': 0}

    ranks.sort()
    return {'from': ranks[0], 'to': ranks[-1]}

def convertDate(s):
    y = int(s[0:3])+1911
    m = int(s[3:5])
    d = int(s[5:7])
    date = datetime.date(y, m, d)
    return date

def convertBoolean(s):
    if (s is not None) and (s == 'Y'):
        return True
    else:
        return False

# judge if a sysnam belongs to tech or admin type.
# admin: return 0. tech: return 1
def judge_type(sysnam):
    adminlist = [u'無', u'政', u'新聞', u'法制', u'社會工作', u'醫務管理', u'會計', u'統計', u'會計', u'審計', u'金融保險', u'圖書資訊管理']
    for keyword in adminlist:
        if keyword in sysnam:
            return 0
    return 1

