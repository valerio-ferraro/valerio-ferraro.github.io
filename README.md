# Minimal Academic Personal Website

Fast static multi-page site inspired by the provided reference screenshot.

## Stack

- HTML5 + CSS3 + vanilla JavaScript
- Vite for local dev server and production build
- GitHub Actions workflow for GitHub Pages deployment

## Included Pages

- `index.html` (About / Home)
- `research.html`
- `photography.html`
- `blog.html` (Blog & Writings)
- `404.html`

## SEO + Accessibility

- Title and meta description on every page
- Open Graph and Twitter cards on every page
- Canonical URLs on every page
- `favicon.svg`
- `public/sitemap.xml`
- `public/robots.txt`
- Semantic landmarks (`header`, `nav`, `main`, `footer`)
- Skip link, keyboard-friendly menu, visible focus styles, alt text

## Run Locally

```bash
npm install
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

## Build Locally

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push this `academic-site` folder as the root of a GitHub repository.
2. Keep the workflow at `.github/workflows/deploy-github-pages.yml`.
3. In GitHub: `Settings` -> `Pages` -> set `Source` to `GitHub Actions`.
4. Push to `main`; deployment starts automatically.

## Configured Site URL

The project is currently configured with:

- `https://valerioferraro.github.io/`

If your final GitHub username/repository is different, run this once from project root:

```powershell
$old = "https://valerioferraro.github.io"
$new = "https://YOUR-USERNAME.github.io/YOUR-REPO"
Get-ChildItem -Recurse -File -Include *.html,*.xml,*.txt,README.md | ForEach-Object {
  (Get-Content $_.FullName -Raw).Replace($old, $new) | Set-Content $_.FullName
}
```

## Indexing Checklist

After the site is live:

1. Add your site to Google Search Console.
2. Submit `https://YOUR-DOMAIN/sitemap.xml`.
3. Request indexing for the home page.
4. Repeat on Bing Webmaster Tools for faster discovery.





