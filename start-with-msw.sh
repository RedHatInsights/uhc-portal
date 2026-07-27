#!/bin/bash
set -e

CONTAINER_NAME="frontend-development-proxy"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check prerequisites
if [[ ! -f "$REPO_ROOT/prod.foo.redhat.com.pem" ]] || [[ ! -f "$REPO_ROOT/prod.foo.redhat.com-key.pem" ]]; then
    echo "Error: mkcert certificates not found."
    echo "Run: npm run msw:setup"
    exit 1
fi

if [[ ! -f "$REPO_ROOT/.caddy/Caddyfile" ]]; then
    echo "Error: Custom Caddyfile not found at .caddy/Caddyfile"
    exit 1
fi

# Detect container runtime once
if command -v podman &> /dev/null; then
    RUNTIME="podman"
elif command -v docker &> /dev/null; then
    RUNTIME="docker"
else
    echo "Error: Neither podman nor docker found"
    exit 1
fi

# Determine volume mount options (SELinux labeling only on Linux)
MOUNT_OPTS="ro"
if [[ "$(uname)" == "Linux" ]]; then
    MOUNT_OPTS="ro,Z"
fi

# Remove any leftover container from a previous run so the wait loop
# only finds the freshly-created one from this FEC session.
$RUNTIME stop "$CONTAINER_NAME" 2>/dev/null || true
$RUNTIME rm "$CONTAINER_NAME" 2>/dev/null || true

echo "Starting dev server with MSW support..."

# Start the dev server in the background
MSW_ENABLED=true npm run start &
DEV_SERVER_PID=$!

# Function to cleanup on exit.
# npm -> concurrently (--kill-others) -> webpack, http-server, container
# Killing npm triggers concurrently's --kill-others, which cleans up the rest.
# We also stop the recreated container since concurrently only knows about the original.
cleanup() {
    echo ""
    echo "Shutting down..."
    $RUNTIME stop $CONTAINER_NAME 2>/dev/null || true
    $RUNTIME rm $CONTAINER_NAME 2>/dev/null || true
    kill $DEV_SERVER_PID 2>/dev/null || true
    wait $DEV_SERVER_PID 2>/dev/null || true
}

trap cleanup SIGINT SIGTERM EXIT

# Wait for the Caddy container to start
echo "Waiting for Caddy container to start..."
MAX_WAIT=120
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    if $RUNTIME container inspect "$CONTAINER_NAME" &>/dev/null; then
        echo "Caddy container is running"
        break
    fi
    sleep 1
    WAITED=$((WAITED + 1))

    if [ $((WAITED % 10)) -eq 0 ]; then
        echo "  Still waiting... (${WAITED}s)"
    fi
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo "Error: Timeout waiting for Caddy container to start"
    exit 1
fi

# Give it a couple more seconds to fully initialize
sleep 3

# Extract container configuration
echo "Mounting mkcert certificates..."
# Podman uses .ImageName, Docker uses .Config.Image
IMAGE=$($RUNTIME container inspect "$CONTAINER_NAME" --format '{{.ImageName}}' 2>/dev/null \
    || $RUNTIME container inspect "$CONTAINER_NAME" --format '{{.Config.Image}}')
ROUTES_CONFIG=$($RUNTIME container inspect "$CONTAINER_NAME" --format '{{range .Mounts}}{{if eq .Destination "/config/routes.json"}}{{.Source}}{{end}}{{end}}')

# Extract ALL environment variables from the original container
ENV_ARGS=()
while IFS= read -r envvar; do
    [[ -z "$envvar" ]] && continue
    ENV_ARGS+=("-e" "$envvar")
done < <($RUNTIME container inspect "$CONTAINER_NAME" --format '{{range .Config.Env}}{{println .}}{{end}}')

# Extract port mapping
PORT_MAPPING=$($RUNTIME port "$CONTAINER_NAME" 2>/dev/null | head -1 || echo "")
if [[ -n "$PORT_MAPPING" ]]; then
    CONTAINER_PORT="${PORT_MAPPING%% *}"
    HOST_PORT="${PORT_MAPPING##*:}"
else
    CONTAINER_PORT="1337/tcp"
    HOST_PORT="1337"
fi

# Stop, remove, and restart container with custom certificates
$RUNTIME stop "$CONTAINER_NAME"
$RUNTIME rm "$CONTAINER_NAME"

$RUNTIME run -d \
    "${ENV_ARGS[@]}" \
    -p "${HOST_PORT}:${CONTAINER_PORT}" \
    -v "$ROUTES_CONFIG:/config/routes.json:${MOUNT_OPTS}" \
    -v "$REPO_ROOT/.caddy/Caddyfile:/etc/caddy/Caddyfile:${MOUNT_OPTS}" \
    -v "$REPO_ROOT/prod.foo.redhat.com.pem:/certs/prod.foo.redhat.com.pem:${MOUNT_OPTS}" \
    -v "$REPO_ROOT/prod.foo.redhat.com-key.pem:/certs/prod.foo.redhat.com-key.pem:${MOUNT_OPTS}" \
    --name "$CONTAINER_NAME" \
    "$IMAGE"

echo ""
echo "MSW dev environment ready!"
echo "Visit: https://prod.foo.redhat.com:1337/openshift"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Wait for the dev server to exit
wait $DEV_SERVER_PID
