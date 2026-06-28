from django.urls import path
from . import views

urlpatterns = [
    path('presets/', views.preset_list, name='preset-list'),
    path('presets/<str:name>/', views.preset_detail, name='preset-detail'),
]
