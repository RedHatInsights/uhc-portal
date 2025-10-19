#!/usr/bin/env bash


#####################################################################################
# this script generates a monitored production build of the app,
# injecting and uploading sourcemaps to the sentry ('glitchtip')
# alerting/monitoring system.
# @see https://glitchtip.devshift.net/ocm/releases (releases page)
# @see https://glitchtip.devshift.net/ocm/issues?project=65 (production env' project)
#####################################################################################


set -e

# don't set up sentry env' vars on preview builds;
# sourcemaps are only relevant to stable environments.
if [[ ${BETA} != 'true' ]]; then
  # fixme - this bypasses a git ownership issue in konflux builds, to allow getting the git revision.
  # fixme - we should probably look for a less hackish way to do that
  git config --global --add safe.directory /opt/app-root/src

  VERSION="${VERSION:-$(git rev-parse --short HEAD)}"

  export SENTRY_PROJECT="ocm-uhc-portal"
  export SENTRY_VERSION="$SENTRY_PROJECT-$VERSION"

  echo "
  Sentry environment:
    SENTRY_PROJECT=$SENTRY_PROJECT
    SENTRY_VERSION=$SENTRY_VERSION
  "
fi

# run a prod' build anyway - the build will use sentry env' vars,
# if they're available, to initialize monitoring.
yarn build:prod

# inject and publish sourcemaps to glitchtip releases, on stable environments.
if [[ ${BETA} != 'true' ]]; then
  yarn sentry:sourcemaps-release
fi

