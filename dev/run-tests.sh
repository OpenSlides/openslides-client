#!/bin/bash

# Executes all tests. Should errors occur, CATCH will be set to 1, causing an erronous exit code.

echo "########################################################################"
echo "###################### Start full system tests #########################"
echo "########################################################################"

IMAGE_TAG=openslides-client-tests
CATCH=0
PERSIST_CONTAINERS=$1

# Linters

make build-test || CATCH=1
docker run -t ${IMAGE_TAG} /bin/sh -c "apk add chromium && npm run test-silently -- --browsers=ChromiumHeadlessNoSandbox" || CATCH=1
docker run -t ${IMAGE_TAG} npm run lint || CATCH=1
docker run -t ${IMAGE_TAG} npm run prettify-check || CATCH=1

if [ -z $PERSIST_CONTAINERS ]; then docker stop $(docker ps -a -q --filter ancestor=${IMAGE_TAG} --format="{{.ID}}") || CATCH=1; fi

exit $CATCH