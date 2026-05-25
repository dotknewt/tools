// app.js — UI wiring, state management, rendering.
// Depends on: GARDEN_ACTIVITIES, GARDEN_PLANTS (globals from data/), ICS (from ics.js).

(function () {
  "use strict";

  // ── Zone / offset config ────────────────────────────────────────────────────
  // Maps USDA zone label → seasonal offset in days (positive = later spring).
  // Baseline zone 6b = 0. Offset applied to spring activities; inverted for autumn.
  // Approximation only — USDA zones describe cold hardiness, not frost timing.
  const ZONE_OFFSETS = {
    "3":      +28,
    "4":      +21,
    "5":      +10,
    "6":        0,
    "7":      -10,
    "8":      -21,
    "9":      -28,
    "10":     -35,
    "custom":   0  // overridden by manual input
  };

  // ── App state ───────────────────────────────────────────────────────────────
  const state = {
    zone: "6",
    customOffset: 0,
    rruleYearly: false,
    // selections: Map<`${plantId}:${activityId}` → true>
    selections: new Map(),
    // manualEdits: Map<`${plantId}:${activityId}` → { start: Date|null, end: Date|null }>
    manualEdits: new Map(),
    searchQuery: "",
    activeCategory: "bonsai"
  };

  // Parse a YYYY-MM-DD string as local midnight (avoids UTC-shift on non-UTC systems)
  function parseLocalDate(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function getOffsetDays() {
    if (state.zone === "custom") return Number(state.customOffset) || 0;
    return ZONE_OFFSETS[state.zone] || 0;
  }

  function getZoneLabel() {
    if (state.zone === "custom") return `Custom (${getOffsetDays()} days)`;
    return `USDA Zone ${state.zone} (~${getOffsetDays()} days offset)`;
  }

  function selectionKey(plantId, activityId) {
    return `${plantId}:${activityId}`;
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validatePlants(plants) {
    if (!Array.isArray(plants)) {
      console.error("[GardenCal] GARDEN_PLANTS is not an array.");
      return false;
    }
    let ok = true;
    plants.forEach((p, i) => {
      const loc = `GARDEN_PLANTS[${i}]`;
      if (!p.id) { console.error(`${loc}: missing 'id'`); ok = false; }
      if (!p.name) { console.error(`${loc}: missing 'name'`); ok = false; }
      if (!p.category) { console.error(`${loc}: missing 'category'`); ok = false; }
      if (!Array.isArray(p.activities)) { console.error(`${loc}: 'activities' must be an array`); ok = false; return; }
      p.activities.forEach((a, j) => {
        const aloc = `${loc}.activities[${j}]`;
        if (!a.type) { console.error(`${aloc}: missing 'type'`); ok = false; }
        if (!a.earliest || !a.earliest.month || !a.earliest.day) { console.error(`${aloc}: malformed 'earliest'`); ok = false; }
        if (!a.latest || !a.latest.month || !a.latest.day) { console.error(`${aloc}: malformed 'latest'`); ok = false; }
      });
    });
    return ok;
  }

  // ── Rendering helpers ────────────────────────────────────────────────────────
  function escapeHTML(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toInputDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // ── Compute event dates ──────────────────────────────────────────────────────
  function computeEventDates(plant, activityDef, plantActivity) {
    const season = plantActivity.season || activityDef.season || "spring";
    let offset = getOffsetDays();
    if (season === "autumn") offset = -offset;
    if (season === "fixed") offset = 0;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisYear = today.getFullYear();

    function toDate(year, md, off) {
      const d = new Date(year, md.month - 1, md.day);
      d.setDate(d.getDate() + off);
      return d;
    }

    const latestThisYear = toDate(thisYear, plantActivity.latest, offset);
    const year = latestThisYear < today ? thisYear + 1 : thisYear;

    const start = toDate(year, plantActivity.earliest, offset);
    let endYear = year;
    if (plantActivity.latest.month < plantActivity.earliest.month) endYear = year + 1;
    const end = toDate(endYear, plantActivity.latest, offset);

    return { start, end };
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  function render() {
    renderCategories();
    renderPlantList();
    renderPreview();
    updateExportButton();
  }

  function renderCategories() {
    const tabs = document.querySelectorAll(".category-tab");
    tabs.forEach((tab) => {
      const active = tab.dataset.category === state.activeCategory;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function renderPlantList() {
    const container = document.getElementById("plant-list");
    if (!container) return;

    const activities = window.GARDEN_ACTIVITIES[state.activeCategory] || [];
    const plants = (window.GARDEN_PLANTS || []).filter(
      (p) => p.category === state.activeCategory
    );

    const query = state.searchQuery.toLowerCase();
    const filtered = query
      ? plants.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.scientificName || "").toLowerCase().includes(query)
        )
      : plants;

    if (filtered.length === 0) {
      container.innerHTML = `<p class="empty-state">No plants found.</p>`;
      return;
    }

    container.innerHTML = filtered
      .map((plant) => {
        const plantActivities = activities.filter((a) =>
          plant.activities.some((pa) => pa.type === a.id)
        );
        const checkboxes = plantActivities
          .map((actDef) => {
            const key = selectionKey(plant.id, actDef.id);
            const checked = state.selections.has(key) ? "checked" : "";
            return `<label class="activity-checkbox">
              <input type="checkbox" data-plant="${escapeHTML(plant.id)}" data-activity="${escapeHTML(actDef.id)}" ${checked}>
              <span class="activity-label" style="--dot-color:${escapeHTML(actDef.color)}">${escapeHTML(actDef.label)}</span>
            </label>`;
          })
          .join("");

        const sciName = plant.scientificName
          ? `<span class="scientific-name">${escapeHTML(plant.scientificName)}</span>`
          : "";

        return `<div class="plant-entry">
          <div class="plant-header">
            <span class="plant-name">${escapeHTML(plant.name)}</span>${sciName}
          </div>
          <div class="plant-activities">${checkboxes}</div>
        </div>`;
      })
      .join("");

    // Attach checkbox listeners
    container.querySelectorAll("input[type=checkbox]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const key = selectionKey(cb.dataset.plant, cb.dataset.activity);
        if (cb.checked) state.selections.set(key, true);
        else {
          state.selections.delete(key);
          state.manualEdits.delete(key);
        }
        renderPreview();
        updateExportButton();
      });
    });
  }

  function renderPreview() {
    const container = document.getElementById("preview-list");
    const countEl = document.getElementById("event-count");
    if (!container) return;

    const events = buildEventList();
    if (countEl) countEl.textContent = events.length;

    if (events.length === 0) {
      container.innerHTML = `<p class="empty-state">Select plants and activities to preview events.</p>`;
      return;
    }

    container.innerHTML = events
      .map((ev) => {
        const key = selectionKey(ev.plant.id, ev.activity.id);
        const edits = state.manualEdits.get(key) || {};
        const start = edits.start ? parseLocalDate(edits.start) : ev.start;
        const end = edits.end ? parseLocalDate(edits.end) : ev.end;
        const edited = edits.start || edits.end;

        return `<div class="preview-row ${edited ? "edited" : ""}" data-key="${escapeHTML(key)}">
          <div class="preview-info">
            <span class="preview-summary">${escapeHTML(ev.activity.label)}: ${escapeHTML(ev.plant.name)}</span>
            ${edited ? `<span class="edited-badge">edited <button class="reset-edit" data-key="${escapeHTML(key)}">reset</button></span>` : ""}
          </div>
          <div class="preview-dates">
            <label>Start <input type="date" class="date-edit start-edit" data-key="${escapeHTML(key)}" value="${toInputDate(start)}"></label>
            <label>End <input type="date" class="date-edit end-edit" data-key="${escapeHTML(key)}" value="${toInputDate(end)}"></label>
          </div>
          <button class="remove-event" data-key="${escapeHTML(key)}" title="Remove">✕</button>
        </div>`;
      })
      .join("");

    // Date edit listeners
    container.querySelectorAll(".start-edit").forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.dataset.key;
        const edits = state.manualEdits.get(key) || {};
        edits.start = input.value || null;
        state.manualEdits.set(key, edits);
        renderPreview();
      });
    });
    container.querySelectorAll(".end-edit").forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.dataset.key;
        const edits = state.manualEdits.get(key) || {};
        edits.end = input.value || null;
        state.manualEdits.set(key, edits);
        renderPreview();
      });
    });

    // Reset listeners
    container.querySelectorAll(".reset-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.manualEdits.delete(btn.dataset.key);
        renderPreview();
      });
    });

    // Remove listeners
    container.querySelectorAll(".remove-event").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [plantId, actId] = splitKey(btn.dataset.key);
        state.selections.delete(btn.dataset.key);
        state.manualEdits.delete(btn.dataset.key);
        // Uncheck the matching checkbox
        const cb = document.querySelector(
          `input[data-plant="${plantId}"][data-activity="${actId}"]`
        );
        if (cb) cb.checked = false;
        renderPreview();
        updateExportButton();
      });
    });
  }

  function splitKey(key) {
    const sep = key.indexOf(":");
    return [key.slice(0, sep), key.slice(sep + 1)];
  }

  function buildEventList() {
    const events = [];
    state.selections.forEach((_, key) => {
      const [plantId, actId] = splitKey(key);
      const plant = (window.GARDEN_PLANTS || []).find((p) => p.id === plantId);
      if (!plant) return;
      const catActivities = window.GARDEN_ACTIVITIES[plant.category] || [];
      const actDef = catActivities.find((a) => a.id === actId);
      if (!actDef) return;
      const plantActivity = plant.activities.find((a) => a.type === actId);
      if (!plantActivity) return;
      const { start, end } = computeEventDates(plant, actDef, plantActivity);
      events.push({ plant, activity: actDef, plantActivity, start, end });
    });
    return events;
  }

  function updateExportButton() {
    const btn = document.getElementById("export-btn");
    const msg = document.getElementById("export-empty-msg");
    if (!btn) return;
    const hasEvents = state.selections.size > 0;
    btn.disabled = !hasEvents;
    if (msg) msg.style.display = hasEvents ? "none" : "block";
  }

  // ── ICS export ──────────────────────────────────────────────────────────────
  function doExport() {
    const events = buildEventList();
    const icsEvents = events.map((ev) => {
      const key = selectionKey(ev.plant.id, ev.activity.id);
      const edits = state.manualEdits.get(key) || {};
      return {
        plant: ev.plant,
        activity: ev.activity,
        offsetDays: getOffsetDays(),
        zoneLabel: getZoneLabel(),
        manualStart: edits.start || null,
        manualEnd: edits.end || null,
        rruleYearly: state.rruleYearly
      };
    });

    const icsString = window.ICS.buildCalendar(icsEvents);
    const blob = new Blob([icsString], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "garden-calendar.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Boot ────────────────────────────────────────────────────────────────────
  function boot() {
    if (!validatePlants(window.GARDEN_PLANTS)) {
      console.warn("[GardenCal] Some plant entries are malformed — check console errors above.");
    }

    // Category tabs
    document.querySelectorAll(".category-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        state.activeCategory = tab.dataset.category;
        state.searchQuery = "";
        const searchInput = document.getElementById("plant-search");
        if (searchInput) searchInput.value = "";
        render();
      });
    });

    // Search
    const searchInput = document.getElementById("plant-search");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.searchQuery = searchInput.value;
        renderPlantList();
      });
    }

    // Zone selector
    const zoneSelect = document.getElementById("zone-select");
    if (zoneSelect) {
      zoneSelect.addEventListener("change", () => {
        state.zone = zoneSelect.value;
        const customRow = document.getElementById("custom-offset-row");
        if (customRow) customRow.style.display = state.zone === "custom" ? "flex" : "none";
        // Recompute preview only for non-manually-edited rows
        renderPreview();
      });
    }

    const customOffsetInput = document.getElementById("custom-offset");
    if (customOffsetInput) {
      customOffsetInput.addEventListener("input", () => {
        state.customOffset = Number(customOffsetInput.value) || 0;
        renderPreview();
      });
    }

    // Repeat yearly toggle
    const rruleToggle = document.getElementById("rrule-yearly");
    if (rruleToggle) {
      rruleToggle.addEventListener("change", () => {
        state.rruleYearly = rruleToggle.checked;
      });
    }

    // Select all / clear all per category
    document.addEventListener("click", (e) => {
      if (e.target.matches(".select-all-btn")) {
        const cat = state.activeCategory;
        const plants = (window.GARDEN_PLANTS || []).filter((p) => p.category === cat);
        const activities = window.GARDEN_ACTIVITIES[cat] || [];
        plants.forEach((plant) => {
          activities.forEach((act) => {
            if (plant.activities.some((a) => a.type === act.id)) {
              state.selections.set(selectionKey(plant.id, act.id), true);
            }
          });
        });
        renderPlantList();
        renderPreview();
        updateExportButton();
      }
      if (e.target.matches(".clear-all-btn")) {
        const cat = state.activeCategory;
        const plants = (window.GARDEN_PLANTS || []).filter((p) => p.category === cat);
        const activities = window.GARDEN_ACTIVITIES[cat] || [];
        plants.forEach((plant) => {
          activities.forEach((act) => {
            const key = selectionKey(plant.id, act.id);
            state.selections.delete(key);
            state.manualEdits.delete(key);
          });
        });
        renderPlantList();
        renderPreview();
        updateExportButton();
      }
    });

    // Export button
    const exportBtn = document.getElementById("export-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", doExport);
    }

    render();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
