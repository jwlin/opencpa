from django.conf.urls import patterns, url

from opencpa import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index')
	)