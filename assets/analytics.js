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
  var MEASUREMENT_ID = "G-B8QB4L6NH2";
  // Exact match, not "contains an X" — a real measurement ID may legitimately contain one.
  if (MEASUREMENT_ID === "G-XXXXXXXXXX") return; // property not created yet

  window.dataLayer = window.dataLayer || [];
  // gtag.js only honours commands pushed as an `arguments` object, never a plain array.
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  document.head.appendChild(s);

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
