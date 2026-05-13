// === ENERGY CALCULATION ENGINE ===
// Based on: Totaal energie gebruik appartement.xlsx (2026-05-12, authoritative)
// Prior reference: 251105_Schiehaven Noord_Energie enkel apartement.xlsx
// Simplified for workshop use — key physical relationships preserved.
//
// Architecture overview
// ─────────────────────
// ENERGY_CONFIG holds all lookup tables (ventilation systems, construction types,
// heating/cooling systems, solar collectors, shower WTW, orientation factors).
// Calc functions (calcHeating, calcCooling, calcVentilation, etc.) each produce
// one kWh/year component. calcAll() assembles them into a single result object.
//
// Key design decision — decoupling ventilation from envelope (new in 2026 model):
//   Old model: ventilation system determined U-values (Passive House bundle).
//   New model: ventilation and construction are independent choices.
//     → Envelope U-values come from constructionTypes[].
//     → Ventilation system drives fan energy + heat recovery (WTW) + free cooling.
//   This better matches how buildings are actually specified.

const ENERGY_CONFIG = {

  // ── VENTILATION SYSTEMS ────────────────────────────────────────────────────
  // Source: Basistabellen sheet, rows 15–24 of new Excel.
  //
  // Why 8 systems? The new reference model defines exactly these 8 real Dutch
  // ventilation installation types — no invented categories.
  //
  // Fields:
  //   dPmin / dPmax [Pa]  — fan static pressure range at minimum / maximum flow.
  //     Used to interpolate actual fan pressure at the operating point.
  //     Natural systems (type 1) have no fan → dP = 0.
  //   wtw [0–1]           — heat recovery (warmteterugwinning) efficiency.
  //     Fraction of ventilation heat loss recovered from exhaust air.
  //     Only balanced systems (supply + extract) can have WTW.
  //     Single-flow systems (extract only or supply only) = 0.
  //   freeCoolingFactor   — fraction of base cooling demand remaining after
  //     passive/free cooling through the ventilation system.
  //     Derived from the "vrije koeling W/m²" column in Basistabellen:
  //       freeCoolingFactor = 1 − (freeCool_W/m² / 11.458) × 0.80
  //     where 11.458 W/m² is the EWF maximum and 0.80 caps the reduction at 80%.
  //     Lower value = system ventilates passively with outdoor air = less
  //     mechanical cooling needed. Balanced sealed systems score worst here
  //     because their ductwork bypasses passive airflow paths.
  //
  // Workshop impact: students choosing a better WTW system reduce heating loss
  // but sacrifice free cooling. EWF is exceptional because it combines moderate
  // WTW with very high free cooling capacity (ground-coupled heat exchange).
  ventilation: [
    // 1. Purely passive — no fans, driven by wind and thermal buoyancy.
    //    Zero fan energy. Zero WTW (no controlled air path to recover heat from).
    //    Good free cooling: abundant outdoor air exchange on warm nights.
    //    Downside: no control over airflow rate; draughts; noise; poor in still air.
    { name: 'Natuurlijke Ventilatie',            short: 'Nat.',       dPmin:   0, dPmax:   0, wtw: 0.00, freeCoolingFactor: 0.70 },

    // 2. Extract-only. Fan draws air out; fresh air enters through gaps/vents.
    //    Low fan pressure because only one fan (extract side).
    //    No WTW: fresh air enters cold, no heat exchange with warm exhaust.
    //    Reasonable free cooling: inlet vents can be opened wide at night.
    { name: 'Mechanische Afvoer',                short: 'Mech.Afv.',  dPmin:  50, dPmax: 175, wtw: 0.00, freeCoolingFactor: 0.70 },

    // 3. Supply-only. Fan pushes fresh air in; stale air exits through gaps.
    //    Less common in NL apartments. No WTW. Moderate free cooling.
    { name: 'Mechanische Toevoer',               short: 'Mech.Toe.',  dPmin:  50, dPmax: 300, wtw: 0.00, freeCoolingFactor: 0.80 },

    // 4. Balanced — local unit per apartment (decentralised WTW box in facade).
    //    Both supply and extract fans in one unit. WTW = 55%.
    //    Higher fan pressure than single-flow because both sides are ducted.
    //    Low free cooling: the compact unit has little capacity for passive bypass.
    //    Advantage: no central shaft needed, easy retrofit, tenant control.
    { name: 'Gebalanceerd lokaal',               short: 'Gebал.lok.', dPmin: 250, dPmax: 600, wtw: 0.55, freeCoolingFactor: 0.93 },

    // 5. Balanced — central unit per floor or building (centralised WTW).
    //    Slightly higher WTW than local due to larger heat exchanger.
    //    Similar free cooling to local balanced.
    //    Advantage: one unit serves multiple apartments, easier maintenance.
    { name: 'Gebalanceerd centraal',             short: 'Gebал.ctr.', dPmin: 400, dPmax: 700, wtw: 0.60, freeCoolingFactor: 0.93 },

    // 6. Balanced HR++ — high-efficiency central WTW, best in class for heat recovery.
    //    Highest fan pressure (long, well-sealed duct runs to reach HR++ efficiency).
    //    WTW = 75%: recovers ¾ of ventilation heat loss.
    //    Worst free cooling: the sealed balanced system cannot easily bypass outdoor
    //    air into the apartment at night without running the fans.
    //    Best choice when heating dominates (north-facing, poorly insulated).
    { name: 'Gebalanceerd HR++',                 short: 'HR++',       dPmin: 500, dPmax: 800, wtw: 0.75, freeCoolingFactor: 0.97 },

    // 7. Innovative extract — low-pressure extract with partial heat recovery.
    //    A modern take on type 2: uses a smart, variable-speed extract fan and
    //    an indirect heat exchanger on the exhaust path. WTW = 20%.
    //    Lower dP than type 2 because the extract path is optimised.
    //    Good free cooling: still an open inlet system.
    { name: 'Mechanische afzuiging innovatief',  short: 'Mech.inn.',  dPmin:  75, dPmax: 200, wtw: 0.20, freeCoolingFactor: 0.68 },

    // 8. EWF (Energie Werk Fluïdum / ground-coupled ventilation system).
    //    Air is pre-conditioned via an underground heat exchanger before entering.
    //    WTW = 40% (moderate — the ground exchanger is the main energy benefit).
    //    EXCEPTIONAL free cooling: ground temp (~12°C) passively pre-cools incoming
    //    air in summer → freeCoolingFactor = 0.20 (80% cooling reduction).
    //    Higher install cost but drastically reduces both heating and cooling.
    { name: 'EWF systeem (volledig)',             short: 'EWF',        dPmin:  75, dPmax: 150, wtw: 0.40, freeCoolingFactor: 0.20 },
  ],

  // ── HEATING / COOLING SYSTEMS ─────────────────────────────────────────────
  // Source: Coeefficienten sheet, rows 19–23 of old Excel (unchanged in new model).
  //
  // copHeat  — COP for space heating (thermal kWh delivered per electrical kWh used).
  // copCool  — COP for space cooling.
  // copHW    — COP for domestic hot water (often lower than space heating COP).
  // svFraction — share of heat covered by district heating (stadsverwarming).
  //   For SV systems, copHeat/copHW are CO₂-equivalent COPs (not electrical):
  //     CO₂_elec / (CO₂_SV / delivery_eff) = 0.42 / (37.44 kg/GJ ÷ 277.78 kWh/GJ ÷ 0.764)
  //     = 2.38 → "purchased energy" for SV encodes its CO₂ impact directly.
  //
  // Workshop impact: the COP divides thermal demand into purchased energy.
  // WKO (ground source) has the highest COPs → lowest purchased energy per kWh of heat.
  // SV systems make sense when a district network is available (e.g. Schiehaven).
  heatCoolSystems: [
    // Air-source heat pump. copHeat=4.5: new Excel Benodigde energie row 41 (updated
    // from 3.5 in old model — reflects modern SCOP for NL climate).
    { name: 'Warmtepomp lucht (AP)',         short: 'WP Lucht', copHeat: 4.5,  copCool: 3.5,  copHW: 2.75, svFraction: 0.00 },
    // Ground-source (aquifer/borehole). Stable ground temp → high, stable COP.
    // copCool=20: WKO uses ground water for passive free cooling (no compressor) —
    // source: Benodigde energie row 43 + rows 22–23 system table, new Excel.
    { name: 'Warmtepomp WKO (bodem)',        short: 'WP WKO',   copHeat: 6.0,  copCool: 20.0, copHW: 4.00, svFraction: 0.00 },
    // District heating for all heat; separate chiller for cooling.
    { name: 'Stadsverwarming + koelmachine', short: 'SV+Koel',  copHeat: 2.38, copCool: 3.5,  copHW: 2.38, svFraction: 1.00 },
    // District HW only; heat pump for space heating and cooling.
    { name: 'SV tapwater + warmtepomp',      short: 'SV+WP',    copHeat: 3.5,  copCool: 3.5,  copHW: 2.38, svFraction: 0.50 },
    // Temperature-dependent SV share: when SV supply temp is high enough, use it;
    // otherwise fall back to heat pump. Higher effective COP in mild weather.
    { name: 'SV + WP (T-afhankelijk)',       short: 'SV+WP-T',  copHeat: 5.47, copCool: 3.5,  copHW: 2.38, svFraction: 0.25 },
  ],

  // ── SOLAR THERMAL COLLECTORS ──────────────────────────────────────────────
  // Source: Coeefficienten rows 26–29 (unchanged in new model).
  //
  // area [m²]       — collector surface area mounted on roof / facade.
  // yieldPerM2      — annual thermal yield per m² collector [kWh/m²/yr].
  //   Vacuum tubes concentrate radiation → higher yield than flat panels.
  //   PVT (photovoltaic-thermal hybrid) has smaller thermal area but generates
  //   electricity as a side product (not modelled here — only thermal counted).
  //
  // Workshop impact: reduces domestic hot water thermal demand. Effect is modest
  // (1.5–2 m² vs. 800+ kWh/yr hot water need) unless combined with shower WTW.
  solarCollector: [
    { name: 'Geen',      area: 0.0, yieldPerM2:   0 },
    { name: 'PVT',       area: 1.5, yieldPerM2: 300 },
    { name: 'Standaard', area: 2.0, yieldPerM2: 350 },
    { name: 'Vacuum',    area: 2.0, yieldPerM2: 550 },
  ],

  // ── SHOWER HEAT RECOVERY (DOUCHE WTW) ─────────────────────────────────────
  // Source: Coeefficienten rows 32–34 / Basistabellen rows 52–55 (unchanged).
  //
  // reduction — fraction of hot water thermal demand saved by recovering heat
  //   from drain water before it leaves the building.
  //   Individual: small coil around each drain pipe — 30% recovery.
  //   Collective: a larger central heat exchanger on the main drain stack — 40%.
  //
  // Workshop impact: hot water is 10–20% of total energy; 30–40% of that = 3–8%
  // total saving. Combines well with solar collector (both reduce hot water demand).
  showerWTW: [
    { name: 'Geen',        reduction: 0.00 },
    { name: 'Individueel', reduction: 0.30 },
    { name: 'Collectief',  reduction: 0.40 },
  ],

  // ── CONSTRUCTION TYPES ────────────────────────────────────────────────────
  // Source: Basistabellen rows 27–32 of new Excel.
  //
  // Replaces the old mass-only categories (volledig hout → volledig beton).
  // Each type now represents a named construction concept with explicit:
  //   uWall [W/m²K]    — U-value of opaque external wall.
  //   uGlass [W/m²K]   — U-value of glazing (frame + glass combined).
  //   uRoof [W/m²K]    — U-value of roof (used for top-floor apartments only).
  //   ztaWinter        — solar heat gain coefficient WITHOUT shading
  //                      (applies in heating season: blinds/shutters open).
  //   ztaSummer        — solar heat gain coefficient WITH shading
  //                      (applies in cooling season: blinds/shutters closed).
  //   massCoolingFactor — relative cooling demand multiplier vs. reference (beton=1.00).
  //     Derived from P_cool_1side in Basistabellen, normalised to Conventioneel beton.
  //     Direction is REVERSED vs. old model: heavy beton has LESS active cooling
  //     because its high thermal mass acts as a flywheel — absorbing heat during the
  //     day and releasing it at night when ventilation can remove it.
  //     Bio-based licht has NO thermal mass → any heat gain requires immediate
  //     mechanical cooling → highest cooling demand.
  //
  // Workshop impact: U-values directly affect heating (transmission losses).
  //   ZTA affects both heating (solar gains in winter) and cooling (solar gains in summer).
  //   Mass affects cooling peak; combined with ventilation free cooling it determines
  //   whether an apartment is self-cooling or needs mechanical air conditioning.
  constructionTypes: [
    // Standard Dutch apartment construction: concrete frame, standard glazing.
    // Heavy mass (concrete slabs, walls) = good thermal flywheel for cooling.
    // Moderate insulation — the baseline most students will compare against.
    { name: 'Conventioneel, beton',           short: 'Beton',     uWall: 0.25, uGlass: 1.1, uRoof: 0.30, ztaWinter: 0.30, ztaSummer: 0.30, massCoolingFactor: 1.00 },

    // Timber frame with light insulation. Low mass = instant overheating response.
    // Worse U-values than beton (less insulation assumed in this scenario).
    // Higher ZTA_winter (0.4) = more solar gain in winter = good for heating.
    // Lower ZTA_summer (0.12) = much better shading = helps cooling despite low mass.
    // Net cooling result: ZTA shading helps, but lack of thermal buffer means
    // massCoolingFactor is still higher than beton (more active cooling needed).
    { name: 'Bio-based licht',                short: 'Bio-licht',  uWall: 0.30, uGlass: 1.2, uRoof: 0.35, ztaWinter: 0.40, ztaSummer: 0.12, massCoolingFactor: 1.50 },

    // Timber frame, heavily insulated. Best insulation of the bio-based range.
    // Same mass situation as bio-based licht but lower roof U-value.
    // Same ZTA profile as licht: high winter gain, low summer gain.
    { name: 'Bio-based zwaar geïsoleerd',     short: 'Bio-zwaar', uWall: 0.25, uGlass: 1.1, uRoof: 0.20, ztaWinter: 0.40, ztaSummer: 0.12, massCoolingFactor: 1.30 },

    // Concrete structure with bio-based infill panels. Best of both worlds:
    // concrete gives thermal mass (good for cooling), bio-based panels give
    // excellent insulation (lowest U-values), and high-performance glazing (U=0.8).
    // Lower glass fraction (30%) also reduces solar and transmission area.
    // Best all-round construction type — lowest heating AND moderate cooling.
    { name: 'Hybride beton-biobased',         short: 'Hybride',   uWall: 0.20, uGlass: 0.8, uRoof: 0.20, ztaWinter: 0.35, ztaSummer: 0.15, massCoolingFactor: 1.15 },
  ],

  // ── APARTMENT TYPES ───────────────────────────────────────────────────────
  // Three types cover the workshop scenarios. Tower always contains both eenzijdig
  // and hoekappartement (corner); gallery is its own building form.
  //
  // ventBonus — multiplier on fan electricity for this apartment type.
  //   Gallery = 0.45: the open gallery corridor on the back of the building
  //   creates cross-ventilation — wind drives airflow through the apartment
  //   without the mechanical fan running at full power. Result: 55% less fan energy.
  //   This is the same effect that enabled the old "nat+mech on gallery" bonus.
  //
  // liftFactor — fraction of tower lift energy.
  //   Gallery buildings are typically lower-rise and have open staircases →
  //   residents use the stairs more and the lift less. 35% of tower lift use.
  //
  // facadeRatio — m² external facade per m² floor area, drives transmission losses.
  //   eenzijdig: 1 external facade, 3 party walls → ratio 0.40.
  //   hoekappartement: 2 perpendicular external facades → ratio 0.60.
  //   gallerij: 2 external facades (front + gallery back), slab form → ratio 0.75.
  //
  // Workshop impact: the biggest single variable in the model. Gallery vs. tower
  // alone accounts for 20–40% difference in total energy, driven by ventilation
  // bonus, lift reduction, and better passive cooling.
  aptTypes: [
    { name: 'Eenzijdig toren (gesloten kern)', short: '1-zijdig', ventBonus: 1.00, liftFactor: 1.00, facadeRatio: 0.40 },
    { name: 'Hoekappartement toren',           short: 'Hoek',     ventBonus: 0.80, liftFactor: 1.00, facadeRatio: 0.60 },
    { name: 'Gallerij flat',                   short: 'Gallerij', ventBonus: 0.45, liftFactor: 0.35, facadeRatio: 0.75 },
  ],

  // ── ORIENTATION FACTORS ───────────────────────────────────────────────────
  // Source: Basis waarden en tabellen, Koel_orientatie table (old Excel, validated).
  // Averaged across apartment types. Index = 0:N, 1:NE, 2:E, 3:SE, 4:S, 5:SW, 6:W, 7:NW.
  // South (index 4) = 1.00 reference. Values > 1 = more solar-driven cooling.
  // SW (1.13) is the worst: afternoon sun hits at highest intensity when outdoor
  // temperature is already at its daily peak.
  //
  // Also used inversely for heating solar gains: south = maximum winter sun.
  coolingOrientation: [0.22, 0.32, 0.48, 0.72, 1.00, 1.13, 1.00, 0.75],

  // Annual solar radiation on a vertical glass surface per orientation [kWh/m² glass].
  // Dutch reference winter heating season values (NEN 7120 basis).
  // South ~200 kWh/m² (low-angle winter sun hits south facade well).
  // North ~50 kWh/m² (almost no direct winter sun on north facade).
  heatingSolarByOrientation: [50, 75, 110, 160, 200, 175, 130, 80],

  // ── ROOF TYPES ────────────────────────────────────────────────────────────
  // Source: Coeefficienten rows 120–123 (unchanged in new model).
  // Only affects top-floor apartments (roofType 0 = not top floor).
  //
  // coolingFactor — relative cooling multiplier vs. no-roof reference.
  //   Black bitumen roof absorbs solar radiation → heats top slab → more cooling.
  //   Green roof (sedum/grass) provides insulation + evaporative cooling:
  //     less conductive heat gain than black, but still adds some transmission.
  // uRoof — this value is OVERRIDDEN by constructionTypes[].uRoof for the
  //   roof construction; the roofTypes uRoof here provides a fallback default
  //   when no construction-specific roof U-value is specified.
  roofTypes: [
    { name: 'Geen dak (niet top verdieping)', coolingFactor: 1.00, uRoof: 0.00 },
    { name: 'Zwart dak',                      coolingFactor: 1.18, uRoof: 0.25 },
    { name: 'Groen dak',                      coolingFactor: 1.06, uRoof: 0.18 },
  ],

  // ── CO₂ EMISSION FACTOR ───────────────────────────────────────────────────
  // 0.42 kg CO₂/kWh — NL 2025 grid mix (source: Resultaten sheet, old Excel Z6).
  // SV systems use CO₂-equivalent COPs (2.38), so multiplying total purchased
  // energy × this single factor gives correct CO₂ for all system types.
  co2Electricity: 0.42,
};

