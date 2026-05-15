// ===== Ring/Yeti Category Definitions =====
const YETI_CODES = {
  SMT01: { name: "CPU / SoC", groups: ["SoC"] },
  SMT02: { name: "Connectivity - Wi-Fi / BLE", groups: ["Wi-Fi", "BLE", "RF"] },
  SMT03: { name: "Memory - Flash", groups: ["Memory - Flash", "Memory - DRAM"] },
  SMT05: { name: "Actives", groups: ["IC", "Power IC", "Transistor", "MOSFET", "Diode", "Fuses"] },
  SMT10: { name: "Passives (LCR)", groups: ["Inductors", "Capacitors", "Resistors", "Crystal", "Transformers"] },
  SMT15: { name: "Sensors", groups: ["ALS", "PIR", "Radar", "Sensor"] },
  SMT20: { name: "Audio", groups: ["Microphone", "AMP"] },
  SMT25: { name: "LED", groups: ["IR LED", "LED"] },
  SMT27: { name: "Connectors", groups: ["Connectors"] },
  SMT30: { name: "PCB", groups: ["PCB"] },
  SMT35: { name: "Elech-Mech", groups: ["Shielding", "Gasket", "EMI Enclosure", "Motor", "Switches and Buttons", "EM Misc"] },
  SMT46: { name: "FPC/FPCA", groups: ["FPC/FPCA"] },
  SMT50: { name: "Antenna", groups: ["Antenna"] },
  SMT55: { name: "Optics", groups: ["Lens + ICR", "Image Sensor", "Fresnel Lens", "Camera Module"] },
  FATP01: { name: "Elech-Mech (Speaker/Cable)", groups: ["PD-ME Speaker", "Internal Cables"] },
  FATP05: { name: "PD", groups: ["PD-ME Plastic", "PD-ME Others, Thermal/Heatsink", "PD-ME Metal", "PD-ME Die Cuts", "PD-ME Screw", "PD-ME Thermal", "PD-ME Rubber"] },
  FATP25: { name: "Accessory - Battery", groups: ["Battery"] },
  FATP27: { name: "Accessory - Other", groups: ["Accessory - Tool kit", "Accessory - Light Fixture"] },
  FATP31: { name: "Packaging - US", groups: ["Packaging (A Part)", "Packaging Misc. (C Part)", "Other Inbox"] },
  MVA01: { name: "MVA", groups: ["MVA"] },
};

// Flat list of all valid group categories
const ALL_GROUPS = [];
Object.values(YETI_CODES).forEach(v => v.groups.forEach(g => { if (!ALL_GROUPS.includes(g)) ALL_GROUPS.push(g); }));

