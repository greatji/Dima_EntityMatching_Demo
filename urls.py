from django.conf.urls import url
from . import views

app_name = 'entity_matching'

urlpatterns = [
    url(r'^test/$', views.Index.as_view(), name='test'),
    url(r'^test/data/$', views.Data.as_view(), name='test'),
	url(r'^test/schema/$', views.Schema.as_view(), name='test'),
    url(r'^test/datafile/$', views.DataFile.as_view(), name='test'),
    url(r'^test/rule/', views.Rule.as_view(), name='test'),
    url(r'^test/sql/', views.Sql.as_view(), name='test'),
    url(r'^test/entity_matching/$', views.EntityMatching.as_view(), name='test'),
]