// ─── FACADE ORIENTATION HELPERS ───────────────────────────────────────────────
// Convention (from Excel opmerking):
//   eenzijdig  → orientation = single external facade direction
//   gallerij   → front facade = orientation; back (gallery corridor) = orientation+4
//   hoekapt    → corner direction; two perpendicular facades at orientation±1
// For gallerij: front and back slab facades are equal area.
// For hoek: two perpendicular facades are equal area.

function effCoolingOrientation(aptType, orientation) {
  const co = ENERGY_CONFIG.coolingOrientation;
  if (aptType === 1) // hoek: average of the two perpendicular facades
    return 0.5 * co[(orientation - 1 + 8) % 8] + 0.5 * co[(orientation + 1) % 8];
  if (aptType === 2) // gallerij: front + opposite back
    return 0.5 * co[orientation] + 0.5 * co[(orientation + 4) % 8];
  return co[orientation];
}

function effHeatingSolar(aptType, orientation) {
  const hs = ENERGY_CONFIG.heatingSolarByOrientation;
  if (aptType === 1)
    return 0.5 * hs[(orientation - 1 + 8) % 8] + 0.5 * hs[(orientation + 1) % 8];
  if (aptType === 2)
    return 0.5 * hs[orientation] + 0.5 * hs[(orientation + 4) % 8];
  return hs[orientation];
}

