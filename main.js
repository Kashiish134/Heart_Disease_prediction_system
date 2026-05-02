/**
 * CardioScan AI — main.js
 * Handles:
 *  1. Multi-step form wizard (step navigation, validation)
 *  2. Async form submission to POST /predict  (JSON fetch)
 *  3. Result card rendering (no page reload needed)
 *  4. Stats page — fetch /api/stats and render charts + table
 */

"use strict";

// ═══════════════════════════════════════════════════════════
//  UTILITY HELPERS
// ═══════════════════════════════════════════════════════════

/** Shorthand query selector */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Smoothly scroll an element into the viewport */
function scrollTo(el, offset = 80) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

/** Show a toast-style notification */
function showToast(msg, type = "info") {
  const existing = $("#cardio-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "cardio-toast";
  toast.textContent = msg;
  Object.assign(toast.style, {
    position:     "fixed",
    bottom:       "28px",
    right:        "28px",
    padding:      "14px 22px",
    borderRadius: "10px",
    fontSize:     "0.88rem",
    fontWeight:   "600",
    color:        "#fff",
    zIndex:       "9999",
    boxShadow:    "0 8px 30px rgba(0,0,0,0.35)",
    animation:    "toastIn .3s ease both",
    background:   type === "error"   ? "#ef4444"
                : type === "success" ? "#10b981"
                :                      "#334155",
  });

  // inject keyframe if not already present
  if (!$("#cardio-toast-style")) {
    const s = document.createElement("style");
    s.id = "cardio-toast-style";
    s.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(s);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}


// ═══════════════════════════════════════════════════════════
//  PREDICTION PAGE — Step Wizard
// ═══════════════════════════════════════════════════════════

(function initWizard() {
  // Only run on prediction page
  if (!$("#mainForm")) return;

  const TOTAL = 3;
  let   current = 1;

  const TITLES = {
    1: "Step 1 — Personal Information",
    2: "Step 2 — Vitals & Blood Work",
    3: "Step 3 — Clinical Tests",
  };
  const SUBS = {
    1: "Basic demographic details",
    2: "Measurements from your checkup",
    3: "Advanced diagnostic parameters",
  };

  // ── Render step state ─────────────────────────────────────
  function render() {
    // panels
    for (let i = 1; i <= TOTAL; i++) {
      const panel = $(`#panel${i}`);
      if (panel) panel.classList.toggle("active", i === current);
    }

    // step indicators
    for (let i = 1; i <= TOTAL; i++) {
      const si = $(`#si${i}`);
      if (!si) continue;
      si.classList.remove("active", "done");
      if (i < current) si.classList.add("done");
      if (i === current) si.classList.add("active");
    }

    // connector lines
    for (let i = 1; i < TOTAL; i++) {
      const line = $(`#line${i}`);
      if (line) line.classList.toggle("done", i < current);
    }

    // header text
    const titleEl = $("#panelTitle");
    const subEl   = $("#panelSub");
    const numEl   = $("#stepNum");
    if (titleEl) titleEl.textContent = TITLES[current];
    if (subEl)   subEl.textContent   = SUBS[current];
    if (numEl)   numEl.textContent   = current;

    // nav bar — hidden on last step (submit button takes over)
    const nav     = $("#formNav");
    const prevBtn = $("#prevBtn");
    if (nav)     nav.style.display        = current < TOTAL ? "flex"    : "none";
    if (prevBtn) prevBtn.style.visibility = current > 1     ? "visible" : "hidden";
  }

  // ── Validate required inputs in current panel ─────────────
  function validateCurrentPanel() {
    const panel  = $(`#panel${current}`);
    if (!panel) return true;

    let valid = true;
    $$("input[required], select[required]", panel).forEach(inp => {
      const empty = !inp.value.trim();
      inp.style.borderColor = empty ? "#ef4444" : "";
      inp.style.boxShadow   = empty ? "0 0 0 3px rgba(239,68,68,0.2)" : "";
      if (empty) {
        if (valid) inp.focus();   // focus first invalid field
        valid = false;
      }
    });

    if (!valid) showToast("Please fill in all required fields.", "error");
    return valid;
  }

  // Re-style field on user input
  document.addEventListener("input", e => {
    if (e.target.matches("input, select")) {
      e.target.style.borderColor = "";
      e.target.style.boxShadow   = "";
    }
  });

  // ── Public step navigation ────────────────────────────────
  window.nextStep = function () {
    if (!validateCurrentPanel()) return;
    if (current < TOTAL) {
      current++;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  window.prevStep = function () {
    if (current > 1) { current--; render(); }
  };

  window.goToStep = function (n) {
    if (n <= current) { current = n; render(); }
  };

  render();   // initial paint


  // ═══════════════════════════════════════════════════════════
  //  FORM SUBMISSION — async fetch to POST /predict
  // ═══════════════════════════════════════════════════════════

  const form      = $("#mainForm");
  const submitBtn = $(".btn-submit", form);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();   // prevent classic page reload

    // Make sure last panel is also valid
    if (!validateCurrentPanel()) return;

    // ── Collect all field values into a plain object ────────
    const fd   = new FormData(form);
    const body = {};
    fd.forEach((val, key) => { body[key] = val; });

    // ── Loading state on button ─────────────────────────────
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled   = true;
    submitBtn.innerHTML  = `<span class="spinner"></span> Analysing…`;
    injectSpinnerStyle();

    try {
      const res  = await fetch("/predict", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Prediction failed. Please try again.");
      }

      // ── Render result card ────────────────────────────────
      renderResult(data);

    } catch (err) {
      showToast(err.message, "error");
      console.error("[CardioScan] Predict error:", err);
    } finally {
      submitBtn.disabled  = false;
      submitBtn.innerHTML = originalHTML;
    }
  });

  // ── Result card renderer ──────────────────────────────────
  function renderResult(data) {
    // Remove any previous result
    const old = $("#resultSection");
    if (old) old.remove();

    const isHigh = data.is_high;
    const name   = data.name || "Patient";

    const section = document.createElement("div");
    section.id = "resultSection";
    section.className = "result-section";
    section.innerHTML = `
      <div class="result-card ${isHigh ? "risk" : "safe"}">
        <div class="result-icon">${isHigh ? "⚠️" : "✅"}</div>
        <div style="flex:1">
          <div class="result-title">${escHtml(data.result)}</div>
          <div class="result-msg">${escHtml(data.message)}</div>
          <div class="result-actions">
            <a class="btn-download" href="${escHtml(data.download_url)}">
              📄 Download PDF Report
            </a>
            <a class="btn-download" href="/">🔄 New Assessment</a>
          </div>
          <div class="result-meta">
            Assessed on ${new Date().toLocaleString()}
          </div>
        </div>
      </div>
    `;

    // Inject extra style once
    if (!$("#result-meta-style")) {
      const s = document.createElement("style");
      s.id = "result-meta-style";
      s.textContent = `.result-meta{margin-top:12px;font-size:0.75rem;color:var(--muted);}`;
      document.head.appendChild(s);
    }

    // Insert after the form card
    form.closest("div").appendChild(section);
    scrollTo(section, 100);
    showToast(isHigh ? "⚠️ High risk detected!" : "✅ Low risk — great news!", isHigh ? "error" : "success");
  }
})();   // end initWizard


// ═══════════════════════════════════════════════════════════
//  STATS PAGE
// ═══════════════════════════════════════════════════════════

(function initStats() {
  if (!$("#statsPage")) return;    // only run on stats.html

  loadStats();

  async function loadStats() {
    try {
      const res  = await fetch("/api/stats");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // KPI counters
      animateCounter("#kpiTotal", data.total);
      animateCounter("#kpiHigh",  data.high);
      animateCounter("#kpiLow",   data.low);

      // Chart image (generated by Flask)
      const chartImg = $("#statsChart");
      if (chartImg && data.chart) {
        chartImg.src = data.chart + "?t=" + Date.now();   // cache-bust
        chartImg.style.display = "block";
        $("#chartPlaceholder").style.display = "none";
      }

      // Recent patients table
      renderTable(data.recent);

    } catch (err) {
      showToast("Could not load statistics: " + err.message, "error");
      console.error("[CardioScan] Stats error:", err);
    }
  }

  function renderTable(rows) {
    const tbody = $("#recentTableBody");
    if (!tbody || !rows.length) return;

    tbody.innerHTML = rows.map((r, i) => `
      <tr class="table-row" style="animation-delay:${i * 0.04}s">
        <td>${escHtml(r.name)}</td>
        <td>
          <span class="badge ${r.prediction.includes("High") ? "badge-risk" : "badge-safe"}">
            ${r.prediction.includes("High") ? "High Risk" : "Low Risk"}
          </span>
        </td>
        <td>${escHtml(r.created_at || "—")}</td>
      </tr>
    `).join("");
  }

  function animateCounter(sel, target) {
    const el = $(sel);
    if (!el) return;
    const duration = 900;
    const start    = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);   // ease-out cubic
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
})();   // end initStats


// ═══════════════════════════════════════════════════════════
//  SHARED UTILITIES
// ═══════════════════════════════════════════════════════════

/** Escape HTML to prevent XSS when inserting server data into innerHTML */
function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Inject spinner CSS once */
function injectSpinnerStyle() {
  if ($("#spinner-style")) return;
  const s = document.createElement("style");
  s.id = "spinner-style";
  s.textContent = `
    .spinner {
      display: inline-block;
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .7s linear infinite;
      vertical-align: middle;
      margin-right: 6px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(s);
}