#!/bin/bash

# Executes all linters. Should errors occur, CATCH will be set to 1, causing an erroneous exit code.

echo "########################################################################"
echo "###################### Run Linters #####################################"
echo "########################################################################"

# Parameters
while getopts "lscp" FLAG; do
    case "${FLAG}" in
    l) LOCAL=true ;;
    s) SKIP_BUILD=true ;;
    c) SKIP_CONTAINER_UP=true ;;
    p) PERSIST_CONTAINERS=true ;;
    *) echo "Can't parse flag ${FLAG}" && break ;;
    esac
done

# Setup
IMAGE_TAG=openslides-client-tests

# Helpers
USER_ID=$(id -u)
GROUP_ID=$(id -g)
DC="CONTEXT=tests USER_ID=$USER_ID GROUP_ID=$GROUP_ID docker compose -f dev/docker-compose.dev.yml"

# Safe Exit
trap 'if [ -z "$PERSIST_CONTAINERS" ] && [ -z "$SKIP_CONTAINER_UP" ]; then docker stop $(docker ps -a -q --filter ancestor=${IMAGE_TAG} --format="{{.ID}}"); fi' EXIT

# Optionally build & start
if [ -z "$SKIP_BUILD" ]; then make build-tests; fi

# Execution

# No difference between local and container mode
docker run -t ${IMAGE_TAG} npm run lint
docker run -t ${IMAGE_TAG} npm run prettify-check