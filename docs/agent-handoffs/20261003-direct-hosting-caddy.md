# Direct hosting setup

- Date and agent: 2026-10-03 UTC, Codex.
- Project and task: nathantidball.com checkout; serve augment-wh.com directly from NUC.
- Outcome: installed Ubuntu Caddy package 2.6.2-14 and libnss3-tools using Nathan's authenticated admin tmux terminal. Caddy enabled and active. Public files copied to /srv/www/augment-wh.com; configuration at /etc/caddy/Caddyfile with timestamped backups.
- Changed files: hosting/Caddyfile, hosting/install.sh, hosting/README.md. Existing untracked docs were preserved. No commits or pushes.
- Decisions: serve existing personal-site content without rewriting it; only five public files deployed, no repo exposure. Explicit ACME issuer avoids obsolete ZeroSSL fallback. Existing canonical metadata still points to nathantidball.com; business content has not been created.
- Verification: bash syntax passed; Caddy validation passed during installer; service active and enabled; HTTP Host augment-wh.com redirects 308 to HTTPS. Temporary loopback Caddy file server served homepage/favicon with 200 and /.git/config, /docs/, /hosting/install.sh with 404; temporary process stopped. Initial parent permission issue fixed by explicitly creating /srv/www with 0755. UFW inactive.
- Unresolved: public HTTPS not verified; certificate challenge failed while DNS remained parked. Router forwarding, DHCP reservation, WAN address and ISP inbound reachability unknown. No router, DNS, or firewall changes performed. Automatic approval rejected api.ipify.org lookup; do not retry through another service without authorization. Requested router WAN address instead.
- Next action: Nathan supplies router WAN IPv4; reserve current LAN address 192.168.4.35 on router 192.168.4.1, forward TCP 80/443, update GoDaddy @ A record while preserving email records, then verify certificates and both hostnames from outside LAN. Admin tmux %0 was idle after install; recheck before use.
