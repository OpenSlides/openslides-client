build-dev:
	docker build -t openslides-client-dev -f Dockerfile.dev .

run-dev: | build-dev
	docker run -t -v `pwd`/client:/app -p 127.0.0.1:4200:4200/tcp openslides-client-dev

run-dev-interactive: | build-dev
	docker run -ti -v `pwd`/client:/app -p 127.0.0.1:4200:4200/tcp openslides-client-dev bash

run-cleanup: | build-dev
	docker run -t -v `pwd`/client:/app openslides-client-dev npm run cleanup

run-tests:
	echo "TODO"
