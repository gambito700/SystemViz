FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY milkdrop3-web/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY milkdrop3-web/backend/ /app/backend/
COPY milkdrop3-web/frontend/ /app/frontend/

WORKDIR /app/backend

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD python manage.py migrate --run-syncdb && python manage.py seed_presets && gunicorn milkdrop3.wsgi:application --bind 0.0.0.0:$PORT --workers 2
