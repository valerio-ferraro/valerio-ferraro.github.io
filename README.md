# Valerio Ferraro — personal website

A static, English-language research website built with semantic HTML, CSS, vanilla JavaScript and Vite. Uses system typography. No analytics, cookies, or third-party embeds.

## Preview and publication

Work continues on `design/editorial-preview`. Pushing this branch runs build checks; GitHub Pages deploys only from `main`.

The repository and this branch are public: source files and images are readable on GitHub. The running preview is bound to `127.0.0.1`, so the preview website is available only on the local computer.

The public website is at https://valerio-ferraro.github.io/. Updating `main` publishes the corresponding build automatically; publish only reviewed changes. Robots directives currently request no indexing; they are not access control.

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
- `research.html`: working paper and ten OCPI articles retained from the previous website, with their existing authors, dates and links. Academic and policy work are separate.
- `photography.html`: six existing illustrative studies, explicitly identified as temporary. Replace the files and descriptions with the approved photographic selection later.
- `blog.html`: an onward link to public writing, preserving the old address without fictional blog posts.
- `404.html`: recovery links for missing pages.
- `assets/css/styles.css`: responsive layout, type, colour and motion.
- `assets/js/main.js`: pointer-responsive portrait and gallery viewer.

The biography is based on the supplied statement of purpose. It does not assert a PhD enrolment or current university appointment. The paper abstract is preserved from the prior site; verify it against the next paper version before publication.

## Design and accessibility

Near-white background, charcoal text and a restrained red accent. A single system sans-serif family is used throughout. The supplied portrait retains its original colour.

Research and section links work without JavaScript. The portrait uses an 81-pose grid (9 × 9) generated directly from the supplied original PICT_20260903_113453.JPG with LivePortrait, without creating a separately restyled master. The offline model keeps the original source appearance/expression while varying head yaw by ±12 degrees, pitch by ±8 degrees, and eye direction together. These are model-generated approximations; they are not exact untouched photographs or a reconstructed 3D head. The no-JavaScript, reduced-motion, loading and failure fallback is a direct crop of the original photo.

`public/images/portrait-live/manifest.json` defines the two WebP atlases, cell dimensions, neutral pose and eye midpoint. Desktop cells are 256 × 256; phone/coarse-pointer cells are 160 × 160. A canvas draws only the selected frame; a critically damped controller smooths pose changes without crossfading faces or adding synthetic pupil overlays. Mouse movement follows the pointer; touch interaction over the portrait preserves normal page scrolling. Movement returns to neutral when focus or visibility is lost, and animation stops once settled. Reduced-motion visitors do not download an atlas. Asset filenames are content-hashed. No runtime AI, tracking, external calls or GPU server is required by visitors. Offline generation ran locally on CPU using the MIT-licensed LivePortrait human models; attribution is stored with the assets.

The existing feathered oval mask softens the portrait. The gallery uses a native modal dialog with Escape, arrow navigation and focus return. All pages include a skip link, labelled navigation and visible keyboard focus.

Design references supplied by Valerio: [Lynn Fisher](https://lynnandtonic.com/), [Jack McDade](https://jackmcdade.com/), [Tim Rodenbröker](https://timrodenbroeker.de/), and [Ahmed Dahbi](https://dahbiahmed.com/). No source code or creative assets were copied from these sites.
