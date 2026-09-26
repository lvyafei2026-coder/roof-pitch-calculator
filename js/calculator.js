let currentMode = 'riseRun';
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
  svgTri.setAttribute('points', `${baseX},${baseY} ${baseX + w},${baseY} ${baseX + w},${baseY - h}`);

  // angle arc
  const arcR = Math.min(w * 0.25, 40);
  const endX = baseX + arcR * Math.cos(angleDeg * Math.PI / 180);
  const endY = baseY - arcR * Math.sin(angleDeg * Math.PI / 180);
  svgAngleArc.setAttribute('d', `M ${baseX + arcR} ${baseY} A ${arcR} ${arcR} 0 0 0 ${endX} ${endY}`);

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
document.addEventListener('DOMContentLoaded', init);