// ─── OCCUPANCY ────────────────────────────────────────────────────────────────
// Derived from Dutch demographic model (Basis waarden en tabellen).
// Smaller apartments attract more young singles; larger attract families.
// Range clamped to 1.0–4.5 persons.
function calcOccupancy(size) {
  return Math.max(1.0, Math.min(4.5, 0.60 + size / 50.0));
}

// ─── HOT WATER ────────────────────────────────────────────────────────────────
// Source: Coeefficienten F13–F15 (old Excel, unchanged).
// Base 200 kWh/yr + 800 kWh/yr per person^0.95 (sub-linear: shared appliances).
// Returns kWh THERMAL/year before system COP conversion.
// Shower WTW and solar collector reduce this thermal demand before it reaches
// the heat generator — the COP only sees the remaining demand.
function calcHotWater(occupants, showerWTW, solarCollector) {
  let hw = 200 + 800 * Math.pow(occupants, 0.95);
  hw *= (1 - ENERGY_CONFIG.showerWTW[showerWTW].reduction);
  const sc = ENERGY_CONFIG.solarCollector[solarCollector];
  hw = Math.max(0, hw - sc.area * sc.yieldPerM2);
  return hw; // kWh thermal/year
}

// ─── LIGHTING ─────────────────────────────────────────────────────────────────
// Source: Coeefficienten F64–F66 (old Excel, unchanged).
// 5 kWh/m² base, slightly lower in larger apartments (scale effect).
// Daylight factor (glassRatio) reduces artificial lighting need:
//   more glass → better daylight → fewer hours of artificial lighting.
// df_factor floored at 0.50 (you can't eliminate 100% of lighting with glass alone).
function calcLighting(size, occupants, glassRatio) {
  const base = size * (5.0 + (-0.5) * Math.pow(50.0 / size, 0.25))
             + 0.5 * (occupants - 1);
  const df_factor = Math.max(0.50, 1.0 - 0.7 * (glassRatio - 0.25));
  return base * df_factor; // kWh electrical/year
}

