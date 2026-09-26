const fs = require('fs');
const path = require('path');

// ============================================================
// HTML 模板
// ============================================================
function buildIndexHtml(forceLang, htmlLang, canonicalPath) {
  const forceLine = forceLang
    ? `<script>window.__FORCE_LANG__ = '${forceLang}';<\/script>\n`
    : '';
  const canonical = `https://toolara.dev${canonicalPath}`;

  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Roof Pitch Calculator — Convert Rise/Run to Degrees, X:12 & Rafter Length</title>
<meta name="description" content="Free roof pitch calculator. Enter rise and run, a degree angle, or a pitch ratio (X:12) to instantly get pitch ratio, angle, slope percentage, rafter length, and slope coefficient.">
<meta name="keywords" content="roof pitch calculator, roof slope calculator, rise run to degrees, x:12 pitch, rafter length calculator, roof angle calculator">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="theme-color" content="#1e293b">

<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="https://toolara.dev/roof-pitch-calculator/">
<link rel="alternate" hreflang="zh-Hans" href="https://toolara.dev/roof-pitch-calculator/zh/">
<link rel="alternate" hreflang="x-default" href="https://toolara.dev/roof-pitch-calculator/">

<meta property="og:type" content="website">
<meta property="og:title" content="Roof Pitch Calculator — Convert Rise/Run to Degrees, X:12 & Rafter Length">
<meta property="og:description" content="Enter rise and run, a degree angle, or a pitch ratio to instantly get pitch, slope, rafter length, and more.">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="en_US">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Roof Pitch Calculator",
  "url": "${canonical}",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Any",
  "description": "Free roof pitch calculator that converts rise/run, degrees, and X:12 ratio, with rafter length and slope coefficient.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
<\/script>

${forceLine}<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header class="hero">
  <div class="lang-switch">
    <select id="langSelect" onchange="setLang(this.value)" aria-label="Language">
      <option value="en">English</option>
      <option value="zh">简体中文</option>
    </select>
  </div>
  <div class="hero-inner">
    <div class="hero-badge">🏗️ Roofing & Construction</div>
    <h1 data-i18n="title">Roof Pitch Calculator</h1>
    <p data-i18n="subtitle">Convert rise and run to degrees, X:12 ratio, slope percentage, and rafter length — instantly.</p>
  </div>
</header>

<main class="wrap">
  <section class="card">
    <h2 class="visually-hidden" data-i18n="calcHeading">Calculator</h2>

    <div class="mode-tabs">
      <button class="mode-tab active" data-mode="riseRun" onclick="switchMode('riseRun')" data-i18n="modeRiseRun">Rise & Run</button>
      <button class="mode-tab" data-mode="angle" onclick="switchMode('angle')" data-i18n="modeAngle">Angle (°)</button>
      <button class="mode-tab" data-mode="ratio" onclick="switchMode('ratio')" data-i18n="modeRatio">Pitch Ratio (X:12)</button>
    </div>

    <!-- Rise & Run -->
    <div id="mode-riseRun" class="mode-panel">
      <div class="row">
        <div>
          <label for="rise" data-i18n="riseLabel">Rise</label>
          <input type="number" id="rise" min="0" step="0.01" placeholder="6" value="6" inputmode="decimal">
        </div>
        <div>
          <label for="run" data-i18n="runLabel">Run</label>
          <input type="number" id="run" min="0.01" step="0.01" placeholder="12" value="12" inputmode="decimal">
        </div>
      </div>
      <div class="unit-toggle">
        <label data-i18n="unitLabel">Unit:</label>
        <button class="unit-btn active" data-unit="ft" onclick="setUnit('ft')">ft</button>
        <button class="unit-btn" data-unit="in" onclick="setUnit('in')">in</button>
        <button class="unit-btn" data-unit="m" onclick="setUnit('m')">m</button>
        <button class="unit-btn" data-unit="cm" onclick="setUnit('cm')">cm</button>
      </div>
    </div>

    <!-- Angle -->
    <div id="mode-angle" class="mode-panel" style="display:none;">
      <label for="angle" data-i18n="angleLabel">Roof angle (degrees)</label>
      <input type="number" id="angle" min="0" max="89.9" step="0.1" placeholder="26.57" value="26.57" inputmode="decimal">
    </div>

    <!-- Ratio -->
    <div id="mode-ratio" class="mode-panel" style="display:none;">
      <label for="ratioX" data-i18n="ratioLabel">Pitch ratio (X in 12)</label>
      <input type="number" id="ratioX" min="0" step="0.1" placeholder="6" value="6" inputmode="decimal">
      <p class="hint" data-i18n="ratioHint">Enter the rise in inches over 12 inches of run. For example, 6 for a 6:12 pitch.</p>
    </div>

    <button class="calc" type="button" onclick="calculate()" data-i18n="calcBtn">Calculate roof pitch</button>

    <!-- SVG Diagram -->
    <div class="svg-wrap">
      <svg id="roofSvg" viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#334155"/>
          </linearGradient>
        </defs>
        <!-- Ground line -->
        <line x1="40" y1="180" x2="360" y2="180" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,4"/>
        <!-- Roof triangle -->
        <polygon id="roofTri" points="40,180 360,180 360,80" fill="url(#roofGrad)" opacity="0.15"/>
        <line id="roofLine" x1="40" y1="180" x2="360" y2="80" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
        <!-- Run line -->
        <line id="runLine" x1="40" y1="180" x2="360" y2="180" stroke="#f59e0b" stroke-width="2.5"/>
        <text id="runLabel" x="200" y="200" text-anchor="middle" font-size="13" fill="#f59e0b" font-weight="600">Run</text>
        <!-- Rise line -->
        <line id="riseLine" x1="360" y1="180" x2="360" y2="80" stroke="#3b82f6" stroke-width="2.5"/>
        <text id="riseLabel" x="375" y="135" font-size="13" fill="#3b82f6" font-weight="600">Rise</text>
        <!-- Angle arc -->
        <path id="angleArc" d="M 80 180 A 40 40 0 0 0 76 170" fill="none" stroke="#ef4444" stroke-width="2"/>
        <text id="angleLabel" x="85" y="172" font-size="12" fill="#ef4444" font-weight="600">θ</text>
      </svg>
    </div>

    <div id="result" role="region" aria-live="polite">
      <div class="result-grid">
        <div class="result-item">
          <div class="result-key" data-i18n="resPitch">Pitch (X:12)</div>
          <div class="result-val" id="resPitch">—</div>
        </div>
        <div class="result-item">
          <div class="result-key" data-i18n="resAngle">Angle</div>
          <div class="result-val" id="resAngle">—</div>
        </div>
        <div class="result-item">
          <div class="result-key" data-i18n="resSlope">Slope</div>
          <div class="result-val" id="resSlope">—</div>
        </div>
        <div class="result-item">
          <div class="result-key" data-i18n="resRafter">Rafter length</div>
          <div class="result-val" id="resRafter">—</div>
        </div>
        <div class="result-item">
          <div class="result-key" data-i18n="resCoeff">Slope coefficient</div>
          <div class="result-val" id="resCoeff">—</div>
        </div>
        <div class="result-item">
          <div class="result-key" data-i18n="resWalk">Walkability</div>
          <div class="result-val" id="resWalk">—</div>
        </div>
      </div>

      <div class="share-row">
        <button class="share-btn" type="button" onclick="copyShareLink()" data-i18n="shareBtn">Copy shareable link</button>
        <span class="share-copied" id="shareCopied" data-i18n="shareCopied">Copied!</span>
      </div>
    </div>
  </section>

  <section>
    <h2 data-i18n="whatIsTitle">What is roof pitch?</h2>
    <p data-i18n="whatIsText">Roof pitch describes how steep a roof is. It is usually expressed as a ratio, such as 6:12, which means the roof rises 6 inches for every 12 inches of horizontal run. Pitch can also be expressed in degrees or as a percentage slope. Roof pitch determines which roofing materials are code-compliant, how much surface area you need to cover, and how safely workers can move on the roof.</p>
  </section>

  <section>
    <h2 data-i18n="commonTitle">Common roof pitches reference</h2>
    <table>
      <thead>
        <tr><th data-i18n="thPitch">Pitch (X:12)</th><th data-i18n="thDeg">Degrees</th><th data-i18n="thSlope">Slope %</th><th data-i18n="thCoeff">Coefficient</th><th data-i18n="thWalk">Walkability</th></tr>
      </thead>
      <tbody>
        <tr><td>2:12</td><td>9.5°</td><td>16.7%</td><td>1.014</td><td data-i18n="walkEasy">Easy</td></tr>
        <tr><td>3:12</td><td>14.0°</td><td>25.0%</td><td>1.031</td><td data-i18n="walkEasy">Easy</td></tr>
        <tr><td>4:12</td><td>18.4°</td><td>33.3%</td><td>1.054</td><td data-i18n="walkEasy">Easy</td></tr>
        <tr><td>5:12</td><td>22.6°</td><td>41.7%</td><td>1.083</td><td data-i18n="walkMod">Moderate</td></tr>
        <tr><td>6:12</td><td>26.6°</td><td>50.0%</td><td>1.118</td><td data-i18n="walkMod">Moderate</td></tr>
        <tr><td>7:12</td><td>30.3°</td><td>58.3%</td><td>1.158</td><td data-i18n="walkCare">With care</td></tr>
        <tr><td>8:12</td><td>33.7°</td><td>66.7%</td><td>1.202</td><td data-i18n="walkSteep">Steep</td></tr>
        <tr><td>9:12</td><td>36.9°</td><td>75.0%</td><td>1.250</td><td data-i18n="walkSteep">Steep</td></tr>
        <tr><td>10:12</td><td>39.8°</td><td>83.3%</td><td>1.302</td><td data-i18n="walkSteep">Steep</td></tr>
        <tr><td>12:12</td><td>45.0°</td><td>100.0%</td><td>1.414</td><td data-i18n="walkSteep">Steep</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2 data-i18n="formulaTitle">Formulas used</h2>
    <ul>
      <li data-i18n="formula1"><strong>Pitch ratio (X:12):</strong> (Rise ÷ Run) × 12</li>
      <li data-i18n="formula2"><strong>Angle (degrees):</strong> arctan(Rise ÷ Run) × (180 ÷ π)</li>
      <li data-i18n="formula3"><strong>Slope percentage:</strong> (Rise ÷ Run) × 100</li>
      <li data-i18n="formula4"><strong>Rafter length:</strong> √(Rise² + Run²)</li>
      <li data-i18n="formula5"><strong>Slope coefficient:</strong> √(1 + (Rise ÷ Run)²)</li>
    </ul>
  </section>

  <section>
    <h2 data-i18n="howToTitle">How to use this calculator</h2>
    <ol>
      <li data-i18n="howTo1">Choose your input mode: Rise & Run, Angle, or Pitch Ratio (X:12).</li>
      <li data-i18n="howTo2">Enter your measurements. If using Rise & Run, select your unit (ft, in, m, cm).</li>
      <li data-i18n="howTo3">The results update instantly as you type — no submit button needed.</li>
      <li data-i18n="howTo4">Click "Copy shareable link" to share your calculation with a colleague or contractor.</li>
    </ol>
  </section>

  <section>
    <h2 data-i18n="faqTitle">Frequently asked questions</h2>
    <h3 data-i18n="faq1q">What is a walkable roof pitch?</h3>
    <p data-i18n="faq1a">A roof pitch of 6:12 or less is generally considered walkable for most people. Above 7:12, roof jacks or fall protection are typically required. Above 9:12, most crews consider the roof non-walkable without special equipment.</p>

    <h3 data-i18n="faq2q">What is the minimum roof pitch for asphalt shingles?</h3>
    <p data-i18n="faq2a">Asphalt shingles require a minimum pitch of 2:12 with double underlayment. Below 2:12, you need a different roofing system such as EPDM, TPO, or modified bitumen.</p>

    <h3 data-i18n="faq3q">How do I measure roof pitch from the attic?</h3>
    <p data-i18n="faq3a">Hold a level horizontally against the underside of a rafter. Mark 12 inches along the level from where it touches the rafter. Measure vertically from that 12-inch mark up to the rafter. That vertical measurement in inches is your rise over 12 inches of run.</p>

    <h3 data-i18n="faq4q">What is the slope coefficient and why does it matter?</h3>
    <p data-i18n="faq4a">The slope coefficient converts horizontal footprint area to actual sloped roof surface area. For example, a 6:12 pitch has a coefficient of 1.118, meaning a 2,000 sq ft footprint has 2,236 sq ft of actual roof surface. This is the number you need for accurate material ordering.</p>

    <h3 data-i18n="faq5q">What is the most common residential roof pitch?</h3>
    <p data-i18n="faq5a">The most common US residential pitch is 6:12 (26.6°), which balances drainage, material cost, and walkability. In snowy regions, 8:12 to 10:12 is more common. In the UK and Europe, pitches are often expressed in degrees rather than X:12 ratios.</p>

    <div class="disclaimer" data-i18n="disclaimer"><strong>Disclaimer:</strong> This calculator provides estimates for planning purposes. Always verify measurements on site and consult local building codes before starting any roofing project.</div>
  </section>
</main>

<footer class="footer" data-i18n="footer">Runs entirely in your browser. No data is collected or stored.</footer>

<script src="js/i18n.js"><\/script>
<script src="js/calculator.js"><\/script>
</body>
</html>`;
}

// ============================================================
// CSS — 工地风（深蓝灰 + 琥珀色）
// ============================================================
const STYLE_CSS = `:root {
  --bg: #f1f5f9; --card: #ffffff; --text: #0f172a; --muted: #64748b;
  --accent: #f59e0b; --accent-dark: #d97706; --navy: #1e293b; --blue: #3b82f6;
  --border: #e2e8f0; --radius: 14px;
  --shadow: 0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.06);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.65; -webkit-font-smoothing: antialiased; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  color: #fff;
  padding: 64px 20px 96px;
  background:
    radial-gradient(circle at 20% 20%, rgba(245,158,11,0.30) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(59,130,246,0.25) 0%, transparent 55%),
    linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%);
}
.hero::before {
  content: "";
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);
  pointer-events: none;
}
.hero-inner { max-width: 720px; margin: 0 auto; position: relative; z-index: 2; text-align: center; }
.hero-badge {
  display: inline-block;
  background: rgba(245,158,11,0.18);
  border: 1px solid rgba(245,158,11,0.45);
  color: #fcd34d;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 18px;
}
.hero h1 { font-size: 2.1rem; margin: 0 0 12px; font-weight: 800; letter-spacing: -0.02em; }
.hero p { margin: 0 auto; opacity: 0.9; font-size: 1rem; max-width: 560px; }

