// window.GARDEN_PLANTS — the plant catalog. Extend this file to add plants.
//
// Date format: { month: 1–12, day: 1–31 }
// Windows may wrap the year boundary (e.g. earliest Dec → latest Feb).
//
// Data sources / references:
//   Bonsai: "The Complete Book of Bonsai" (Tomlinson, 1990); bonsai4me.com species guides.
//   Vegetables/herbs: RHS Grow Your Own guides; Norsk Hageselskap sowing calendars.
//   General: RHS Pruning & Training (Brickell, 2011).
//
// Season offsets are applied by app.js; dates here are baseline zone-6b / temperate-European.

window.GARDEN_PLANTS = [

  // ── BONSAI ──────────────────────────────────────────────────────────────────

  {
    id: "zelkova-serrata",
    name: "Japanese Zelkova",
    scientificName: "Zelkova serrata",
    category: "bonsai",
    activities: [
      {
        type: "prune",
        earliest: { month: 2, day: 15 },
        latest:   { month: 3, day: 31 },
        season: "spring",
        notes: "Structural pruning in late dormancy, before bud break. Removes crossing branches and refines ramification."
      },
      {
        type: "pinch",
        earliest: { month: 5, day: 1 },
        latest:   { month: 6, day: 30 },
        season: "spring",
        notes: "Pinch new shoots back to 1–2 leaves to build fine twig structure throughout the growing season."
      },
      {
        type: "repot",
        earliest: { month: 3, day: 1 },
        latest:   { month: 4, day: 15 },
        season: "spring",
        notes: "Repot as buds swell, before leaves open. Use free-draining akadama/pumice mix. Prune up to 1/3 of roots."
      },
      {
        type: "fertilize",
        earliest: { month: 4, day: 1 },
        latest:   { month: 9, day: 30 },
        season: "spring",
        notes: "Balanced fertiliser Apr–Jun; low-nitrogen from Jul onwards to harden growth before winter."
      }
    ]
  },

  {
    id: "acer-palmatum",
    name: "Japanese Maple",
    scientificName: "Acer palmatum",
    category: "bonsai",
    activities: [
      {
        type: "prune",
        earliest: { month: 11, day: 1 },
        latest:   { month: 2, day: 28 },
        season: "fixed",
        notes: "Prune in full dormancy (Nov–Feb). Maples bleed sap heavily if cut during active growth; avoid spring flush."
      },
      {
        type: "repot",
        earliest: { month: 3, day: 15 },
        latest:   { month: 4, day: 30 },
        season: "spring",
        notes: "Repot as buds just begin to swell. Maples prefer slightly more organic content than junipers."
      },
      {
        type: "wire",
        earliest: { month: 11, day: 1 },
        latest:   { month: 3, day: 15 },
        season: "fixed",
        notes: "Wire in dormancy so bark is visible and new wood doesn't bite-in too quickly. Use aluminium wire."
      },
      {
        type: "fertilize",
        earliest: { month: 4, day: 15 },
        latest:   { month: 9, day: 15 },
        season: "spring",
        notes: "Feed lightly after leaves fully open. Avoid high nitrogen in midsummer to prevent oversized leaves."
      }
    ]
  },

  {
    id: "juniperus-chinensis",
    name: "Chinese Juniper",
    scientificName: "Juniperus chinensis",
    category: "bonsai",
    activities: [
      {
        type: "prune",
        earliest: { month: 3, day: 1 },
        latest:   { month: 4, day: 30 },
        season: "spring",
        notes: "Remove dead/crossing branches in early spring. Pinch foliage pads throughout the growing season."
      },
      {
        type: "pinch",
        earliest: { month: 4, day: 1 },
        latest:   { month: 9, day: 30 },
        season: "spring",
        notes: "Pinch extending shoots back to foliage pads. Never cut into bare wood — junipers rarely back-bud from old wood."
      },
      {
        type: "wire",
        earliest: { month: 10, day: 1 },
        latest:   { month: 2, day: 28 },
        season: "fixed",
        notes: "Wire autumn through early spring before active growth. Check for wire bite regularly in summer."
      },
      {
        type: "repot",
        earliest: { month: 3, day: 15 },
        latest:   { month: 5, day: 15 },
        season: "spring",
        notes: "Repot every 2–3 years. Junipers tolerate moderate root reduction. Fast-draining inorganic mix preferred."
      },
      {
        type: "fertilize",
        earliest: { month: 4, day: 1 },
        latest:   { month: 10, day: 31 },
        season: "spring",
        notes: "Feed generously April–October. Conifers benefit from a high-nitrogen spring feed, switching to low-N in autumn."
      }
    ]
  },

  {
    id: "ulmus-parvifolia",
    name: "Chinese Elm",
    scientificName: "Ulmus parvifolia",
    category: "bonsai",
    activities: [
      {
        type: "prune",
        earliest: { month: 2, day: 1 },
        latest:   { month: 3, day: 31 },
        season: "spring",
        notes: "Main structural pruning before bud break. Chinese Elm back-buds readily so hard pruning is safe."
      },
      {
        type: "pinch",
        earliest: { month: 4, day: 1 },
        latest:   { month: 8, day: 31 },
        season: "spring",
        notes: "Pinch new shoots back to 1–2 leaves to develop fine ramification. Can be pinched continuously."
      },
      {
        type: "repot",
        earliest: { month: 3, day: 1 },
        latest:   { month: 4, day: 30 },
        season: "spring",
        notes: "Repot every 1–2 years for young trees, every 3–4 years for older specimens. Tolerates moderate root pruning."
      },
      {
        type: "fertilize",
        earliest: { month: 3, day: 15 },
        latest:   { month: 10, day: 15 },
        season: "spring",
        notes: "Regular balanced fertiliser through the growing season. Chinese Elm is a hungry feeder."
      }
    ]
  },

  {
    id: "pinus-sylvestris",
    name: "Scots Pine",
    scientificName: "Pinus sylvestris",
    category: "bonsai",
    activities: [
      {
        type: "pinch",
        earliest: { month: 5, day: 1 },
        latest:   { month: 6, day: 15 },
        season: "spring",
        notes: "Pinch or pull candles back to 1/3–1/2 of their length as they extend. Balance energy across the tree."
      },
      {
        type: "wire",
        earliest: { month: 10, day: 1 },
        latest:   { month: 12, day: 31 },
        season: "autumn",
        notes: "Wire in autumn when growth has hardened. Avoid spring wiring — new extension is too soft."
      },
      {
        type: "repot",
        earliest: { month: 3, day: 15 },
        latest:   { month: 5, day: 1 },
        season: "spring",
        notes: "Repot every 3–5 years. Preserve mycorrhizal network — never bare-root. Pumice-heavy mix."
      },
      {
        type: "fertilize",
        earliest: { month: 4, day: 1 },
        latest:   { month: 8, day: 31 },
        season: "spring",
        notes: "High-nitrogen April–June; taper off to help harden growth before winter. Avoid feeding into autumn."
      }
    ]
  },

  {
    id: "ficus-retusa",
    name: "Ficus / Ginseng",
    scientificName: "Ficus microcarpa",
    category: "bonsai",
    activities: [
      {
        type: "prune",
        earliest: { month: 4, day: 1 },
        latest:   { month: 8, day: 31 },
        season: "spring",
        notes: "Prune any time during the growing season. Ficus bleeds white latex — let it dry before moving the tree."
      },
      {
        type: "repot",
        earliest: { month: 5, day: 1 },
        latest:   { month: 7, day: 31 },
        season: "spring",
        notes: "Tropical species — repot in warm weather only (indoor temps >18 °C). Free-draining mix with some organic."
      },
      {
        type: "fertilize",
        earliest: { month: 4, day: 1 },
        latest:   { month: 10, day: 31 },
        season: "spring",
        notes: "Feed every two weeks during the growing season. Ficus is vigorous and benefits from regular fertilising."
      }
    ]
  },

  // ── VEGETABLES & HERBS ───────────────────────────────────────────────────────

  {
    id: "solanum-lycopersicum",
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    category: "vegetables-herbs",
    activities: [
      {
        type: "sow-indoor",
        earliest: { month: 2, day: 15 },
        latest:   { month: 3, day: 31 },
        season: "spring",
        notes: "Sow in modules at 18–22 °C. Germination 7–14 days. Pot on once first true leaves appear."
      },
      {
        type: "transplant",
        earliest: { month: 5, day: 15 },
        latest:   { month: 6, day: 15 },
        season: "spring",
        notes: "Transplant after last frost when nights stay above 10 °C. Harden off 7–10 days before planting out."
      },
      {
        type: "harvest",
        earliest: { month: 7, day: 15 },
        latest:   { month: 10, day: 15 },
        season: "autumn",
        notes: "Pick when fully coloured and slightly soft to touch. Continue harvesting until first frost."
      }
    ]
  },

  {
    id: "daucus-carota",
    name: "Carrot",
    scientificName: "Daucus carota subsp. sativus",
    category: "vegetables-herbs",
    activities: [
      {
        type: "sow-direct",
        earliest: { month: 3, day: 15 },
        latest:   { month: 7, day: 15 },
        season: "spring",
        notes: "Sow direct in fine, stone-free soil. Thin to 5–8 cm. Multiple sowings every 3–4 weeks for succession."
      },
      {
        type: "harvest",
        earliest: { month: 6, day: 1 },
        latest:   { month: 11, day: 30 },
        season: "autumn",
        notes: "Harvest from pencil-thickness onwards. Later sowings can be left in ground and harvested through autumn."
      }
    ]
  },

  {
    id: "cucurbita-pepo",
    name: "Courgette / Zucchini",
    scientificName: "Cucurbita pepo",
    category: "vegetables-herbs",
    activities: [
      {
        type: "sow-indoor",
        earliest: { month: 4, day: 1 },
        latest:   { month: 5, day: 15 },
        season: "spring",
        notes: "Sow on edge in deep pots at 20 °C. Courgettes resent root disturbance — sow in final pots if possible."
      },
      {
        type: "transplant",
        earliest: { month: 5, day: 20 },
        latest:   { month: 6, day: 15 },
        season: "spring",
        notes: "Plant out after all frost risk passes. Space 90 cm apart. Plants are large; allow room."
      },
      {
        type: "harvest",
        earliest: { month: 6, day: 15 },
        latest:   { month: 9, day: 30 },
        season: "autumn",
        notes: "Harvest at 15–20 cm for best flavour. Check daily in peak season — fruits swell fast."
      }
    ]
  },

  {
    id: "lactuca-sativa",
    name: "Lettuce",
    scientificName: "Lactuca sativa",
    category: "vegetables-herbs",
    activities: [
      {
        type: "sow-indoor",
        earliest: { month: 2, day: 1 },
        latest:   { month: 3, day: 31 },
        season: "spring",
        notes: "Early indoor sowings give a head start. Prick out to individual cells. Requires 15–18 °C."
      },
      {
        type: "sow-direct",
        earliest: { month: 3, day: 15 },
        latest:   { month: 8, day: 31 },
        season: "spring",
        notes: "Direct sow in drills 30 cm apart. Thin to 25–30 cm for heading types. Sow successionally every 2–3 weeks."
      },
      {
        type: "harvest",
        earliest: { month: 4, day: 15 },
        latest:   { month: 10, day: 31 },
        season: "autumn",
        notes: "Cut-and-come-again varieties can be harvested continuously. Heading types: cut when firm."
      }
    ]
  },

  {
    id: "ocimum-basilicum",
    name: "Basil",
    scientificName: "Ocimum basilicum",
    category: "vegetables-herbs",
    activities: [
      {
        type: "sow-indoor",
        earliest: { month: 3, day: 1 },
        latest:   { month: 5, day: 1 },
        season: "spring",
        notes: "Sow at 20–24 °C. Basil is frost-tender; keep indoors or under cover until summer. Sow thinly — seedlings are fragile."
      },
      {
        type: "transplant",
        earliest: { month: 5, day: 20 },
        latest:   { month: 6, day: 30 },
        season: "spring",
        notes: "Move outside only when nights reliably stay above 12 °C. Full sun. Shelter from wind."
      },
      {
        type: "harvest",
        earliest: { month: 5, day: 15 },
        latest:   { month: 9, day: 30 },
        season: "autumn",
        notes: "Pinch growing tips regularly to delay flowering and promote bushy growth. Harvest before plants bolt."
      }
    ]
  },

  {
    id: "pisum-sativum",
    name: "Peas",
    scientificName: "Pisum sativum",
    category: "vegetables-herbs",
    activities: [
      {
        type: "sow-direct",
        earliest: { month: 3, day: 1 },
        latest:   { month: 5, day: 31 },
        season: "spring",
        notes: "Sow 5 cm deep, 7–8 cm apart in double rows. Peas tolerate light frost. Provide support immediately."
      },
      {
        type: "harvest",
        earliest: { month: 6, day: 1 },
        latest:   { month: 8, day: 31 },
        season: "spring",
        notes: "Pick when pods are full but peas still feel tender — overmature peas turn starchy quickly."
      }
    ]
  },

  {
    id: "brassica-oleracea-acephala",
    name: "Kale",
    scientificName: "Brassica oleracea var. sabellica",
    category: "vegetables-herbs",
    activities: [
      {
        type: "sow-indoor",
        earliest: { month: 4, day: 1 },
        latest:   { month: 5, day: 31 },
        season: "spring",
        notes: "Sow in modules at 15 °C. Transplant once 4–6 true leaves develop. Kale is hardy and easy to raise."
      },
      {
        type: "sow-direct",
        earliest: { month: 5, day: 1 },
        latest:   { month: 7, day: 15 },
        season: "spring",
        notes: "Direct sow in seedbed, thin to final spacing of 45–60 cm. Later sowings give autumn/winter harvest."
      },
      {
        type: "harvest",
        earliest: { month: 9, day: 1 },
        latest:   { month: 3, day: 31 },
        season: "fixed",
        notes: "Harvest outer leaves from September onward. Frost improves flavour. Can be harvested all winter in mild areas."
      }
    ]
  },

  {
    id: "rosmarinus-officinalis",
    name: "Rosemary",
    scientificName: "Salvia rosmarinus",
    category: "vegetables-herbs",
    activities: [
      {
        type: "sow-indoor",
        earliest: { month: 2, day: 1 },
        latest:   { month: 4, day: 30 },
        season: "spring",
        notes: "Germination is slow and erratic (2–4 weeks at 18–21 °C). Easier to propagate from semi-ripe cuttings in summer."
      },
      {
        type: "transplant",
        earliest: { month: 5, day: 1 },
        latest:   { month: 6, day: 30 },
        season: "spring",
        notes: "Plant in full sun, well-drained soil. Rosemary dislikes waterlogged roots — essential in Norwegian clay soils."
      },
      {
        type: "harvest",
        earliest: { month: 4, day: 1 },
        latest:   { month: 11, day: 30 },
        season: "spring",
        notes: "Snip fresh stems as needed throughout the growing season. Avoid cutting into old woody growth."
      }
    ]
  },

  // ── GENERAL ─────────────────────────────────────────────────────────────────

  {
    id: "privet-hedge",
    name: "Privet Hedge",
    scientificName: "Ligustrum ovalifolium",
    category: "general",
    activities: [
      {
        type: "hedge-trim",
        earliest: { month: 5, day: 15 },
        latest:   { month: 8, day: 31 },
        season: "spring",
        notes: "First cut May–June after the main flush of new growth. Second cut in August maintains a tight finish through winter. Avoid trimming during nesting season (Apr–Jul) if birds are present."
      }
    ]
  },

  {
    id: "lawn",
    name: "Lawn (new or overseeding)",
    scientificName: null,
    category: "general",
    activities: [
      {
        type: "sow-lawn",
        earliest: { month: 4, day: 1 },
        latest:   { month: 5, day: 31 },
        season: "spring",
        notes: "Spring sowing is the second-best window. Soil temperatures need to reach 8–10 °C. Keep moist until established."
      },
      {
        type: "sow-lawn",
        earliest: { month: 8, day: 15 },
        latest:   { month: 9, day: 30 },
        season: "autumn",
        notes: "Autumn is the ideal sowing window — warm soil, autumn rains, reduced weed competition. Overseed thin areas now."
      }
    ]
  },

  {
    id: "forsythia",
    name: "Forsythia",
    scientificName: "Forsythia × intermedia",
    category: "general",
    activities: [
      {
        type: "prune-shrub",
        earliest: { month: 4, day: 1 },
        latest:   { month: 5, day: 15 },
        season: "spring",
        notes: "Prune immediately after flowering — forsythia blooms on old wood. Remove 1/3 of oldest stems at ground level to rejuvenate."
      }
    ]
  },

  {
    id: "buddleja-davidii",
    name: "Butterfly Bush",
    scientificName: "Buddleja davidii",
    category: "general",
    activities: [
      {
        type: "prune-shrub",
        earliest: { month: 3, day: 1 },
        latest:   { month: 4, day: 15 },
        season: "spring",
        notes: "Cut back hard (to 30–60 cm) in early spring before new growth. Buddleja blooms on current year's wood — hard pruning maximises flowering."
      }
    ]
  },

  {
    id: "cornus-sanguinea",
    name: "Dogwood (Cornus)",
    scientificName: "Cornus sanguinea",
    category: "general",
    activities: [
      {
        type: "prune-shrub",
        earliest: { month: 3, day: 1 },
        latest:   { month: 4, day: 15 },
        season: "spring",
        notes: "Cut all stems to 5–8 cm in early spring to promote vivid-coloured new growth for winter display. Feed after cutting."
      }
    ]
  }

];
