#!/bin/bash
# Auto-load Node 22 for this project
# Source this in your shell profile

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Auto-use .nvmrc on cd
nvm_cd() {
  cd "$@" || return
  if [[ -f .nvmrc ]]; then
    nvm use > /dev/null 2>&1
  fi
}

alias cd='nvm_cd'
