人事行政總處事求人網站開放資料版
---
將人事行政總處事求人網站每日的職缺開放資料(主要為公務人員部分)以更直覺的方式呈現，特色如下:

 - 上方的下拉式選單直接顯示本日有開缺的類科及職缺數
 - 職缺預設以職等由高到低呈現，標題只顯示必要資訊，詳細資訊可點選標題展開
 - 若該職缺近期內在事求人頻繁開缺(兩次以上)，該筆職缺下方額外顯示開缺日期
 - 提供匿名留言，除了留言內容與（亂數雜湊後的）密碼外，系統不儲存任何資訊
 - 提供各類科及各機關開缺數統計資訊列表、搜尋及排序 **NEW!**

另，以下類別的職缺將不會顯示:

 - 不屬於銓敘部職組職系一覽表列的職系、或職系為空白
 - 「人員類別」為「約僱人員、駐外人員、代理教師、代課教師、實習老師、聘用人員」

簡單來說就是過濾掉非公務人員

### Running on localhost:
This app is developed with Django.
```
pip install -r requirements/local.txt
python manage.py runserver --settings=opencpa.settings.local
```
Update DB daily with `python opencpa/job/updatexml.py`.
### Deployment (Apache & mod_wsgi)
```
pip install -r requirements/production.txt
python manage.py collectstatic --settings=opencpa.settings.production
cp opencpa/settings/opencpa.conf /etc/httpd/conf.d/
```
and change corresponding settings in `opencpa.conf`.
