# Commands inside the container

all: pyupgrade black autoflake isort flake8 mypy

pyupgrade:
	pyupgrade --py310-plus --exit-zero-even-if-changed $$(find . -name '*.py')

check-pyupgrade:
	pyupgrade --py310-plus $$(find . -name '*.py')

black:
	black src/

check-black:
	black --check --diff src/

autoflake:
	autoflake src/

isort:
	isort src/

check-isort:
	isort --check-only --diff src/

flake8:
	flake8 src/

mypy:
	mypy src/

validate-models:
	python src/validate.py

# Docker manage commands

run-dev:
	USER_ID=$$(id -u $${USER}) GROUP_ID=$$(id -g $${USER}) docker compose up -d --build
	docker compose exec models bash --rcfile /etc/bash_completion

stop-dev:
	docker compose down
