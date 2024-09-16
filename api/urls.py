from django.urls import path
from . import views

urlpatterns = [
    path('search-books/', views.search_books, name='Search for books'),
    path('get-recommendations/', views.get_recommendation, name='Get recommendations')
]