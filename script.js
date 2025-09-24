/* =========================
   T4J Retirement Calculator (inputs-only)
   - Live projection on input (debounced)
   - Right-side results panel with two CTAs
   - Updated logo path fallback + favicon
   ========================= */

/* Elements */
const resultLine = document.getElementById('resultLine');
const resultBig  = document.getElementById('resultBig');
const inputs = {
  currentAge: document.getElementById('currentAge'),
  retirementAge: document.getElementById('retirementAge'),
  currentBalance: document.getElementById('currentBalance'),
  monthlyContribution: document.getElementById('monthlyContribution'),
  annualReturn: document.getElementById('annualReturn')
};

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  setupInputListeners();
  generateFavicon();
});

/* Smooth scroll */
function scrollToCalculator(){
  document.getElementById('calculator').scrollIntoView({behavior:'smooth', block:'center'});
}

/* Keyboard help */
function toggleKeyboardHelp(){
  const el = document.getElementById('keyboardHelp');
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  if (!open) document.addEventListener('keydown', closeHelpOnEscape);
}
function closeHelpOnEscape(e){ if (e.key === 'Escape') toggleKeyboardHelp(); }

/* Favicon + logo fallback (uses new path) */
function generateFavicon(){
  const canvas = document.createElement('canvas');
  canvas.width = 32; canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const img = new Image(); img.crossOrigin = 'anonymous';
  img.onload = () => {
    ctx.drawImage(img,0,0,32,32);
    setFavicon(canvas.toDataURL('image/png'));
  };
  img.onerror = () => { drawFallbackFavicon(ctx); setFavicon(canvas.toDataURL('image/png')); };
    img.src = 'assets/logo/PNG-01.png';
}
function setFavicon(dataURL){
  let link = document.querySelector('link[rel="icon"]');
  if (!link){ link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
  link.href = dataURL;
}
function drawFallbackFavicon(ctx){
  ctx.fillStyle = '#7c3aed'; ctx.beginPath(); ctx.arc(16,16,15,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillText('T4J',16,20);
}
/* Called from <img onerror> to replace broken logo with SVG */
function fallbackLogo(imgEl){
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 120 40'); svg.setAttribute('class','logo');
  svg.innerHTML = `
    <defs><linearGradient id="g" x1="0" x2="1">
      <stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#a78bfa"/></linearGradient></defs>
    <rect x="0" y="0" width="120" height="40" rx="8" fill="#111117" stroke="#232333"/>
    <text x="60" y="26" text-anchor="middle" font-size="20" font-weight="800" fill="url(#g)">T4J</text>
  `;
  imgEl.replaceWith(svg);
}

/* Debounce */
function debounce(fn, wait=300){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); };
}

/* Listen & compute */
function setupInputListeners(){
  const handler = debounce(calculateRetirement, 250);
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', handler);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') calculateRetirement(); });
  });
}

/* Validation */
function haveRequired(){
  const ca = parseFloat(inputs.currentAge.value);
  const ra = parseFloat(inputs.retirementAge.value);
  if (isNaN(ca) || isNaN(ra)) return false;
  if (ra <= ca) { setResult('Error: retirement age must exceed current age'); return false; }
  return true;
}

/* Calculate projection (monthly compounding) */
function calculateRetirement(){
  if (!haveRequired()){ if (!inputs.currentAge.value) setResult('$0'); return; }

  const currentAge        = parseFloat(inputs.currentAge.value);
  const retirementAge     = parseFloat(inputs.retirementAge.value);
  const currentBalance    = parseFloat(inputs.currentBalance.value || '0');
  const monthlyContribution = parseFloat(inputs.monthlyContribution.value || '0');
  const annualReturnPct   = parseFloat(inputs.annualReturn.value || '0') / 100;

  const months = Math.max(0, Math.round((retirementAge - currentAge) * 12));
  const monthlyRate = Math.pow(1 + annualReturnPct, 1/12) - 1;

  let balance = isFinite(currentBalance) ? currentBalance : 0;
  for (let m=0; m<months; m++){
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    if (!isFinite(balance) || balance > 1e15){ setResult('Error'); return; }
  }
  const formatted = formatCurrency(balance);
  setResult(formatted);
}

/* UI helpers */
function setResult(text){
  resultLine.textContent = text;
  if (resultBig) resultBig.textContent = text;   // keep right panel in sync
}
function formatCurrency(amount){
  return new Intl.NumberFormat('en-US',{style:'currency', currency:'USD', maximumFractionDigits:0}).format(amount);
}

