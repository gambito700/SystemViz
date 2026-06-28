#!/usr/bin/env bash
set -o errexit

cd milkdrop3-web/backend

pip install -r requirements.txt

python manage.py migrate --run-syncdb
python manage.py seed_presets
python manage.py collectstatic --noinput
