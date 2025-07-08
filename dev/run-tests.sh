#!/bin/bash

# Executes all tests. Should errors occur, CATCH will be set to 1, causing an erroneous exit code.

echo "########################################################################"
echo "###################### Run Tests and Linters ###########################"
echo "########################################################################"

# Setup
IMAGE_TAG=openslides-client-tests
CATCH=0

# Safe Exit
trap 'docker stop $(docker ps -a -q --filter ancestor=${IMAGE_TAG})' EXIT

# Execution
if [ "$(docker images -q $IMAGE_TAG)" = "" ]; then make build-test || CATCH=1; fi
docker run -t ${IMAGE_TAG} /bin/sh -c "apk add chromium && npm run test-silently -- --browsers=ChromiumHeadlessNoSandbox" || CATCH=1
docker run -t ${IMAGE_TAG} npm run lint || CATCH=1
docker run -t ${IMAGE_TAG} npm run prettify-check || CATCH=1

exit $CATCH