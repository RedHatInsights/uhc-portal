#!/bin/bash
# Start insights-proxy with our config.
# This script replaces the builtin env.sh & run.sh scripts from insights-proxy.

set -e -u -o pipefail

cd "$(dirname "$(dirname "$0")")"  # repo root directory (above run/ that contains this script)

# If insights-proxy is already running, spandx will happily start on
# next available port, despite us requesting specific SPANDX_PORT.
npm run stop-insights-proxy
export SPANDX_PORT=1337
run/check-spandx-port-available.js

export CUSTOM_CONF=true
export CUSTOM_CONF_PATH="${CUSTOM_CONF_PATH:-$PWD/profiles/local-frontend.js}"

case "$(uname -s)" in
    Linux*)
        OPTS="--net=host --env PLATFORM=linux";;
    Darwin*)
        OPTS="--env PLATFORM=darwin";;
    *)
        echo 'This only works on Linux or Darwin!'
        exit 1;;
esac

# insights-proxy container currently tends to not die when killed with SIGTERM.
# `podman run` may "detach" & exit, but container stays running,
# or may not exit at all!  So abort it ourselves.
trap 'echo Trapped SIGINT; npm run stop-insights-proxy' INT
trap 'echo Trapped SIGTERM; npm run stop-insights-proxy' TERM
trap 'echo Trapped SIGHUP; npm run stop-insights-proxy' HUP
trap 'npm run stop-insights-proxy' EXIT

# bash doesn't trap signals while a foreground command is running.
# Running in background + wait allows the trap to work.
run/podman-or-docker.sh run \
                      --rm --name insightsproxy \
                      --add-host qa.foo.redhat.com:127.0.0.1 \
                      --add-host prod.foo.redhat.com:127.0.0.1 \
                      --env SPANDX_PORT \
                      --env CUSTOM_CONF --volume "$CUSTOM_CONF_PATH":/config/spandx.config.js \
                      --security-opt label=disable \
                      $OPTS \
                      -p 1337:1337 \
                      quay.io/redhat-sd-devel/insights-proxy:3.2.1 &
child_pid=$!
wait $child_pid
