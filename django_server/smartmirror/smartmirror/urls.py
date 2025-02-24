"""smartmirror URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth import views as auth_views
from display import views as display_views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns = [
    url(r'^app/$', display_views.app, name='app'),
    url(r'^app/(?P<account>[0-9]+)$', display_views.app, name='app'),
    url(r'^settings/$', display_views.settings, name='settings'),
    url(r'^pair/$', display_views.pair, name='pair'),
    url(r'^pair/(?P<form_val>[0-9]+)$', display_views.pair, name='pair'),
    url(r'^new/$', display_views.new, name='new'),
    url(r'^login/$', auth_views.login, {'template_name': 'accounts/login.html'}, name='login'),
    url(r'^logout/$', auth_views.logout, name='logout'),
    url(r'^admin/', admin.site.urls),
]
urlpatterns += staticfiles_urlpatterns()
