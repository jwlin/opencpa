# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup

url = 'https://web3.dgpa.gov.tw/WANT03FRONT/AP/WANTF00003.aspx'

# first HTTP request without form data
resp = requests.get(url, verify=False)
soup = BeautifulSoup(resp.text)
# parse and retrieve 3 vital form values
viewstate = soup.select("#__VIEWSTATE")[0]['value']
eventvalidation = soup.select("#__EVENTVALIDATION")[0]['value']
viewstategenerator = soup.select("#__VIEWSTATEGENERATOR")[0]['value']

print viewstate, eventvalidation, viewstategenerator
formData = {
	'__EVENTVALIDATION': eventvalidation,
	'__VIEWSTATE': viewstate,
	'__VIEWSTATEGENERATOR': viewstategenerator,
	'ctl00$ContentPlaceHolder1$btn_DownloadXML': '職缺 Open Data(XML)'
}
header = {'Content-Type': 'application/x-www-form-urlencoded'}
resp = requests.post(url, verify=False, data=formData, headers=header)
print resp.text
