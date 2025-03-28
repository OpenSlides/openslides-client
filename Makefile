docker-run=docker run -ti -v `pwd`/client/src:/app/src -v `pwd`/client/cli:/app/cli -p 127.0.0.1:9001:9001/tcp openslides-client-dev

build-dev:
	docker build -t openslides-client-dev -f Dockerfile.dev .

build-prod:
	docker build -t openslides-client -f Dockerfile .

run-dev: | build-dev
	$(docker-run)

run-dev-interactive: | build-dev
	$(docker-run) sh

run-cleanup-standalone: | build-dev
	$(docker-run) npm run cleanup

run-cleanup:
	docker exec -it $$(docker ps -a -q  --filter ancestor=openslides-client-dev) npm run cleanup

run-tests: run-check-linting run-check-prettifying run-karma-tests | build-dev

run-karma-tests: | build-dev
	docker run -t openslides-client-dev /bin/sh -c "apk add chromium && npm run test-silently -- --browsers=ChromiumHeadlessNoSandbox"

run-check-linting: | build-dev
	docker run -t openslides-client-dev npm run lint

run-check-prettifying: | build-dev
	docker run -t openslides-client-dev npm run prettify-check

run-playwright:
	docker compose -f client/tests/docker-compose.test.yml build
	docker compose -f client/tests/docker-compose.test.yml up --exit-code-from playwright