// ─── USER APPLIANCES ──────────────────────────────────────────────────────────
// Source: Coeefficienten F6+F8 (appliances) and F9+F11 (media) (old Excel, unchanged).
// Scale sub-linearly with extra persons — a household of 3 doesn't use 3×
// the appliances of a household of 1 (shared fridge, TV, washing machine).
function calcUserAppliances(occupants) {
  const appliances = 500 + 200 * Math.pow(Math.max(0, occupants - 1), 0.50);
  const media      = 600 + 100 * Math.pow(Math.max(0, occupants - 1), 0.50);
  return { appliances, media }; // kWh electrical/year each
}

// ─── VENTILATION ELECTRICITY ──────────────────────────────────────────────────
// Source: Basistabellen fan pressure range + Basis waarden ventilator energy.
// Fan power: P [W] = Q [m³/s] × ΔP [Pa] / η_fan
//   where η_fan = 0.40 (typical EC motor + impeller efficiency).
//
// Flow rate: 0.6 l/s·m² per floor area (updated from 0.9 in old model —
//   new reference Excel Basistabellen row 35 gives 0.6 l/s·m² as the floor rate,
//   reflecting tighter demand-controlled ventilation practice).
//   Minimum 40 l/s regardless of apartment size.
//
// CO₂ demand control reduces average flow to ~65% of maximum:
//   sensors cut airflow when CO₂ < threshold (apartment empty/low occupancy).
//   Saves ~35% of fan electricity at typical Dutch occupancy patterns.
//
// Gallery cross-ventilation (aptTypes[2].ventBonus = 0.45):
//   Wind drives airflow through the apartment via the open gallery corridor —
//   the mechanical fan runs much less hard → 55% less fan energy.
function calcVentilation(size, ventType, aptType, co2Control) {
  const vSys = ENERGY_CONFIG.ventilation[ventType];
  const apt  = ENERGY_CONFIG.aptTypes[aptType];

  // Natural ventilation has no fan — return a small residual for infiltration control.
  if (vSys.dPmin === 0 && vSys.dPmax === 0) return 5 * apt.ventBonus;

  const flow_max = Math.max(0.6 * size, 40); // l/s — updated from 0.9 l/s·m²
  const flow_avg = co2Control ? flow_max * 0.65 : flow_max;

  // Interpolate fan pressure at actual operating point within the system's range.
  const dP_avg = vSys.dPmin + (flow_avg / flow_max) * (vSys.dPmax - vSys.dPmin);
  const power_W = (flow_avg / 1000) * dP_avg / 0.40; // W
  let energy = power_W * 8760 / 1000; // kWh/year

  energy *= apt.ventBonus; // gallery cross-ventilation bonus

  return energy; // kWh electrical/year
}

