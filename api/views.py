from django.http import HttpResponse
from django.shortcuts import render
from typing import List, Optional
from librio.settings import GROQ_API_KEY
from groq import Groq
from pydantic import BaseModel
import requests, json, regex, urllib.parse, re
from django.views.decorators.http import require_http_methods
from math import floor, ceil
from pprint import pprint
from django.template.defaulttags import register

class Book(BaseModel):
    title: str
    author: str
    genres_of_book: str
    long_summary: str
    detailed_reason: str


class Recommendation(BaseModel):
    recommendation: List[Book]


def getBook(query):
    url = 'https://openlibrary.org/search.json'
    params = {
        'q': f'{query} language:eng cover_i:*',
        'fields': 'key,title,author_name,ratings_average,ratings_count,cover_i,editions,editions.key,editions.title,editions.subtitle,editions.isbn,editions.cover_i',
        'limit': '5'
    }
    return requests.get(url, params=params).json()

@register.filter
def get_range(value):
    return range(value)


@require_http_methods(["POST"])
def search_books(request):
    try:
        body = json.loads(request.body)
        res = getBook(body['query'])
        books = []
        for book in res['docs']:
            label = book['editions']['docs'][0]['title']
            if 'subtitle' in book['editions']['docs'][0]:
                label += ' ' + book['editions']['docs'][0]['subtitle']
            label += ' - '
            for author in book['author_name']:
                label += author + (', ')
            label = label[:-2]
            value = book['editions']['docs'][0]['key']
            books.append({'label': label, 'value': value})

        return HttpResponse(json.dumps(books), content_type='application/json')
    except requests.exceptions.RequestException as e:
        return HttpResponse(500)

@require_http_methods(["POST"])
def get_recommendation(request):
    pref_json = json.loads(request.body)
    pprint(pref_json)
    pref = 'Genres I like: '
    for genre in pref_json['genres']:
        pref += genre.lower() + ', '
    pref = pref[:-2] + '. The books I have read: '
    if len(pref_json['books']) != 0:
        for book in pref_json['books']:
            pref += book['title'] + ' by ' + book['author'] + ', '

    pref = pref[:-2]
    prompt = 'Recommend me 5 books. ' + pref
    client = Groq(api_key=GROQ_API_KEY)
    chat_completion = client.chat.completions.create(
        messages=[
            {
                'role': 'system',
                'content': 'You are a recommendation algorithm. The recommendations should be based on what genres the user likes or the books he has read. When you give the recommendations give a long summary of the book and a detailed reason why you recommend that book and what genres does the book belong to.\n'
                # Pass the json schema to the model. Pretty printing improves results.
                           f' The JSON object must use the schema: {json.dumps(Recommendation.model_json_schema(), indent=2)}',
            },
            {
                'role': 'user',
                'content': prompt,
            }
        ],
        model='llama-3.1-70b-versatile',
        temperature=0,
        # Streaming is not supported in JSON mode
        stream=False,
        # Enable JSON mode by setting the response format
        response_format={'type': 'json_object'},
    )

    recommendation = Recommendation.model_validate_json(chat_completion.choices[0].message.content)
    recommendation_json = []
    for rec in recommendation.recommendation:
        recommendation_json.append(
            {'title': rec.title, 'author': rec.author, 'genres': rec.genres_of_book, 'reason': rec.detailed_reason,
             'summary': rec.long_summary})

    print(recommendation_json)
    for book in range(len(recommendation_json)):
        authors = get_author_query(recommendation_json[book]['author'])
        query = recommendation_json[book]['title']
        for author in authors:
            query += ' author: ' + author

        res = getBook(query)
        if len(res['docs']):
            cover = 'https://covers.openlibrary.org/b/id/' + str(get_cover(res['docs'][0])) + '-L.jpg'
        else:
            # Fallback samo na title
            res = getBook(recommendation_json[book]['title'])
            if len(res['docs']) == 0:
                del recommendation_json[book]
                continue
            cover = 'https://covers.openlibrary.org/b/id/' + str(get_cover(res['docs'][0]))

        recommendation_json[book]['ratings'] = ratings_average(res['docs'][0]['ratings_average'], res['docs'][0]['ratings_count'])
        recommendation_json[book]['cover'] = cover

    print(recommendation_json)

    return render(request, 'show-recommendations-carousel.html',{'books': recommendation_json, 'len': len(recommendation_json)})

def get_author_query(unformatted_query):
    return re.split(' and |, ', normilize_author(unformatted_query))

def normilize_author(unformatted_name):
    return re.sub(' +', ' ', re.sub('.', '. ', unformatted_name))

def get_cover(res):
    if 'cover_i' in res['editions']['docs'][0]:
        return res['editions']['docs'][0]['cover_i']
    return res['cover_i']

def ratings_average(ratings_average_field, ratings_count):
    full_stars = floor(ratings_average_field)
    half_stars = (round(ratings_average_field * 2) / 2) - full_stars
    empty_stars = 5 - (full_stars + ceil(half_stars))
    return {'full_stars': full_stars, 'half_stars': half_stars, 'empty_stars': empty_stars,
            'ratings_avg': round(ratings_average_field, 2), 'ratings_count': ratings_count}