// ===== Classification Rules =====
function classifyItem(pn, desc, commodity, funcBlock, board) {
  const d = (desc || "").toLowerCase();
  const c = (commodity || "").toLowerCase();
  const f = (funcBlock || "").toLowerCase();
  const b = (board || "").toLowerCase();

  // Rule 5: Wi-Fi/BLE SoC chips and dedicated RF filter ICs only
  if (/cyw43|wifi|wi-fi|wlan|bluetooth|ble.*soc|802\.11/i.test(d) && /ic|soc|chip/i.test(c + " " + d)) return { code: "SMT02", group: "Wi-Fi" };
  if (/band.?pass.?filter|bpf|saw.?filter|rf.?filter/i.test(d)) return { code: "SMT02", group: "RF" };

  // SoC / CPU
  if (/\bsoc\b|ares|application.?processor|cpu/i.test(d) || /ap\.ic/i.test(f)) return { code: "SMT01", group: "SoC" };

  // Memory
  if (/flash|nor.?memory|nand|eeprom/i.test(d) || /memory/i.test(f)) return { code: "SMT03", group: "Memory - Flash" };
  if (/dram|sdram/i.test(d)) return { code: "SMT03", group: "Memory - DRAM" };

  // Rule 4: Passives — caps, resistors, inductors, beads, crystals
  if (/capacitor|ceramic cap|\bcap\b/i.test(d) || /capacitor/i.test(c)) return { code: "SMT10", group: "Capacitors" };
  if (/resistor|\bres\b|current.?sense/i.test(d) || /resistor/i.test(c)) return { code: "SMT10", group: "Resistors" };
  if (/\binductor\b|ferrite.?bead|\bbead\b|choke/i.test(d) || /bead|inductor/i.test(c)) return { code: "SMT10", group: "Inductors" };
  if (/common.?mode/i.test(d) || /filter/i.test(c) && /common/i.test(d)) return { code: "SMT10", group: "Transformers" };
  if (/crystal|oscillator|\bxtal\b|mems.?osc/i.test(d) || /oscillator/i.test(c)) return { code: "SMT10", group: "Crystal" };
  if (/ntc|thermistor/i.test(d) || /ntc/i.test(c)) return { code: "SMT15", group: "Sensor" };

  // Sensors
  if (/\bpir\b/i.test(d) || /pir/i.test(f)) return { code: "SMT15", group: "PIR" };
  if (/sensor|als|ambient.?light/i.test(d) && !/image/i.test(d)) return { code: "SMT15", group: "Sensor" };
  if (/radar/i.test(d)) return { code: "SMT15", group: "Radar" };

  // Optics
  if (/camera.?module|lens.?holder|lens.?module/i.test(d)) return { code: "SMT55", group: "Camera Module" };
  if (/image.?sensor|cmos.?sensor/i.test(d)) return { code: "SMT55", group: "Image Sensor" };
  if (/fresnel/i.test(d)) return { code: "SMT55", group: "Fresnel Lens" };
  if (/\blens\b.*icr|\bicr\b.*lens/i.test(d)) return { code: "SMT55", group: "Lens + ICR" };

  // Audio
  if (/microphone|\bmic\b|\bdmic\b/i.test(d) || /dmic|mic/i.test(c)) return { code: "SMT20", group: "Microphone" };
  if (/audio.?amp|class.?d|speaker.?amp/i.test(d) || /amp/i.test(c)) return { code: "SMT20", group: "AMP" };

  // LED
  if (/\bir.?led\b|infrared.?emitter/i.test(d) || /ir.*led/i.test(c)) return { code: "SMT25", group: "IR LED" };
  if (/\bled\b/i.test(d) && !/driver/i.test(d) || /led/i.test(c) && !/driver/i.test(c)) return { code: "SMT25", group: "LED" };

  // Actives - Power IC
  if (/ldo|regulator|buck|boost|charger|fuel.?gauge|load.?switch|dc.?dc|power.?monitor/i.test(d)) return { code: "SMT05", group: "Power IC" };
  if (/led.?driver/i.test(d)) return { code: "SMT05", group: "IC" };

  // Actives - MOSFET
  if (/mosfet|\bfet\b|n-ch|p-ch|n.channel|p.channel/i.test(d) || /mos.?fet/i.test(c)) return { code: "SMT05", group: "MOSFET" };

  // Actives - Transistor
  if (/transistor|\bbjt\b/i.test(d)) return { code: "SMT05", group: "Transistor" };

  // Actives - Diode
  if (/diode|tvs|esd|schottky|rectifier|zener/i.test(d) || /diode|esd/i.test(c)) return { code: "SMT05", group: "Diode" };

  // Actives - Fuse
  if (/\bfuse\b/i.test(d) || /fuse/i.test(c)) return { code: "SMT05", group: "Fuses" };

  // Actives - IC (generic)
  if (/\bic\b|expander|translator|controller|driver|i2c|spi/i.test(d) || /\bic\b/i.test(c)) return { code: "SMT05", group: "IC" };

  // Rule 3: Springs → Connectors
  if (/spring/i.test(d) || /spring/i.test(c)) return { code: "SMT27", group: "Connectors" };

  // Connectors
  if (/connector|usb|b2b|b2w|ffc|fpc.*conn|receptacle|plug|socket/i.test(d) || /connector/i.test(c)) return { code: "SMT27", group: "Connectors" };
  if (/shield.?can.?clip/i.test(d)) return { code: "SMT27", group: "Connectors" };

  // PCB
  if (/\bpcb\b|printed.?circuit/i.test(d) || /pcb/i.test(c)) return { code: "SMT30", group: "PCB" };

  // FPC/FPCA
  if (/\bfpc\b|\bfpca\b|flex.?print/i.test(d) || /fpc/i.test(c)) return { code: "SMT46", group: "FPC/FPCA" };

  // Antenna
  if (/antenna/i.test(d) || /antenna/i.test(c)) return { code: "SMT50", group: "Antenna" };

  // Rule 2: Shielding → FATP PD-ME Metal
  if (/shield|shielding/i.test(d)) return { code: "FATP05", group: "PD-ME Metal" };

  // SMT35 - Switches
  if (/switch|tactile|button/i.test(d) || /switch/i.test(c)) return { code: "SMT35", group: "Switches and Buttons" };
  if (/motor/i.test(d) && !/driver/i.test(d)) return { code: "SMT35", group: "Motor" };

  // Battery
  if (/\bbattery\b/i.test(d) || /battery/i.test(c)) return { code: "FATP25", group: "Battery" };

  // Speaker
  if (/speaker|\bspk\b/i.test(d) || /speaker/i.test(c)) return { code: "FATP01", group: "PD-ME Speaker" };

  // FATP05 sub-categories
  if (/screw/i.test(d) || /screw/i.test(c)) return { code: "FATP05", group: "PD-ME Screw" };
  if (/\bpsa\b|foam|sponge|mylar|mesh|die.?cut|membrane/i.test(d) || /die.?cut/i.test(c)) return { code: "FATP05", group: "PD-ME Die Cuts" };
  if (/rubber|o.?ring|oring|silicone.?seal/i.test(d) || /rubber/i.test(c)) return { code: "FATP05", group: "PD-ME Rubber" };
  if (/plastic|cover|housing|frame|plate|button|push.?pin|caddy/i.test(d) && b.includes("me")) return { code: "FATP05", group: "PD-ME Plastic" };
  if (/metal|clamp|bracket|nut/i.test(d) && !/shield/i.test(d)) return { code: "FATP05", group: "PD-ME Metal" };

  // Packaging
  if (/label|box|carton|wrap|sticker|tray|guide|packaging|package/i.test(d) || /pkg/i.test(b)) return { code: "FATP31", group: "Packaging (A Part)" };

  // Wall mount / accessory
  if (/wall.?mount|tool.?kit|corner.?kit/i.test(d)) return { code: "FATP27", group: "Accessory - Tool kit" };

  // Fallback
  if (b.includes("me") || b.includes("fatp")) return { code: "FATP05", group: "PD-ME Others, Thermal/Heatsink" };

  return { code: "SMT05", group: "IC" }; // default fallback
}

