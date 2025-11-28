# Simple TODO App

This is a small Django application that implements a basic TODO list with due dates and completion status.

## Model diagram

A DOT file describing the `Todo` model has been generated and is available at `docs/models.dot`.

If you have Graphviz installed locally you can generate a PNG with:

```bash
dot -Tpng docs/models.dot -o docs/models.png
```

Alternatively, the repository includes a `Makefile` target that will attempt to install `django-extensions` and generate the diagram:

```bash
make model-diagram
```

If a PNG is present at `docs/models.png` it will be displayed here:

![Model diagram](docs/models.png)

## Quick start

Install dependencies and prepare environment as you did before:

```bash
$ curl -LsSf https://astral.sh/uv/install.sh | sh
$ source $HOME/.local/bin/env
$ uv init simple_todo_app
$ cd simple_todo_app/
$ uv add django
```

Run migrations and start the server:

```bash
make makemigrations
make migrate
make runserver
# or
uv run python manage.py runserver
```

Run tests:

```bash
make test
```

## Notes

- The `due_date` field is a `DateField`. The form uses an HTML5 `date` input for a native calendar picker.
- Model-level validation prevents saving a `due_date` in the past.
- Templates live under `todo/templates/` and are discovered via `APP_DIRS = True`.

If you want me to try to render and commit the PNG here as well, I can attempt to install the required system packages (`graphviz`) — tell me if you want me to try and I'll attempt it (it may require system-level install which can fail in this environment).
