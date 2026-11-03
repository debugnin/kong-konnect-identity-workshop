#!/usr/bin/env bash
# Remove everything the workshop created. Prompts before deleting anything in Konnect.
#   ./99-cleanup.sh            interactive
#   ./99-cleanup.sh --yes      no prompts
#   ./99-cleanup.sh --local    only stop containers and delete local generated files
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
yes=0; local_only=0
for a in "$@"; do case "$a" in --yes) yes=1;; --local) local_only=1;; *) die "usage: $0 [--yes] [--local]";; esac; done
confirm() { [[ "$yes" == 1 ]] && return 0; read -r -p "$1 [y/N] " r; [[ "$r" == y || "$r" == Y ]]; }

hdr "Local containers"
if confirm "Stop and remove the workshop containers?"; then
  compose down -v --remove-orphans >&2 || warn "compose down reported a problem (already stopped?)"
fi

if [[ "$local_only" == 0 ]]; then
  if [[ -n "${PRINCIPAL_ID:-}" && -n "${DIRECTORY_ID:-}" ]] && confirm "Delete principal $PRINCIPAL_ID (and its identities) from Kong Identity?"; then
    konnect DELETE "/v2/directories/$DIRECTORY_ID/principals/$PRINCIPAL_ID" >/dev/null && ok "principal deleted" || warn "principal delete failed or already gone"
  fi
  if [[ "$(state_get DIRECTORY_CREATED_BY_WORKSHOP)" == "yes" && -n "${DIRECTORY_ID:-}" ]] && confirm "Delete the directory the workshop created ($DIRECTORY_ID)?"; then
    konnect DELETE "/v2/directories/$DIRECTORY_ID" >/dev/null && ok "directory deleted" || warn "directory delete failed (is it empty?)"
  elif [[ "$(state_get DIRECTORY_CREATED_BY_WORKSHOP)" == "no" ]]; then
    note "Directory pre-existed in your org — leaving it alone."
  fi
  if [[ -n "${CONTROL_PLANE_ID:-}" ]] && confirm "Delete control plane '$CONTROL_PLANE_NAME' (removes its services, routes, plugins, consumers, groups)?"; then
    konnect DELETE "/v2/control-planes/$CONTROL_PLANE_ID" >/dev/null && ok "control plane deleted" || warn "control plane delete failed or already gone"
  fi
fi

if confirm "Delete local generated files (.generated/: secrets, DP certificate)?"; then rm -rf "$GEN_DIR"; ok "removed .generated/"; fi
ok "cleanup finished"
