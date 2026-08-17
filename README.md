# V2R Website

This is the local static marketing site for Vision to Reality (V2R).
It is intentionally plain HTML and CSS with no build step, no framework,
and no package manager.

The site uses repository-root GitHub Pages structure: `index.html`,
`styles.css`, and `assets/` live at the root. This is the simplest path
for a small public landing page because GitHub Pages can serve the root
directly without generated files or a separate `docs/` publishing folder.

## Content Source

Copy is adapted from the approved public-facing company documents:

- `docs/company/complete-company-overview.md`
- `docs/company/identity.md`

No internal-only or governance documents were used for page copy.

## Local Preview

Open `index.html` directly in a browser, or run:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publishing Status

This repository is local only. It has no git remote and is not connected
to a live domain.

Cloudflare in front of GitHub Pages for DNS, CDN, and WAF was the
orchestrator's recommendation, but it is not configured here. That
requires the founder's own Cloudflare account and domain decision.
