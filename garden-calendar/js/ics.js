// ics.js — ICS generation (RFC 5545). Pure functions; no DOM access.
// Assigned to window.ICS for use by app.js.

(function () {
  "use strict";

  const PRODID = "-//Garden Calendar Generator//EN";

  // Escape text values per RFC 5545 §3.3.11
  function escapeText(str) {
    if (!str) return "";
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  }

  // Fold lines > 75 octets per RFC 5545 §3.1
  function foldLine(line) {
    const bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;

    const parts = [];
    let current = "";
    let currentBytes = 0;

    for (const char of line) {
      const charBytes = new TextEncoder().encode(char).length;
      if (currentBytes + charBytes > 75) {
        parts.push(current);
        current = " " + char;
        currentBytes = 1 + charBytes;
      } else {
        current += char;
        currentBytes += charBytes;
      }
    }
    if (current) parts.push(current);
    return parts.join("\r\n");
  }

  // Format a {month, day} + year as YYYYMMDD
  function formatDate(year, month, day) {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}${mm}${dd}`;
  }

  // Add days to a Date object
  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  // Parse a YYYY-MM-DD string as local midnight (avoids UTC-shift bug in non-UTC timezones)
  function parseLocalDate(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Convert {month, day} + year + offset (days) to a Date
  function toDate(year, monthDay, offsetDays) {
    const d = new Date(year, monthDay.month - 1, monthDay.day);
    return addDays(d, offsetDays);
  }

  // Determine the target year for an event given today's date.
  // If the window end has already passed this year, use next year.
  function targetYear(latestMonthDay, offsetDays) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisYear = today.getFullYear();
    const latestThisYear = toDate(thisYear, latestMonthDay, offsetDays);
    return latestThisYear < today ? thisYear + 1 : thisYear;
  }

  // Format a Date as UTC timestamp for DTSTAMP: YYYYMMDDTHHmmssZ
  function formatDtstamp(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
      `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
    );
  }

  // Build a single VEVENT string.
  // event: { plantId, plantName, activityId, activityLabel, category,
  //          startDate: Date, endDate: Date, notes, zoneLabel }
  function buildEvent(event) {
    const uid = `${event.plantId}-${event.activityId}-${event.startDate.getFullYear()}@garden-cal`;

    const dtstart = formatDate(
      event.startDate.getFullYear(),
      event.startDate.getMonth() + 1,
      event.startDate.getDate()
    );

    // ICS all-day DTEND is exclusive: add 1 day
    const dtendDate = addDays(event.endDate, 1);
    const dtend = formatDate(
      dtendDate.getFullYear(),
      dtendDate.getMonth() + 1,
      dtendDate.getDate()
    );

    const summary = escapeText(`${event.activityLabel}: ${event.plantName}`);
    const description = escapeText(
      [
        event.notes || "",
        `Zone/offset applied: ${event.zoneLabel}`,
        `Window: ${dtstart} – ${formatDate(event.endDate.getFullYear(), event.endDate.getMonth() + 1, event.endDate.getDate())}`
      ]
        .filter(Boolean)
        .join("\n")
    );

    const lines = [
      "BEGIN:VEVENT",
      foldLine(`UID:${uid}`),
      `DTSTAMP:${formatDtstamp(new Date())}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      foldLine(`SUMMARY:${summary}`),
      foldLine(`DESCRIPTION:${description}`),
      foldLine(`CATEGORIES:${escapeText(event.category)}`),
      "END:VEVENT"
    ];

    if (event.rruleYearly) {
      lines.splice(lines.length - 1, 0, "RRULE:FREQ=YEARLY");
    }

    return lines.join("\r\n");
  }

  // Build a complete VCALENDAR string from an array of event descriptors.
  // Each descriptor: { plant, activity, offsetDays, zoneLabel, manualStart?, manualEnd?, rruleYearly? }
  function buildCalendar(events) {
    const vevents = events.map((ev) => {
      const activity = ev.plant.activities.find((a) => a.type === ev.activity.id);
      const season = activity.season || ev.activity.season || "spring";

      let offsetDays = ev.offsetDays;
      if (season === "autumn") offsetDays = -offsetDays;
      if (season === "fixed") offsetDays = 0;

      const year = targetYear(activity.latest, offsetDays);
      let startDate, endDate;

      if (ev.manualStart) {
        startDate = parseLocalDate(ev.manualStart);
      } else {
        startDate = toDate(year, activity.earliest, offsetDays);
      }

      if (ev.manualEnd) {
        endDate = parseLocalDate(ev.manualEnd);
      } else {
        // Handle year-wrap: if end month < start month, it's next year
        let endYear = year;
        if (activity.latest.month < activity.earliest.month && !ev.manualStart) {
          endYear = year + 1;
        }
        endDate = toDate(endYear, activity.latest, offsetDays);
      }

      return buildEvent({
        plantId: ev.plant.id,
        plantName: ev.plant.name,
        activityId: ev.activity.id,
        activityLabel: ev.activity.label,
        category: ev.plant.category,
        startDate,
        endDate,
        notes: activity.notes,
        zoneLabel: ev.zoneLabel,
        rruleYearly: ev.rruleYearly || false
      });
    });

    const header = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      foldLine(`PRODID:${PRODID}`),
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ].join("\r\n");

    const body = vevents.length > 0 ? "\r\n" + vevents.join("\r\n") : "";
    return header + body + "\r\nEND:VCALENDAR";
  }

  window.ICS = { buildCalendar, buildEvent };
})();
