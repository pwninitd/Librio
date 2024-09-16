from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods

@require_http_methods(['GET'])
def choose_genre(request):
    return render(request, 'choose-genre.html')

@require_http_methods(['GET'])
def choose_books(request):
    return render(request, 'choose-books.html')

@require_http_methods(['GET'])
def show_recommendations(request):
    return render(request, 'show-recommendations.html')

@require_http_methods(['GET'])
def home(request):
    return render(request, 'home.html')
