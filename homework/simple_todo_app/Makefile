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

model-diagram: ## Generate a model diagram PNG using django-extensions (requires graphviz)
	# ensure docs directory exists
	mkdir -p docs
	# install django-extensions into uv env (no-op if already present)
	uv add django-extensions || true
	# generate diagram (requires graphviz dot installed on the system)
	$(PY) manage.py graph_models todo -o docs/models.png

model-sql: ## Dump SQL for the initial todo migration to docs/todo_0001_sql.txt
	mkdir -p docs
	$(PY) manage.py sqlmigrate todo 0001 > docs/todo_0001_sql.txt