// ===== State =====
let rawData = [];
let headers = [];
let categorizedData = [];
let columnMap = {};

// ===== File Upload =====
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('dragover'); handleFile(e.dataTransfer.files[0]); });
fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const wb = XLSX.read(e.target.result, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (json.length < 2) { showToast('File appears empty'); return; }
    headers = json[0].map(h => String(h || '').trim());
    rawData = json.slice(1).filter(r => r.some(c => c != null && c !== ''));
    showMapping();
  };
  reader.readAsArrayBuffer(file);
}

function showMapping() {
  setStep(2);
  document.getElementById('panel-upload').classList.add('hidden');
  document.getElementById('panel-mapping').classList.remove('hidden');
  const fields = ['map-pn','map-desc','map-cost','map-qty','map-board','map-mfr','map-func','map-commodity'];
  const hints = ['part','desc','cost|price|u/p','qty|quantity','where|board|location','manu|mfr|supplier','func|block','commod|category'];
  fields.forEach((id, i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="">-- select --</option>';
    headers.forEach((h, idx) => {
      const opt = document.createElement('option');
      opt.value = idx; opt.textContent = h;
      sel.appendChild(opt);
    });
    // Auto-match
    const hint = hints[i].split('|');
    const match = headers.findIndex(h => hint.some(k => h.toLowerCase().includes(k)));
    if (match >= 0) sel.value = match;
  });
}

