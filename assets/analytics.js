/* ── Google Analytics 4 — ideaforgepro.com landing ───────────────────────────────
   Same measurement ID as the app. app.ideaforgepro.com is a subdomain, so GA4 keeps
   the cookie on .ideaforgepro.com and a visitor who reads here and then clicks
   through to the forge stays ONE session — the landing → app funnel is measurable
   without any cross-domain setup.

   Loaded once from every real page (index / personas / integra) so the ID and the
   event list live in exactly one file. og-card.html is deliberately excluded: it's a
   render target for the OG screenshot, not a page anyone visits.

   Nothing personal is collected. Outbound clicks are classified by destination, so a
   new CTA to the same place is tracked the moment it ships. */

(function () {
  // The gtag loader and `config` call live INLINE in each page's <head>, not here. They used to
  // be injected from this file, which worked for real visitors but left nothing in the HTML
  // source — so Google's own tag-detection test reported "code not detected" and blocked setup.
  // The loader stays inline where any source-scanning checker can see it; this file only adds
  // the custom events on top.
  if (typeof window.gtag !== "function") return;

  // Which page the click came from — the three "Forge an idea free" CTAs sit in
  // different bands, and knowing which one converts is the point of tracking at all.
  function where(el) {
    var band = el.closest ? el.closest("section[id],nav,header,footer") : null;
    return (band && (band.id || band.tagName.toLowerCase())) || "page";
  }

  document.addEventListener("click", function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest("a") : null;
    if (!el) return;
    var href = el.getAttribute("href") || "";
    var text = (el.textContent || "").trim().slice(0, 80);

    if (/^https?:\/\/app\.ideaforgepro\.com/i.test(href)) {
      // the conversion that matters on this site: a reader becomes a user
      window.gtag("event", "app_click", { link_text: text, location: where(el) });
    } else if (/^https?:\/\/(www\.)?deliberon\.com/i.test(href)) {
      window.gtag("event", "deliberon_click", { link_text: text, location: where(el) });
    }
  }, true);
})();
