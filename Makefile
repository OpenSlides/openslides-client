# Helpers

SERVICE=client
docker-run=docker run -ti -v `pwd`/client/src:/app/src -v `pwd`/client/cli:/app/cli -p 127.0.0.1:9001:9001/tcp openslides-client-dev

# Parameters

ATTACH=false
STANDALONE=false
DETACH=false
LOG=$(SERVICE)
CONTEXT=dev

# Build images for different contexts

build-prod:
	docker build ./ --tag "openslides-$(SERVICE)" --build-arg CONTEXT="prod" --target "prod"

build-dev build:
	docker build ./ --tag "openslides-$(SERVICE)-dev" --build-arg CONTEXT="dev" --target "dev"

build-test:
	docker build ./ --tag "openslides-$(SERVICE)-tests" --build-arg CONTEXT="tests" --target "tests"

# Development tools

run-dev: | build-dev
	$(docker-run)

run-dev-interactive: | build-dev
	$(docker-run) sh

# Testing tools

run-cleanup-standalone: | build-dev
	$(docker-run) npm run cleanup

run-cleanup:
	docker exec -it $$(docker ps -a -q  --filter ancestor=openslides-client-dev) npm run cleanup

run-tests:
	bash dev/run-tests.sh

run-karma-tests: | build-dev
	docker run -t openslides-client-dev /bin/sh -c "apk add chromium && npm run test-silently -- --browsers=ChromiumHeadlessNoSandbox"

run-check-linting: | build-dev
	docker run -t openslides-client-dev npm run lint

run-check-prettifying: | build-dev
	docker run -t openslides-client-dev npm run prettify-check

run-playwright:
	docker compose -f client/tests/docker-compose.test.yml build
	docker compose -f client/tests/docker-compose.test.yml up --exit-code-from playwright