// ─── COOLING ──────────────────────────────────────────────────────────────────
// Source: Coeefficienten rows 93–117 + Basistabellen P_cool/massCoolingFactor.
// Base: 25 kWh/m²·yr for south-facing eenzijdig reference apartment.
//
// Corrections applied in order:
//  1. Orientation — solar-driven cooling varies strongly with facade direction.
//  2. Glass ratio — more glass = more solar heat gain (relative to 40% reference).
//  3. ZTA summer — construction-specific summer solar heat gain coefficient
//     (with blinds/shading). Lower ZTA = more shading = less solar cooling load.
//     Reference ZTA_summer = 0.30 (Conventioneel beton).
//  4. Thermal mass (massCoolingFactor) — heavy beton stores heat and releases at
//     night when ventilation can remove it → less mechanical cooling needed.
//     Bio-based light has no buffer → any heat gain requires immediate cooling.
//  5. Roof type — black roof on top floor adds solar gain through slab.
//  6. Ventilation free cooling (freeCoolingFactor) — passive night purge capacity.
//     Each ventilation system's factor is derived from its W/m² free cooling
//     capacity in the new Basistabellen (see ENERGY_CONFIG.ventilation comments).
//  7. Gallery cross-ventilation — gallery aptType gets an additional 25% cooling
//     reduction on top of the ventilation system factor (wind-driven cross-flow).
//  8. Climate 2050 — warmer summers raise cooling demand by ~60%.
//  9. Urban Heat Island — strongest at street level, diminishes with height
//     (higher floors benefit from wind cooling that counteracts UHI).
//
// Returns kWh THERMAL/year before COP conversion.
function calcCooling(size, aptType, orientation, glassRatio, construction, ventType, roofType, floorNumber, totalFloors, climate2050) {
  const vSys  = ENERGY_CONFIG.ventilation[ventType];
  const cType = ENERGY_CONFIG.constructionTypes[construction];

  const base_per_m2 = 25; // kWh/m²·yr south reference
  let cooling = base_per_m2 * effCoolingOrientation(aptType, orientation);

  // Glass area: more solar gain (reference = 40% glass)
  const glass_factor = Math.pow(glassRatio / 0.40, 1.5);
  cooling *= glass_factor;

  // ZTA summer correction: construction shading quality vs. beton reference (0.30)
  cooling *= cType.ztaSummer / 0.30;

  // Thermal mass: heavy construction buffers heat, reduces active cooling need
  cooling *= cType.massCoolingFactor;

  // Roof: top-floor solar gain through slab
  cooling *= ENERGY_CONFIG.roofTypes[roofType].coolingFactor;

  // Ventilation free cooling: passive night purge capacity of the system
  cooling *= vSys.freeCoolingFactor;

  // Gallery: open gallery corridor enables wind-driven cross-ventilation
  // (additional reduction stacked on top of the ventilation system's own factor)
  if (aptType === 2) cooling *= 0.75;

  // Climate 2050: +1.7°C summer + more solar ≈ +60% cooling demand
  if (climate2050) cooling *= 1.60;

  // Urban Heat Island: stronger at street level, fades with height
  const floorFrac = Math.min(1, floorNumber / Math.max(1, totalFloors));
  const uhi = climate2050
    ? 1.0 + 0.10 * (1.0 - floorFrac)
    : 1.0 + 0.06 * (1.0 - floorFrac);
  cooling *= uhi;

  return cooling * size; // kWh thermal/year
}

