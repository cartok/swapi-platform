# Hosting Plan

1. Fly.io
   - A small stateless app
   - Initially without a custom domain
   - No volume
   - No autoscaling
2. Cloudflare in front of Fly
   - Custom domain managed in Cloudflare
   - Cloudflare DNS / proxy
   - WAF enabled
   - CDN / asset caching
   - Later, targeted HTML caching for SSR/SSG responses
   - Fly remains the origin
3. Cloudflare Worker in front of Fly
   - Edge routing / negotiation for device detection
   - Client Hints evaluation
   - Redirect / rewrite / variant decision logic
4. Optional: deploy the app itself to Cloudflare Workers
   - To gain hands-on experience with the Workers model
   - Without Cloudflare Containers
   - Static assets are free / unlimited
   - Dynamic Worker requests are limited in the free plan
5. Switch to VPS + Docker Compose
   - Multiple services
   - DB + CRUD API
   - Optional AI service
   - Optional separate routing/negotiation service
   - Monitoring / logging / alerting
   - Cloudflare remains in front
6. Optional later: Kubernetes / k3s
   - For exploration only
