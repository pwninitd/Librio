from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='Home'),
    path('choose-genre/', views.choose_genre, name='Choose Genre'),
    path('choose-books/', views.choose_books, name='Choose The Books You Read'),
    path('show-recommendations/', views.show_recommendations, name='Show recommendations'),
]