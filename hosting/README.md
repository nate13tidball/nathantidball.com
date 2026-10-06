# Direct hosting

This configuration serves the existing personal-site files at augment-wh.com
and www.augment-wh.com. It does not create business-site content or change the
personal site's canonical URLs. GitHub Pages deployment is independent.

Install or deploy updated public files from this checkout:

```sh
sudo bash hosting/install.sh
```

Caddy runs under the distribution's dedicated service account and serves only
the five explicitly copied files in /srv/www/augment-wh.com. The checkout,
Git history, and handoffs are not web-accessible. Configuration backups live
under /etc/caddy. Re-running the installer deploys current public files.

## Network setup

1. Reserve this computer's LAN address in the router's DHCP settings.
2. Forward TCP ports 80 and 443 to that address. Do not forward SSH or Caddy's
   local administration port 2019.
3. Allow inbound TCP 80 and 443 in the host firewall if it is enabled.
4. Compare the router's WAN IPv4 address with its upstream connection. A private
   address or 100.64.0.0/10 address indicates upstream NAT that needs resolving
   with the ISP or upstream router before ordinary IPv4 forwarding will work.
5. Replace GoDaddy's parked A record for @ with the reachable public IPv4.
   Keep www pointing to augment-wh.com and preserve email and nameserver records.
6. Verify from a different internet connection that both hostnames serve HTTPS.

Caddy automatically requests and renews certificates once DNS and incoming
connections reach it. Local installation alone does not verify public HTTPS.
If the public IPv4 changes, update the A record. Keep this computer awake and
connected for availability.

## Checks

```sh
sudo caddy validate --config /etc/caddy/Caddyfile
systemctl status caddy
sudo journalctl -u caddy -n 50 --no-pager
curl -I http://augment-wh.com
curl -I https://augment-wh.com
curl -I https://www.augment-wh.com
curl -I https://augment-wh.com/.git/config
curl -I https://augment-wh.com/docs/
```

The last two requests must return 404. Stop local hosting with
`sudo systemctl disable --now caddy`; DNS and router settings must be reverted
separately if retiring the service.
