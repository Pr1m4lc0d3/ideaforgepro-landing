/* ── Google Analytics 4 — ideaforgepro.com landing ───────────────────────────────
   Same measurement ID as the app. app.ideaforgepro.com is a subdomain, so GA4 keeps the
   cookie on .ideaforgepro.com and a visitor who reads here then clicks through to the forge
   stays ONE session — the landing → app funnel is measurable with no cross-domain setup.

   The gtag loader and config call live INLINE in each page's <head> (Google's tag detection
   scans the HTML source and fails on runtime-injected tags). This file only adds custom events.

   Loaded by every real page: index, personas, integra. og-card.html is deliberately excluded —
   it's a render target for the OG screenshot, not a page anyone visits, and tracking it would
   log a phantom pageview every time the card is regenerated.

   WHAT MATTERS HERE, in order:
     1. app_click — a reader becoming a user. The whole job of this page.
     2. deliberon_click — the funnel's actual destination.
     3. Depth and dwell — more minutes on the page means more exposure to the Deliberon name,
        so engagement is a leading indicator of the funnel rather than a vanity metric.

   Nothing personal is collected. Outbound clicks are classified by destination, so a new CTA
   to the same place is tracked the moment it ships. */

(function () {
  if (typeof window.gtag !== "function") return; // inline snippet missing → stay silent, break nothing

  // ── 0. Roll-up property ─────────────────────────────────────────────────────
  // The same measurement id sits on every one of his sites, so a visit that
  // crosses domains stays ONE session instead of restarting as a fresh referral.
  // Unlike the primary tag above, this one does NOT need to be inline: the file
  // header's rule is about Google's tag DETECTION, which only has to find the
  // property this site is verified against. The roll-up just needs to fire.
  // It lives here rather than in five <head>s so there is one copy to change —
  // and landing/index.html is at its anti-bloat cap, so it could not take more.
  window.gtag("config", "G-F7WLK0CG8X");

  function ev(name, params) { window.gtag("event", name, params || {}); }

  // ── 1. Clicks ───────────────────────────────────────────────────────────────
  // Which band the click came from — the three "Forge an idea free" CTAs sit in different
  // sections, and knowing which one converts is the entire point of tracking them separately.
  function where(el) {
    var band = el.closest ? el.closest("section[id],nav,header,footer") : null;
    return (band && (band.id || band.tagName.toLowerCase())) || "page";
  }

  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!el) return;
    var href = el.getAttribute("href") || "";
    var text = (el.textContent || "").trim().slice(0, 80);

    if (/^https?:\/\/app\.ideaforgepro\.com/i.test(href)) {
      ev("app_click", { link_text: text, location: where(el) });
    } else if (/^https?:\/\/(www\.)?deliberon\.com/i.test(href)) {
      // surface is namespaced so landing clicks never blur together with the app's handoff card
      ev("deliberon_click", { surface: "landing_" + where(el), link_text: text });
    } else if (/personas\.html/i.test(href)) {
      ev("personas_click", { link_text: text, location: where(el) });
    } else if (/integra\.html/i.test(href)) {
      ev("integra_click", { link_text: text, location: where(el) });
    }
  }, true);

  // ── 2. Scroll depth ────────────────────────────────────────────────────────
  // A long landing page is only doing its job if people reach the bottom. GA4's enhanced
  // measurement reports a single 90% event; these four marks show WHERE readers give up.
  var marks = [25, 50, 75, 100], hitMarks = {};
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (max <= 0) return;
    var pct = Math.min(100, Math.round(((h.scrollTop || document.body.scrollTop) / max) * 100));
    for (var i = 0; i < marks.length; i++) {
      if (pct >= marks[i] && !hitMarks[marks[i]]) {
        hitMarks[marks[i]] = 1;
        ev("scroll_depth", { percent: marks[i] });
      }
    }
  }, { passive: true });

  // ── 3. Dwell ───────────────────────────────────────────────────────────────
  // Milestone events, not just GA4's aggregate engagement time, so a specific cohort can be
  // segmented and retargeted ("everyone who read for 3+ minutes").
  var dwellMarks = [30, 60, 180, 600], activeMs = 0, last = Date.now(), next = 0;
  function tick() {
    // Only count time the tab is actually VISIBLE — a forgotten background tab is not
    // engagement, and counting it would inflate the one metric we want to trust.
    if (document.visibilityState === "visible") activeMs += Date.now() - last;
    last = Date.now();
    while (next < dwellMarks.length && activeMs >= dwellMarks[next] * 1000) {
      ev("time_on_page", { seconds: dwellMarks[next] });
      next++;
    }
  }
  setInterval(tick, 5000);
  document.addEventListener("visibilitychange", tick);
})();