// ===== Categorization =====
function runCategorization() {
  columnMap = {
    pn: +document.getElementById('map-pn').value,
    desc: +document.getElementById('map-desc').value,
    cost: +document.getElementById('map-cost').value,
    qty: +document.getElementById('map-qty').value,
    board: document.getElementById('map-board').value !== '' ? +document.getElementById('map-board').value : -1,
    mfr: document.getElementById('map-mfr').value !== '' ? +document.getElementById('map-mfr').value : -1,
    func: document.getElementById('map-func').value !== '' ? +document.getElementById('map-func').value : -1,
    commodity: document.getElementById('map-commodity').value !== '' ? +document.getElementById('map-commodity').value : -1,
  };

  categorizedData = rawData.map(row => {
    const pn = String(row[columnMap.pn] || '').trim();
    const desc = String(row[columnMap.desc] || '').trim();
    const costRaw = row[columnMap.cost];
    const cost = parseFloat(String(costRaw).replace(/[^0-9.\-]/g, '')) || 0;
    const qtyRaw = row[columnMap.qty];
    const qty = parseFloat(String(qtyRaw).replace(/[^0-9.\-]/g, '')) || 0;
    const board = columnMap.board >= 0 ? String(row[columnMap.board] || '') : '';
    const mfr = columnMap.mfr >= 0 ? String(row[columnMap.mfr] || '') : '';
    const func = columnMap.func >= 0 ? String(row[columnMap.func] || '') : '';
    const commodity = columnMap.commodity >= 0 ? String(row[columnMap.commodity] || '') : '';
    const total = +(cost * qty).toFixed(6);
    const cat = classifyItem(pn, desc, commodity, func, board);
    return { pn, desc, cost, qty, total, board, mfr, func, commodity, code: cat.code, group: cat.group };
  }).filter(r => r.pn || r.desc);

  showResults();
}

