# rampantmonkey.com

Personal website, now maintained as plain static HTML/CSS.

## Editing workflow

- Edit pages directly in the repo root.
- Home page: `index.html`
- Writing posts: `writing/<slug>/index.html`
- Shared styles: `main.css`
- Static assets: `images/` and `files/`

## Deploy

GitHub Pages builds a `site/` artifact by copying static files and deploys that artifact via `.github/workflows/pages.yml`.
