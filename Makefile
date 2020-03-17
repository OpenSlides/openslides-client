build-dev:
<<<<<<< HEAD
	make -C haproxy build-dev
	git submodule foreach 'make build-dev'
	docker-compose -f docker/docker-compose.dev.yml build

run-dev: | build-dev
	UID=$$(id -u $${USER}) GID=$$(id -g $${USER}) docker-compose -f docker/docker-compose.dev.yml up

stop-dev:
	docker-compose -f docker/docker-compose.dev.yml down

reload-haproxy:
	docker-compose -f docker/docker-compose.dev.yml kill -s HUP haproxy

get-server-shell:
	docker-compose -f docker/docker-compose.dev.yml run server bash

=======
	docker build -t openslides-client-dev -f Dockerfile.dev .

run-dev: | build-dev
	docker run -t -v `pwd`/client:/app -p 127.0.0.1:4200:4200/tcp openslides-client-dev

run-tests:
	echo "TODO"
>>>>>>> a7d4575c0 (Initial commit for OpenSlides4)