// ===== Show Results =====
function showResults() {
  setStep(3);
  document.getElementById('panel-mapping').classList.add('hidden');
  document.getElementById('panel-results').classList.remove('hidden');

  const grandTotal = categorizedData.reduce((s, r) => s + r.total, 0);
  const smtTotal = categorizedData.filter(r => r.code.startsWith('SMT')).reduce((s, r) => s + r.total, 0);
  const fatpTotal = categorizedData.filter(r => r.code.startsWith('FATP')).reduce((s, r) => s + r.total, 0);
  const mvaTotal = categorizedData.filter(r => r.code.startsWith('MVA')).reduce((s, r) => s + r.total, 0);

  document.getElementById('summaryCards').innerHTML = `
    <div class="card"><div class="label">Grand Total</div><div class="value orange">$${grandTotal.toFixed(4)}</div></div>
    <div class="card"><div class="label">SMT Total</div><div class="value">$${smtTotal.toFixed(4)}</div></div>
    <div class="card"><div class="label">FATP Total</div><div class="value">$${fatpTotal.toFixed(4)}</div></div>
    <div class="card"><div class="label">Line Items</div><div class="value">${categorizedData.length}</div></div>
    ${mvaTotal > 0 ? `<div class="card"><div class="label">MVA Total</div><div class="value">$${mvaTotal.toFixed(4)}</div></div>` : ''}
  `;
  document.getElementById('itemCount').textContent = `${categorizedData.length} items categorized`;

  // Rollup by code
  const rollup = {};
  categorizedData.forEach(r => {
    if (!rollup[r.code]) rollup[r.code] = { total: 0, count: 0 };
    rollup[r.code].total += r.total;
    rollup[r.code].count++;
  });

  const codeOrder = Object.keys(YETI_CODES);
  let rollupHTML = '<h3>Cost Summary by Yeti Code</h3><table class="preview-table"><thead><tr><th>Code</th><th>Yeti Category</th><th class="text-center">Items</th><th class="text-right">Subtotal</th><th class="text-right">%</th><th>Distribution</th></tr></thead><tbody>';
  codeOrder.forEach(code => {
    if (!rollup[code]) return;
    const pct = (rollup[code].total / grandTotal * 100).toFixed(1);
    const barW = Math.max(2, Math.round(rollup[code].total / grandTotal * 200));
    const tagClass = code.startsWith('SMT') ? 'tag-smt' : code.startsWith('FATP') ? 'tag-fatp' : 'tag-mva';
    rollupHTML += `<tr><td><span class="tag ${tagClass}">${code}</span></td><td>${YETI_CODES[code].name}</td><td class="text-center">${rollup[code].count}</td><td class="text-right mono">$${rollup[code].total.toFixed(4)}</td><td class="text-right">${pct}%</td><td><span class="rollup-bar" style="width:${barW}px"></span></td></tr>`;
  });
  rollupHTML += '</tbody></table>';
  document.getElementById('rollupPanel').innerHTML = rollupHTML;

  // Detail table grouped by code
  let detailHTML = '<table class="preview-table"><thead><tr><th>Part Number</th><th>Description</th><th class="text-right">Unit Cost</th><th class="text-center">Qty</th><th class="text-right">Total</th><th>Group Category</th><th>Yeti Code</th></tr></thead><tbody>';
  codeOrder.forEach(code => {
    const items = categorizedData.filter(r => r.code === code);
    if (items.length === 0) return;
    const sub = items.reduce((s, r) => s + r.total, 0);
    detailHTML += `<tr><td colspan="7" style="background:#F0F2F2;font-weight:700;font-size:12px;">${code} — ${YETI_CODES[code].name} (${items.length} items, $${sub.toFixed(4)})</td></tr>`;
    items.sort((a, b) => b.total - a.total).forEach(r => {
      detailHTML += `<tr><td class="mono">${r.pn}</td><td>${esc(r.desc.substring(0,80))}</td><td class="text-right mono">$${r.cost.toFixed(4)}</td><td class="text-center">${r.qty}</td><td class="text-right mono">$${r.total.toFixed(4)}</td><td><select class="category-select" onchange="updateGroup(this,'${r.pn}')">`;
      ALL_GROUPS.forEach(g => { detailHTML += `<option value="${g}" ${g === r.group ? 'selected' : ''}>${g}</option>`; });
      detailHTML += `</select></td><td><span class="tag ${r.code.startsWith('SMT') ? 'tag-smt' : 'tag-fatp'}">${r.code}</span></td></tr>`;
    });
  });
  detailHTML += '</tbody></table>';
  document.getElementById('detailScroll').innerHTML = detailHTML;
}

