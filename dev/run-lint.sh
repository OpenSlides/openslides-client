#!/bin/bash

# Executes all linters. Should errors occur, CATCH will be set to 1, causing an erroneous exit code.

echo "########################################################################"
echo "###################### Run Linters #####################################"
echo "########################################################################"

# Parameters
while getopts "ls" FLAG; do
    case "${FLAG}" in
    l) LOCAL=true ;;
    s) SKIP_SETUP=true ;;
    *) echo "Can't parse flag ${FLAG}" && break ;;
    esac
done

# Setup
CONTAINER_NAME="client-tests"
IMAGE_TAG=openslides-client-tests

# Helpers
USER_ID=$(id -u)
GROUP_ID=$(id -g)
DC="CONTEXT=tests USER_ID=$USER_ID GROUP_ID=$GROUP_ID docker compose -f dev/docker-compose.dev.yml"

# Safe Exit
trap 'if [ -z "$LOCAL" ]; then docker stop "$CONTAINER_NAME" &> /dev/null && docker rm "$CONTAINER_NAME" &> /dev/null; fi' EXIT

# Execution
if [ -z "$LOCAL" ]
then
    # Setup
    if [ -z "$SKIP_SETUP" ]
    then
        make build-tests
        docker run -d --name "$CONTAINER_NAME" ${IMAGE_TAG}
    fi

    # Container Mode
    docker exec "$CONTAINER_NAME" npm run lint
    docker exec "$CONTAINER_NAME" npm run prettify-check
else
    # Local Mode
    npm run lint
    npm run prettify-check
fi
