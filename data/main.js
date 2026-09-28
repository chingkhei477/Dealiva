/* Dealiva — site script (no dependencies) */
(function () {
  "use strict";

  var CONFIG = window.DEALIVA_CONFIG || {};
  var EMAIL = CONFIG.supportEmail || "support@dealiva.in";
  var CLICKS_KEY = "dealiva_clicks";
  var CONSENT_KEY = "dealiva_consent";

  var ICONS = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  /* ---------- Storage helpers (never break the page) ---------- */
  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
    return null;
  }
  function getClicks() {
    var list = store(CLICKS_KEY);
    return Array.isArray(list) ? list : [];
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Header ---------- */
  var header = $(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 4); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  var menuBtn = $(".menu-btn");
  var nav = $("#site-nav");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });
    $all("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) setMenu(false); });
  }

  $all("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $all("[data-email]").forEach(function (el) {
    el.textContent = EMAIL;
    if (el.tagName === "A") el.href = "mailto:" + EMAIL;
  });

  /* ---------- Deals ---------- */
  function activeDeals() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return (window.DEALIVA_DEALS || []).filter(function (d) {
      if (!d || !d.id || !d.retailer || !d.url) return false;
      if (d.validTill) {
        var end = new Date(d.validTill + "T23:59:59");
        if (!isNaN(end) && end < today) return false;
      }
      return true;
    });
  }

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function dealCard(d) {
    var logo = d.logo
      ? '<img src="' + esc(d.logo) + '" alt="" loading="lazy" width="52" height="52">'
      : esc(d.retailer.trim().charAt(0).toUpperCase());
    var conds = (d.conditions || []).map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
    return (
      '<article class="deal">' +
        '<div class="deal-top"><div class="deal-logo">' + logo + '</div>' +
        '<div><div class="deal-retailer">' + esc(d.retailer) + '</div><div class="deal-cat">' + esc(d.category || "") + '</div></div></div>' +
        '<div class="deal-rate">' + esc(d.cashback) + ' <small>cashback</small></div>' +
        '<h3>' + esc(d.title || "") + '</h3>' +
        '<div class="deal-meta">' +
          (d.confirmIn ? '<span>' + ICONS.clock + 'Confirms in ' + esc(d.confirmIn) + '</span>' : "") +
          (d.validTill ? '<span>' + ICONS.calendar + 'Valid till ' + esc(formatDate(d.validTill)) + '</span>' : "") +
        '</div>' +
        (conds ? '<details><summary>Conditions</summary><ul>' + conds + '</ul></details>' : "") +
        '<button type="button" class="btn btn--primary btn--block" data-deal="' + esc(d.id) + '">Get this offer ' + ICONS.arrow + '</button>' +
      '</article>'
    );
  }

  var grid = $("#deal-grid");
  if (grid) {
    var deals = activeDeals();
    var state = { q: "", cat: "All", sort: "featured" };
    var tools = $("#deal-tools");
    var empty = $("#deal-empty");
    var noMatch = $("#deal-nomatch");
    var count = $("#deal-count");

    if (!deals.length) {
      if (tools) tools.hidden = true;
      grid.hidden = true;
      if (empty) empty.hidden = false;
    } else {
      if (empty) empty.hidden = true;
      if (tools) tools.hidden = false;
      var cats = ["All"];
      deals.forEach(function (d) { if (d.category && cats.indexOf(d.category) < 0) cats.push(d.category); });
      var chipWrap = $("#deal-chips");
      chipWrap.innerHTML = cats.map(function (c) {
        return '<button type="button" class="chip" aria-pressed="' + (c === "All") + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
      }).join("");
      chipWrap.addEventListener("click", function (e) {
        var b = e.target.closest(".chip"); if (!b) return;
        state.cat = b.getAttribute("data-cat");
        $all(".chip", chipWrap).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        render();
      });
      $("#deal-search").addEventListener("input", function (e) { state.q = e.target.value.trim().toLowerCase(); render(); });
      $("#deal-sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
      render();
    }

    function render() {
      var list = deals.filter(function (d) {
        if (state.cat !== "All" && d.category !== state.cat) return false;
        if (!state.q) return true;
        return (d.retailer + " " + (d.title || "") + " " + (d.category || "")).toLowerCase().indexOf(state.q) > -1;
      });
      if (state.sort === "rate") list.sort(function (a, b) { return (b.rateValue || 0) - (a.rateValue || 0); });
      if (state.sort === "az") list.sort(function (a, b) { return a.retailer.localeCompare(b.retailer); });
      grid.innerHTML = list.map(dealCard).join("");
      grid.hidden = !list.length;
      noMatch.hidden = !!list.length;
      count.textContent = list.length + (list.length === 1 ? " offer" : " offers");
    }

    grid.addEventListener("click", function (e) {
      var b = e.target.closest("[data-deal]"); if (!b) return;
      var d = deals.filter(function (x) { return x.id === b.getAttribute("data-deal"); })[0];
      if (d) openClickModal(d, b);
    });
  }

  /* ---------- Click ID modal ---------- */
  function newClickId() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var out = "";
    var rnd = new Uint8Array(8);
    (window.crypto || window.msCrypto).getRandomValues(rnd);
    for (var i = 0; i < 8; i++) out += chars[rnd[i] % chars.length];
    return "DLV-" + out.slice(0, 4) + "-" + out.slice(4);
  }

  var modal = $("#click-modal");
  var lastFocus = null;
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    document.body.classList.remove("modal-open");
    if (lastFocus) lastFocus.focus();
  }
  function openClickModal(deal, trigger) {
    if (!modal) return;
    lastFocus = trigger;
    var id = newClickId();
    var link = deal.url.indexOf("{clickid}") > -1 ? deal.url.split("{clickid}").join(encodeURIComponent(id)) : deal.url;
    $("#click-retailer", modal).textContent = deal.retailer;
    $("#click-id", modal).textContent = id;
    var go = $("#click-go", modal);
    go.href = link;
    go.querySelector("span").textContent = "Continue to " + deal.retailer;
    go.onclick = function () {
      var list = getClicks();
      list.unshift({ id: id, retailer: deal.retailer, deal: deal.id, at: new Date().toISOString() });
      store(CLICKS_KEY, list.slice(0, 20));
      setTimeout(closeModal, 50);
    };
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    $(".modal-close", modal).focus();
  }
  if (modal) {
    modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest(".modal-close")) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal(); });
    var copyBtn = $("#click-copy", modal);
    copyBtn.addEventListener("click", function () {
      var text = $("#click-id", modal).textContent;
      var done = function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = "Copy"; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
      else { var r = document.createRange(); r.selectNodeContents($("#click-id", modal)); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    });
  }

  /* ---------- Contact / claim form ---------- */
  var form = $("#contact-form");
  if (form) {
    var reason = $("#reason", form);
    var claimBox = $("#claim-fields", form);
    var claimInputs = $all("[data-claim-required]", form);
    var statusBox = $("#form-status");
    var submitBtn = $("button[type=submit]", form);

    // Recent Click IDs from this browser
    var clicks = getClicks();
    var dl = $("#clickid-list");
    if (dl) dl.innerHTML = clicks.map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(c.retailer + " – " + new Date(c.at).toLocaleDateString("en-IN")) + "</option>";
    }).join("");
    var recent = $("#recent-clicks");
    if (recent && clicks.length) {
      recent.hidden = false;
      $("span", recent).textContent = clicks.slice(0, 3).map(function (c) { return c.id + " (" + c.retailer + ")"; }).join(", ");
    }
    var orderDate = $("#order_date", form);
    if (orderDate) orderDate.max = new Date().toISOString().slice(0, 10);

    function syncReason() {
      var isClaim = reason.value === "Register a purchase" || reason.value === "Missing cashback";
      claimBox.hidden = !isClaim;
      claimInputs.forEach(function (el) { el.required = isClaim; el.disabled = !isClaim; });
      $all("input, select, textarea", claimBox).forEach(function (el) { el.disabled = !isClaim; });
      $all("[data-nonclaim-required]", form).forEach(function (el) { el.required = !isClaim; });
      $all("[data-nonclaim-marker]", form).forEach(function (el) { el.hidden = isClaim; });
      $all(".has-error", claimBox).forEach(function (el) { if (!isClaim) el.classList.remove("has-error"); });
    }
    reason.addEventListener("change", syncReason);
    var params = new URLSearchParams(location.search);
    if (params.get("reason") === "claim") reason.value = "Register a purchase";
    syncReason();

    var messages = {
      valueMissing: "This field is required.",
      typeMismatch: "Please enter a valid value.",
      patternMismatch: "Please check the format.",
      rangeOverflow: "Please check this value.",
      rangeUnderflow: "Please check this value."
    };
    function fieldMsg(el) {
      if (el.validity.valid) return "";
      if (el.name === "email" && !el.validity.valueMissing) return "Please enter a valid email address.";
      if (el.name === "upi_id" && el.validity.patternMismatch) return "Enter a UPI ID like name@bank.";
      if (el.name === "phone" && el.validity.patternMismatch) return "Enter a 10-digit Indian mobile number.";
      for (var k in messages) if (el.validity[k]) return messages[k];
      return "Please check this field.";
    }
    function validate(el) {
      var wrap = el.closest(".field"); if (!wrap) return el.validity.valid;
      var msg = fieldMsg(el);
      wrap.classList.toggle("has-error", !!msg);
      var em = $(".error-msg", wrap); if (em) em.textContent = msg;
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }
    $all("input, select, textarea", form).forEach(function (el) {
      el.addEventListener("blur", function () { if (el.value) validate(el); });
      el.addEventListener("input", function () { if (el.closest(".has-error")) validate(el); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusBox.className = "form-status";
      var fields = $all("input, select, textarea", form).filter(function (el) { return !el.disabled && el.type !== "hidden" && !el.classList.contains("hp-input"); });
      var firstBad = null;
      fields.forEach(function (el) { if (!validate(el) && !firstBad) firstBad = el; });
      if (firstBad) { firstBad.focus(); return; }
      if ($(".hp-input", form).value) return; // bot

      var data = {};
      fields.forEach(function (el) {
        if (el.type === "checkbox") data[el.name] = el.checked ? "Yes" : "No";
        else if (el.value) data[el.name] = el.value.trim();
      });
      var subject = "Dealiva: " + data.reason + (data.order_id ? " – Order " + data.order_id : "");

      if (CONFIG.web3formsKey) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
        var payload = Object.assign({ access_key: CONFIG.web3formsKey, subject: subject, from_name: "Dealiva website", replyto: data.email, botcheck: "" }, data);
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (!res.success) throw new Error(res.message || "Failed");
          form.reset(); syncReason();
          statusBox.className = "form-status is-ok";
          statusBox.textContent = "Thank you. Your message has reached our support team. We'll reply to " + data.email + " within 2 working days.";
        }).catch(function () {
          statusBox.className = "form-status is-err";
          statusBox.innerHTML = 'We couldn\'t send your message just now. Please email us at <a href="mailto:' + EMAIL + '">' + EMAIL + "</a>.";
        }).then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send message";
          statusBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      } else {
        var labels = {
          name: "Name", email: "Email", phone: "Phone", reason: "Topic", retailer: "Retailer",
          order_id: "Order ID", order_date: "Order date", order_amount: "Order amount (₹)",
          click_id: "Dealiva Click ID", upi_id: "UPI ID", message: "Message", agree: "Agreed to terms"
        };
        var body = Object.keys(data).map(function (k) { return (labels[k] || k) + ": " + data[k]; }).join("\n");
        var href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        window.location.href = href;
        statusBox.className = "form-status is-ok";
        statusBox.innerHTML = "Your email app should now open with your message filled in. Press <strong>Send</strong> there to reach us. If nothing opened, email us directly at " +
          '<a href="' + esc(href) + '">' + EMAIL + "</a>.";
        statusBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  /* ---------- Consent + optional Meta Pixel ---------- */
  function loadPixel(id) {
    if (window.fbq) return;
    /* Meta Pixel base code */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", id);
    window.fbq("track", "PageView");
  }
  var consent = $("#consent");
  if (CONFIG.metaPixelId && consent) {
    var choice = store(CONSENT_KEY);
    if (choice === "accepted") loadPixel(CONFIG.metaPixelId);
    else if (choice !== "declined") consent.classList.add("is-open");
    consent.addEventListener("click", function (e) {
      var b = e.target.closest("[data-consent]"); if (!b) return;
      var v = b.getAttribute("data-consent");
      store(CONSENT_KEY, v);
      consent.classList.remove("is-open");
      if (v === "accepted") loadPixel(CONFIG.metaPixelId);
    });
  }
  $all("[data-reset-consent]").forEach(function (b) {
    b.hidden = !CONFIG.metaPixelId;
    b.addEventListener("click", function () {
      try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
      if (consent) consent.classList.add("is-open");
    });
  });
})();
