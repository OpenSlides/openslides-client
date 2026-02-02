#!/bin/bash
#
# OIDC E2E Test Runner
#
# This script runs the OIDC E2E tests in a CI/agent-friendly manner.
# It checks for service availability, sets up the environment, and runs tests.
#
# Usage:
#   ./run-oidc-tests.sh [options]
#
# Options:
#   --headed        Run tests in headed mode (for debugging)
#   --debug         Enable verbose output
#   --skip-setup    Skip service availability checks
#   --browser       Browser to use (chromium, firefox, webkit)
#
# Environment variables:
#   BASE_URL        OpenSlides base URL (default: https://localhost:8000)
#   KEYCLOAK_URL    Keycloak base URL (default: http://localhost:8080)
#   CI              Set to 'true' for CI mode
#

set -e

# Default values
BASE_URL="${BASE_URL:-https://localhost:8000}"
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
HEADED=""
DEBUG=""
SKIP_SETUP=""
BROWSER="chromium"
MAX_RETRIES=30
RETRY_DELAY=2

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --headed)
            HEADED="--headed"
            shift
            ;;
        --debug)
            DEBUG="--debug"
            set -x
            shift
            ;;
        --skip-setup)
            SKIP_SETUP="true"
            shift
            ;;
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to check if a service is available
check_service() {
    local name=$1
    local url=$2
    local retries=${3:-$MAX_RETRIES}

    log_info "Checking $name availability at $url..."

    for ((i=1; i<=retries; i++)); do
        if curl -k -s -o /dev/null -w "%{http_code}" "$url" | grep -q "^[23]"; then
            log_info "$name is available"
            return 0
        fi

        if [ $i -lt $retries ]; then
            log_warn "$name not ready (attempt $i/$retries), retrying in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
    done

    log_error "$name is not available after $retries attempts"
    return 1
}

# Check Keycloak OIDC configuration endpoint
check_keycloak() {
    local url="${KEYCLOAK_URL}/auth/realms/openslides/.well-known/openid-configuration"
    check_service "Keycloak" "$url"
}

# Check OpenSlides availability
check_openslides() {
    local url="${BASE_URL}/system/auth/"
    check_service "OpenSlides" "$url"
}

# Main execution
main() {
    log_info "Starting OIDC E2E test runner"
    log_info "OpenSlides URL: $BASE_URL"
    log_info "Keycloak URL: $KEYCLOAK_URL"

    # Change to test directory
    cd "$(dirname "$0")"

    if [ -z "$SKIP_SETUP" ]; then
        # Check service availability
        if ! check_openslides; then
            log_error "OpenSlides is not available. Please start the dev stack: make dev"
            exit 1
        fi

        if ! check_keycloak; then
            log_error "Keycloak is not available. Please start Keycloak:"
            log_error "  docker compose -f dev/docker/docker-compose.dev.yml up -d keycloak"
            exit 1
        fi

        export KEYCLOAK_AVAILABLE=true
    fi

    # Export environment variables for Playwright
    export BASE_URL
    export KEYCLOAK_URL

    # Determine CI mode
    if [ -n "$CI" ]; then
        log_info "Running in CI mode"
        CI_FLAG="--reporter=github"
    else
        CI_FLAG=""
    fi

    # Run Playwright tests
    log_info "Running OIDC E2E tests..."

    npx playwright test \
        --config=playwright.oidc.config.ts \
        --project="oidc-${BROWSER}" \
        $HEADED \
        $CI_FLAG \
        "$@"

    exit_code=$?

    if [ $exit_code -eq 0 ]; then
        log_info "OIDC E2E tests passed!"
    else
        log_error "OIDC E2E tests failed with exit code $exit_code"
    fi

    exit $exit_code
}

main "$@"
