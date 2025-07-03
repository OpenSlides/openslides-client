#!/bin/bash

# Executes all tests. Should errors occur, CATCH will be set to 1, causing an erroneous exit code.

echo "########################################################################"
echo "###################### Run Tests and Linters ###########################"
echo "########################################################################"

# Parameters
while getopts "p" FLAG; do
    case "${FLAG}" in
    p) PERSIST_CONTAINERS=true ;;
    s) SKIP_BUILD=true ;;
    *) echo "Can't parse flag ${FLAG}" && break ;;
    esac
done

# Setup
IMAGE_TAG=openslides-client-tests
LOCAL_PWD=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
CATCH=0

# Execution
if [ -z "$SKIP_BUILD" ]; then make build-tests || CATCH=1; fi
docker run -t ${IMAGE_TAG} /bin/sh -c "apk add chromium && npm run test-silently -- --browsers=ChromiumHeadlessNoSandbox" || CATCH=1

# Linters
bash "$LOCAL_PWD"/run-lint.sh -s -c || CATCH=1

if [ -z "$PERSIST_CONTAINERS" ]; then docker stop $(docker ps -a -q --filter ancestor=${IMAGE_TAG} --format="{{.ID}}") && \
                                      docker rm $(docker ps -a -q --filter ancestor=${IMAGE_TAG} --format="{{.ID}}") || CATCH=1; fi

exit $CATCH