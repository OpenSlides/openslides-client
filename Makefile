override SERVICE=client
override DOCKER-RUN=docker run -ti -v `pwd`/client/src:/app/src -v `pwd`/client/cli:/app/cli -p 127.0.0.1:9001:9001/tcp openslides-client-dev

# Build images for different contexts

build-prod:
	docker build ./ $(ARGS) --tag "openslides-$(SERVICE)" --build-arg CONTEXT="prod" --target "prod"

build-dev:
	docker build ./ $(ARGS) --tag "openslides-$(SERVICE)-dev" --build-arg CONTEXT="dev" --target "dev"

build-tests:
	docker build ./ $(ARGS) --tag "openslides-$(SERVICE)-tests" --build-arg CONTEXT="tests" --target "tests"

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
	$(DOCKER-RUN) npm run cleanup

# GitHub
run-check-linting: | build-dev
	docker run -t openslides-client-dev npm run lint

run-check-prettifying: | build-dev
	docker run -t openslides-client-dev npm run prettify-check

########################## Deprecation List ##########################

deprecation-warning:
	@echo "\033[1;33m DEPRECATION WARNING: This make command is deprecated and will be removed soon! \033[0m"

deprecation-warning-alternative: | deprecation-warning
	@echo "\033[1;33m Please use the following command instead: $(ALTERNATIVE) \033[0m"

run-dev run-dev-attach run-dev-attached run-dev-standalone run-bash run-dev-interactive stop-dev:
	@make deprecation-warning-alternative ALTERNATIVE="dev and derivative maketargets are now only available in main repository. (use 'make dev-help' in main repository for more information)"

