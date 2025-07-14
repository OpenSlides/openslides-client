#!/bin/bash

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
IMAGE_TAG=openslides-client-tests
LOCAL_PWD=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Safe Exit
trap 'docker stop client-test && docker rm client-test' EXIT

# Execution
if [ -z "$SKIP_BUILD" ]; then make build-tests; fi
docker run -t ${IMAGE_TAG} --name client-test /bin/sh -c "apk add chromium && npm run test-silently -- --browsers=ChromiumHeadlessNoSandbox"

# Linters
bash "$LOCAL_PWD"/run-lint.sh -s -c