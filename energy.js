// === ENERGY CALCULATION ENGINE ===
// Based on: 251105_Schiehaven Noord_Energie enkel apartement.xlsx
// Simplified for workshop use — key relationships preserved

const ENERGY_CONFIG = {
  // Ventilation systems (Coeefficienten rows 38-41 + Tabellen rows 42-45)
  // dPmin/max in Pa, wtw = heat recovery efficiency, uWall/uGlass in W/m²K
  ventilation: [
    { name: 'Nat. toevoer + mech. afzuiging', short: 'Nat+Mech', dPmin: 20,  dPmax: 100, wtw: 0.00, uWall: 0.30, uGlass: 1.20 },
    { name: 'Nat. toevoer met indirecte WTW',  short: 'Ind.WTW',  dPmin: 20,  dPmax: 100, wtw: 0.40, uWall: 0.20, uGlass: 1.20 },
    { name: 'Passive House',                    short: 'PassHouse',dPmin: 150, dPmax: 750, wtw: 0.90, uWall: 0.15, uGlass: 0.80 },
    { name: 'Balans ventilatie met WTW',        short: 'Balans',   dPmin: 100, dPmax: 600, wtw: 0.80, uWall: 0.25, uGlass: 1.00 },
  ],

  // Heating/cooling systems (Coeefficienten rows 19-23)
  // copHeat/copCool/copHW = coefficients of performance
  // For SV systems, copHeat/copHW = CO2-equivalent COP = CO2_elec / (CO2_SV/delivery_eff)
  //   = 0.42 / (37.44 kg/GJ / 277.78 kWh/GJ / 0.764 delivery_eff) = 2.38 (Excel J21-J23)
  //   This makes "purchased energy" for SV = CO2-equivalent kWh, matching the Excel metric.
  // svFraction = fraction of heat supplied by district heating (stadsverwarming)
  heatCoolSystems: [
    { name: 'Warmtepomp lucht (AP)',           short: 'WP Lucht', copHeat: 3.5, copCool: 3.5,  copHW: 2.75, svFraction: 0.00 },
    { name: 'Warmtepomp WKO (bodem)',          short: 'WP WKO',   copHeat: 6.0, copCool: 6.0,  copHW: 4.00, svFraction: 0.00 },
    { name: 'Stadsverwarming + koelmachine',   short: 'SV+Koel',  copHeat: 2.38,copCool: 3.5,  copHW: 2.38, svFraction: 1.00 },
    { name: 'SV tapwater + warmtepomp',        short: 'SV+WP',    copHeat: 3.5, copCool: 3.5,  copHW: 2.38, svFraction: 0.50 },
    { name: 'SV + WP (T-afhankelijk)',         short: 'SV+WP-T',  copHeat: 5.47,copCool: 3.5,  copHW: 2.38, svFraction: 0.25 },
  ],

  // Solar thermal collectors (Coeefficienten rows 26-29)
  solarCollector: [
    { name: 'Geen',      area: 0.0, yieldPerM2: 0   },
    { name: 'PVT',       area: 1.5, yieldPerM2: 300  },
    { name: 'Standaard', area: 2.0, yieldPerM2: 350  },
    { name: 'Vacuum',    area: 2.0, yieldPerM2: 550  },
  ],

  // Shower heat recovery (Coeefficienten rows 32-34)
  showerWTW: [
    { name: 'Geen',         reduction: 0.00 },
    { name: 'Individueel',  reduction: 0.30 },
    { name: 'Collectief',   reduction: 0.40 },
  ],

  // Apartment types — 3 types only (tower always has both eenzijdig + hoekappartement)
  // ventBonus: multiplier on fan energy (gallery=0.45: 55% less due to cross-ventilation)
  // liftFactor: gallery has open staircases → 0.35 of tower lift energy
  // facadeRatio: m² external facade per m² floor area (drives transmission losses)
  //   eenzijdig: 1 facade + 3 party/core walls → ~0.40
  //   hoekappartement: 2 facades at 90° + 2 party/core walls → ~0.60
  //   gallerij: front facade + gallery corridor facade, both external → ~0.75
  aptTypes: [
    { name: 'Eenzijdig toren (gesloten kern)', short: '1-zijdig',  ventBonus: 1.00, liftFactor: 1.00, facadeRatio: 0.40 },
    { name: 'Hoekappartement toren',           short: 'Hoek',      ventBonus: 0.80, liftFactor: 1.00, facadeRatio: 0.60 },
    { name: 'Gallerij flat',                   short: 'Gallerij',  ventBonus: 0.45, liftFactor: 0.35, facadeRatio: 0.75 },
  ],

  // Cooling orientation factors (N, NE, E, SE, S, SW, W, NW) with South = 1.00
  // Averaged from Basis waarden en tabellen Koel_orientatie across all apartment types
  coolingOrientation: [0.22, 0.32, 0.48, 0.72, 1.00, 1.13, 1.00, 0.75],

  // Orientation solar gain for heating (kWh/m² glass, winter heating season)
  // Dutch reference: south vertical ~200 kWh/m², north ~50 kWh/m² (NEN 7120)
  heatingSolarByOrientation: [50, 75, 110, 160, 200, 175, 130, 80],

  // Thermal mass cooling factor: heavy construction stores heat, reduces peak cooling
  // Index 0=volledig hout (lightest), 4=volledig beton (heaviest)
  massCoolingFactor: [0.82, 0.88, 0.93, 1.00, 1.04],
  constructionNames: ['Volledig hout', 'Hybride hout-staal', 'Hybride hout-beton', 'Beton + staal', 'Volledig beton'],

  // Roof types (only applies to top-floor apartments)
  roofTypes: [
    { name: 'Geen dak (niet top verdieping)', coolingFactor: 1.00, uRoof: 0.0 },
    { name: 'Zwart dak',                      coolingFactor: 1.18, uRoof: 0.25 },
    { name: 'Groen dak',                      coolingFactor: 1.06, uRoof: 0.18 },
  ],

  // CO2 emission factor — single factor covers all systems
  // SV copHeat/copHW are CO2-equivalent, so total × co2Electricity gives correct CO2 for all
  co2Electricity:   0.42,    // kg CO2/kWh (NL 2025 grid mix, Resultaten Z6)
};