// ─── HEATING ──────────────────────────────────────────────────────────────────
// Source: Basis waarden en tabellen rows 68–84 + Basistabellen U-values.
// Components: transmission losses + ventilation losses − internal gains − solar gains.
//
// Key change from old model: U-values (uWall, uGlass) now come from the
// construction type, not the ventilation system. Ventilation only contributes
// its WTW efficiency to reduce ventilation heat loss.
//
// ZTA winter (ztaWinter): construction-specific solar gain in heating season
//   (blinds open). Bio-based types allow more solar in (ZTA 0.40 vs beton 0.30)
//   which is beneficial in winter — reduces heating demand.
//
// Flow rate updated to 0.6 l/s·m² (matching new Basistabellen ventilation table).
// Returns kWh THERMAL/year before COP conversion.
function calcHeating(size, aptType, glassRatio, ventType, construction, floorNumber, totalFloors, roofType, climate2050, occupants, orientation) {
  const vSys  = ENERGY_CONFIG.ventilation[ventType];
  const apt   = ENERGY_CONFIG.aptTypes[aptType];
  const cType = ENERGY_CONFIG.constructionTypes[construction];

  const totalFacade = size * apt.facadeRatio;
  const glassArea   = totalFacade * glassRatio;
  const wallArea    = totalFacade - glassArea;

  // Heating degree hours: ΔT = 13.7°C (22°C indoor − 8.3°C Dutch winter avg), 5500 h/yr
  const dT     = 13.7;
  const Hhours = 5500;

  // Transmission losses through walls and glazing [kWh/yr]
  let transmission = (cType.uWall * wallArea + cType.uGlass * glassArea) * dT * Hhours / 1000;

  // Extra roof transmission on top floor — use construction type roof U-value
  if (roofType > 0) {
    transmission += cType.uRoof * size * dT * Hhours / 1000;
  }

  // Ventilation heat loss — reduced by WTW efficiency
  // Flow rate 0.6 l/s·m² (updated from 0.9, source: new Basistabellen row 35)
  const flow_m3s = Math.max(0.6 * size, 40) / 1000;
  const rho_cp   = 1200; // J/(m³·K) for air
  const vent_loss = flow_m3s * rho_cp * dT * (1 - vSys.wtw) * Hhours / 1000;

  // Internal gains: occupants + equipment ≈ 2 W/m² + 1.5 W/person
  const internal_gains = (2.0 * size + 1.5 * occupants) * Hhours / 1000;

  // Solar gains through glazing — use construction-specific winter ZTA (no shading)
  // effHeatingSolar returns kWh/m² glass for the winter heating season
  const solar_per_m2_glass = effHeatingSolar(aptType, orientation);
  const solar_gains = glassArea * cType.ztaWinter * solar_per_m2_glass;

  // Climate 2050: warmer winters → ~5% less heating
  const cc_factor = climate2050 ? 0.95 : 1.00;

  const heating = Math.max(0,
    (transmission + vent_loss - internal_gains - solar_gains) * cc_factor
  );

  return heating; // kWh thermal/year
}

