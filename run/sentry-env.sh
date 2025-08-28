#!/bin/bash -e


# this script defines env' vars used by Sentry for building, injecting and publishing sourcemaps.
#
# it should be sourced rather than executed, e.g. within the shell:
# . run/sentry-env.sh && yarn build:saas
#
# @see package.json#scripts.sentry:sourcemaps-release:saas
# @see https://glitchtip.devshift.net/ocm/issues?project=65 (production)


# don't set up sentry-env on preview builds;
# sourcemaps are only deployed to stable environments.
if [[ ${BETA} == 'true' ]]; then
  return 0
fi


VERSION="${VERSION:-$(git rev-parse --short HEAD)}"

export SENTRY_PROJECT="ocm-uhc-portal"
export SENTRY_VERSION="$SENTRY_PROJECT-$VERSION"

echo "
Sentry environment:
  SENTRY_PROJECT=$SENTRY_PROJECT
  SENTRY_VERSION=$SENTRY_VERSION
"