// ─── OCCUPANCY ────────────────────────────────────────────────────────────────
// Derived from Dutch demographic model in Basis waarden en tabellen
// Smaller apartments attract more young singles; larger attract families
function calcOccupancy(size) {
  return Math.max(1.0, Math.min(4.5, 0.60 + size / 50.0));
}

// ─── HOT WATER ────────────────────────────────────────────────────────────────
// Coeefficienten F13-F15: base 200 kWh + 800 kWh/person^0.95
// Returns kWh thermal/year BEFORE system conversion
function calcHotWater(occupants, showerWTW, solarCollector) {
  let hw = 200 + 800 * Math.pow(occupants, 0.95);
  hw *= (1 - ENERGY_CONFIG.showerWTW[showerWTW].reduction);
  const sc = ENERGY_CONFIG.solarCollector[solarCollector];
  hw = Math.max(0, hw - sc.area * sc.yieldPerM2);
  return hw; // kWh thermal/year
}

// ─── LIGHTING ─────────────────────────────────────────────────────────────────
// Coeefficienten F64-F66: 5 kWh/m² base, size scaling, occupant addition
// Daylight factor (glass ratio) reduces artificial lighting need
function calcLighting(size, occupants, glassRatio) {
  const base = size * (5.0 + (-0.5) * Math.pow(50.0 / size, 0.25))
             + 0.5 * (occupants - 1);
  // More glass → better daylight → less artificial light
  const df_factor = Math.max(0.50, 1.0 - 0.7 * (glassRatio - 0.25));
  return base * df_factor; // kWh electrical/year
}

// ─── USER APPLIANCES ──────────────────────────────────────────────────────────
// Coeefficienten F6+F8 (appliances) and F9+F11 (media)
// Scale with sqrt(extra persons) — shared appliances = diminishing returns
function calcUserAppliances(occupants) {
  const appliances = 500 + 200 * Math.pow(Math.max(0, occupants - 1), 0.50);
  const media      = 600 + 100 * Math.pow(Math.max(0, occupants - 1), 0.50);
  return { appliances, media }; // kWh electrical/year each
}

// ─── VENTILATION ELECTRICITY ──────────────────────────────────────────────────
// Fan power: P = Q × ΔP / η  (Resultaten rows 44-49)
// Gallery apartments use natural cross-ventilation → much lower fan energy
function calcVentilation(size, ventType, aptType, co2Control) {
  const vSys = ENERGY_CONFIG.ventilation[ventType];
  const apt  = ENERGY_CONFIG.aptTypes[aptType];

  const flow_max = Math.max(0.9 * size, 40); // l/s (Basis waarden: 0.9 l/s.m²)
  // CO2 demand-control reduces average flow to ~65% of max
  const flow_avg = co2Control ? flow_max * 0.65 : flow_max;

  const dP_avg = vSys.dPmin + (flow_avg / flow_max) * (vSys.dPmax - vSys.dPmin);
  // P [W] = Q [m³/s] × ΔP [Pa] / η  → result is Watts, not kW
  const power_W = (flow_avg / 1000) * dP_avg / 0.40;
  let energy = power_W * 8760 / 1000; // W × h / 1000 = kWh/year

  // Apartment type ventilation bonus (gallery = cross-ventilation possible)
  energy *= apt.ventBonus;

  return energy; // kWh electrical/year
}

