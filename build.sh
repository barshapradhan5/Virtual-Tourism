#!/usr/bin/env bash
# Exit on error
set -o errexit

pip install --upgrade pip
pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/manage.py seed_places
python backend/manage.py collectstatic --no-input