// ─── LIFT ENERGY ─────────────────────────────────────────────────────────────
// Not in original Excel — added for workshop educational value.
// Gallery: open staircases and lower-rise typology → 65% less lift use.
// Model: 4 trips/person/day × 0.008 kWh/floor × avg 55% of max height.
function calcLift(floorNumber, totalFloors, aptType, occupants) {
  if (floorNumber <= 1) return 15;
  const apt = ENERGY_CONFIG.aptTypes[aptType];
  const tripsPerDay = 4 * occupants;
  const avgFloorsPerTrip = floorNumber * 0.55;
  const energyPerTrip = 0.008 * avgFloorsPerTrip;
  return tripsPerDay * energyPerTrip * 365 * apt.liftFactor;
}

// ─── MAIN CALCULATION ─────────────────────────────────────────────────────────
function calcAll(inputs) {
  const {
    aptType, floor, totalFloors, size, orientation,
    glassRatio, construction, roofType,
    ventilation, heatCool, solarCollector, showerWTW, co2Control,
    occupants, climate2050
  } = inputs;

  const hotWaterThermal  = calcHotWater(occupants, showerWTW, solarCollector);
  const coolingThermal   = calcCooling(size, aptType, orientation, glassRatio, construction, ventilation, roofType, floor, totalFloors, climate2050);
  const heatingThermal   = calcHeating(size, aptType, glassRatio, ventilation, construction, floor, totalFloors, roofType, climate2050, occupants, orientation);

  const lighting         = calcLighting(size, occupants, glassRatio);
  const ventilationElec  = calcVentilation(size, ventilation, aptType, co2Control);
  const { appliances, media } = calcUserAppliances(occupants);
  const lift             = calcLift(floor, totalFloors, aptType, occupants);

  const hcSys       = ENERGY_CONFIG.heatCoolSystems[heatCool];
  const hotWaterPurch = hotWaterThermal  / hcSys.copHW;
  const coolingPurch  = coolingThermal   / hcSys.copCool;
  const heatingPurch  = heatingThermal   / hcSys.copHeat;

  const total  = lighting + ventilationElec + coolingPurch + heatingPurch + hotWaterPurch + appliances + media + lift;
  const perM2  = total / size;

  // CO₂: SV uses CO₂-equivalent COP (2.38), so total purchased × co2Electricity
  // gives correct CO₂ for all system types uniformly.
  const co2kg = total * ENERGY_CONFIG.co2Electricity;

  return {
    hotWater:         Math.round(hotWaterPurch),
    lighting:         Math.round(lighting),
    ventilation:      Math.round(ventilationElec),
    cooling:          Math.round(coolingPurch),
    heating:          Math.round(heatingPurch),
    appliances:       Math.round(appliances),
    media:            Math.round(media),
    lift:             Math.round(lift),
    total:            Math.round(total),
    totalPerM2:       Math.round(perM2),
    co2:              Math.round(co2kg),
    hotWaterThermal:  Math.round(hotWaterThermal),
    coolingThermal:   Math.round(coolingThermal),
    heatingThermal:   Math.round(heatingThermal),
    copHeat:          hcSys.copHeat,
    copCool:          hcSys.copCool,
  };
}

