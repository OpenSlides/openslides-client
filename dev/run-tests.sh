#!/bin/bash

set -e

# Executes all tests. Should errors occur, CATCH will be set to 1, causing an erroneous exit code.

echo "########################################################################"
echo "###################### Run Tests and Linters ###########################"
echo "########################################################################"

# Parameters
while getopts "s" FLAG; do
    case "${FLAG}" in
    s) SKIP_BUILD=true ;;
    *) echo "Can't parse flag ${FLAG}" && break ;;
    esac
done

# Setup
CONTAINER_NAME="client-test"
IMAGE_TAG=openslides-client-tests
LOCAL_PWD=$(dirname "$0")

# Safe Exit
trap 'docker stop "$CONTAINER_NAME" &> /dev/null && docker rm "$CONTAINER_NAME" &> /dev/null' EXIT

# Execution
if [ -z "$SKIP_BUILD" ]; then make build-tests; fi
docker run -d --name "$CONTAINER_NAME" ${IMAGE_TAG}
docker exec "$CONTAINER_NAME" /bin/sh -c "apk add chromium && npm run test-silently -- --browsers=ChromiumHeadlessNoSandbox"

# Linters
bash "$LOCAL_PWD"/run-lint.sh
