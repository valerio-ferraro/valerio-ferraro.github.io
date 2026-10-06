# Valerio Ferraro — personal website

A static, English-language research website built with semantic HTML, CSS, vanilla JavaScript and Vite. Fonts are served locally. No analytics, cookies, or third-party embeds.

## Preview and publication

The redesign is on `design/editorial-preview`. Pushing this branch does **not** deploy GitHub Pages. The workflow also rejects manual deployment from non-main branches.

The repository and this branch are public: source files and images are readable on GitHub. The running preview is bound to `127.0.0.1`, so the preview website is available only on the local computer.

The existing public website remains at https://valerio-ferraro.github.io/. Merging this branch into `main` will publish the redesign automatically; do this only when it is approved. Robots directives currently request no indexing; they are not access control.

## Run

With Node.js and npm installed:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173/. For a production preview, stop the development server, then run:

```sh
npm run build
npm run preview
```

Both servers listen only on the local computer. If port 4173 is occupied, stop the existing preview or select another port.

## Content

- `index.html`: biography, supplied portrait, research interests, CV and contact links.
- `research.html`: working paper and ten OCPI articles retained from the previous website, with their existing authors, dates and links. Academic and policy work are separate. Update the category counts when adding entries.
- `photography.html`: six existing illustrative studies, explicitly identified as temporary. Replace the files and descriptions with the approved photographic selection later.
- `blog.html`: an onward link to public writing, preserving the old address without fictional blog posts.
- `404.html`: recovery links for missing pages.
- `assets/css/styles.css`: responsive layout, type, colour and motion.
- `assets/js/main.js`: research filters, interest selector and gallery viewer.

The biography is based on the supplied statement of purpose. It does not assert a PhD enrolment or current university appointment. The paper abstract is preserved from the prior site; verify it against the next paper version before publication.

## Design and accessibility

Warm paper, dark ink and a muted olive accent. Libre Caslon Display is paired with DM Sans; both have SIL Open Font Licences in `public/fonts/`.

Research is readable without JavaScript. With JavaScript, category URLs and browser history work together with accent-insensitive keyword search. The gallery uses the native modal dialog with Escape, arrow navigation and focus return. Motion follows the visitor's reduced-motion preference. All pages include a skip link, labelled navigation and visible keyboard focus.

Design references: [Web Style Guide](https://webstyleguide.com/), [web.dev responsive design](https://web.dev/learn/design), and [Practical Typography](https://practicaltypography.com/typography-in-ten-minutes.html).