function updateGroup(sel, pn) {
  const item = categorizedData.find(r => r.pn === pn);
  if (item) {
    item.group = sel.value;
    // Find which code this group belongs to
    for (const [code, def] of Object.entries(YETI_CODES)) {
      if (def.groups.includes(sel.value)) { item.code = code; break; }
    }
    showToast(`Updated ${pn} → ${sel.value}`);
  }
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ===== Export Functions =====
function exportCSV() {
  let csv = 'Part Number,Description,Unit Cost,Qty,Total Cost,Group Category,Yeti Code,Yeti Category\n';
  categorizedData.forEach(r => {
    csv += `"${r.pn}","${r.desc.replace(/"/g,'""')}",${r.cost.toFixed(4)},${r.qty},${r.total.toFixed(4)},"${r.group}","${r.code}","${YETI_CODES[r.code].name}"\n`;
  });
  downloadBlob(csv, 'bom_categorized.csv', 'text/csv');
  showToast('CSV exported');
}

function exportHTML() {
  const grandTotal = categorizedData.reduce((s, r) => s + r.total, 0);
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BOM Report</title>
<style>body{font-family:Arial,sans-serif;font-size:12px;background:#EAEDED;padding:16px}
.hdr{background:#232F3E;color:#fff;padding:12px 20px;border-radius:6px;margin-bottom:16px}
.hdr h1{font-size:18px;margin:0}.hdr span{color:#FF9900;font-size:12px}
table{width:100%;border-collapse:collapse;background:#fff;margin-bottom:16px;border-radius:6px;overflow:hidden}
th{background:#F7F8F8;padding:6px 8px;text-align:left;font-size:10px;text-transform:uppercase;border-bottom:2px solid #D5D9D9}
td{padding:5px 8px;border-bottom:1px solid #EAEDED;font-size:11px}
.r{text-align:right}.m{font-family:monospace}
.grp{background:#F0F2F2;font-weight:700;font-size:12px}
.tag{display:inline-block;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:600}
.s{background:#E3F2FD;color:#1565C0}.f{background:#FFF3E0;color:#E65100}
.total{font-size:16px;font-weight:700;color:#C7511F}</style></head><body>
<div class="hdr"><h1>Sunray BOM Cost Report</h1><span>Grand Total: $${grandTotal.toFixed(4)}</span></div>
<table><thead><tr><th>Part Number</th><th>Description</th><th class="r">Unit Cost</th><th class="r">Qty</th><th class="r">Total</th><th>Group Category</th><th>Code</th></tr></thead><tbody>`;

  const codeOrder = Object.keys(YETI_CODES);
  codeOrder.forEach(code => {
    const items = categorizedData.filter(r => r.code === code);
    if (!items.length) return;
    const sub = items.reduce((s, r) => s + r.total, 0);
    html += `<tr><td colspan="7" class="grp">${code} — ${YETI_CODES[code].name} (${items.length} items, $${sub.toFixed(4)})</td></tr>`;
    items.sort((a, b) => b.total - a.total).forEach(r => {
      const tc = r.code.startsWith('SMT') ? 's' : 'f';
      html += `<tr><td class="m">${esc(r.pn)}</td><td>${esc(r.desc.substring(0,80))}</td><td class="r m">$${r.cost.toFixed(4)}</td><td class="r">${r.qty}</td><td class="r m">$${r.total.toFixed(4)}</td><td>${esc(r.group)}</td><td><span class="tag ${tc}">${r.code}</span></td></tr>`;
    });
  });
  html += `</tbody></table><p class="total">Grand Total: $${grandTotal.toFixed(4)}</p></body></html>`;
  downloadBlob(html, 'bom_report.html', 'text/html');
  showToast('HTML report exported');
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Part Number', 'Description', 'Where Use', 'Manufacturer', 'Functional Block', 'Commodity Category', 'Unit Cost', 'Qty', 'Total Cost', 'Remark'],
    ['315000713475', 'UAZ003B1AC10 - ARES SoC TFBGA-169', 'Main Board', 'Verisilicon', 'AP.IC', 'IC', 2.255, 1, 2.255, 'Example'],
    ['311000100776', 'GRM0335C1H180GA01D - Cap 18pF 50V 0201', 'Main Board', 'Murata', 'PWR.Others', 'Capacitor', 0.0014, 51, 0.0714, 'Example'],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BOM');
  XLSX.writeFile(wb, 'BOM_Template.xlsx');
  showToast('Template downloaded');
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ===== UI Helpers =====
function setStep(n) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('step' + i);
    el.classList.remove('active', 'done');
    if (i < n) el.classList.add('done');
    else if (i === n) el.classList.add('active');
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function resetAll() {
  rawData = []; headers = []; categorizedData = [];
  document.getElementById('panel-upload').classList.remove('hidden');
  document.getElementById('panel-mapping').classList.add('hidden');
  document.getElementById('panel-results').classList.add('hidden');
  fileInput.value = '';
  setStep(1);
}
