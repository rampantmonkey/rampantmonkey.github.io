#!/usr/bin/env bash

set -e

username="${USERNAME:-}"
hostname="${HOST:-rm}"
if [ ! -z $username ]; then
    username="${username}@"
fi
ssh_key_path="${KEYPATH:-$HOME/.ssh/id_rsa}"

hugo --theme=rampantmonkey -d public
rsync -v -r -e "ssh -i ${ssh_key_path}" -u --delete public/ "${username}${hostname}:rm/"
rm -r public
