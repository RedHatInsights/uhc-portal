#!/bin/bash
# Exec `podman` (default) or `docker`, with friendly error message.
# Respects RUNNER env var.
RUNNER="${RUNNER:-podman}"

if which "$RUNNER" > /dev/null; then
  set -x
  exec "$RUNNER" "$@"
fi

(
  echo "ERROR: $RUNNER not found"
  if which podman > /dev/null; then
    echo "  - podman: found, you can force it by: export RUNNER=podman"
  else
    echo "  - podman: not found. On Fedora: sudo dnf install podman"
  fi
  if which docker > /dev/null; then
    echo "  - docker: found, you can force it by: export RUNNER=docker"
  else
    echo "  - docker: not found. On Fedora: sudo dnf install moby-engine; export RUNNER=docker"
  fi
  echo "  podman is preferred but either should work."
) >&2
