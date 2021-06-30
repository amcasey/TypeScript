#!/usr/bin/env bash

set -eu
set -o pipefail
set -x

RELEASE_BRANCH="$1"

TS_VERSION=$(echo "${RELEASE_BRANCH}" | sed -E 's/^refs\/heads\/releases\/(.*)-midgard/\1/')

# Find the latest tag
# The --exit-code flag is used so that if it fails to find a
# git tag with the pattern "${TS_VERSION}-midgard.*", then
# LATEST_TAG_EXIT_CODE would be a non-zero value
LATEST_TAG_EXIT_CODE=0
LATEST_TAG=$(git ls-remote  --exit-code --tags --refs --sort=-version:refname origin "${TS_VERSION}-midgard.*" | head -n 1 | sed -r 's/^.*refs\/tags\/(.*)/\1/' ) || LATEST_TAG_EXIT_CODE=$?


if [[ "$LATEST_TAG_EXIT_CODE" = 0 ]]; then
  # If the LATEST_TAG_EXIT_CODE is 0, then
  # it successfully found a tag with this pattern: "${TS_VERSION}-midgard.*"
  # This means the new tag needs to increment the patch version e.g
  # v4.3.4-midgard.1 ->  v4.3.4-midgard.2
  PREV_PATCH=$(echo "$LATEST_TAG" | sed -r 's/.*-midgard\.(.+)/\1/')
  PATCH_VERSION=$(($PREV_PATCH + 1 ))
else
  # If the LATEST_TAG_EXIT_CODE is non-zero, then
  # it couldn't find a tag with this pattern: "${TS_VERSION}-midgard.*"
  # This means there is no release of typescript-platform-resolution
  # based on TS_VERSION, hence the PATCH_VERSION should be 0.
  echo "Creating first release of fork on TS verion: ${TS_VERSION}"
  PATCH_VERSION=0
fi

# Build
npm install
npm run jake LKG
git add .
git commit -m "Update LKG"

# Update name.
sed -i -E "s/\"name\": \"typescript\"/\"name\": \"@msfast\/typescript-platform-resolution\"/" package.json
git commit -a -m "Update name to @msfast/typescript-platform-resolution"

# Set Midgard fork version

NEXT_VERSION="${TS_VERSION}-midgard.${PATCH_VERSION}"
echo "New midgard version is: ${NEXT_VERSION}"
npm version "$NEXT_VERSION"

# Push midgard fork release
git push origin --tags