// ─── COOLING ──────────────────────────────────────────────────────────────────
// Base: 25 kWh/m².j for south-facing reference (Resultaten row 52)
// Corrected for orientation, glass, mass, ventilation type, climate, UHI/height
// Returns kWh THERMAL/year (before dividing by COP)
function calcCooling(size, aptType, orientation, glassRatio, construction, ventType, roofType, floorNumber, totalFloors, climate2050) {
  const base_per_m2 = 25; // kWh/m².year (south reference)
  let cooling = base_per_m2 * ENERGY_CONFIG.coolingOrientation[orientation];

  // Glass: more solar gain through windows (reference = 40% glass)
  const glass_factor = Math.pow(glassRatio / 0.40, 1.5);
  cooling *= glass_factor;

  // Thermal mass absorbs daytime heat, releases at night → less peak cooling
  cooling *= ENERGY_CONFIG.massCoolingFactor[construction];

  // Roof type (only matters if top floor; roofType 0 = not top floor)
  cooling *= ENERGY_CONFIG.roofTypes[roofType].coolingFactor;

  // Ventilation system (Passive House night-purge nearly eliminates mech cooling)
  if (ventType === 2) cooling *= 0.12; // Passive House: residual only
  else if (aptType === 2 && ventType === 1) cooling *= 0.55; // Gallery + indirect WTW
  else if (aptType === 2) cooling *= 0.70; // Gallery: wind cross-vent always helps

  // Climate 2050: +1.7°C summer + more solar ≈ +60% cooling demand
  if (climate2050) cooling *= 1.60;

  // Urban Heat Island: strongest at street level, diminishes with height
  // Higher floors get wind cooling effect which counteracts UHI
  const floorFrac = Math.min(1, floorNumber / Math.max(1, totalFloors));
  const uhi = climate2050
    ? 1.0 + 0.10 * (1.0 - floorFrac) // UHI 10% stronger at ground in 2050
    : 1.0 + 0.06 * (1.0 - floorFrac); // current UHI 6% at ground level
  cooling *= uhi;

  return cooling * size; // kWh thermal/year
}

// ─── HEATING ──────────────────────────────────────────────────────────────────
// Transmission + ventilation losses − internal gains − solar gains
// (Basis waarden en tabellen rows 68-84, Resultaten rows 80-94)
// Returns kWh THERMAL/year (before dividing by COP)
function calcHeating(size, aptType, glassRatio, ventType, floorNumber, totalFloors, roofType, climate2050, occupants, orientation) {
  const vSys = ENERGY_CONFIG.ventilation[ventType];
  const apt  = ENERGY_CONFIG.aptTypes[aptType];

  // Facade area (m²) = floor area × facade ratio for this apartment type
  const totalFacade = size * apt.facadeRatio;
  const glassArea   = totalFacade * glassRatio;
  const wallArea    = totalFacade - glassArea;

  // Heating degree hours: ΔT=13.7°C (22°C indoor − 8.3°C avg winter), 5500 hours
  const dT     = 13.7;
  const Hhours = 5500;

  // Transmission losses [kWh]
  let transmission = (vSys.uWall * wallArea + vSys.uGlass * glassArea) * dT * Hhours / 1000;

  // Extra roof transmission (top floor only)
  if (roofType > 0) {
    const roofU = ENERGY_CONFIG.roofTypes[roofType].uRoof;
    transmission += roofU * size * dT * Hhours / 1000;
  }

  // Ventilation heat loss (reduced by WTW efficiency)
  const flow_m3s = Math.max(0.9 * size, 40) / 1000;
  const rho_cp   = 1200; // J/(m³·K)
  // Q [m³/s] × ρcp [J/(m³K)] × ΔT [K] = Power [W]; × hours / 1000 = kWh
  const vent_loss = flow_m3s * rho_cp * dT * (1 - vSys.wtw) * Hhours / 1000;

  // Internal gains: occupants, equipment, lighting ≈ 2W/m² average
  const internal_gains = (2.0 * size + 1.5 * occupants) * Hhours / 1000;

  // Solar gains through windows (orientation-dependent winter solar)
  const solar_per_m2_glass = ENERGY_CONFIG.heatingSolarByOrientation[orientation]; // kWh/m²
  const solar_gains = glassArea * 0.35 * solar_per_m2_glass; // ZTA ≈ 0.35

  // Climate 2050: warmer winters → ~10% less heating needed
  const cc_factor = climate2050 ? 0.90 : 1.00;

  const heating = Math.max(0,
    (transmission + vent_loss - internal_gains - solar_gains) * cc_factor
  );

  return heating; // kWh thermal/year
}

