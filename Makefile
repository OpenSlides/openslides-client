docker-run=docker run -ti -v `pwd`/client/src:/app/src -p 127.0.0.1:9001:9001/tcp openslides-client-dev

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

run-tests: | build-dev
	docker run -t openslides-client-dev npm run lint
	docker run -t openslides-client-dev npm run prettify-check
	docker run -t openslides-client-dev npm run test-silently
	docker run -t openslides-client-dev npm run build-debug

run-karma-tests:
	docker run -t openslides-client-dev npm run test-silently

run-check-linting:
	docker run -t openslides-client-dev npm run lint

run-check-prettifying:
	docker run -t openslides-client-dev npm run prettify-check

run-playwright:
	docker-compose -f client/tests/docker-compose.test.yml build
	docker-compose -f client/tests/docker-compose.test.yml up --exit-code-from playwright
