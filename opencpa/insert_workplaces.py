 # -*- coding: utf-8 -*-
import sqlite3

w_id = [ 
	10, 23, 30, 31, 32, 35, 42, 50, 
	54, 60, 61, 63, 72, 82, 90, 24, 
	26, 95, 97, 101, 168, 169
]

w_name = [ 
	u'臺北市', u'新北市', u'新竹市', u'新竹縣', u'桃園縣', u'苗栗縣', u'臺中市', u'彰化縣',
	u'南投縣', u'嘉義市', u'嘉義縣', u'雲林縣', u'臺南市', u'高雄市', u'屏東縣', u'基隆市',
	u'宜蘭縣', u'臺東縣', u'花蓮縣', u'連江縣', u'澎湖縣', u'金門縣'
]


conn = sqlite3.connect('../db.sqlite3')
c = conn.cursor()
for i in range(len(w_id)):
	c.execute('INSERT INTO opencpa_workplace VALUES (NULL, ?, ?)', (w_id[i], w_name[i]))
conn.commit()
conn.close()

