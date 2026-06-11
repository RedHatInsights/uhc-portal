#!/usr/bin/env bash
# Sync fork branch to parent main, then open a PR: fork branch -> parent:security-compliance
#
# Setup (one-time):
#   - git remote add upstream <parent-clone-url>   # parent (openshift, etc.)
#   - origin should be your fork (read/write)
#   - gh auth login
#
# Usage: run from a clone of your fork, repo root.
#
# Optional env:
#   UPSTREAM_REMOTE, FORK_REMOTE, MAIN_BRANCH, TARGET_BRANCH

set -euo pipefail

UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-upstream}"
FORK_REMOTE="${FORK_REMOTE:-origin}"
MAIN_BRANCH="${MAIN_BRANCH:-main}"
TARGET_BRANCH="${TARGET_BRANCH:-security-compliance}"

die() { echo "error: $*" >&2; exit 1; }
command -v git >/dev/null 2>&1 || die "git is required"
command -v gh >/dev/null 2>&1 || die "gh (GitHub CLI) is required"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  die "run this from inside a git repository"
fi
if [ -n "$(git status --porcelain)" ]; then
  die "working tree is not clean; commit or stash changes first"
fi

github_owner_repo_from_url() {
  # ssh: git@github.com:org/repo.git
  # https: https://github.com/org/repo
  local url="$1"
  if [[ "$url" =~ github\.com[:/]([^/]+)/([^/]+) ]]; then
    echo "${BASH_REMATCH[1]}/${BASH_REMATCH[2]//.git/}"
  else
    return 1
  fi
}

UPSTREAM_URL=$(git remote get-url "$UPSTREAM_REMOTE" 2>/dev/null) \
  || die "remote '$UPSTREAM_REMOTE' not found. Add the parent, e.g.: git remote add $UPSTREAM_REMOTE <url>"
FORK_URL=$(git remote get-url "$FORK_REMOTE" 2>/dev/null) \
  || die "remote '$FORK_REMOTE' not found"

PARENT_REPO=$(github_owner_repo_from_url "$UPSTREAM_URL") \
  || die "could not parse parent repo from $UPSTREAM_URL"
FORK_REPO=$(github_owner_repo_from_url "$FORK_URL") \
  || die "could not parse fork from $FORK_URL"
FORK_OWNER="${FORK_REPO%%/*}"

SYNC_REF="$UPSTREAM_REMOTE/$MAIN_BRANCH"
if ! git rev-parse --verify "$SYNC_REF" >/dev/null 2>&1; then
  git fetch "$UPSTREAM_REMOTE" "$MAIN_BRANCH"
fi

DATE_STR="$(date +%Y-%m-%d)"
# Unique branch in case the script is run more than once per day
BRANCH="update-${TARGET_BRANCH}-${DATE_STR}-$(date +%H%M%S)"

git fetch "$UPSTREAM_REMOTE" "$MAIN_BRANCH"
git switch -c "$BRANCH" "$SYNC_REF"
git push -u "$FORK_REMOTE" "$BRANCH"

TITLE="Update security-compliance on ${DATE_STR}"
BODY="This PR updates \`$TARGET_BRANCH\` to match the current \`$MAIN_BRANCH\` from the parent repository (\`$PARENT_REPO\`).

- Sync source: \`$SYNC_REF\`
- Pushed from fork: \`$FORK_OWNER/$BRANCH\`"

gh pr create \
  --repo "$PARENT_REPO" \
  --base "$TARGET_BRANCH" \
  --head "${FORK_OWNER}:${BRANCH}" \
  --title "$TITLE" \
  --body "$BODY"

echo "Done. Opened PR: $PARENT_REPO base=$TARGET_BRANCH <- ${FORK_OWNER}:${BRANCH}"