// ─── LIFT ENERGY ─────────────────────────────────────────────────────────────
// New component not in original Excel — added for workshop educational value
// Gallery flats: open staircases, low-rise sections → much less lift use
function calcLift(floorNumber, totalFloors, aptType, occupants) {
  if (floorNumber <= 1) return 15; // Ground floor: almost no lift use
  const apt = ENERGY_CONFIG.aptTypes[aptType];

  // 4 trips per person per day (going out + coming back × 2 average)
  const tripsPerDay = 4 * occupants;
  // Energy per trip: 0.008 kWh per floor (modern gearless elevator)
  const avgFloorsPerTrip = floorNumber * 0.55; // avg trip = 55% of max height
  const energyPerTrip = 0.008 * avgFloorsPerTrip;

  return tripsPerDay * energyPerTrip * 365 * apt.liftFactor; // kWh/year
}

// ─── MAIN CALCULATION ────────────────────────────────────────────────────────
function calcAll(inputs) {
  const {
    aptType, floor, totalFloors, size, orientation,
    glassRatio, construction, roofType,
    ventilation, heatCool, solarCollector, showerWTW, co2Control,
    occupants, climate2050
  } = inputs;

  // --- Thermal demands ---
  const hotWaterThermal  = calcHotWater(occupants, showerWTW, solarCollector);
  const coolingThermal   = calcCooling(size, aptType, orientation, glassRatio, construction, ventilation, roofType, floor, totalFloors, climate2050);
  const heatingThermal   = calcHeating(size, aptType, glassRatio, ventilation, floor, totalFloors, roofType, climate2050, occupants, orientation);

  // --- Direct electrical ---
  const lighting       = calcLighting(size, occupants, glassRatio);
  const ventilationElec= calcVentilation(size, ventilation, aptType, co2Control);
  const { appliances, media } = calcUserAppliances(occupants);
  const lift           = calcLift(floor, totalFloors, aptType, occupants);

  // --- Convert thermal to purchased energy via COP ---
  const hcSys = ENERGY_CONFIG.heatCoolSystems[heatCool];
  const hotWaterPurch  = hotWaterThermal  / hcSys.copHW;
  const coolingPurch   = coolingThermal   / hcSys.copCool;
  const heatingPurch   = heatingThermal   / hcSys.copHeat;

  const total    = lighting + ventilationElec + coolingPurch + heatingPurch + hotWaterPurch + appliances + media + lift;
  const perM2    = total / size;

  // --- CO2 (kg/year) ---
  // SV systems use CO2-equivalent COP (2.38), so total purchased already encodes SV CO2 impact.
  // CO2 = total × co2Electricity works uniformly for all system types.
  const co2kg = total * ENERGY_CONFIG.co2Electricity;

  return {
    hotWater:    Math.round(hotWaterPurch),
    lighting:    Math.round(lighting),
    ventilation: Math.round(ventilationElec),
    cooling:     Math.round(coolingPurch),
    heating:     Math.round(heatingPurch),
    appliances:  Math.round(appliances),
    media:       Math.round(media),
    lift:        Math.round(lift),
    total:       Math.round(total),
    totalPerM2:  Math.round(perM2),
    co2:         Math.round(co2kg),
    // Thermal values for educational tooltips
    hotWaterThermal:  Math.round(hotWaterThermal),
    coolingThermal:   Math.round(coolingThermal),
    heatingThermal:   Math.round(heatingThermal),
    copHeat:          hcSys.copHeat,
    copCool:          hcSys.copCool,
  };
}

// ─── BUILDING OVERVIEW ───────────────────────────────────────────────────────
// Derives apartment count per floor from size (no extra input needed).
// Tower: always 4 corner (hoek) + remaining single-sided (eenzijdig) per floor.
// Gallery: through-apartments spanning the full block width.
function calcBuildingOverview(inputs) {
  const { size, totalFloors, buildingType } = inputs;

  if (buildingType === 1) {
    // Gallery: 60m block length, each apartment ~size m² → floor width ≈ size/8m depth
    const perFloor = Math.max(2, Math.floor(480 / size));
    const r = calcAll({ ...inputs, aptType: 2 });
    return {
      type: 'gallery',
      perFloor,
      r,
      buildingTotal: Math.round(r.total * perFloor * totalFloors),
    };
  }

  // Tower: 4 hoek (corner) + remaining eenzijdig (single-sided) per floor
  const totalPerFloor = Math.max(6, Math.round(500 / size));
  const hoekPerFloor  = 4;
  const eenzPerFloor  = Math.max(2, totalPerFloor - 4);
  const rHoek = calcAll({ ...inputs, aptType: 1 });
  const rEenz = calcAll({ ...inputs, aptType: 0 });
  return {
    type: 'tower',
    hoekPerFloor,
    eenzPerFloor,
    rHoek,
    rEenz,
    buildingTotal: Math.round((rHoek.total * hoekPerFloor + rEenz.total * eenzPerFloor) * totalFloors),
  };
}
