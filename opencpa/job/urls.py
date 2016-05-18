from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^about$', views.about, name='about'),
    url(r'^trend$', views.trend, name='trend'),
    url(r'^dept$', views.dept, name='dept'),
    url(r'^(?P<job_id>[0-9]+)$', views.item, name='item'),
    url(r'^api/message/(?P<job_id>[0-9]+)$', views.message, name='message'),
    url(r'^api/dept/$', views.dept_ajax, name='dept_ajax'),
    url(r'^api/trend/$', views.trend_ajax, name='trend_ajax'),
)
