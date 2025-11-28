PY=uv run python

.PHONY: test migrate runserver makemigrations

test:
	$(PY) manage.py test

makemigrations:
	$(PY) manage.py makemigrations

migrate:
	$(PY) manage.py migrate

runserver:
	$(PY) manage.py runserver
