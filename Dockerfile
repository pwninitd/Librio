FROM python:3.12.3
WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY . /app
ENTRYPOINT ["python", "manage.py", "runserver", "0.0.0.0:8000"]