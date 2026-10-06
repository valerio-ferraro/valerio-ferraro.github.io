# Valerio Ferraro — personal website

A static, English-language research website built with semantic HTML, CSS, vanilla JavaScript and Vite. Uses system typography. No analytics, cookies, or third-party embeds.

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
- `research.html`: working paper and ten OCPI articles retained from the previous website, with their existing authors, dates and links. Academic and policy work are separate.
- `photography.html`: six existing illustrative studies, explicitly identified as temporary. Replace the files and descriptions with the approved photographic selection later.
- `blog.html`: an onward link to public writing, preserving the old address without fictional blog posts.
- `404.html`: recovery links for missing pages.
- `assets/css/styles.css`: responsive layout, type, colour and motion.
- `assets/js/main.js`: pointer-responsive portrait and gallery viewer.

The biography is based on the supplied statement of purpose. It does not assert a PhD enrolment or current university appointment. The paper abstract is preserved from the prior site; verify it against the next paper version before publication.

## Design and accessibility

Near-white background, charcoal text and a restrained red accent. A single system sans-serif family is used throughout. The supplied portrait retains its original colour.

Research and section links work without JavaScript. The portrait uses the generated 25-pose colour atlas with wider framing (`public/images/portrait-directions-v4.png`), based on PICT_20260903_113453.JPG. Pointer position selects a row and column; the animation traverses adjacent poses at 42 ms intervals, with hysteresis to avoid boundary flicker. Direction is measured from the eyes, with an 18px neutral zone and sensitivity relative to the portrait size rather than the viewport. A feathered oval mask and a faint radial backdrop soften the cutout. The generated cell bounds are calibrated individually to avoid clipping hair and displaying adjacent cells. Eye direction is baked into each image; this is not independent, continuous pupil tracking. This is a sequence of generated stills, not a continuous 3D model. A central pose appears without JavaScript, on touch devices, and with reduced motion. Movement resets when the tab loses focus or the portrait leaves view. A failed atlas load falls back to the original photograph. The gallery uses a native modal dialog with Escape, arrow navigation and focus return. All pages include a skip link, labelled navigation and visible keyboard focus.

Design references supplied by Valerio: [Lynn Fisher](https://lynnandtonic.com/), [Jack McDade](https://jackmcdade.com/), [Tim Rodenbröker](https://timrodenbroeker.de/), and [Ahmed Dahbi](https://dahbiahmed.com/). No source code or creative assets were copied from these sites.
