#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
if [[ $EUID -ne 0 ]]; then
    echo 'Run this script with sudo.' >&2
    exit 1
fi
# Only these public assets are deployed; Git history and handoffs stay private.
public_files=(index.html 404.html favicon.svg robots.txt sitemap.xml)
for file in "${public_files[@]}"; do
    test -f "$file"
done
if ! command -v caddy >/dev/null; then
    apt-get update
    apt-get install -y caddy
fi
caddy validate --config "$PWD/hosting/Caddyfile" --adapter caddyfile
install -d -m 0755 /srv/www /srv/www/augment-wh.com
install -m 0644 "${public_files[@]}" /srv/www/augment-wh.com/
if [[ -f /etc/caddy/Caddyfile ]]; then
    cp -a /etc/caddy/Caddyfile "/etc/caddy/Caddyfile.backup.$(date +%s)"
fi
install -m 0644 hosting/Caddyfile /etc/caddy/Caddyfile
systemctl daemon-reload
systemctl enable caddy
if systemctl is-active --quiet caddy; then
    systemctl reload caddy
else
    systemctl start caddy
fi
systemctl --no-pager status caddy