/* ---------- Lang switcher ---------- */
.lang-switch { position: absolute; top: 16px; right: 16px; z-index: 3; }
.lang-switch select {
  appearance: none; -webkit-appearance: none;
  background-color: rgba(255,255,255,0.12);
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 10px center; background-size: 14px;
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff; padding: 7px 32px 7px 12px; border-radius: 8px;
  font-size: 0.85rem; font-family: inherit; cursor: pointer;
}
.lang-switch select:hover { background-color: rgba(255,255,255,0.25); }
.lang-switch select option { color: #0f172a; background: #fff; }

/* ---------- Layout ---------- */
.wrap { max-width: 720px; margin: -56px auto 0; padding: 0 20px 64px; position: relative; z-index: 2; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; margin-bottom: 22px; box-shadow: var(--shadow); }

label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; }
input, select { width: 100%; padding: 11px 13px; border: 1px solid #cbd5e1; border-radius: 9px; font-size: 1rem; margin-bottom: 18px; background: #fff; color: var(--text); transition: border-color 0.15s, box-shadow 0.15s; font-family: inherit; }
input:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(245,158,11,0.15); }
.row { display: flex; gap: 14px; }
.row > div { flex: 1; }
button.calc { width: 100%; padding: 15px; background: var(--navy); color: #fff; border: none; border-radius: 9px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.1s; font-family: inherit; }
button.calc:hover { background: #0f172a; }
button.calc:active { transform: scale(0.99); }

/* ---------- Mode tabs ---------- */
.mode-tabs { display: flex; gap: 8px; margin-bottom: 20px; background: #f1f5f9; padding: 4px; border-radius: 10px; }
.mode-tab { flex: 1; padding: 10px 8px; border: none; background: transparent; color: var(--muted); border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.mode-tab.active { background: #fff; color: var(--text); box-shadow: 0 1px 3px rgba(15,23,42,0.08); }
.mode-tab:hover:not(.active) { color: var(--text); }

/* ---------- Unit toggle ---------- */
.unit-toggle { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
.unit-toggle label { margin: 0; font-size: 0.8rem; color: var(--muted); }
.unit-btn { padding: 6px 14px; border: 1px solid var(--border); background: #fff; color: var(--muted); border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.unit-btn.active { background: var(--navy); color: #fff; border-color: var(--navy); }
.unit-btn:hover:not(.active) { border-color: var(--navy); color: var(--navy); }

/* ---------- Hint ---------- */
.hint { font-size: 0.8rem; color: var(--muted); margin: -12px 0 18px; }

/* ---------- SVG ---------- */
.svg-wrap { margin: 0 0 20px; background: #f8fafc; border: 1px solid var(--border); border-radius: 12px; padding: 12px; }
.svg-wrap svg { width: 100%; height: auto; display: block; }

/* ---------- Result ---------- */
#result { display: none; animation: fadeIn 0.35s ease; }
#result.show { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.result-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
.result-item { background: #f8fafc; border: 1px solid var(--border); border-radius: 10px; padding: 14px 12px; text-align: center; }
.result-key { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); font-weight: 600; margin-bottom: 6px; }
.result-val { font-size: 1.15rem; font-weight: 700; color: var(--navy); letter-spacing: -0.01em; }

.share-row { display: flex; align-items: center; gap: 12px; }
.share-btn { padding: 9px 16px; background: #fff; border: 1px solid var(--accent); color: var(--accent-dark); border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s; }
.share-btn:hover { background: #fffbeb; }
.share-copied { font-size: 0.85rem; color: #059669; font-weight: 600; opacity: 0; transition: opacity 0.25s; }
.share-copied.show { opacity: 1; }

/* ---------- Content ---------- */
h2 { font-size: 1.25rem; margin: 36px 0 12px; letter-spacing: -0.01em; }
h3 { font-size: 1rem; margin: 22px 0 6px; }
p { margin: 0 0 14px; }
ul, ol { margin: 0 0 16px; padding-left: 22px; }
li { margin-bottom: 8px; line-height: 1.65; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin: 14px 0; }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); }
th { background: #f8fafc; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
tr:last-child td { border-bottom: none; }
.disclaimer { font-size: 0.85rem; color: var(--muted); border-left: 3px solid var(--accent); padding: 4px 0 4px 14px; margin-top: 18px; }
.footer { text-align: center; font-size: 0.8rem; color: var(--muted); padding: 24px 20px 48px; }

@media (max-width: 560px) {
  .hero { padding: 48px 16px 80px; }
  .hero h1 { font-size: 1.5rem; }
  .lang-switch { position: static; display: flex; justify-content: center; margin-bottom: 16px; }
  .wrap { padding: 0 14px 48px; }
  .card { padding: 20px; }
  .row { flex-direction: column; gap: 0; }
  .mode-tabs { flex-direction: column; }
  .result-grid { grid-template-columns: repeat(2, 1fr); }
  .result-val { font-size: 1rem; }
}`;

// ============================================================
// i18n.js
// ============================================================
const I18N_JS = `const SUPPORTED_LANGS = ['en','zh'];
const DEFAULT_LANG = 'en';
const MARKER = '/roof-pitch-calculator';

const LANG_TO_PATH = { 'en':'/', 'zh':'/zh/' };
const SEG_TO_LANG = { 'zh':'zh' };

let currentLang = DEFAULT_LANG;
let translations = {};
const cache = {};

function getBase() {
  const p = window.location.pathname;
  const idx = p.indexOf(MARKER);
  if (idx !== -1) return p.slice(0, idx + MARKER.length);
  return '';
}

function detectPageLang() {
  if (window.__FORCE_LANG__ && SUPPORTED_LANGS.includes(window.__FORCE_LANG__)) return window.__FORCE_LANG__;
  const p = window.location.pathname;
  const base = getBase();
  const rest = base ? p.slice(base.length) : p;
  const segs = rest.split('/').filter(Boolean);
  if (segs.length > 0) {
    const first = segs[0].toLowerCase();
    if (SEG_TO_LANG[first]) return SEG_TO_LANG[first];
  }
  return DEFAULT_LANG;
}

async function loadLocale(lang) {
  if (cache[lang]) return cache[lang];
  const base = getBase();
  const res = await fetch(base + '/locales/' + lang + '.json');
  if (!res.ok) throw new Error('Failed to load locale: ' + lang);
  const data = await res.json();
  cache[lang] = data;
  return data;
}

function applyTranslations(t) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] === undefined) return;
    if (key === 'disclaimer') el.innerHTML = t[key];
    else el.textContent = t[key];
  });
}

async function initPage() {
  const lang = detectPageLang();
  try { translations = await loadLocale(lang); }
  catch (err) { console.error(err); return; }
  currentLang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang;
  applyTranslations(translations);
  const select = document.getElementById('langSelect');
  if (select) select.value = lang;
  window.__i18n = { t: translations, lang: currentLang };
  if (typeof readUrlParams === 'function') readUrlParams();
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  const base = getBase();
  window.location.href = base + (LANG_TO_PATH[lang] || '/');
}

document.addEventListener('DOMContentLoaded', initPage);`;

// ============================================================
// calculator.js
// ============================================================
const CALCULATOR_JS = `let currentMode = 'riseRun';
let currentUnit = 'ft';

function t() { return (window.__i18n && window.__i18n.t) || {}; }

function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  document.querySelectorAll('.mode-panel').forEach(p => p.style.display = 'none');
  document.getElementById('mode-' + mode).style.display = 'block';
  calculate();
}

function setUnit(unit) {
  currentUnit = unit;
  document.querySelectorAll('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.unit === unit));
  calculate();
}

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('mode')) {
    const m = params.get('mode');
    if (['riseRun','angle','ratio'].includes(m)) switchMode(m);
  }
  if (params.has('rise')) document.getElementById('rise').value = params.get('rise');
  if (params.has('run')) document.getElementById('run').value = params.get('run');
  if (params.has('angle')) document.getElementById('angle').value = params.get('angle');
  if (params.has('ratio')) document.getElementById('ratioX').value = params.get('ratio');
  if (params.has('unit')) setUnit(params.get('unit'));
  calculate();
}

function buildShareUrl() {
  const params = new URLSearchParams();
  params.set('mode', currentMode);
  if (currentMode === 'riseRun') {
    params.set('rise', document.getElementById('rise').value);
    params.set('run', document.getElementById('run').value);
    params.set('unit', currentUnit);
  } else if (currentMode === 'angle') {
    params.set('angle', document.getElementById('angle').value);
  } else {
    params.set('ratio', document.getElementById('ratioX').value);
  }
  const base = window.location.origin + window.location.pathname;
  return base + '?' + params.toString();
}

function copyShareLink() {
  const url = buildShareUrl();
  navigator.clipboard.writeText(url).then(() => {
    const el = document.getElementById('shareCopied');
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1800);
  }).catch(() => { prompt('Copy this link:', url); });
}

function calculate() {
  const tr = t();
  let rise, run;

  if (currentMode === 'riseRun') {
    rise = parseFloat(document.getElementById('rise').value) || 0;
    run = parseFloat(document.getElementById('run').value) || 1;
  } else if (currentMode === 'angle') {
    const angle = parseFloat(document.getElementById('angle').value) || 0;
    if (angle <= 0 || angle >= 90) { clearResult(); return; }
    const rad = angle * Math.PI / 180;
    run = 12;
    rise = Math.tan(rad) * run;
  } else {
    const x = parseFloat(document.getElementById('ratioX').value) || 0;
    rise = x;
    run = 12;
  }

  if (rise <= 0 || run <= 0) { clearResult(); return; }

  const ratio = (rise / run) * 12;
  const angleDeg = Math.atan(rise / run) * (180 / Math.PI);
  const slopePct = (rise / run) * 100;
  const rafter = Math.sqrt(rise * rise + run * run);
  const coeff = Math.sqrt(1 + Math.pow(rise / run, 2));

  // walkability
  let walk = tr.walkEasy || 'Easy';
  if (ratio > 6 && ratio <= 7) walk = tr.walkMod || 'Moderate';
  else if (ratio > 7 && ratio <= 8) walk = tr.walkCare || 'With care';
  else if (ratio > 8) walk = tr.walkSteep || 'Steep';

  // update SVG
  const svgRise = document.getElementById('riseLine');
  const svgRun = document.getElementById('runLine');
  const svgRoof = document.getElementById('roofLine');
  const svgTri = document.getElementById('roofTri');
  const svgAngleArc = document.getElementById('angleArc');

  const maxH = 100;
  const pxPerUnit = Math.min(maxH / rise, 250 / run);
  const w = run * pxPerUnit;
  const h = rise * pxPerUnit;
  const baseX = 40, baseY = 180;

  svgRun.setAttribute('x2', baseX + w);
  svgRun.setAttribute('y2', baseY);
  svgRise.setAttribute('x1', baseX + w);
  svgRise.setAttribute('y1', baseY);
  svgRise.setAttribute('x2', baseX + w);
  svgRise.setAttribute('y2', baseY - h);
  svgRoof.setAttribute('x2', baseX + w);
  svgRoof.setAttribute('y2', baseY - h);
  svgTri.setAttribute('points', \`\${baseX},\${baseY} \${baseX + w},\${baseY} \${baseX + w},\${baseY - h}\`);

  // angle arc
  const arcR = Math.min(w * 0.25, 40);
  const endX = baseX + arcR * Math.cos(angleDeg * Math.PI / 180);
  const endY = baseY - arcR * Math.sin(angleDeg * Math.PI / 180);
  svgAngleArc.setAttribute('d', \`M \${baseX + arcR} \${baseY} A \${arcR} \${arcR} 0 0 0 \${endX} \${endY}\`);

  document.getElementById('resPitch').textContent = ratio.toFixed(1) + ':12';
  document.getElementById('resAngle').textContent = angleDeg.toFixed(2) + '°';
  document.getElementById('resSlope').textContent = slopePct.toFixed(1) + '%';
  document.getElementById('resRafter').textContent = rafter.toFixed(2) + ' ' + (currentMode === 'riseRun' ? currentUnit : 'in');
  document.getElementById('resCoeff').textContent = coeff.toFixed(3);
  document.getElementById('resWalk').textContent = walk;

  document.getElementById('result').classList.add('show');
}

function clearResult() {
  document.getElementById('result').classList.remove('show');
}

function init() {
  ['rise','run','angle','ratioX'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculate);
  });
  calculate();
}

window.switchMode = switchMode;
window.setUnit = setUnit;
window.copyShareLink = copyShareLink;
window.readUrlParams = readUrlParams;
document.addEventListener('DOMContentLoaded', init);`;

// ============================================================
// Locales
// ============================================================
const LOCALES = {
  'en': {
    title: "Roof Pitch Calculator",
    subtitle: "Convert rise and run to degrees, X:12 ratio, slope percentage, and rafter length — instantly.",
    calcHeading: "Calculator",
    modeRiseRun: "Rise & Run", modeAngle: "Angle (°)", modeRatio: "Pitch Ratio (X:12)",
    riseLabel: "Rise", runLabel: "Run", unitLabel: "Unit:",
    angleLabel: "Roof angle (degrees)",
    ratioLabel: "Pitch ratio (X in 12)",
    ratioHint: "Enter the rise in inches over 12 inches of run. For example, 6 for a 6:12 pitch.",
    calcBtn: "Calculate roof pitch",
    resPitch: "Pitch (X:12)", resAngle: "Angle", resSlope: "Slope",
    resRafter: "Rafter length", resCoeff: "Slope coefficient", resWalk: "Walkability",
    walkEasy: "Easy", walkMod: "Moderate", walkCare: "With care", walkSteep: "Steep",
    shareBtn: "Copy shareable link", shareCopied: "Copied!",
    whatIsTitle: "What is roof pitch?",
    whatIsText: "Roof pitch describes how steep a roof is. It is usually expressed as a ratio, such as 6:12, which means the roof rises 6 inches for every 12 inches of horizontal run. Pitch can also be expressed in degrees or as a percentage slope. Roof pitch determines which roofing materials are code-compliant, how much surface area you need to cover, and how safely workers can move on the roof.",
    commonTitle: "Common roof pitches reference",
    thPitch: "Pitch (X:12)", thDeg: "Degrees", thSlope: "Slope %", thCoeff: "Coefficient", thWalk: "Walkability",
    formulaTitle: "Formulas used",
    formula1: "Pitch ratio (X:12): (Rise ÷ Run) × 12",
    formula2: "Angle (degrees): arctan(Rise ÷ Run) × (180 ÷ π)",
    formula3: "Slope percentage: (Rise ÷ Run) × 100",
    formula4: "Rafter length: √(Rise² + Run²)",
    formula5: "Slope coefficient: √(1 + (Rise ÷ Run)²)",
    howToTitle: "How to use this calculator",
    howTo1: "Choose your input mode: Rise & Run, Angle, or Pitch Ratio (X:12).",
    howTo2: "Enter your measurements. If using Rise & Run, select your unit (ft, in, m, cm).",
    howTo3: "The results update instantly as you type — no submit button needed.",
    howTo4: "Click \"Copy shareable link\" to share your calculation with a colleague or contractor.",
    faqTitle: "Frequently asked questions",
    faq1q: "What is a walkable roof pitch?",
    faq1a: "A roof pitch of 6:12 or less is generally considered walkable for most people. Above 7:12, roof jacks or fall protection are typically required. Above 9:12, most crews consider the roof non-walkable without special equipment.",
    faq2q: "What is the minimum roof pitch for asphalt shingles?",
    faq2a: "Asphalt shingles require a minimum pitch of 2:12 with double underlayment. Below 2:12, you need a different roofing system such as EPDM, TPO, or modified bitumen.",
    faq3q: "How do I measure roof pitch from the attic?",
    faq3a: "Hold a level horizontally against the underside of a rafter. Mark 12 inches along the level from where it touches the rafter. Measure vertically from that 12-inch mark up to the rafter. That vertical measurement in inches is your rise over 12 inches of run.",
    faq4q: "What is the slope coefficient and why does it matter?",
    faq4a: "The slope coefficient converts horizontal footprint area to actual sloped roof surface area. For example, a 6:12 pitch has a coefficient of 1.118, meaning a 2,000 sq ft footprint has 2,236 sq ft of actual roof surface. This is the number you need for accurate material ordering.",
    faq5q: "What is the most common residential roof pitch?",
    faq5a: "The most common US residential pitch is 6:12 (26.6°), which balances drainage, material cost, and walkability. In snowy regions, 8:12 to 10:12 is more common. In the UK and Europe, pitches are often expressed in degrees rather than X:12 ratios.",
    disclaimer: "<strong>Disclaimer:</strong> This calculator provides estimates for planning purposes. Always verify measurements on site and consult local building codes before starting any roofing project.",
    footer: "Runs entirely in your browser. No data is collected or stored."
  },
  'zh': {
    title: "屋顶坡度计算器",
    subtitle: "即时将坡度和水平距离转换为角度、X:12 比例、坡度百分比和椽长。",
    calcHeading: "计算器",
    modeRiseRun: "高度 & 水平距离", modeAngle: "角度（°）", modeRatio: "坡度比（X:12）",
    riseLabel: "高度", runLabel: "水平距离", unitLabel: "单位：",
    angleLabel: "屋顶角度（度）",
    ratioLabel: "坡度比（12 英寸水平距离对应的高度）",
    ratioHint: "输入 12 英寸水平距离对应的高度（英寸）。例如，6:12 坡度输入 6。",
    calcBtn: "计算屋顶坡度",
    resPitch: "坡度（X:12）", resAngle: "角度", resSlope: "坡度",
    resRafter: "椽长", resCoeff: "坡度系数", resWalk: "可步行性",
    walkEasy: "容易", walkMod: "中等", walkCare: "小心行走", walkSteep: "陡峭",
    shareBtn: "复制分享链接", shareCopied: "已复制！",
    whatIsTitle: "什么是屋顶坡度？",
    whatIsText: "屋顶坡度描述屋顶的陡峭程度，通常以比例表示，如 6:12，意为水平距离每 12 英寸，屋顶上升 6 英寸。坡度也可以用角度或百分比表示。屋顶坡度决定了哪些材料符合建筑规范、需要覆盖多少表面积，以及工人在屋顶上移动的安全程度。",
    commonTitle: "常见屋顶坡度参考",
    thPitch: "坡度（X:12）", thDeg: "角度", thSlope: "坡度 %", thCoeff: "系数", thWalk: "可步行性",
    formulaTitle: "使用的公式",
    formula1: "坡度比（X:12）：（高度 ÷ 水平距离）× 12",
    formula2: "角度（度）：arctan（高度 ÷ 水平距离）×（180 ÷ π）",
    formula3: "坡度百分比：（高度 ÷ 水平距离）× 100",
    formula4: "椽长：√（高度² + 水平距离²）",
    formula5: "坡度系数：√（1 + （高度 ÷ 水平距离）²）",
    howToTitle: "如何使用本计算器",
    howTo1: "选择输入模式：高度 & 水平距离、角度或坡度比（X:12）。",
    howTo2: "输入测量值。如果使用高度 & 水平距离模式，请选择单位（英尺、英寸、米、厘米）。",
    howTo3: "结果会随着输入即时更新——无需点击提交按钮。",
    howTo4: "点击“复制分享链接”，将计算分享给同事或承包商。",
    faqTitle: "常见问题",
    faq1q: "什么屋顶坡度可以行走？",
    faq1a: "6:12 或更缓的屋顶坡度通常可以安全行走。超过 7:12 通常需要屋顶挂钩或防坠落设备。超过 9:12，大多数施工队认为没有特殊设备无法在屋顶上行走。",
    faq2q: "沥青瓦的最低屋顶坡度是多少？",
    faq2a: "沥青瓦需要最低 2:12 的坡度，并铺设双层防水层。低于 2:12 时，需要使用其他屋顶系统，如 EPDM、TPO 或改性沥青。",
    faq3q: "如何从阁楼测量屋顶坡度？",
    faq3a: "将水平尺水平放置在椽子的下侧。从水平尺与椽子接触点开始，沿水平尺量出 12 英寸。从该 12 英寸标记处垂直向上测量到椽子。该垂直测量值（英寸）就是 12 英寸水平距离对应的高度。",
    faq4q: "什么是坡度系数，为什么重要？",
    faq4a: "坡度系数将水平投影面积转换为实际倾斜屋顶表面积。例如，6:12 坡度的系数为 1.118，意味着 2,000 平方英尺的水平投影面积对应 2,236 平方英尺的实际屋顶面积。这是精确订购材料所需的关键数字。",
    faq5q: "最常见的住宅屋顶坡度是多少？",
    faq5a: "美国最常见的住宅坡度是 6:12（26.6°），在排水、材料成本和可步行性之间取得了平衡。在多雪地区，8:12 至 10:12 更常见。在英国和欧洲，坡度通常以角度而非 X:12 比例表示。",
    disclaimer: "<strong>免责声明：</strong>本计算器仅供规划参考。开始任何屋顶工程前，请务必在现场核实测量值，并查阅当地建筑规范。",
    footer: "完全在您的浏览器中运行。不收集、不存储任何数据。"
  }
};

// ============================================================
// 生成文件
// ============================================================
const files = {};

files['index.html'] = buildIndexHtml(null, 'en', '/roof-pitch-calculator/');
files['zh/index.html'] = buildIndexHtml('zh', 'zh-Hans', '/roof-pitch-calculator/zh/');

files['css/style.css'] = STYLE_CSS;
files['js/i18n.js'] = I18N_JS;
files['js/calculator.js'] = CALCULATOR_JS;

for (const [lang, data] of Object.entries(LOCALES)) {
  files[`locales/${lang}.json`] = JSON.stringify(data, null, 2);
}

files['.gitignore'] = `node_modules/
.wrangler/
.dev.vars
.DS_Store
*.log
.vscode/
.idea/
dist/
build/
`;

// ============================================================
// 写入
// ============================================================
const root = '.';
let count = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(root, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created: ' + filePath);
  count++;
}
console.log(`\nDone. ${count} files generated.`);
console.log('\nNext steps:');
console.log('  1. git init && git add . && git commit -m "Initial: roof pitch calculator"');
console.log('  2. Push to a new GitHub repo "roof-pitch-calculator"');
console.log('  3. Deploy as a new Cloudflare Worker');
console.log('  4. In tool-proxy/src/index.js PROXY_MAP, add:');
console.log('     \'/roof-pitch-calculator\': \'https://roof-pitch-calculator.lvyafei2026.workers.dev\'');
console.log('  5. In tool-proxy/wrangler.toml run_worker_first, add:');
console.log('     "/roof-pitch-calculator/*"');
console.log('  6. In Cloudflare tool-proxy Domains & Routes, add:');
console.log('     toolara.dev/roof-pitch-calculator/*');
console.log('     www.toolara.dev/roof-pitch-calculator/*');
console.log('  7. Update tool-proxy/public/sitemap.xml and index.html');