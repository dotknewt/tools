// window.GARDEN_ACTIVITIES — activity types available per category.
// Edit this file to add new activity types; never touch app.js or ics.js for this.
window.GARDEN_ACTIVITIES = {
  bonsai: [
    { id: "prune",     label: "Structural pruning", color: "#6b7f4e", season: "spring" },
    { id: "pinch",     label: "Pinching / trimming", color: "#8a9a5b", season: "spring" },
    { id: "wire",      label: "Wiring",              color: "#9c6b3c", season: "autumn" },
    { id: "repot",     label: "Repotting",           color: "#a8543e", season: "spring" },
    { id: "fertilize", label: "Fertilizing",         color: "#c89b3c", season: "spring" },
    { id: "propagate", label: "Propagation",         color: "#5b7a6a", season: "spring" }
  ],
  "vegetables-herbs": [
    { id: "sow-indoor", label: "Sow indoors",    color: "#8a9a5b", season: "spring" },
    { id: "sow-direct", label: "Direct sow",     color: "#6b7f4e", season: "spring" },
    { id: "transplant", label: "Transplant out", color: "#5b7a6a", season: "spring" },
    { id: "harvest",    label: "Harvest",        color: "#c89b3c", season: "autumn" }
  ],
  general: [
    { id: "hedge-trim",  label: "Hedge trimming", color: "#6b7f4e", season: "spring" },
    { id: "sow-lawn",    label: "Lawn sowing",    color: "#8a9a5b", season: "spring" },
    { id: "prune-shrub", label: "Shrub pruning",  color: "#9c6b3c", season: "spring" }
  ]
};