// ─── SITE BRIEF ──────────────────────────────────────────────────────────────
// Fixed programme: 3 000 m² site, 100–120 apartments, 270–320 residents.
const SITE = { area: 3000, aptMin: 100, aptMax: 120, resMin: 270, resMax: 320 };

function calcBuildingOverview(inputs) {
  const { size, totalFloors, buildingType, occupants = 2.82, width = 45, depth = 12 } = inputs;

  const footprint    = width * depth;
  const siteCoverage = Math.round(footprint / SITE.area * 100);
  const gfa          = footprint * totalFloors;
  const far          = +(gfa / SITE.area).toFixed(1);

  if (buildingType === 1) {
    const aptDepth  = Math.max(5, depth - 1.8);
    const perFloor  = Math.max(1, Math.floor(width * aptDepth / size));
    const totalApts = perFloor * totalFloors;
    const residents = Math.round(totalApts * occupants);
    const r = calcAll({ ...inputs, aptType: 2 });
    return {
      type: 'gallery', perFloor, totalApts, siteCoverage, far, gfa, footprint,
      residents,
      inAptRange: totalApts >= SITE.aptMin && totalApts <= SITE.aptMax,
      inResRange: residents >= SITE.resMin && residents <= SITE.resMax,
      r,
      buildingTotal: Math.round(r.total * totalApts),
    };
  }

  const coreArea     = 70;
  const rawPF        = Math.max(4, Math.floor((footprint - coreArea) / size));
  const hoekPerFloor = 4;
  const eenzPerFloor = Math.floor(Math.max(0, rawPF - 4) / 2) * 2;
  const perFloor     = hoekPerFloor + eenzPerFloor;
  const totalApts    = perFloor * totalFloors;
  const residents    = Math.round(totalApts * occupants);
  const rHoek = calcAll({ ...inputs, aptType: 1 });
  const rEenz = calcAll({ ...inputs, aptType: 0 });
  return {
    type: 'tower', perFloor, hoekPerFloor, eenzPerFloor, totalApts,
    siteCoverage, far, gfa, footprint,
    residents,
    inAptRange: totalApts >= SITE.aptMin && totalApts <= SITE.aptMax,
    inResRange: residents >= SITE.resMin && residents <= SITE.resMax,
    rHoek, rEenz,
    buildingTotal: Math.round((rHoek.total * hoekPerFloor + rEenz.total * eenzPerFloor) * totalFloors),
  };
}
