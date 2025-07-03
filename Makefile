# Helpers
override SERVICE=client
override MAKEFILE_PATH=../dev/scripts/makefile
override DOCKER_COMPOSE_FILE=
override DOCKER-RUN=docker run -ti -v `pwd`/client/src:/app/src -v `pwd`/client/cli:/app/cli -p 127.0.0.1:9001:9001/tcp openslides-client-dev
override CONTAINER_ARGS=-ti -v `pwd`/client/src:/app/src -v `pwd`/client/cli:/app/cli -p 127.0.0.1:9001:9001/tcp

# Build images for different contexts

build build-prod build-dev build-tests:
	bash $(MAKEFILE_PATH)/make-build-service.sh $@ $(SERVICE)

# Development tools

run-dev run-dev-attached run-dev-detached run-dev-help run-dev-stop run-dev-clean run-dev-exec run-dev-enter:
	bash $(MAKEFILE_PATH)/make-run-dev.sh "$@" "$(SERVICE)" "$(DOCKER_COMPOSE_FILE)" "$(CONTAINER_ARGS)"

run-dev-standalone:
	bash $(MAKEFILE_PATH)/make-run-dev.sh "$@" "$(SERVICE)" "$(DOCKER_COMPOSE_FILE)" "$(CONTAINER_ARGS)"
	$(DOCKER-RUN) npm run cleanup

run-dev-attached:
	bash $(MAKEFILE_PATH)/make-run-dev.sh "$@" "$(SERVICE)" "$(DOCKER_COMPOSE_FILE)" "$(CONTAINER_ARGS) sh"

# Testing tools

run-tests:
	bash dev/run-tests.sh

run-lint:
	bash dev/run-tests.sh

run-karma-tests: | build-dev
	docker run -t openslides-client-dev /bin/sh -c "apk add chromium && npm run test-silently -- --browsers=ChromiumHeadlessNoSandbox"

run-playwright:
	docker compose -f client/tests/docker-compose.test.yml build
	docker compose -f client/tests/docker-compose.test.yml up --exit-code-from playwright

# Cleanup

run-cleanup:
	docker exec -it $$(docker ps -a -q  --filter ancestor=openslides-client-dev) npm run cleanup


########################## Deprecation List ##########################

deprecation-warning:
	bash $(MAKEFILE_PATH)/make-deprecation-warning.sh

stop-dev:
	bash $(MAKEFILE_PATH)/make-deprecation-warning.sh "run-dev-stop"
	$(DC_DEV) down --volumes --remove-orphans

run-check-linting: | deprecation-warning build-dev
	docker run -t openslides-client-dev npm run lint

run-check-prettifying: | deprecation-warning build-dev
	docker run -t openslides-client-dev npm run prettify-check

########################## Replacement List ##########################