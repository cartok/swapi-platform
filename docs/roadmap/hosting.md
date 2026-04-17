# Hosting Roadmap

## Phase 1: Fly.io

- [x] Deploy a small stateless app.
- [x] Start without a custom domain.
- [x] Run without volumes.
- [x] Run without autoscaling.

## Phase 2: Cloudflare in front of Fly.io

- [x] Manage the custom domain in Cloudflare.
- [x] Enable Cloudflare DNS/proxy.
- [x] Enable CDN/asset caching.
- [ ] Verify that device-specific HTML pages are cached correctly. The current URL-based redirection likely already addresses most cache-variant concerns.

## Phase 3: Cloudflare Worker in front of Fly.io

- Implement edge routing and negotiation for device detection.
- Evaluate Client Hints.
- Implement redirect/rewrite/variant decision logic.

## Phase 4 (optional): Deploy the app to Cloudflare Workers

- Gain hands-on experience with the Workers runtime model.
- Do this without Cloudflare Containers.
- Benefit from free/unlimited static asset hosting.
- Consider free-plan limits for dynamic Worker requests.

## Phase 5: Move to VPS + Docker Compose

- Run multiple services incl. own monitoring, logging, alerting.

## Phase 6 (optional): Kubernetes/k3s

- Exploration only.

## Deployment Automation

- Set up GitHub Actions deployments (for example via release tags).
