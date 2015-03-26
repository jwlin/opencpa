from django.conf.urls import patterns, url

from . import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^about$', views.about, name='about'),
	url(r'^(?P<job_id>[0-9]+)$', views.item, name='item'),
	url(r'^api/message/(?P<job_id>[0-9]+)$', views.message, name='message'),
)
