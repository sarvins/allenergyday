// info-content.js — Hover tooltips and read-more content for each parameter
// Structure: INFO[paramKey].{ icon, nl|en: { tooltip, aptNote[type], full } }

const INFO = {

  aptType: {
    icon: '🏢',
    affects3D: true,
    nl: {
      tooltip: 'Bepaalt de bouwvorm, ventilatiemogelijkheden en liftgebruik. Gallerij-flats hebben unieke voordelen voor koeling en ventilatie.',
      aptNote: [
        'Eenzijdig toren: alle verse lucht via mechanisch systeem — geen doorstroming mogelijk. Hogere ventilatie-energie, sterk afhankelijk van WTW-systeem.',
        'Hoekappartement: twee loodrechte gevels geven meer daglicht én kruisventilatie-mogelijkheid, maar ook een grotere koelbelasting op de zonhoek.',
        '🌬️ Gallerij-flat is tweezijdig: hoofdgevel (ramen, voorkant) + open galerijgang (achterkant). Die twee open zijden creëren kruisventilatie — lucht stroomt door het appartement van voor naar achter. Resultaat: ~55% minder ventilatie-elektriciteit en ~65% minder liftenergie dan toren. Let op: twee gevels betekent ook meer transmissieverliezen in de winter.',
      ],
      full: `<h3>Type appartement</h3>
<p>De bouwvorm is een van de meest bepalende factoren voor energieverbruik — niet alleen via isolatie, maar via de <strong>mogelijkheid tot passieve ventilatie en koeling</strong>.</p>

<h4>🌬️ Gallerij — tweezijdig appartement</h4>
<p>Een galerijflat is <strong>tweezijdig</strong>: de hoofdgevel (ramen) aan de voorkant, en een open galerijgang aan de achterkant. Beide zijden zijn blootgesteld aan de buitenlucht. Die twee open zijden maken echte <em>kruisventilatie</em> mogelijk.</p>
<ul>
  <li><strong>~55% minder ventilatie-elektriciteit</strong> — wind drijft ventilatie aan</li>
  <li><strong>~65% minder liftenergie</strong> — open trappenhuizen worden vaker gebruikt</li>
  <li>Betere passieve nachtkoeling</li>
  <li>Let op: twee gevels = ook meer transmissieverliezen in de winter</li>
</ul>

<h4>🔲 Toren: eenzijdig vs. hoekappartement</h4>
<p>Een toren heeft altijd 4 hoekappartementen (twee loodrechte gevels) en een aantal eenzijdige appartementen (één gevel, rest naar kern). Hoekappartementen hebben meer daglicht maar ook hogere koelbelasting op de zonhoek.</p>

<h4>🛗 Liftenergie per type</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px 8px;border-bottom:1px solid #334155">Type</th><th style="padding:4px 8px;border-bottom:1px solid #334155">Liftfactor</th></tr>
  <tr><td style="padding:4px 8px">Toren (alle typen)</td><td style="padding:4px 8px">100% (referentie)</td></tr>
  <tr><td style="padding:4px 8px">Gallerij flat</td><td style="padding:4px 8px">~35%</td></tr>
</table>`,
    },
    en: {
      tooltip: 'Determines building form, ventilation potential and lift use. Gallery flats have unique advantages for cooling and ventilation.',
      aptNote: [
        'Single-sided tower: all fresh air via mechanical system — no cross-ventilation. Higher fan energy, strongly dependent on heat recovery system.',
        'Corner apartment: two perpendicular façades give more daylight and cross-ventilation, but also higher cooling load at the sun-facing corner.',
        '🌬️ Gallery flat is two-sided: main façade (windows, front) + open gallery corridor (back). Those two open sides create cross-ventilation — air flows through the apartment front-to-back. Result: ~55% less ventilation electricity and ~65% less lift energy than a tower. Note: two façades also mean more transmission losses in winter.',
      ],
      full: `<h3>Apartment type</h3>
<p>Building form is one of the most decisive factors for energy use — not just through insulation, but through the <strong>potential for passive ventilation and cooling</strong>.</p>

<h4>🌬️ Gallery vs. Tower</h4>
<p>A gallery flat has an open access corridor on one side. This acts as a <strong>wind channel</strong>: outdoor air flows through the apartment from front windows and exits via the gallery. This is called <em>cross-ventilation</em>.</p>
<ul>
  <li><strong>~55% less ventilation electricity</strong> — fans run less hard or less often</li>
  <li><strong>~65% less lift energy</strong> — open staircases are used more</li>
  <li>Better passive night cooling in warm periods</li>
  <li>Improved comfort without air conditioning</li>
</ul>`,
    },
  },

  floor: {
    icon: '🏗️',
    affects3D: true,
    nl: {
      tooltip: 'Hogere verdiepingen hebben meer liftenergie maar minder Urban Heat Island effect. Wind koelt de gevel beter op hoogte.',
      aptNote: [
        'Toren, eenzijdig: liftenergie neemt lineair toe met verdieping. Op verdieping 15 gebruik je ~3× meer liftenergie dan op verdieping 5.',
        'Hoekappartement: liftverbruik gelijk aan standaard toren maar hoger windblootstelling op de hoek bij hogere verdiepingen.',
        '✅ Gallerij: open trappenhuizen en lage gebouwhoogte reduceren liftenergie sterk — factor ~35% van een toren.',
      ],
      full: `<h3>Verdieping & hoogte</h3>

<h4>🛗 Liftenergie</h4>
<p>Liftenergie schaalt met de verdieping: hoe hoger, hoe meer energie per rit. De berekening gebruikt <strong>4 ritten per persoon per dag</strong> (thuis + weg, 2× per rit = 2 reizen).</p>
<p>Vuistregel: elke 5 verdiepingen hoger ≈ +50% liftenergie per appartement.</p>

<h4>🌡️ Urban Heat Island (UHI)</h4>
<p>In steden is het warmer dan het omringende platteland door bebouwing, asfalt en warmtelozingen. Dit heet het <em>Urban Heat Island effect</em>. Op straatniveau is dit effect het sterkst (+1–2°C), maar het neemt af met hoogte door meer windkoeling.</p>
<ul>
  <li><strong>Verdieping 1–3:</strong> volle UHI-last → hogere koelvraag</li>
  <li><strong>Verdieping 10+:</strong> UHI neemt af, maar liftvraag neemt toe</li>
</ul>

<h4>📊 Hoogte-tradeoff</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Verdieping</th><th style="padding:4px;border-bottom:1px solid #334155">UHI-effect</th><th style="padding:4px;border-bottom:1px solid #334155">Liftenergie</th></tr>
  <tr><td style="padding:4px">1–2</td><td style="padding:4px">Sterk</td><td style="padding:4px">Laag</td></tr>
  <tr><td style="padding:4px">5–7</td><td style="padding:4px">Matig</td><td style="padding:4px">Matig</td></tr>
  <tr><td style="padding:4px">12+</td><td style="padding:4px">Zwak</td><td style="padding:4px">Hoog</td></tr>
</table>`,
    },
    en: {
      tooltip: 'Higher floors mean more lift energy but less Urban Heat Island effect. Wind cools the façade better at height.',
      aptNote: [
        'Single-sided tower: lift energy increases linearly with floor. At floor 15 you use ~3× more lift energy than floor 5.',
        'Corner apartment: lift use equal to standard tower but higher wind exposure at corner on upper floors.',
        '✅ Gallery: open staircases and low building height reduce lift energy strongly — factor ~35% of a tower.',
      ],
      full: `<h3>Floor & height</h3>
<h4>🛗 Lift energy</h4>
<p>Lift energy scales with floor number: the higher, the more energy per trip. The calculation uses <strong>4 trips per person per day</strong>.</p>
<h4>🌡️ Urban Heat Island (UHI)</h4>
<p>In cities it is warmer than surrounding areas due to buildings, asphalt and heat emissions. This UHI effect is strongest at street level and decreases with height due to increased wind cooling.</p>`,
    },
  },

  size: {
    icon: '📐',
    affects3D: true,
    nl: {
      tooltip: 'Groter appartement = meer bewoners, meer apparaten, maar ook meer verliesoppervlak. Energie per m² daalt licht bij grotere appartementen.',
      aptNote: null, // same for all types
      full: `<h3>Grootte appartement</h3>
<p>De grootte beïnvloedt bijna alle energieposten:</p>
<ul>
  <li><strong>Transmissieverliezen:</strong> groter geveloppervlak → meer warmteverlies (maar ook meer zonwinst)</li>
  <li><strong>Ventilatie:</strong> hogere luchtverversingseis (0,9 l/s·m²)</li>
  <li><strong>Bewoners:</strong> grotere appartementen trekken meer bewoners — meer warm water en apparaten</li>
  <li><strong>Verlichting:</strong> meer m² = meer verlichtingsenergie, maar de energiedichtheid (kWh/m²) daalt door schaaleffect</li>
</ul>
<p>Bewonersmodel: een appartement van <strong>40 m² heeft ~1,2 bewoners</strong>, 88 m² heeft ~2, en 140 m² heeft ~3,4.</p>`,
    },
    en: {
      tooltip: 'Larger apartment = more occupants, more appliances, but also more loss area. Energy per m² decreases slightly in larger apartments.',
      aptNote: null,
      full: `<h3>Apartment size</h3>
<p>Size affects almost every energy component: transmission losses, ventilation demand, occupancy, and lighting. Energy intensity (kWh/m²) decreases slightly at larger sizes due to scale effects.</p>`,
    },
  },

  orientation: {
    icon: '🧭',
    affects3D: true,
    nl: {
      tooltip: 'Oriëntatie heeft enorme invloed op koeling: een zuidgevel heeft tot 5× meer koelbelasting dan een noordgevel. Verwarming verschilt minder.',
      aptNote: [
        'Eenzijdig toren: oriëntatie bepaalt alles — er is maar één gevel. Zuid is het warmst in de zomer.',
        'Hoekappartement: twee loodrechte gevels → oriëntatie is de hoekrichting. ZO-ZW hoek is de warmste combinatie.',
        'Gallerij: de gallerij-zijde heeft minder directe zoninstraling. De hoofdoriëntatie is de gevel tegenover de galerij.',
      ],
      full: `<h3>Oriëntatie</h3>
<p>Oriëntatie is de meest onderschatte parameter voor <strong>koeling</strong>. Een zuidgevel ontvangt tot 5× meer zonne-instraling in de zomer dan een noordgevel.</p>

<h4>☀️ Koelbelasting per oriëntatie (relatief)</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Richting</th><th style="padding:4px;border-bottom:1px solid #334155">Koelfactor</th><th style="padding:4px;border-bottom:1px solid #334155">Toelichting</th></tr>
  <tr><td style="padding:4px">Noord (N)</td><td style="padding:4px">0.22×</td><td style="padding:4px">Nauwelijks directe zon</td></tr>
  <tr><td style="padding:4px">Oost/West (O/W)</td><td style="padding:4px">0.45–1.0×</td><td style="padding:4px">Ochtend- of middagzon</td></tr>
  <tr><td style="padding:4px">Zuid (Z)</td><td style="padding:4px">1.00× (ref)</td><td style="padding:4px">Meeste zomerzon</td></tr>
  <tr><td style="padding:4px">Zuidwest (ZW)</td><td style="padding:4px">1.13×</td><td style="padding:4px">Heetste richtingl</td></tr>
</table>
<p style="margin-top:8px">Voor <strong>verwarming</strong> is het effect omgekeerd: zuidgevel wint zonnewarmte in de winter (minder stookkosten). Het verschil is hier minder groot.</p>`,
    },
    en: {
      tooltip: 'Orientation has enormous impact on cooling: a south façade can have up to 5× more cooling load than a north façade.',
      aptNote: [
        'Single-sided tower: orientation determines everything — there is only one façade. South is hottest in summer.',
        'Corner apartment: two perpendicular façades — orientation is the corner direction. SE-SW corner is warmest.',
        'Gallery: the gallery side has less direct solar radiation. Main orientation is the façade opposite the gallery.',
      ],
      full: `<h3>Orientation</h3>
<p>Orientation is the most underestimated parameter for <strong>cooling</strong>. A south façade receives up to 5× more solar radiation in summer than a north façade. For heating, south orientation provides solar gains in winter, reducing heating demand.</p>`,
    },
  },

  glassRatio: {
    icon: '🪟',
    affects3D: true,
    nl: {
      tooltip: 'Meer glas = meer daglicht (minder verlichting), maar ook meer zonnewarmte (meer koeling) en meer warmteverlies (meer verwarming). De balans is oriëntatie-afhankelijk.',
      aptNote: [
        'Eenzijdig toren: hoog glaspercentage op zuidgevel is risicovol voor oververhitting zonder zonwering.',
        'Hoekappartement: glaspercentage op twee richtingen — meer strategisch kiezen welke zijde meer glas krijgt.',
        '🟡 Gallerij: de galerij-overhang werkt als natuurlijke zonwering voor het onderste deel van de gevel. Meer glas minder problematisch dan bij een vrije toren.',
      ],
      full: `<h3>Glaspercentage</h3>
<p>Glas is een dubbelzinnig materaal: het laat licht door (positief), maar ook warmte (positief in winter, negatief in zomer) en verliest meer warmte dan een goed geïsoleerde muur (negatief in winter).</p>

<h4>📊 Effect van glaspercentage</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Effect</th><th style="padding:4px;border-bottom:1px solid #334155">20% glas</th><th style="padding:4px;border-bottom:1px solid #334155">40% glas</th><th style="padding:4px;border-bottom:1px solid #334155">70% glas</th></tr>
  <tr><td style="padding:4px">Koeling (rel.)</td><td style="padding:4px">0.6×</td><td style="padding:4px">1.0× (ref)</td><td style="padding:4px">~2.0×</td></tr>
  <tr><td style="padding:4px">Verwarming</td><td style="padding:4px">Lager</td><td style="padding:4px">Ref</td><td style="padding:4px">Hoger (verlies) / Lager (winst)</td></tr>
  <tr><td style="padding:4px">Verlichting</td><td style="padding:4px">Hoog</td><td style="padding:4px">Matig</td><td style="padding:4px">Laag</td></tr>
</table>

<h4>🕶️ Zonwering</h4>
<p>Zonwering (ZTA-waarde) halveert de effectieve koelbelasting van glas. Een gallerij-overhang werkt als vaste zonwering voor laagstaande zomerse zon.</p>`,
    },
    en: {
      tooltip: 'More glass = more daylight (less lighting), but also more solar heat gain (more cooling) and more heat loss (more heating). The balance is orientation-dependent.',
      aptNote: [
        'Single-sided tower: high glass % on south façade risks overheating without shading.',
        'Corner apartment: glass on two directions — strategic choice which side gets more glazing.',
        '🟡 Gallery: the gallery overhang acts as natural shading. Higher glass % less problematic than free-standing tower.',
      ],
      full: `<h3>Glass percentage</h3>
<p>Glass is ambiguous: it admits light (positive), but also heat (positive in winter, negative in summer) and loses more heat than well-insulated wall (negative in winter).</p>
<p>The cooling demand scales roughly as (glass%/40%)^1.5. Going from 40% to 70% glass nearly doubles cooling load.</p>`,
    },
  },

  construction: {
    icon: '🧱',
    affects3D: true,
    nl: {
      tooltip: 'Constructietype bepaalt U-waarden, thermische massa, ZTA (zonwering) en daarmee zowel warmte- als koelvraag. Hybride beton-biobased scoort het beste over alle seizoenen.',
      aptNote: null,
      full: `<h3>Constructie & envelop</h3>
<p>Het constructietype bepaalt drie dingen tegelijk: <strong>isolatiewaarde (U-waarden)</strong>, <strong>thermische massa</strong> en <strong>zonwering (ZTA)</strong>. In het nieuwe model zijn U-waarden losgekoppeld van het ventilatiesysteem — het zijn nu aparte keuzes.</p>

<h4>📊 Typen vergeleken</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Type</th><th style="padding:4px;border-bottom:1px solid #334155">U-gevel</th><th style="padding:4px;border-bottom:1px solid #334155">U-glas</th><th style="padding:4px;border-bottom:1px solid #334155">ZTA zomer</th><th style="padding:4px;border-bottom:1px solid #334155">Massa-koeling</th></tr>
  <tr><td style="padding:4px">Conventioneel beton</td><td style="padding:4px">0.25</td><td style="padding:4px">1.1</td><td style="padding:4px">0.30</td><td style="padding:4px">×1.00</td></tr>
  <tr><td style="padding:4px">Bio-based licht</td><td style="padding:4px">0.30</td><td style="padding:4px">1.2</td><td style="padding:4px">0.12</td><td style="padding:4px">×1.50</td></tr>
  <tr><td style="padding:4px">Bio-based zwaar</td><td style="padding:4px">0.25</td><td style="padding:4px">1.1</td><td style="padding:4px">0.12</td><td style="padding:4px">×1.30</td></tr>
  <tr><td style="padding:4px">Hybride beton-biobased</td><td style="padding:4px">0.20</td><td style="padding:4px">0.8</td><td style="padding:4px">0.15</td><td style="padding:4px">×1.15</td></tr>
</table>

<h4>🌡️ Thermische massa & koeling</h4>
<p>Beton is zwaar: het slaat overdag warmte op en geeft die 's nachts langzaam vrij. Als 's nachts wordt geventileerd, verdwijnt die opgeslagen warmte passief. Resultaat: <em>minder actieve koeling nodig</em>. Bio-based licht heeft geen buffer — elke warmtetoevoer vereist direct mechanische koeling.</p>

<h4>☀️ ZTA = zontoetredingsfactor</h4>
<p>ZTA-zomer (met zonwering actief) bepaalt hoeveel zomerse zonnestraling door het glas komt. Bio-based types hebben betere externe zonwering (ZTA 0.12) dan beton (ZTA 0.30) — dit helpt koeling, maar compenseert het gebrek aan thermische massa niet volledig.</p>

<h4>🌿 CO₂ in materialen</h4>
<p>Dit model berekent alleen <em>gebruiksenergie</em> — de CO₂ in de materiaalproductie (embodied carbon) zit er niet in. Bio-based constructies binden CO₂ in het hout; beton is CO₂-intensief in productie.</p>`,
    },
    en: {
      tooltip: 'Construction type sets U-values, thermal mass, ZTA (solar shading) — affecting both heating and cooling. Hybrid concrete-biobased is best across all seasons.',
      aptNote: null,
      full: `<h3>Construction & building envelope</h3>
<p>The construction type determines three things simultaneously: <strong>insulation quality (U-values)</strong>, <strong>thermal mass</strong>, and <strong>solar shading (ZTA)</strong>. In the new model, U-values are decoupled from the ventilation system — they are now independent choices.</p>

<h4>📊 Types compared</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Type</th><th style="padding:4px;border-bottom:1px solid #334155">U-wall</th><th style="padding:4px;border-bottom:1px solid #334155">U-glass</th><th style="padding:4px;border-bottom:1px solid #334155">ZTA summer</th><th style="padding:4px;border-bottom:1px solid #334155">Mass-cooling</th></tr>
  <tr><td style="padding:4px">Conventional concrete</td><td style="padding:4px">0.25</td><td style="padding:4px">1.1</td><td style="padding:4px">0.30</td><td style="padding:4px">×1.00</td></tr>
  <tr><td style="padding:4px">Bio-based light</td><td style="padding:4px">0.30</td><td style="padding:4px">1.2</td><td style="padding:4px">0.12</td><td style="padding:4px">×1.50</td></tr>
  <tr><td style="padding:4px">Bio-based heavily ins.</td><td style="padding:4px">0.25</td><td style="padding:4px">1.1</td><td style="padding:4px">0.12</td><td style="padding:4px">×1.30</td></tr>
  <tr><td style="padding:4px">Hybrid concrete-biobased</td><td style="padding:4px">0.20</td><td style="padding:4px">0.8</td><td style="padding:4px">0.15</td><td style="padding:4px">×1.15</td></tr>
</table>

<h4>🌡️ Thermal mass & cooling</h4>
<p>Concrete is heavy: it absorbs heat during the day and releases it slowly at night. With night ventilation, that stored heat escapes passively. Result: <em>less active cooling needed</em>. Bio-based light has no buffer — any heat input requires immediate mechanical cooling.</p>

<h4>☀️ ZTA = solar transmittance</h4>
<p>ZTA-summer (with shading active) determines how much summer solar radiation passes through the glass. Bio-based types have better external shading (ZTA 0.12 vs. concrete's 0.30) — this helps cooling, but doesn't fully compensate for the lack of thermal mass.</p>`,
    },
  },

  roofType: {
    icon: '🏠',
    affects3D: true,
    nl: {
      tooltip: 'Alleen relevant voor het topappartement. Een groen dak isoleert en koelt door verdamping; een zwart dak absorbeert zonnestraling sterk.',
      aptNote: null,
      full: `<h3>Dak (topverdieping)</h3>
<p>Het dak is alleen relevant als dit appartement op de <strong>bovenste verdieping</strong> zit.</p>

<h4>🌿 Groen dak</h4>
<ul>
  <li>Vegetatielaag isoleert het dakoppervlak</li>
  <li>Verdamping koelt het dak actief (evapotranspiratie)</li>
  <li>Netto: licht hogere koelbelasting dan geen dak (door extra massa), maar beduidend minder dan een zwart dak</li>
  <li>Bijkomend voordeel: biodiversiteit, waterberging</li>
</ul>

<h4>⬛ Zwart dak</h4>
<ul>
  <li>Donkere bitumen absorbeert tot 95% van de zonnestraling</li>
  <li>Dakoppervlak kan 70–80°C worden in de zomer</li>
  <li>Dit straalt als extra warmte af in het appartement → +18% koelvraag</li>
</ul>`,
    },
    en: {
      tooltip: 'Only relevant for the top-floor apartment. A green roof insulates and cools through evaporation; a black roof absorbs solar radiation strongly.',
      aptNote: null,
      full: `<h3>Roof (top floor only)</h3>
<p>A black roof can reach 70–80°C surface temperature in summer, adding ~18% to cooling demand. A green roof's evapotranspiration actively cools the surface, making it much better despite added mass.</p>`,
    },
  },

  ventilation: {
    icon: '💨',
    affects3D: false,
    nl: {
      tooltip: 'Ventilatiesysteem bepaalt WTW-efficiëntie (warmteterugwinning) én vrije-koeling-capaciteit. Hoge WTW = minder verwarmingsverlies; hoge vrije koeling = minder actieve koeling nodig.',
      aptNote: [
        '⚠️ Eenzijdig toren: geen kruisventilatie mogelijk. Fan draait op volledig vermogen — hogere ventilatie-elektriciteit.',
        'Hoekappartement: twee gevels geven iets meer luchtbeweging; balans-systemen werken hier goed.',
        '✅ Gallerij: open galerij aan de achterzijde maakt kruisventilatie mogelijk — wind drijft de lucht door het appartement (~55% minder fan-energie, stapelt op het systeemeffect).',
      ],
      full: `<h3>Ventilatiesysteem</h3>
<p>Het ventilatiesysteem heeft twee onafhankelijke effecten op energie:</p>
<ol>
  <li><strong>WTW (warmteterugwinning)</strong> — terugwinning van warmte uit de afvoerlucht. Hoge WTW = minder verwarmingsverlies via ventilatie.</li>
  <li><strong>Vrije koeling</strong> — passieve koeling door koude buitenlucht 's nachts. Open systemen (nat., afvoer) kunnen 's nachts veel koele lucht doorlaten. Dichte balans-systemen kunnen dat niet.</li>
</ol>
<p>⚠️ <strong>Let op:</strong> U-waarden staan nu apart in het constructietype, niet meer gekoppeld aan het ventilatiesysteem.</p>

<h4>📊 Systemen vergeleken</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Systeem</th><th style="padding:4px;border-bottom:1px solid #334155">WTW</th><th style="padding:4px;border-bottom:1px solid #334155">Vrije koeling*</th><th style="padding:4px;border-bottom:1px solid #334155">Fan W/m²</th></tr>
  <tr><td style="padding:4px">Natuurlijke ventilatie</td><td style="padding:4px">0%</td><td style="padding:4px">↑↑ 30%</td><td style="padding:4px">0 (geen fan)</td></tr>
  <tr><td style="padding:4px">Mechanische afvoer</td><td style="padding:4px">0%</td><td style="padding:4px">↑↑ 30%</td><td style="padding:4px">laag</td></tr>
  <tr><td style="padding:4px">Mechanische toevoer</td><td style="padding:4px">0%</td><td style="padding:4px">↑ 20%</td><td style="padding:4px">laag</td></tr>
  <tr><td style="padding:4px">Gebalanceerd lokaal</td><td style="padding:4px">55%</td><td style="padding:4px">↓ 7%</td><td style="padding:4px">hoog</td></tr>
  <tr><td style="padding:4px">Gebalanceerd centraal</td><td style="padding:4px">60%</td><td style="padding:4px">↓ 7%</td><td style="padding:4px">hoog</td></tr>
  <tr><td style="padding:4px">Gebalanceerd HR++</td><td style="padding:4px">75%</td><td style="padding:4px">↓↓ 3%</td><td style="padding:4px">zeer hoog</td></tr>
  <tr><td style="padding:4px">Mech. afzuiging innov.</td><td style="padding:4px">20%</td><td style="padding:4px">↑↑ 32%</td><td style="padding:4px">laag</td></tr>
  <tr><td style="padding:4px">EWF systeem</td><td style="padding:4px">40%</td><td style="padding:4px">↑↑↑ 80%</td><td style="padding:4px">laag</td></tr>
</table>
<p style="font-size:0.78rem;color:#94a3b8">* Vrije koeling = % koelvraag-reductie via passieve nachtventilatie t.o.v. basislijn.</p>

<h4>🌍 EWF — bijzonder geval</h4>
<p>Het EWF-systeem (Energie Werk Fluïdum) voert lucht via een ondergrondse warmtewisselaar. De grondtemperatuur (~12°C) koelt de inkomende lucht passief in de zomer — een enorm vrije-koeling-voordeel (80% koelreductie). In de winter verwarmt diezelfde grond de binnenkomende lucht voor.</p>

<h4>🌬️ Gallerij-bonus (stapelbaar)</h4>
<p>De gallerij-kruisventilatie (−25% extra koeling, −55% fan-energie) stapelt bovenop het systeem-effect. EWF + gallerij = de laagste koelvraag van alle combinaties.</p>`,
    },
    en: {
      tooltip: 'Ventilation system determines WTW efficiency (heat recovery) AND free cooling capacity. High WTW = less heating loss; high free cooling = less active cooling needed.',
      aptNote: [
        '⚠️ Single-sided tower: no cross-ventilation. Fan runs at full power — higher electricity.',
        'Corner apartment: two façades give slightly more airflow; balanced systems work well here.',
        '✅ Gallery: open corridor at the back enables cross-ventilation — wind drives airflow through the apartment (~55% less fan energy, stacked on top of the system effect).',
      ],
      full: `<h3>Ventilation system</h3>
<p>The ventilation system has two independent energy effects:</p>
<ol>
  <li><strong>WTW (heat recovery)</strong> — recovering heat from exhaust air. Higher WTW = less heating loss through ventilation.</li>
  <li><strong>Free cooling</strong> — passive cooling via cold outdoor air at night. Open systems (natural, extract) can flush cool air freely. Sealed balanced systems cannot.</li>
</ol>
<p>⚠️ <strong>Note:</strong> U-values are now set separately in the construction type, no longer coupled to the ventilation system.</p>

<h4>📊 Systems compared</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">System</th><th style="padding:4px;border-bottom:1px solid #334155">HRV</th><th style="padding:4px;border-bottom:1px solid #334155">Free cooling*</th></tr>
  <tr><td style="padding:4px">Natural ventilation</td><td style="padding:4px">0%</td><td style="padding:4px">↑↑ 30%</td></tr>
  <tr><td style="padding:4px">Mechanical extract</td><td style="padding:4px">0%</td><td style="padding:4px">↑↑ 30%</td></tr>
  <tr><td style="padding:4px">Mechanical supply</td><td style="padding:4px">0%</td><td style="padding:4px">↑ 20%</td></tr>
  <tr><td style="padding:4px">Balanced local</td><td style="padding:4px">55%</td><td style="padding:4px">↓ 7%</td></tr>
  <tr><td style="padding:4px">Balanced central</td><td style="padding:4px">60%</td><td style="padding:4px">↓ 7%</td></tr>
  <tr><td style="padding:4px">Balanced HR++</td><td style="padding:4px">75%</td><td style="padding:4px">↓↓ 3%</td></tr>
  <tr><td style="padding:4px">Innovative mech. extract</td><td style="padding:4px">20%</td><td style="padding:4px">↑↑ 32%</td></tr>
  <tr><td style="padding:4px">EWF system</td><td style="padding:4px">40%</td><td style="padding:4px">↑↑↑ 80%</td></tr>
</table>
<p style="font-size:0.78rem;color:#94a3b8">* Free cooling = % cooling demand reduction via passive night ventilation vs. baseline.</p>

<h4>🌍 EWF — special case</h4>
<p>The EWF system routes air via an underground heat exchanger. Ground temperature (~12°C) passively pre-cools incoming air in summer — massive free cooling advantage (80% cooling reduction). In winter, the same ground pre-warms the incoming air.</p>`,
    },
  },

  heatCool: {
    icon: '⚙️',
    affects3D: false,
    nl: {
      tooltip: 'Het verwarmings-/koelingssysteem bepaalt hoe efficiënt thermische energie omgezet wordt in elektriciteit. WKO-warmtepomp is het meest efficiënt (COP tot 10 voor koeling).',
      aptNote: null,
      full: `<h3>Verwarming & koeling systeem</h3>

<h4>🔢 COP = Coefficient of Performance</h4>
<p>COP geeft aan hoeveel kWh warmte je krijgt per kWh elektriciteit. COP 6 betekent: 1 kWh stroom → 6 kWh warmte.</p>

<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Systeem</th><th style="padding:4px;border-bottom:1px solid #334155">COP verw.</th><th style="padding:4px;border-bottom:1px solid #334155">COP koel.</th><th style="padding:4px;border-bottom:1px solid #334155">COP warm water</th></tr>
  <tr><td style="padding:4px">WP Lucht (AP)</td><td style="padding:4px">3.5</td><td style="padding:4px">3.5</td><td style="padding:4px">2.75</td></tr>
  <tr><td style="padding:4px">WP WKO (bodem)</td><td style="padding:4px">6.0</td><td style="padding:4px">10.0</td><td style="padding:4px">4.0</td></tr>
  <tr><td style="padding:4px">Stadsverw. + koelm.</td><td style="padding:4px">7.0 eq.</td><td style="padding:4px">3.5</td><td style="padding:4px">7.0 eq.</td></tr>
  <tr><td style="padding:4px">SV tapwater + WP</td><td style="padding:4px">3.5</td><td style="padding:4px">3.5</td><td style="padding:4px">7.0 eq.</td></tr>
  <tr><td style="padding:4px">SV + WP T-afh.</td><td style="padding:4px">5.0</td><td style="padding:4px">3.5</td><td style="padding:4px">6.5</td></tr>
</table>

<h4>💡 Stadsverwarming vs. Warmtepomp</h4>
<p>Stadsverwarming heeft een lage CO₂-voetafdruk als de warmtebron hernieuwbaar is (restwarmte, geothermie). Warmtepompen zijn flexibel maar afhankelijk van de CO₂-intensiteit van het elektriciteitsnet.</p>`,
    },
    en: {
      tooltip: 'The heating/cooling system determines how efficiently thermal energy is converted. WKO heat pump is most efficient (COP up to 10 for cooling).',
      aptNote: null,
      full: `<h3>Heating & cooling system</h3>
<p>COP (Coefficient of Performance) tells how much kWh of heat you get per kWh of electricity. A WKO (ground-source) heat pump achieves COP 10 for cooling — meaning 1 kWh electricity provides 10 kWh of cooling, 10× more efficient than direct electric cooling.</p>
<p>The difference between air heat pump (COP 3.5) and WKO (COP 6.0) for heating means ~40% less electricity for the same warmth.</p>`,
    },
  },

  solarCollector: {
    icon: '☀️',
    affects3D: false,
    nl: {
      tooltip: 'Thermische zonnepanelen reduceren warm waterverbruik door de zon te gebruiken voor voorverwarming. Vacuümcollectoren zijn het meest efficiënt (550 kWh/m²).',
      aptNote: null,
      full: `<h3>Thermische zonnepanelen</h3>
<p>Thermische zonnecollectoren (niet te verwarren met PV-panelen!) zetten zonnestraling om in warmte voor <strong>tapwater voorverwarming</strong>.</p>

<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Type</th><th style="padding:4px;border-bottom:1px solid #334155">Oppervlak</th><th style="padding:4px;border-bottom:1px solid #334155">Opbrengst</th><th style="padding:4px;border-bottom:1px solid #334155">Reductie warm water</th></tr>
  <tr><td style="padding:4px">Geen</td><td style="padding:4px">—</td><td style="padding:4px">—</td><td style="padding:4px">0%</td></tr>
  <tr><td style="padding:4px">PVT</td><td style="padding:4px">1.5 m²</td><td style="padding:4px">300 kWh/m²</td><td style="padding:4px">~35%</td></tr>
  <tr><td style="padding:4px">Standaard</td><td style="padding:4px">2.0 m²</td><td style="padding:4px">350 kWh/m²</td><td style="padding:4px">~55%</td></tr>
  <tr><td style="padding:4px">Vacuum</td><td style="padding:4px">2.0 m²</td><td style="padding:4px">550 kWh/m²</td><td style="padding:4px">~85%</td></tr>
</table>

<p>PVT-panelen combineren thermische en elektrische opwekking in één paneel — minder dak nodig.</p>`,
    },
    en: {
      tooltip: 'Solar thermal collectors reduce hot water energy by using the sun for preheating. Vacuum collectors are most efficient (550 kWh/m²).',
      aptNote: null,
      full: `<h3>Solar thermal collectors</h3>
<p>Thermal collectors (not PV panels) convert solar radiation to heat for hot water preheating. Vacuum tube collectors achieve 550 kWh/m²/year, potentially covering 85%+ of hot water demand for 2 persons with 2m².</p>`,
    },
  },

  showerWTW: {
    icon: '🚿',
    affects3D: false,
    nl: {
      tooltip: 'Douche-warmteterugwinning vangt warmte uit het afvoerwater op en geeft dit terug aan het koude water. Eén van de meest kosteneffectieve maatregelen: −30% tot −40% warm waterverbruik.',
      aptNote: null,
      full: `<h3>Douche warmteterugwinning (WTW)</h3>
<p>Warm douchewater verlaat het appartement via de afvoer — en neemt veel energie mee. Een douche-WTW-systeem plaatst een warmtewisselaar in de afvoerbuis die de warmte teruggeeft aan het koude water dat de boiler ingaat.</p>

<h4>💡 Hoe het werkt</h4>
<ol>
  <li>Warm afvoerwater (37°C) stroomt langs de warmtewisselaar</li>
  <li>Koud leidingwater (12°C) wordt voorverwarmd naar ~22°C</li>
  <li>De boiler hoeft minder bij te verwarmen → 30–40% minder energie</li>
</ol>

<h4>📊 Vergelijking</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Systeem</th><th style="padding:4px;border-bottom:1px solid #334155">Reductie</th><th style="padding:4px;border-bottom:1px solid #334155">Investering</th></tr>
  <tr><td style="padding:4px">Geen</td><td style="padding:4px">0%</td><td style="padding:4px">€0</td></tr>
  <tr><td style="padding:4px">Individueel</td><td style="padding:4px">30%</td><td style="padding:4px">~€800</td></tr>
  <tr><td style="padding:4px">Collectief</td><td style="padding:4px">40%</td><td style="padding:4px">~€300/app</td></tr>
</table>
<p>Collectieve systemen zijn goedkoper per appartement omdat één grote warmtewisselaar meerdere woningen bedient.</p>`,
    },
    en: {
      tooltip: 'Shower heat recovery captures heat from drain water and returns it to cold water inlet. One of the most cost-effective measures: −30% to −40% hot water energy.',
      aptNote: null,
      full: `<h3>Shower heat recovery (drain-water HRV)</h3>
<p>Warm shower water (37°C) leaves through the drain, taking energy with it. A drain-water heat exchanger preheats incoming cold water from ~12°C to ~22°C. The boiler needs to heat much less — saving 30–40% of hot water energy.</p>
<p>Collective systems serve multiple apartments with one large heat exchanger, reducing cost per unit (~€300/apartment vs €800 individual).</p>`,
    },
  },

  co2Control: {
    icon: '🌿',
    affects3D: false,
    nl: {
      tooltip: 'CO₂-gestuurd ventileren past het debiet aan op aanwezigheid. Leeg appartement = minimaal debiet. Bespaart ~35% ventilatie-elektriciteit.',
      aptNote: null,
      full: `<h3>CO₂-gestuurde ventilatie</h3>
<p>Standaard ventilatiesystemen draaien altijd op hetzelfde debiet — ook als niemand thuis is. CO₂-sturing gebruikt een sensor die de CO₂-concentratie meet als maatstaf voor aanwezigheid.</p>
<ul>
  <li>Leeg appartement: ventilatie daalt naar minimum (~30% van maximum)</li>
  <li>Vol appartement: ventilatie stijgt naar maximum</li>
  <li>Gemiddeld effect: ~35% minder luchtdebiet → minder ventilatorvermogen</li>
</ul>
<p>Combineer je dit met een WTW-systeem, dan bespaar je ook proportioneel op verwarmingsverlies via ventilatie.</p>`,
    },
    en: {
      tooltip: 'CO₂-controlled ventilation adjusts airflow to occupancy. Empty apartment = minimum flow. Saves ~35% ventilation electricity.',
      aptNote: null,
      full: `<h3>CO₂-controlled ventilation (demand-controlled)</h3>
<p>CO₂ sensors measure occupancy and reduce ventilation when the apartment is empty. On average, this saves ~35% of fan electricity. Combined with HRV, it also reduces proportional heating losses through ventilation.</p>`,
    },
  },

  occupants: {
    icon: '👥',
    affects3D: false,
    nl: {
      tooltip: 'Meer bewoners = meer warm water, meer apparaten, meer media-gebruik — maar ook meer lichaamswarmte die verwarming compenseert. Gebruikersenergie is vaak 30–40% van het totaal.',
      aptNote: null,
      full: `<h3>Bewoners & gebruikersenergie</h3>
<p>Gebruikersgedrag bepaalt een verrassend groot deel van het energieverbruik. Zelfs in een perfect geïsoleerd Passive House appartement verbruiken de bewoners substantieel energie voor dagelijkse activiteiten.</p>

<h4>📦 Gebruikersenergie (2 personen, referentie)</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Post</th><th style="padding:4px;border-bottom:1px solid #334155">Energie/jaar</th><th style="padding:4px;border-bottom:1px solid #334155">Schaling</th></tr>
  <tr><td style="padding:4px">Wasmachine, droger, vaatwasser</td><td style="padding:4px">~700 kWh</td><td style="padding:4px">+ √(extra personen)</td></tr>
  <tr><td style="padding:4px">Media, computer, overig</td><td style="padding:4px">~700 kWh</td><td style="padding:4px">+ √(extra personen)</td></tr>
  <tr><td style="padding:4px">Warm water (verwarmd)</td><td style="padding:4px">~1200 kWh th.</td><td style="padding:4px">+ personen^0.95</td></tr>
</table>

<h4>💡 Schaaleffect</h4>
<p>Apparaten schalen met de <em>wortel</em> van extra personen — een wasmachine wordt gedeeld. Warm water schaalt bijna lineair (iedereen doucht apart).</p>

<h4>🌡️ Interne warmtewinst</h4>
<p>Lichaamswarmte, apparaten en verlichting produceren warmte: ~2W/m² gemiddeld. In een goed geïsoleerd appartement compenseert dit een deel van de verwarmingsvraag.</p>`,
    },
    en: {
      tooltip: 'More occupants = more hot water, more appliances, more media — but also more body heat offsetting heating. User energy is often 30–40% of total.',
      aptNote: null,
      full: `<h3>Occupants & user energy</h3>
<p>User behaviour determines a surprisingly large share of energy use. Appliances scale with the square root of extra persons (shared washing machine), while hot water scales almost linearly (everyone showers separately).</p>
<p>Internal heat gains (~2W/m² average from people, lights, appliances) reduce heating demand — but in summer they add to cooling load.</p>`,
    },
  },

  climate2050: {
    icon: '🌡️',
    affects3D: true,
    nl: {
      tooltip: 'Klimaatscenario 2050 simuleert +1.7°C warmer zomer, +1.4°C warmer winter en meer zon. Gevolg: +40% koeling, −18% verwarming, én sterker Urban Heat Island effect.',
      aptNote: [
        'Eenzijdig toren: in 2050 raakt een slecht ontworpen toren met veel zuidglas snel oververhit. Cooling wordt dominant.',
        'Hoekappartement: twee zonzijden betekent meer risico in 2050 — thermische massa wordt kritisch.',
        '✅ Gallerij: de kruisventilatie van een gallerij-flat is het meest robuust in 2050 — de bouwvorm koelt passief ook bij hogere temperaturen.',
      ],
      full: `<h3>Klimaatscenario 2050</h3>
<p>Gebaseerd op het KNMI klimaatscenario voor Nederland (W+-scenario):</p>

<h4>📊 Verwachte veranderingen</h4>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-top:8px">
  <tr><th style="text-align:left;padding:4px;border-bottom:1px solid #334155">Parameter</th><th style="padding:4px;border-bottom:1px solid #334155">Huidig</th><th style="padding:4px;border-bottom:1px solid #334155">2050</th><th style="padding:4px;border-bottom:1px solid #334155">Verschil</th></tr>
  <tr><td style="padding:4px">Gem. zomertemperatuur</td><td style="padding:4px">15.3°C</td><td style="padding:4px">17.0°C</td><td style="padding:4px">+1.7°C</td></tr>
  <tr><td style="padding:4px">Gem. wintertemperatuur</td><td style="padding:4px">3.8°C</td><td style="padding:4px">5.2°C</td><td style="padding:4px">+1.4°C</td></tr>
  <tr><td style="padding:4px">Zoninstraling zomer</td><td style="padding:4px">700 kWh/m²</td><td style="padding:4px">~800 kWh/m²</td><td style="padding:4px">+14%</td></tr>
</table>

<h4>⚡ Effect op energieverbruik</h4>
<ul>
  <li><strong>Koeling: +40%</strong> — warmere zomers met meer zonnige dagen</li>
  <li><strong>Verwarming: −18%</strong> — mildere winters</li>
  <li><strong>Urban Heat Island: sterker</strong> — steden warmer t.o.v. platteland</li>
  <li><strong>Netto effect:</strong> voor slecht geïsoleerde gebouwen met veel glas stijgt het totaalverbruik; voor goed geïsoleerde gebouwen daalt het</li>
</ul>

<h4>🏆 Winnaar: Passive House + Gallerij</h4>
<p>In het 2050 scenario scoort een gallerij-flat met Passive House ventilatie verreweg het beste: de kruisventilatie koelt passief zonder elektriciteit, en de goede isolatie reduceert de verwarmingsvraag al in 2025.</p>`,
    },
    en: {
      tooltip: '2050 climate scenario simulates +1.7°C warmer summer, +1.4°C warmer winter and more sun. Effect: +40% cooling, −18% heating, stronger Urban Heat Island.',
      aptNote: [
        'Single-sided tower: in 2050 a poorly designed tower with much south glass quickly overheats. Cooling becomes dominant.',
        'Corner apartment: two sun-facing sides means more risk in 2050 — thermal mass becomes critical.',
        '✅ Gallery: cross-ventilation is most robust in 2050 — the building type passively cools even at higher temperatures.',
      ],
      full: `<h3>Climate scenario 2050</h3>
<p>Based on KNMI climate scenario for the Netherlands: +1.7°C warmer summers, +1.4°C warmer winters, more solar radiation.</p>
<p><strong>Effect on energy:</strong> cooling +40%, heating −18%, UHI stronger at street level. Net effect depends heavily on design: well-insulated, gallery-type buildings with Passive House ventilation are the most resilient.</p>`,
    },
  },
};
