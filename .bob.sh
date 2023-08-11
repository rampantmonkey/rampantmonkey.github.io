#!/usr/bin/env bash
set -e

git diff --quiet HEAD^ -- website && echo "No changes to the website. Exiting." && exit 0

pushd website
go build
./website

chmod 755 -R rendered

rsync -v -r -e "ssh -i $SSH_KEY -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no" -u --delete rendered/ deploy@rampantmonkey.com:rm/
popd
