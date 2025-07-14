# Helpers
override SERVICE=client
override MAKEFILE_PATH=../dev/scripts/makefile
override DOCKER_COMPOSE_FILE=
override DOCKER-RUN=docker run -ti -v `pwd`/client/src:/app/src -v `pwd`/client/cli:/app/cli -p 127.0.0.1:9001:9001/tcp openslides-client-dev
override CONTAINER_ARGS=-ti -v `pwd`/client/src:/app/src -v `pwd`/client/cli:/app/cli -p 127.0.0.1:9001:9001/tcp

# Build images for different contexts

build-prod:
	docker build ./ --tag "openslides-$(SERVICE)" --build-arg CONTEXT="prod" --target "prod"

build-dev:
	docker build ./ --tag "openslides-$(SERVICE)-dev" --build-arg CONTEXT="dev" --target "dev"

build-tests:
	docker build ./ --tag "openslides-$(SERVICE)-tests" --build-arg CONTEXT="tests" --target "tests"

# Development tools

.PHONY: dev%

dev%:
	bash $(MAKEFILE_PATH)/make-dev.sh "$@" "$(SERVICE)" "$(DOCKER_COMPOSE_FILE)" "$(CONTAINER_ARGS)" "sh"

dev-standalone:
	bash $(MAKEFILE_PATH)/make-dev.sh "$@" "$(SERVICE)" "$(DOCKER_COMPOSE_FILE)" "$(CONTAINER_ARGS)" "sh"
	$(DOCKER-RUN) npm run cleanup

# Testing tools

run-tests:
	bash dev/run-tests.sh

lint:
	bash dev/run-lint.sh -l

run-karma-tests: | build-dev
	docker run -t openslides-client-dev /bin/sh -c "apk add chromium && npm run test-silently -- --browsers=ChromiumHeadlessNoSandbox"

run-playwright:
	docker compose -f client/tests/docker-compose.test.yml build
	docker compose -f client/tests/docker-compose.test.yml up --exit-code-from playwright

# Cleanup

run-cleanup:
	docker exec -it $$(docker ps -a -q  --filter ancestor=openslides-client-dev) npm run cleanup

run-cleanup-standalone: | build-dev
	$(docker-run) npm run cleanup


########################## Deprecation List ##########################

deprecation-warning:
	bash $(MAKEFILE_PATH)/make-deprecation-warning.sh

stop-dev:
	bash $(MAKEFILE_PATH)/make-deprecation-warning.sh "dev-stop"
	$(DC_DEV) down --volumes --remove-orphans

run-check-linting: | deprecation-warning build-dev
	docker run -t openslides-client-dev npm run lint

run-check-prettifying: | deprecation-warning build-dev
	docker run -t openslides-client-dev npm run prettify-check
