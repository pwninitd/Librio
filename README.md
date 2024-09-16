<img src="static/assets/img/librio.png" alt="drawing" height="100"/>

Your personal guide to discovering books you'll love. Explore genres, uncover hidden gems, and dive into curated reads
based on your unique taste.

# Table of Contents
1. [Overview](#overview)
2. [Technologies Used](#technologies-used)
3. [APIs Used](#apis-used)
4. [Installation and Setup](#installation-and-setup)
   1. [Clone The Repo](#1-clone-the-repository-and-navigate-to-the-project-directory)
   2. [Create API Key](#2-create-an-api-key)
   3. [Building and Running the Application](#3-building-and-running-the-application)
      1. [Windows](#--windows)
      2. [MacOS and Linux](#--macos-and-linux)
5. [Documentation](#documentation)
   1. [user_setup app](#user_setup)
   2. [api app](#api)
6. [Challenges Encountered](#challenges-encountered)
7. [Future Improvements](#future-improvements)
8. [Contributing](#contributing)

# Overview

This project is an AI-powered book recommendation web application that suggests books based on user preferences such as
favorite genres and previously enjoyed books. The app aims to provide personalized recommendations to help users
discover their next great read.

## Technologies Used

- <strong>Backend:</strong> Django with various plugins (e.g., Sass compiler).
- <strong>Frontend:</strong> Bootstrap 5, Owl Carousel, and custom JavaScript scripts.
- <strong>AI/Algorithm:</strong> AI-powered recommendation system.
- <strong>Containerization:</strong> Docker for easier deployment.

## APIs Used

- <strong>OpenLibrary:</strong> Provides access to a comprehensive and open-source book library.
- <strong>Groq:</strong> Facilitates access to the llama-3.1-70b-versatile language model.

# Installation and Setup

[!IMPORTANT]
Make sure you have docker and git installed on your machine before proceeding.

## 1. Clone the repository and navigate to the project directory

Open Command Prompt or PowerShell on Windows, or Terminal on macOS or Linux, and navigate to the directory where you
want to save the project. Then, clone the repository and navigate into the project folder.

```sh
git clone https://github.com/yourusername/Librio.git && cd Librio
```

## 2. Create an API Key

Before building and running the application (since it uses the Groq API),
visit [this link]('https://console.groq.com/keys') to create an api key.

## 3. Building and running the application

### - Windows

```sh
docker compose build && docker compose up
```

### - MacOS and Linux

```sh
sudo docker compose build && sudo docker compose up
```

[!NOTE]
After following these steps, the app should be running and accessible at http://0.0.0.0:8000

# Documentation

The functionality of the website is divided between two Django apps: `api` and `user_setup`.

## `user_setup`

The `user_setup` app is responsible for the frontend of the site. Its URLs are part of the root of the website:

- `home`: The path to the home page of the website.
- `choose-genre`: The path where users can select their preferred genres.
- `choose-books`: The path where users can choose books they have enjoyed reading.
- `show-recommendations`: The path where users receive their book recommendations.

## `api`

The `api` app contains the backend functionality and provides two specific endpoints, both linked to the `/api` path:

`search-books`: This endpoint returns five books based on the user’s search query. It is connected to the `search_books`
view, which only accepts POST requests. The view creates a search query to OpenLibrary's API, retrieves the results, and
formats them for the `autocomplete.js` script. This ensures the results are prepared before being presented on the
frontend.

`get-recommendations`:This is the core functionality of the app, used by the frontend's `carousel.js`.
The `get_recommendations` path is linked to the `get_recommendations` view, which only accepts POST requests. The view
receives a JSON object containing the user's preferred genres and read books, parses this data, and sends it to
the `llama-3.1-70b-versatile` AI model via the Groq API. Once the recommendations are returned in JSON format, the view
normalizes the author names, queries the OpenLibrary API for book covers and ratings, and creates a structured JSON
response.This is used to generate a carousel, which is then sent back to `carousel.js` to display the recommendations.

# Challenges Encountered

- <strong>Bootstrap 5 Sass Overriding:</strong> While Bootstrap suggests overriding Sass variables locally, some values
  couldn't be easily customized, leading to the need for additional CSS files.
- <strong>Organizing Django Apps:</strong> Structuring the Django apps and managing their communication was complex and
  required several iterations.
- <strong>Dockerization:</strong> Dockerizing the app was a new challenge. Although functional, the setup can be
  optimized for future iterations.
- <strong>OpenLibraries API getting information:</strong> Navigating OpenLibrary’s API for reliable book cover data
  proved tricky, as not all books have covers, which required tweaking to ensure consistent results.
- <strong>Autocomplete Search Bar (`choose-books` path):</strong> Implementing the search bar functionality, including
  displaying search results and adding an indicator for processing user input, was more challenging than anticipated.

# Future Improvements

- Refine the Docker setup for better performance and easier deployment.
- Optimize the time needed to get recommendations.

# Contributing

If you'd like to contribute, feel free to submit a pull request or open an issue.
