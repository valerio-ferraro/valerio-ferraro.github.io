function prepareFonts() {
  // Embedded WOFF2 sources need no network, but CSS still decodes them later.
  // A binary FontFace decodes synchronously, before the navigation snapshot,
  // so neither the labels nor the heading are captured with fallback metrics.
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
      const data = rule.style.getPropertyValue("src").match(/url\(["']?data:[^,]+;base64,([^"')]+)/);
      if (!data) continue;
      try {
        const bytes = Uint8Array.from(atob(data[1]), (character) => character.charCodeAt(0));
        const family = rule.style.fontFamily.replace(/^["']|["']$/g, "");
        const font = new FontFace(family, bytes, {
          style: rule.style.fontStyle || "normal",
          weight: rule.style.fontWeight || "400",
        });
        if (font.status === "loaded") document.fonts.add(font);
      } catch {
        // The stylesheet remains a complete, native font-loading fallback.
      }
    }
  }
}

export function prepareNavigation() {
  prepareFonts();
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return;

  if (HTMLScriptElement.supports?.("speculationrules")) {
    const rules = document.createElement("script");
    rules.type = "speculationrules";
    rules.textContent = JSON.stringify({
      prerender: [{
        where: {selector_matches: ".site-header a:not([aria-current])"},
        eagerness: "moderate",
      }],
    });
    document.head.append(rules);
    return;
  }

  // Other browsers can still fetch the next document on a clear sign of intent.
  const warmed = new Set();
  const warm = (event) => {
    const link = event.target.closest?.(".site-header a");
    if (!link || link.hasAttribute("aria-current") || warmed.has(link.href)) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    warmed.add(link.href);
    const hint = document.createElement("link");
    hint.rel = "prefetch";
    hint.href = url.href;
    document.head.append(hint);
  };
  document.addEventListener("pointerover", warm, {passive: true});
  document.addEventListener("focusin", warm);
  document.addEventListener("touchstart", warm, {passive: true});
}
