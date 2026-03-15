// ══════════════════════════════════════
//  STATE & CONSTANTS
// ══════════════════════════════════════
const STORAGE_KEY = 'dcl_erp_lots';
const STATUS_KEYS = { done:'s.done', port:'s.port', packing:'s.packing', plan:'s.plan', delay:'s.urgent', cleared:'s.cleared' };
const STATUS_CLS  = { done:'s-done', port:'s-port', packing:'s-packing', plan:'s-plan', delay:'s-delay', cleared:'s-done' };
const NXE_CLS     = { 'TTK':'nxe-ttk','LINKLUCK':'nxe-ll','VT LSG':'nxe-vtl','PT GLOBAL':'nxe-pt' };

let lots = [];
let currentLang = 'vi';
let selectedLotId = null;
let editingLotId = null;
let pipeFilter = null;

// ══════════════════════════════════════
//  DATE CONVERSION HELPERS (dd/mm ↔ yyyy-mm-dd)
// ══════════════════════════════════════
function ddmmToDate(str) {
  if (!str || str === '—') return '';
  const m = str.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!m) return '';
  const year = new Date().getFullYear();
  return `${year}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
}
function dateToDdmm(val) {
  if (!val) return '';
  const parts = val.split('-');
  if (parts.length < 3) return val;
  return `${parts[2]}/${parts[1]}`;
}
function cutoffToDatetime(str) {
  if (!str || str === '—') return '';
  const cleaned = str.replace(/⚠\s*/g, '');
  const m = cleaned.match(/^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})$/);
  if (!m) {
    const m2 = cleaned.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (m2) {
      const year = new Date().getFullYear();
      return `${year}-${m2[2].padStart(2,'0')}-${m2[1].padStart(2,'0')}T00:00`;
    }
    return '';
  }
  const year = new Date().getFullYear();
  return `${year}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}T${m[3].padStart(2,'0')}:${m[4]}`;
}
function datetimeToCutoff(val) {
  if (!val) return '';
  const m = val.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return val;
  return `${m[3]}/${m[2]} ${m[4]}:${m[5]}`;
}

// ══════════════════════════════════════
//  DEFAULT DATA
// ══════════════════════════════════════
const DEFAULT_LOTS = [
  {
    id:'lot_1', lo:'217', booking:'JJCTHSHY600159', status:'packing',
    khachVn:'Bình Phước 平福', khachCn:'平福', kho:'Bình Phước 平福 KHO 1', lienhe:'',
    cang:'SHA', hang:'SJJ', tau:'', ngaygoi:'06/03', etd:'19/03', eta:'', cutoff:'18/03 19:00', etdKho:'',
    nhaxe:'TTK', gia:'43,000,000', tem:false, cskh:'THANH', note:'',
    containers:[
      {cont:'FBIU5164010',seal:'SJJB713066',status:'full'},
      {cont:'FBIU5683000',seal:'SJJC678710',status:'full'},
      {cont:'FBIU5596122',seal:'SJJC678692',status:'full'}
    ],
    shipper:'DCL TRADING CO., LTD',cnee:'',notify:'SAME AS CONSIGNEE',commodity:'FRESH BANANA +14C VENT 25CBM/H',
    deadlineSI:'',ngaySI:'',draftBL:0,loaiBill:0,soBL:'',ptBill:'THANH',
    cuoc:'',localCharges:'0',phiPhatSinh:'0',ttoan:0,linkBill:'',
    ngayBao:'',ngayCont:'',ngayDay:'',ngayVao:'',ngayRa:'',ngayHa:'',
    kehoach:0,luuMooc:0,phiMooc:'0',cuonMooc:'0',dieuDo:'PHONG',det:14,ghiChuDD:'',
    ngayLamKD:'',ngayKD:'',ttKD:0,soPhyto:'',soCO:'',formCO:0,
    soTK:'',ngayKB:'',phanLuong:0,ttTK:0,linkHQ:'',ptHQ:'THANH',ghiChuHQ:'',
    ngayEport:'',eportStatus:0,maHa:'',ngayThanhLy:''
  },
  {
    id:'lot_2', lo:'218', booking:'A59GX07442', status:'port',
    khachVn:'JIN FU JIE 金富杰', khachCn:'金富杰', kho:'JIN FU JIE KHO 1 — 金富杰 1厂', lienhe:'0382723520 — anh Hải',
    cang:'XIA', hang:'IAL', tau:'WAN HAI 292 N063', ngaygoi:'09/03', etd:'14/03', eta:'19/03', cutoff:'13/03 13:00', etdKho:'',
    nhaxe:'VT LSG', gia:'41,000,000', tem:true, cskh:'THANH',
    note:'Sắp xếp trước 8h lên cont. Cont FBIU5553687 có tem — kiểm tra kỹ trước hạ cảng.',
    containers:[
      {cont:'SZLU9596423',seal:'IAAH674738',status:'full'},
      {cont:'FBIU5553687',seal:'IAAH688050',status:'full'}
    ],
    shipper:'DCL TRADING CO., LTD',cnee:'JIN FU JIE IMPORT CO.',notify:'SAME AS CONSIGNEE',
    commodity:'FRESH BANANA +14C VENT 25CBM/H',
    deadlineSI:'2026-03-12',ngaySI:'2026-03-11',draftBL:1,loaiBill:0,soBL:'IALA59GX07442',ptBill:'THANH',
    cuoc:'41,000,000',localCharges:'0',phiPhatSinh:'0',ttoan:1,linkBill:'',
    ngayBao:'2026-03-09',ngayCont:'2026-03-09',ngayDay:'2026-03-11',ngayVao:'',ngayRa:'',ngayHa:'2026-03-13',
    kehoach:0,luuMooc:0,phiMooc:'0',cuonMooc:'0',dieuDo:'PHONG',det:14,ghiChuDD:'',
    ngayLamKD:'2026-03-10',ngayKD:'2026-03-11',ttKD:1,soPhyto:'PHVN2026-031303',soCO:'CO-VN-2026-0318',formCO:0,
    soTK:'10540612040',ngayKB:'2026-03-11',phanLuong:0,ttTK:1,linkHQ:'',ptHQ:'THANH',
    ghiChuHQ:'Khách xác nhận CO bản nháp OK. Gửi bản final CO + Phyto + TLX cho khách ngày 14/03.',
    ngayEport:'2026-03-13',eportStatus:1,maHa:'CL2603130012',ngayThanhLy:''
  },
  {
    id:'lot_3', lo:'219A', booking:'ASC0507289', status:'packing',
    khachVn:'JIN FU JIE 金富杰', khachCn:'金富杰', kho:'JIN FU JIE KHO 5', lienhe:'',
    cang:'SHA', hang:'CMA', tau:'', ngaygoi:'09/03', etd:'16/03', eta:'', cutoff:'15/03 13:00', etdKho:'',
    nhaxe:'PT GLOBAL', gia:'41,000,000', tem:true, cskh:'THANH', note:'',
    containers:[
      {cont:'CGMU5355006',seal:'M0983835',status:'full'},
      {cont:'SZLU9104333',seal:'M0983832',status:'full'},
      {cont:'AMCU9352725',seal:'M3902215',status:'empty'}
    ],
    shipper:'DCL TRADING CO., LTD',cnee:'',notify:'SAME AS CONSIGNEE',commodity:'FRESH BANANA +14C VENT 25CBM/H',
    deadlineSI:'',ngaySI:'',draftBL:0,loaiBill:0,soBL:'',ptBill:'THANH',
    cuoc:'',localCharges:'0',phiPhatSinh:'0',ttoan:0,linkBill:'',
    ngayBao:'',ngayCont:'',ngayDay:'',ngayVao:'',ngayRa:'',ngayHa:'',
    kehoach:0,luuMooc:0,phiMooc:'0',cuonMooc:'0',dieuDo:'PHONG',det:14,ghiChuDD:'',
    ngayLamKD:'',ngayKD:'',ttKD:0,soPhyto:'',soCO:'',formCO:0,
    soTK:'',ngayKB:'',phanLuong:0,ttTK:0,linkHQ:'',ptHQ:'THANH',ghiChuHQ:'',
    ngayEport:'',eportStatus:0,maHa:'',ngayThanhLy:''
  },
  {
    id:'lot_4', lo:'220', booking:'YMJAI490581148', status:'packing',
    khachVn:'HENG XING 恒兴', khachCn:'恒兴', kho:'HENG XING Thu Vân', lienhe:'',
    cang:'DAL', hang:'YML', tau:'', ngaygoi:'11/03', etd:'20/03', eta:'', cutoff:'19/03 08:00', etdKho:'',
    nhaxe:'VT LSG', gia:'47,000,000', tem:false, cskh:'THANH', note:'',
    containers:[{cont:'YMLU5528545',seal:'YMAU980907',status:'full'}],
    shipper:'DCL TRADING CO., LTD',cnee:'',notify:'SAME AS CONSIGNEE',commodity:'FRESH BANANA +14C VENT 25CBM/H',
    deadlineSI:'',ngaySI:'',draftBL:0,loaiBill:0,soBL:'',ptBill:'THANH',
    cuoc:'',localCharges:'0',phiPhatSinh:'0',ttoan:0,linkBill:'',
    ngayBao:'',ngayCont:'',ngayDay:'',ngayVao:'',ngayRa:'',ngayHa:'',
    kehoach:0,luuMooc:0,phiMooc:'0',cuonMooc:'0',dieuDo:'PHONG',det:14,ghiChuDD:'',
    ngayLamKD:'',ngayKD:'',ttKD:0,soPhyto:'',soCO:'',formCO:0,
    soTK:'',ngayKB:'',phanLuong:0,ttTK:0,linkHQ:'',ptHQ:'THANH',ghiChuHQ:'',
    ngayEport:'',eportStatus:0,maHa:'',ngayThanhLy:''
  },
  {
    id:'lot_5', lo:'221', booking:'JJCTHSHY600158', status:'plan',
    khachVn:'Bình Phước 平福', khachCn:'平福', kho:'Bình Phước 平福 KHO 5', lienhe:'',
    cang:'SHA', hang:'SJJ', tau:'', ngaygoi:'11/03', etd:'19/03', eta:'', cutoff:'18/03 19:00', etdKho:'',
    nhaxe:'TTK', gia:'48,000,000', tem:false, cskh:'THANH', note:'',
    containers:[{cont:'FBIU5683530',seal:'SJJC678688',status:'empty'}],
    shipper:'DCL TRADING CO., LTD',cnee:'',notify:'SAME AS CONSIGNEE',commodity:'FRESH BANANA +14C VENT 25CBM/H',
    deadlineSI:'',ngaySI:'',draftBL:0,loaiBill:0,soBL:'',ptBill:'THANH',
    cuoc:'',localCharges:'0',phiPhatSinh:'0',ttoan:0,linkBill:'',
    ngayBao:'',ngayCont:'',ngayDay:'',ngayVao:'',ngayRa:'',ngayHa:'',
    kehoach:0,luuMooc:0,phiMooc:'0',cuonMooc:'0',dieuDo:'PHONG',det:14,ghiChuDD:'',
    ngayLamKD:'',ngayKD:'',ttKD:0,soPhyto:'',soCO:'',formCO:0,
    soTK:'',ngayKB:'',phanLuong:0,ttTK:0,linkHQ:'',ptHQ:'THANH',ghiChuHQ:'',
    ngayEport:'',eportStatus:0,maHa:'',ngayThanhLy:''
  },
  {
    id:'lot_6', lo:'222', booking:'SITSGTXR488517', status:'delay',
    khachVn:'JIN FU JIE Tây Ninh', khachCn:'金富杰', kho:'JIN FU JIE Tây Ninh', lienhe:'',
    cang:'TJN', hang:'—', tau:'', ngaygoi:'12/03', etd:'19/03', eta:'', cutoff:'⚠ 18/03', etdKho:'',
    nhaxe:'—', gia:'48,000,000', tem:true, cskh:'THANH', note:'',
    containers:[{cont:'— chưa cấp',seal:'—',status:'empty'}],
    shipper:'DCL TRADING CO., LTD',cnee:'',notify:'SAME AS CONSIGNEE',commodity:'FRESH BANANA +14C VENT 25CBM/H',
    deadlineSI:'',ngaySI:'',draftBL:0,loaiBill:0,soBL:'',ptBill:'THANH',
    cuoc:'',localCharges:'0',phiPhatSinh:'0',ttoan:0,linkBill:'',
    ngayBao:'',ngayCont:'',ngayDay:'',ngayVao:'',ngayRa:'',ngayHa:'',
    kehoach:0,luuMooc:0,phiMooc:'0',cuonMooc:'0',dieuDo:'PHONG',det:14,ghiChuDD:'',
    ngayLamKD:'',ngayKD:'',ttKD:0,soPhyto:'',soCO:'',formCO:0,
    soTK:'',ngayKB:'',phanLuong:0,ttTK:0,linkHQ:'',ptHQ:'THANH',ghiChuHQ:'',
    ngayEport:'',eportStatus:0,maHa:'',ngayThanhLy:''
  },
  {
    id:'lot_7', lo:'223', booking:'2322398440', status:'plan',
    khachVn:'HENG XING Trảng Bom', khachCn:'恒兴', kho:'HENG XING Trảng Bom', lienhe:'',
    cang:'DAL', hang:'—', tau:'', ngaygoi:'13/03', etd:'—', eta:'', cutoff:'—', etdKho:'',
    nhaxe:'—', gia:'0', tem:false, cskh:'THANH', note:'',
    containers:[{cont:'— đang chờ',seal:'—',status:'empty'}],
    shipper:'DCL TRADING CO., LTD',cnee:'',notify:'SAME AS CONSIGNEE',commodity:'FRESH BANANA +14C VENT 25CBM/H',
    deadlineSI:'',ngaySI:'',draftBL:0,loaiBill:0,soBL:'',ptBill:'THANH',
    cuoc:'',localCharges:'0',phiPhatSinh:'0',ttoan:0,linkBill:'',
    ngayBao:'',ngayCont:'',ngayDay:'',ngayVao:'',ngayRa:'',ngayHa:'',
    kehoach:0,luuMooc:0,phiMooc:'0',cuonMooc:'0',dieuDo:'PHONG',det:14,ghiChuDD:'',
    ngayLamKD:'',ngayKD:'',ttKD:0,soPhyto:'',soCO:'',formCO:0,
    soTK:'',ngayKB:'',phanLuong:0,ttTK:0,linkHQ:'',ptHQ:'THANH',ghiChuHQ:'',
    ngayEport:'',eportStatus:0,maHa:'',ngayThanhLy:''
  }
];

// ══════════════════════════════════════
//  DATA MANAGEMENT
// ══════════════════════════════════════
function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    lots = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_LOTS));
    if (!stored) saveData();
  } catch(e) {
    lots = JSON.parse(JSON.stringify(DEFAULT_LOTS));
    saveData();
  }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(lots)); }
function genId() { return 'lot_' + Date.now() + '_' + Math.random().toString(36).substr(2,5); }
function nextLo() {
  const nums = lots.map(l => parseInt(l.lo)).filter(n => !isNaN(n));
  return nums.length ? String(Math.max(...nums) + 1) : '100';
}
function formatGia(val) {
  const n = parseInt(String(val).replace(/[,.]/g,''));
  if (!n || isNaN(n)) return '—';
  return Math.round(n/1000000) + 'tr';
}

// ══════════════════════════════════════
//  LANGUAGE
// ══════════════════════════════════════
function t(key) { return (i18n[currentLang] && i18n[currentLang][key]) || (i18n.vi && i18n.vi[key]) || key; }

function setLang(lang) {
  currentLang = lang;
  ['login-btn-vi','right-btn-vi','dash-btn-vi'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.classList.toggle('active', lang==='vi');
  });
  ['login-btn-zh','right-btn-zh','dash-btn-zh'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.classList.toggle('active', lang==='zh');
  });
  applyLang();
  renderAll();
}

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(el.getAttribute('data-i18n'));
    if (val) {
      if (el.tagName === 'H1' && val.includes('<em>')) {
        el.innerHTML = val.replace(/\n/g,'<br/>');
      } else {
        el.textContent = val;
      }
    }
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const val = t(el.getAttribute('data-i18n-ph'));
    if (val) el.placeholder = val;
  });
}

// ══════════════════════════════════════
//  FILTERS
// ══════════════════════════════════════
function populateFilters() {
  const custSel = document.getElementById('filter-customer');
  const carrSel = document.getElementById('filter-carrier');
  const prevCust = custSel.value;
  const prevCarr = carrSel.value;

  // Unique customers
  const customers = [...new Set(lots.map(l => l.khachVn).filter(Boolean))].sort();
  custSel.innerHTML = `<option value="">${t('filter.allCustomers')}</option>`;
  customers.forEach(c => { custSel.innerHTML += `<option value="${c}" ${c===prevCust?'selected':''}>${c}</option>`; });

  // Unique carriers
  const carriers = [...new Set(lots.map(l => l.nhaxe).filter(v => v && v !== '—'))].sort();
  carrSel.innerHTML = `<option value="">${t('filter.allCarriers')}</option>`;
  carriers.forEach(c => { carrSel.innerHTML += `<option value="${c}" ${c===prevCarr?'selected':''}>${c}</option>`; });
}

function getFilteredLots() {
  let filtered = [...lots];
  const search = (document.getElementById('search-inp').value || '').toLowerCase().trim();
  const custVal = document.getElementById('filter-customer').value;
  const carrVal = document.getElementById('filter-carrier').value;
  const statVal = document.getElementById('filter-status').value;

  if (search) {
    filtered = filtered.filter(lot =>
      lot.lo.toLowerCase().includes(search) ||
      lot.booking.toLowerCase().includes(search) ||
      lot.khachVn.toLowerCase().includes(search) ||
      lot.khachCn.toLowerCase().includes(search) ||
      lot.containers.some(c => c.cont.toLowerCase().includes(search) || c.seal.toLowerCase().includes(search))
    );
  }
  if (custVal) filtered = filtered.filter(l => l.khachVn === custVal);
  if (carrVal) filtered = filtered.filter(l => l.nhaxe === carrVal);
  if (statVal) filtered = filtered.filter(l => l.status === statVal);
  if (pipeFilter) {
    const pf = pipeFilter;
    filtered = filtered.filter(l => {
      if (pf === 'all') return true;
      if (pf === 'booked') return l.booking && l.booking !== '—';
      if (pf === 'contkho') return ['packing','port','done','cleared'].includes(l.status);
      if (pf === 'transport') return l.status === 'packing';
      if (pf === 'atport') return ['port','done','cleared'].includes(l.status);
      if (pf === 'shipped') return ['done','cleared'].includes(l.status);
      if (pf === 'cleared') return l.status === 'cleared';
      return true;
    });
  }
  return filtered;
}

// ══════════════════════════════════════
//  RENDERING
// ══════════════════════════════════════
function renderAll() {
  populateFilters();
  renderTable();
  updateStats();
  updatePipeline();
  updateSidePanel();
}

function renderTable() {
  const filtered = getFilteredLots();
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  let totalConts = 0;
  filtered.forEach(lot => {
    lot.containers.forEach((cont, idx) => {
      totalConts++;
      const tr = document.createElement('tr');
      tr.className = idx === 0 ? 'group-row' : 'sub-row';
      if (lot.status === 'delay') tr.style.background = '#fff8f0';
      if (lot.id === selectedLotId) tr.classList.add('selected');

      const sKey = STATUS_KEYS[lot.status] || 's.plan';
      const sCls = STATUS_CLS[lot.status] || 's-plan';
      const nxCls = NXE_CLS[lot.nhaxe] || 'nxe-ttk';

      const loBadge = idx === 0
        ? `<span class="lo-badge" style="${lot.status==='delay'?'color:#c53030':''}">${lot.lo}</span>`
        : '<span style="color:#aaa;padding-left:16px">↳</span>';

      const nxBadge = lot.nhaxe && lot.nhaxe !== '—'
        ? `<span class="nxe ${nxCls}">${lot.nhaxe}</span>`
        : '<span style="color:#aaa">—</span>';

      const cutoffHtml = lot.status === 'delay'
        ? `<span style="color:#c53030;font-weight:700">⚠ ${lot.cutoff}</span>`
        : lot.cutoff;

      const temHtml = lot.tem
        ? `<span class="tem-yes">✓ ${currentLang==='zh'?'贴标':'TEM'}</span>`
        : '<span class="tem-no">—</span>';

      tr.innerHTML = `
        <td>${loBadge}</td>
        <td class="mono">${lot.booking}</td>
        <td class="mono">${cont.cont}</td>
        <td class="mono" style="color:#8898aa">${cont.seal}</td>
        <td>${lot.khachVn}</td>
        <td><span class="port">${lot.cang}</span></td>
        <td>${nxBadge}</td>
        <td>${lot.ngaygoi}</td>
        <td>${lot.etd}</td>
        <td>${cutoffHtml}</td>
        <td>${lot.hang}</td>
        <td><span class="badge-status ${sCls}"><span class="dot"></span>${t(sKey)}</span></td>
        <td>${temHtml}</td>
        <td>${formatGia(lot.gia)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-xs primary" data-lot-id="${lot.id}" data-action="detail">${t('btn.detail')}</button>
            <button class="btn-xs" data-lot-id="${lot.id}" data-action="edit">${t('btn.edit')}</button>
          </div>
        </td>`;

      tr.addEventListener('click', () => {
        document.querySelectorAll('#table-body tr').forEach(x => x.classList.remove('selected'));
        // Select all rows of this lot
        selectedLotId = lot.id;
        document.querySelectorAll(`[data-lot-row="${lot.id}"]`).forEach(x => x.classList.add('selected'));
        tr.classList.add('selected');
        updateSidePanel(lot);
      });

      tr.setAttribute('data-lot-row', lot.id);
      tbody.appendChild(tr);
    });
  });

  // Action button delegation
  tbody.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lotId = btn.getAttribute('data-lot-id');
      openModal(lotId, 'edit');
    });
  });

  // Footer
  const footerEl = document.getElementById('table-footer-text');
  if (footerEl) {
    footerEl.textContent = `${t('table.showing')} ${filtered.length} ${t('table.of')} ${lots.length} ${t('table.lots')} · ${totalConts} containers`;
  }
}

function updateStats() {
  const total = lots.length;
  const shipped = lots.filter(l => l.status === 'done' || l.status === 'cleared').length;
  const transport = lots.filter(l => l.status === 'packing').length;
  const pending = lots.filter(l => l.status === 'plan' || l.status === 'delay').length;
  const totalGia = lots.reduce((sum, l) => sum + (parseInt(String(l.gia).replace(/[,.]/g,'')) || 0), 0);
  const giaStr = (totalGia / 1000000000).toFixed(1) + 'B';

  const el = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
  el('stat-total', total);
  el('stat-shipped', shipped);
  el('stat-transport', transport);
  el('stat-pending', pending);
  el('stat-revenue', giaStr);

  const pctEl = document.getElementById('stat-shipped-pct');
  if(pctEl) pctEl.textContent = total ? (shipped/total*100).toFixed(1)+'%' : '0%';

  const delayCount = lots.filter(l => l.status === 'delay').length;
  const warnEl = document.getElementById('stat-warn-count');
  if(warnEl) warnEl.textContent = delayCount + ' ' + t('stat3.warn');
}

function updatePipeline() {
  const counts = {
    all: lots.length,
    booked: lots.filter(l => l.booking && l.booking !== '—').length,
    contkho: lots.filter(l => ['packing','port','done','cleared'].includes(l.status)).length,
    transport: lots.filter(l => l.status === 'packing').length,
    atport: lots.filter(l => ['port','done','cleared'].includes(l.status)).length,
    shipped: lots.filter(l => ['done','cleared'].includes(l.status)).length,
    cleared: lots.filter(l => l.status === 'cleared').length
  };
  const keys = ['all','booked','contkho','transport','atport','shipped','cleared'];
  keys.forEach(k => {
    const el = document.getElementById('pipe-count-'+k);
    if(el) el.textContent = counts[k];
  });
}

function updateSidePanel(lot) {
  if (!lot && selectedLotId) lot = lots.find(l => l.id === selectedLotId);
  if (!lot && lots.length) lot = lots[0];
  if (!lot) return;

  selectedLotId = lot.id;
  const el = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
  el('side-lo-title', t('dp.detail.title') + lot.lo);
  el('sd-booking', lot.booking);
  el('sd-khach', lot.khachVn);
  el('sd-hang', lot.hang);
  el('sd-tau', lot.tau || '—');
  el('sd-etd', lot.etd);
  el('sd-eta', lot.eta || '—');
  el('sd-nhaxe', lot.nhaxe);
  el('sd-gia', formatGia(lot.gia) + ' VNĐ');
  el('sd-socont', lot.containers.length + ' × 40HR');
  el('sd-note', lot.note || '—');
}

// ══════════════════════════════════════
//  MODAL — OPEN / CLOSE
// ══════════════════════════════════════
function openModal(lotId, mode) {
  const modal = document.getElementById('booking-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (mode === 'new') {
    editingLotId = null;
    clearModal();
    document.getElementById('f-lo').value = nextLo();
    document.getElementById('modal-lo-badge').textContent = t('modal.title.new').split(' ')[0];
    document.getElementById('modal-title').textContent = t('modal.title.new');
    document.getElementById('modal-booking-num').textContent = 'Booking: —';
    document.getElementById('btn-delete-lot').style.display = 'none';
  } else {
    editingLotId = lotId;
    const lot = lots.find(l => l.id === lotId);
    if (!lot) return;
    populateModal(lot);
    const loLabel = currentLang === 'zh' ? '票 ' : 'Lô ';
    document.getElementById('modal-lo-badge').textContent = loLabel + lot.lo;
    document.getElementById('modal-title').textContent = t('modal.title.edit');
    document.getElementById('modal-booking-num').textContent = 'Booking: ' + lot.booking;
    document.getElementById('btn-delete-lot').style.display = '';
  }
  switchTab(document.querySelector('.mtab'), 'tab-general');
}

function closeModal() {
  document.getElementById('booking-modal').classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════
//  MODAL — POPULATE / CLEAR / COLLECT
// ══════════════════════════════════════
function populateModal(lot) {
  const v = (id, val) => { const e = document.getElementById(id); if(e) e.value = val || ''; };
  // General
  v('f-lo', lot.lo);
  v('f-booking', lot.booking);
  v('f-status', lot.status);
  v('f-khach-vn', lot.khachVn);
  v('f-khach-cn', lot.khachCn);
  v('f-kho', lot.kho);
  v('f-lienhe', lot.lienhe);
  v('f-cang', lot.cang);
  v('f-hang', lot.hang);
  v('f-tau', lot.tau);
  v('f-ngay-goi', ddmmToDate(lot.ngaygoi));
  v('f-etd', ddmmToDate(lot.etd));
  v('f-eta', ddmmToDate(lot.eta));
  v('f-cutoff', cutoffToDatetime(lot.cutoff));
  v('f-etd-kho', ddmmToDate(lot.etdKho));
  v('f-nhaxe', lot.nhaxe);
  v('f-gia', lot.gia);
  v('f-cskh', lot.cskh);
  v('f-note', lot.note);
  v('f-tem', lot.tem ? '1' : '0');

  // Containers
  renderContainerRows(lot.containers);

  // ePort
  v('f-ngay-eport', lot.ngayEport);
  v('f-eport-status', String(lot.eportStatus));
  v('f-ma-ha', lot.maHa);
  v('f-ngay-thanh-ly', lot.ngayThanhLy);

  // Dieu do
  v('f-ngay-bao', lot.ngayBao);
  v('f-ngay-cont', lot.ngayCont);
  v('f-ngay-day', lot.ngayDay);
  v('f-ngay-vao', lot.ngayVao);
  v('f-ngay-ra', lot.ngayRa);
  v('f-ngay-ha', lot.ngayHa);
  v('f-kehoach', String(lot.kehoach));
  v('f-luu-mooc', lot.luuMooc);
  v('f-phi-mooc', lot.phiMooc);
  v('f-cuon-mooc', lot.cuonMooc);
  v('f-dieu-do', lot.dieuDo);
  v('f-det', lot.det);
  v('f-ghi-chu-dd', lot.ghiChuDD);

  // Bill
  v('f-shipper', lot.shipper);
  v('f-cnee', lot.cnee);
  v('f-notify', lot.notify);
  v('f-commodity', lot.commodity);
  v('f-deadline-si', lot.deadlineSI);
  v('f-ngay-si', lot.ngaySI);
  v('f-draft-bl', String(lot.draftBL));
  v('f-loai-bill', String(lot.loaiBill));
  v('f-so-bl', lot.soBL);
  v('f-pt-bill', lot.ptBill);
  v('f-cuoc', lot.cuoc);
  v('f-local', lot.localCharges);
  v('f-phi-phat-sinh', lot.phiPhatSinh);
  v('f-ttoan', String(lot.ttoan));
  v('f-link-bill', lot.linkBill);

  // Hai quan
  v('f-ngay-lam-kd', lot.ngayLamKD);
  v('f-ngay-kd', lot.ngayKD);
  v('f-tt-kd', String(lot.ttKD));
  v('f-so-phyto', lot.soPhyto);
  v('f-so-co', lot.soCO);
  v('f-form-co', String(lot.formCO));
  v('f-so-tk', lot.soTK);
  v('f-ngay-kb', lot.ngayKB);
  v('f-phan-luong', String(lot.phanLuong));
  v('f-tt-tk', String(lot.ttTK));
  v('f-link-hq', lot.linkHQ);
  v('f-pt-hq', lot.ptHQ);
  v('f-ghi-chu-hq', lot.ghiChuHQ);
}

function clearModal() {
  document.querySelectorAll('#booking-modal input:not([type="checkbox"]), #booking-modal select, #booking-modal textarea').forEach(el => {
    if (el.type === 'number') el.value = '0';
    else if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
  const contList = document.getElementById('cont-list');
  contList.innerHTML = '';
  addCont();
}

function collectModalData() {
  const v = id => { const e = document.getElementById(id); return e ? e.value : ''; };

  // Collect containers
  const containers = [];
  document.querySelectorAll('#cont-list .cont-row').forEach(row => {
    const inputs = row.querySelectorAll('input');
    const sel = row.querySelector('select');
    if (inputs[0] && inputs[0].value.trim()) {
      containers.push({
        cont: inputs[0].value.trim(),
        seal: inputs[1] ? inputs[1].value.trim() : '',
        status: sel ? sel.value : 'empty'
      });
    }
  });

  return {
    lo: v('f-lo'),
    booking: v('f-booking'),
    status: v('f-status'),
    khachVn: v('f-khach-vn'),
    khachCn: v('f-khach-cn'),
    kho: v('f-kho'),
    lienhe: v('f-lienhe'),
    cang: v('f-cang'),
    hang: v('f-hang'),
    tau: v('f-tau'),
    ngaygoi: dateToDdmm(v('f-ngay-goi')),
    etd: dateToDdmm(v('f-etd')),
    eta: dateToDdmm(v('f-eta')),
    cutoff: datetimeToCutoff(v('f-cutoff')),
    etdKho: dateToDdmm(v('f-etd-kho')),
    nhaxe: v('f-nhaxe'),
    gia: v('f-gia'),
    tem: v('f-tem') === '1',
    cskh: v('f-cskh'),
    note: v('f-note'),
    containers: containers.length ? containers : [{cont:'—',seal:'—',status:'empty'}],
    // ePort
    ngayEport: v('f-ngay-eport'), eportStatus: parseInt(v('f-eport-status'))||0,
    maHa: v('f-ma-ha'), ngayThanhLy: v('f-ngay-thanh-ly'),
    // Dieu do
    ngayBao: v('f-ngay-bao'), ngayCont: v('f-ngay-cont'), ngayDay: v('f-ngay-day'),
    ngayVao: v('f-ngay-vao'), ngayRa: v('f-ngay-ra'), ngayHa: v('f-ngay-ha'),
    kehoach: parseInt(v('f-kehoach'))||0, luuMooc: parseInt(v('f-luu-mooc'))||0,
    phiMooc: v('f-phi-mooc'), cuonMooc: v('f-cuon-mooc'),
    dieuDo: v('f-dieu-do'), det: parseInt(v('f-det'))||14, ghiChuDD: v('f-ghi-chu-dd'),
    // Bill
    shipper: v('f-shipper'), cnee: v('f-cnee'), notify: v('f-notify'), commodity: v('f-commodity'),
    deadlineSI: v('f-deadline-si'), ngaySI: v('f-ngay-si'),
    draftBL: parseInt(v('f-draft-bl'))||0, loaiBill: parseInt(v('f-loai-bill'))||0,
    soBL: v('f-so-bl'), ptBill: v('f-pt-bill'),
    cuoc: v('f-cuoc'), localCharges: v('f-local'), phiPhatSinh: v('f-phi-phat-sinh'),
    ttoan: parseInt(v('f-ttoan'))||0, linkBill: v('f-link-bill'),
    // Hai quan
    ngayLamKD: v('f-ngay-lam-kd'), ngayKD: v('f-ngay-kd'), ttKD: parseInt(v('f-tt-kd'))||0,
    soPhyto: v('f-so-phyto'), soCO: v('f-so-co'), formCO: parseInt(v('f-form-co'))||0,
    soTK: v('f-so-tk'), ngayKB: v('f-ngay-kb'), phanLuong: parseInt(v('f-phan-luong'))||0,
    ttTK: parseInt(v('f-tt-tk'))||0, linkHQ: v('f-link-hq'), ptHQ: v('f-pt-hq'), ghiChuHQ: v('f-ghi-chu-hq')
  };
}

// ══════════════════════════════════════
//  CRUD
// ══════════════════════════════════════
function saveModal() {
  const data = collectModalData();
  if (editingLotId) {
    // UPDATE
    const idx = lots.findIndex(l => l.id === editingLotId);
    if (idx !== -1) {
      lots[idx] = { ...lots[idx], ...data };
      saveData();
      showToast(t('toast.saved'));
    }
  } else {
    // CREATE
    data.id = genId();
    lots.push(data);
    saveData();
    selectedLotId = data.id;
    showToast(t('toast.created'));
  }
  closeModal();
  renderAll();
}

function deleteLot() {
  if (!editingLotId) return;
  if (!confirm(t('confirm.delete'))) return;
  lots = lots.filter(l => l.id !== editingLotId);
  saveData();
  if (selectedLotId === editingLotId) selectedLotId = lots.length ? lots[0].id : null;
  editingLotId = null;
  closeModal();
  renderAll();
  showToast(t('toast.deleted'));
}

// ══════════════════════════════════════
//  CONTAINERS IN MODAL
// ══════════════════════════════════════
function renderContainerRows(containers) {
  const list = document.getElementById('cont-list');
  list.innerHTML = '';
  (containers || []).forEach(c => {
    addContRow(c.cont, c.seal, c.status);
  });
}

function addContRow(cont, seal, status) {
  const list = document.getElementById('cont-list');
  const div = document.createElement('div');
  div.className = 'cont-row';
  div.innerHTML = `
    <div class="form-group" style="margin:0"><input value="${cont||''}" placeholder="XXXX0000000"/></div>
    <div class="form-group" style="margin:0"><input value="${seal||''}" placeholder="${currentLang==='zh'?'铅封号...':'Số seal...'}"/></div>
    <div class="form-group" style="margin:0">
      <select>
        <option value="empty" ${status==='empty'?'selected':''}>${t('cs.empty')}</option>
        <option value="full" ${status==='full'?'selected':''}>${t('cs.full')}</option>
        <option value="packing" ${status==='packing'?'selected':''}>${t('cs.packing')}</option>
        <option value="port" ${status==='port'?'selected':''}>${t('cs.port')}</option>
        <option value="ship" ${status==='ship'?'selected':''}>${t('cs.ship')}</option>
      </select>
    </div>
    <button class="btn-del-cont" onclick="delCont(this)">✕</button>`;
  list.appendChild(div);
}

function addCont() { addContRow('','','empty'); }

function delCont(btn) {
  if (document.querySelectorAll('#cont-list .cont-row').length > 1)
    btn.closest('.cont-row').remove();
}

// ══════════════════════════════════════
//  TABS & TOAST & PIPELINE & MISC
// ══════════════════════════════════════
function switchTab(el, tabId) {
  document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.modal-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.querySelector('span').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function setPipe(el, filterKey) {
  const steps = document.querySelectorAll('.pipe-step');
  const wasActive = el.classList.contains('active');
  steps.forEach(e => e.classList.remove('active'));
  if (wasActive) {
    pipeFilter = null;
  } else {
    el.classList.add('active');
    pipeFilter = filterKey;
  }
  renderTable();
}

function goToDashboard() {
  document.getElementById('page-login').classList.remove('active');
  document.getElementById('page-dashboard').classList.add('active');
  renderAll();
}

// ══════════════════════════════════════
//  EVENTS
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  applyLang();

  // Search
  document.getElementById('search-inp').addEventListener('input', renderTable);

  // Filter dropdowns
  document.getElementById('filter-customer').addEventListener('change', renderTable);
  document.getElementById('filter-carrier').addEventListener('change', renderTable);
  document.getElementById('filter-status').addEventListener('change', renderTable);

  // Modal overlay click to close
  document.getElementById('booking-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && document.getElementById('page-login').classList.contains('active')) goToDashboard();
  });
});
