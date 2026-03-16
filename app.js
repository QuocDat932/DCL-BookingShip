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
//  SHIP SCHEDULE DATA (Lịch tàu tuần)
//  Cập nhật: 15/03/2026
// ══════════════════════════════════════
const SHIP_SCHEDULES_KEY = 'dcl_erp_schedules';

const DEFAULT_SHIP_SCHEDULES = [
  // ── 上海 THƯỢNG HẢI (SHA) ──
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'EMC',    vessel:'EVER OCEAN 0464-092N',       etd:'2026-03-18', eta:'2026-03-25', days:7,  price:'43,000,000' },
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'SJJ',    vessel:'MILD SYMPHONY 2610N',        etd:'2026-03-19', eta:'2026-03-23', days:4,  price:'45,000,000' },
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'RCL',    vessel:'CUL YANGPU 2611N',           etd:'2026-03-20', eta:'2026-03-28', days:8,  price:'46,000,000' },
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'SJJ',    vessel:'XIN AN 63N',                 etd:'2026-03-21', eta:'2026-03-26', days:5,  price:'45,000,000' },
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'CMA',    vessel:'CNC JUPITER / 0HBXAN1NC',    etd:'2026-03-25', eta:'2026-03-31', days:6,  price:'47,000,000' },
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'COSCO',  vessel:'KMTC INCHEON/CKI/2602N',     etd:'2026-02-23', eta:'2026-03-01', days:6,  price:'46,000,000' },
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'SJJ',    vessel:'MILD CHORUS 2611N',          etd:'2026-03-26', eta:'2026-03-30', days:4,  price:'45,000,000' },
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'CMA',    vessel:'AMALFI BAY 0HO39N1NC',       etd:'2026-03-27', eta:'2026-04-03', days:7,  price:'47,000,000' },
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'CMA',    vessel:'HUA XIANG 936 0HBFSN1NC',    etd:'2026-03-28', eta:'2026-04-04', days:7,  price:'47,000,000' },
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'SJJ',    vessel:'HONG AN 2608N',              etd:'2026-03-28', eta:'2026-04-03', days:6,  price:'45,000,000' },
  { port:'SHA', portName:'Thượng Hải 上海', carrier:'EMC',    vessel:'EVER ONWARD 0469-048N',      etd:'2026-04-02', eta:'2026-04-09', days:7,  price:'43,000,000' },

  // ── 大连 ĐẠI LIÊN (DAL) ──
  { port:'DAL', portName:'Đại Liên 大连',   carrier:'COSCO',  vessel:'WAN HAI 359 N038',           etd:'2026-03-18', eta:'2026-03-25', days:7,  price:'50,000,000' },
  { port:'DAL', portName:'Đại Liên 大连',   carrier:'YML',    vessel:'YM CENTENNIAL 065N',         etd:'2026-03-18', eta:'2026-03-26', days:8,  price:'47,000,000' },
  { port:'DAL', portName:'Đại Liên 大连',   carrier:'CMA',    vessel:'TERATAKI 0XKNSN1NC',         etd:'2026-03-20', eta:'2026-03-29', days:9,  price:'50,000,000' },
  { port:'DAL', portName:'Đại Liên 大连',   carrier:'COSCO',  vessel:'CA GUANGZHOU N558',           etd:'2026-03-23', eta:'2026-03-30', days:7,  price:'51,000,000' },
  { port:'DAL', portName:'Đại Liên 大连',   carrier:'YML',    vessel:'URU BHUM 166N',              etd:'2026-03-26', eta:'2026-04-04', days:9,  price:'45,000,000' },
  { port:'DAL', portName:'Đại Liên 大连',   carrier:'CMA',    vessel:'AMALFI BAY 0HO39N1NC',       etd:'2026-03-27', eta:'2026-04-05', days:9,  price:'50,000,000' },
  { port:'DAL', portName:'Đại Liên 大连',   carrier:'WHL',    vessel:'WAN HAI 362 N028',           etd:'2026-03-29', eta:'2026-04-05', days:7,  price:'46,000,000' },

  // ── 天津 THIÊN TÂN (TJN) ──
  { port:'TJN', portName:'Thiên Tân 天津',  carrier:'EMC',    vessel:'EVER ORDER 0103 098N',       etd:'2026-03-19', eta:'2026-03-31', days:12, price:'45,000,000' },
  { port:'TJN', portName:'Thiên Tân 天津',  carrier:'CMA',    vessel:'TERATAKI 0XKNSN1NC',         etd:'2026-03-20', eta:'2026-03-28', days:8,  price:'50,000,000' },
  { port:'TJN', portName:'Thiên Tân 天津',  carrier:'COSCO',  vessel:'KANWAY LUCKY 024N',          etd:'2026-03-23', eta:'2026-04-01', days:9,  price:'50,000,000' },
  { port:'TJN', portName:'Thiên Tân 天津',  carrier:'CMA',    vessel:'AMALFI BAY 0HO39N1NC',       etd:'2026-03-27', eta:'2026-04-04', days:8,  price:'50,000,000' },

  // ── 厦门 HẠ MÔN (XIA) ──
  { port:'XIA', portName:'Hạ Môn 厦门',     carrier:'SJJ',    vessel:'XIN AN / 63N',               etd:'2026-03-21', eta:'2026-03-28', days:7,  price:'45,000,000' },

  // ── 蛇口 SHEKOU (SKU) ──
  { port:'SKU', portName:'Shekou 蛇口',     carrier:'WHL',    vessel:'INTERASIA TACTIC N008',      etd:'2026-03-19', eta:'2026-03-22', days:3,  price:'40,000,000' },
  { port:'SKU', portName:'Shekou 蛇口',     carrier:'CMA',    vessel:'TERATAKI 0XKNSN1NC',         etd:'2026-03-20', eta:'2026-03-23', days:3,  price:'45,000,000' },
  { port:'SKU', portName:'Shekou 蛇口',     carrier:'COSCO',  vessel:'HANSA BREITENBURG',          etd:'2026-03-21', eta:'2026-03-26', days:5,  price:'47,000,000' },
  { port:'SKU', portName:'Shekou 蛇口',     carrier:'WHL',    vessel:'WAN HAI 368 N034',           etd:'2026-03-23', eta:'2026-03-27', days:4,  price:'40,000,000' },
  { port:'SKU', portName:'Shekou 蛇口',     carrier:'CMA',    vessel:'CNC CHEETAH 0XKNUN1NC',      etd:'2026-03-27', eta:'2026-03-30', days:3,  price:'45,000,000' },

  // ── 乍浦港 ZHAPU (ZPU) ──
  { port:'ZPU', portName:'Zhapu 乍浦港',    carrier:'NBOSCO', vessel:'XIN MING ZHOU 106 2604N',    etd:'2026-03-04', eta:'2026-03-10', days:6,  price:'41,000,000' },
  { port:'ZPU', portName:'Zhapu 乍浦港',    carrier:'NBOSCO', vessel:'NBOS QIN 2606N',             etd:'2026-03-13', eta:'2026-03-19', days:6,  price:'41,000,000' },
  { port:'ZPU', portName:'Zhapu 乍浦港',    carrier:'NBOSCO', vessel:'XIN MING ZHOU 106 2605N',    etd:'2026-03-18', eta:'2026-03-24', days:6,  price:'41,000,000' },
  { port:'ZPU', portName:'Zhapu 乍浦港',    carrier:'NBOSCO', vessel:'NBOS QIN 2607N',             etd:'2026-03-27', eta:'2026-04-02', days:6,  price:'41,000,000' },
  { port:'ZPU', portName:'Zhapu 乍浦港',    carrier:'NBOSCO', vessel:'XIN MING ZHOU 106 2606N',    etd:'2026-04-01', eta:'2026-04-07', days:6,  price:'41,000,000' },
  { port:'ZPU', portName:'Zhapu 乍浦港',    carrier:'NBOSCO', vessel:'NBOS QIN 2608N',             etd:'2026-04-10', eta:'2026-04-16', days:6,  price:'41,000,000' },
  { port:'ZPU', portName:'Zhapu 乍浦港',    carrier:'NBOSCO', vessel:'XIN MING ZHOU 106 2607N',    etd:'2026-04-15', eta:'2026-04-21', days:6,  price:'41,000,000' },
];

let shipSchedules = [];

function loadSchedules() {
  try {
    const stored = localStorage.getItem(SHIP_SCHEDULES_KEY);
    shipSchedules = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_SHIP_SCHEDULES));
    if (!stored) saveSchedules();
  } catch(e) {
    shipSchedules = JSON.parse(JSON.stringify(DEFAULT_SHIP_SCHEDULES));
    saveSchedules();
  }
}
function saveSchedules() { localStorage.setItem(SHIP_SCHEDULES_KEY, JSON.stringify(shipSchedules)); }

// ══════════════════════════════════════
//  SHIP SCHEDULE — SELECT LOGIC
// ══════════════════════════════════════
function getUniquePorts() {
  const map = {};
  shipSchedules.forEach(s => { map[s.port] = s.portName; });
  return Object.entries(map).sort((a,b) => a[1].localeCompare(b[1]));
}

function getSchedulesByPort(portCode) {
  return shipSchedules.filter(s => s.port === portCode);
}

function populatePortSelect() {
  const sel = document.getElementById('f-cang');
  if (!sel) return;
  const currentVal = sel.value;
  sel.innerHTML = '<option value="">— Chọn cảng đến —</option>';
  getUniquePorts().forEach(([code, name]) => {
    sel.innerHTML += `<option value="${code}" ${code===currentVal?'selected':''}>${code} — ${name}</option>`;
  });
}

function populateVesselSelect(portCode, selectedVessel) {
  const sel = document.getElementById('f-tau');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Chọn tàu / chuyến —</option>';
  if (!portCode) return;

  const today = new Date();
  today.setHours(0,0,0,0);

  const schedules = getSchedulesByPort(portCode);
  schedules.forEach(s => {
    const dateStr = formatDateShort(s.etd);
    const etdDate = new Date(s.etd + 'T00:00:00');
    const daysLeft = Math.ceil((etdDate - today) / (1000*60*60*24));

    // Build countdown label
    let countdownTag = '';
    if (daysLeft < 0) {
      countdownTag = `⛔ đã qua ${Math.abs(daysLeft)} ngày`;
    } else if (daysLeft === 0) {
      countdownTag = '🔴 HÔM NAY';
    } else if (daysLeft <= 2) {
      countdownTag = `🔴 còn ${daysLeft} ngày`;
    } else if (daysLeft <= 5) {
      countdownTag = `🟡 còn ${daysLeft} ngày`;
    } else {
      countdownTag = `🟢 còn ${daysLeft} ngày`;
    }

    const label = `${s.carrier} | ${s.vessel} | ETD ${dateStr} (${countdownTag}) | ${s.days}d transit | ${s.price}đ`;
    const val = JSON.stringify({ carrier: s.carrier, vessel: s.vessel, etd: s.etd, eta: s.eta, days: s.days, price: s.price });
    const isSelected = selectedVessel === s.vessel ? 'selected' : '';
    sel.innerHTML += `<option value='${val}' ${isSelected}>${label}</option>`;
  });
  // Option for manual input
  sel.innerHTML += '<option value="__manual__">✏️ Nhập tay...</option>';
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
}

function onPortChange() {
  const portSel = document.getElementById('f-cang');
  const portCode = portSel.value;
  populateVesselSelect(portCode, '');
  // Clear dependent fields
  document.getElementById('f-hang').value = '';
  document.getElementById('f-etd').value = '';
  document.getElementById('f-eta').value = '';
}

function onVesselChange() {
  const vesselSel = document.getElementById('f-tau');
  const val = vesselSel.value;

  if (val === '__manual__') {
    // Switch to manual input mode
    switchToManualVessel();
    return;
  }

  if (!val) {
    document.getElementById('f-hang').value = '';
    document.getElementById('f-etd').value = '';
    document.getElementById('f-eta').value = '';
    document.getElementById('f-gia').value = '';
    return;
  }

  try {
    const data = JSON.parse(val);
    document.getElementById('f-hang').value = data.carrier || '';
    document.getElementById('f-etd').value = data.etd || '';
    document.getElementById('f-eta').value = data.eta || '';
    document.getElementById('f-gia').value = data.price || '';
  } catch(e) {}
}

function switchToManualVessel() {
  const container = document.getElementById('f-tau').parentElement;
  const currentVal = document.getElementById('f-tau').dataset.manualVal || '';
  container.innerHTML = `<label data-i18n="lbl.tentau">Tên tàu / Chuyến</label>
    <div style="display:flex;gap:6px">
      <input id="f-tau" placeholder="Nhập tên tàu..." value="${currentVal}" style="flex:1"/>
      <button type="button" class="btn-outline-dcl" style="padding:4px 10px;font-size:.75rem;white-space:nowrap" onclick="switchToSelectVessel()">📋 Chọn từ lịch</button>
    </div>`;
}

function switchToSelectVessel() {
  const container = document.getElementById('f-tau').parentElement.parentElement;
  const manualVal = document.getElementById('f-tau').value;
  container.innerHTML = `<label data-i18n="lbl.tentau">Tên tàu / Chuyến</label><select id="f-tau" onchange="onVesselChange()"></select>`;
  document.getElementById('f-tau').dataset.manualVal = manualVal;
  const portCode = document.getElementById('f-cang').value;
  populateVesselSelect(portCode, '');
}

function getVesselName() {
  const el = document.getElementById('f-tau');
  if (!el) return '';
  // If it's an input (manual mode), return value directly
  if (el.tagName === 'INPUT') return el.value;
  // If it's a select, parse the JSON value to get vessel name
  const val = el.value;
  if (!val || val === '__manual__') return '';
  try {
    const data = JSON.parse(val);
    return data.vessel || '';
  } catch(e) {
    return val;
  }
}

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

      // Per-container nhaxe (fallback to lot-level)
      const contNhaxe = cont.nhaxe || lot.nhaxe || '—';
      const contNxCls = NXE_CLS[contNhaxe] || 'nxe-ttk';
      const nxBadge = contNhaxe && contNhaxe !== '—'
        ? `<span class="nxe ${contNxCls}">${contNhaxe}</span>`
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
//  DISPATCH — HELPER FUNCTIONS
// ══════════════════════════════════════
function calcDateOffset(dateStr, days) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  } catch(e) { return ''; }
}

function getETDValue() {
  const el = document.getElementById('f-etd');
  if (!el || !el.value) return '';
  // If value is dd/mm format, convert
  if (el.value.includes('-')) return el.value;
  return ddmmToDate(el.value);
}

function formatVND(num) {
  if (!num || isNaN(num)) return '0';
  return Math.round(num).toLocaleString('vi-VN');
}

function parseVND(str) {
  if (!str) return 0;
  return parseInt(String(str).replace(/[,.đ\s]/g, '')) || 0;
}

function calcHungThinhCost(card) {
  if (!card) return;
  const dv = (f) => { const el = card.querySelector(`[data-field="${f}"]`); return el ? el.value : ''; };
  const nv = (f) => parseVND(dv(f));

  const ngayVao = dv('htNgayVao');
  const ngayRa = dv('htNgayRa');
  let soNgay = 0;
  if (ngayVao && ngayRa) {
    const d1 = new Date(ngayVao + 'T00:00:00');
    const d2 = new Date(ngayRa + 'T00:00:00');
    soNgay = Math.max(0, Math.ceil((d2 - d1) / (1000*60*60*24)));
  }
  const soNgayEl = card.querySelector('.ht-so-ngay');
  if (soNgayEl) soNgayEl.textContent = soNgay + ' ngày';

  // Get fixed cost values
  const phiDien = nv('htPhiDien') || 0;
  const luuBaiRate = nv('htLuuBai') || 0;
  const luuBaiTotal = luuBaiRate * soNgay;
  const nangHa = nv('htNangHa') || 0;
  const trucking = nv('htTrucking') || 0;
  const keoCang = nv('htKeoCang') || 0;
  const demDet = nv('htDemDet') || 0;

  // Calculate extra costs from dynamic rows
  let extraTotal = 0;
  const extraTbody = card.querySelector('.ht-extra-tbody');
  if (extraTbody) {
    extraTbody.querySelectorAll('tr').forEach(tr => {
      const costInput = tr.querySelector('input[data-field^="htExtraCost"]');
      const autoVal = tr.querySelector('.ht-auto-val');
      const val = costInput ? parseVND(costInput.value) : 0;
      extraTotal += val;
      if (autoVal) autoVal.textContent = formatVND(val) + 'đ';
    });
  }

  const subtotal = phiDien + luuBaiTotal + nangHa + trucking + keoCang + demDet + extraTotal;
  const vat = Math.round(subtotal * 0.08);
  const total = subtotal + vat;

  // Update display - fixed row amounts
  const fixedVals = card.querySelectorAll('.ht-fixed-auto-val');
  if (fixedVals.length >= 6) {
    fixedVals[0].textContent = formatVND(phiDien) + 'đ';
    fixedVals[1].textContent = formatVND(luuBaiTotal) + 'đ';
    fixedVals[2].textContent = formatVND(nangHa) + 'đ';
    fixedVals[3].textContent = formatVND(trucking) + 'đ';
    fixedVals[4].textContent = formatVND(keoCang) + 'đ';
    fixedVals[5].textContent = formatVND(demDet) + 'đ';
  }
  const set = (cls, val) => { const el = card.querySelector(cls); if(el) el.textContent = formatVND(val) + 'đ'; };
  set('.ht-subtotal-val', subtotal);
  set('.ht-vat-val', vat);
  set('.ht-total-val', total);

  // Store for summary
  card.setAttribute('data-ht-total', total);
  card.setAttribute('data-ht-extra', extraTotal);
  updateCostSummary();
}

function calcMoocCost(card) {
  if (!card) return;
  const dv = (f) => { const el = card.querySelector(`[data-field="${f}"]`); return el ? el.value : ''; };

  const kehoach = parseInt(dv('kehoach')) || 0;
  const luuMooc = parseInt(dv('luuMooc')) || 0;

  // Phi luu mooc: free 3 days, then 500k/day
  const phiLuuMooc = Math.max(0, luuMooc - 3) * 500000;
  const phiLuuEl = card.querySelector('[data-field="phiMooc"]');
  if (phiLuuEl) phiLuuEl.value = formatVND(phiLuuMooc);

  // Chi phi kehoach mooc
  let chiPhiKehoach = 0;
  if (kehoach == 1 || kehoach == 2 || kehoach == 3) chiPhiKehoach = 500000; // 500k per mooc
  const chiPhiEl = card.querySelector('[data-field="cuonMooc"]');
  if (chiPhiEl) chiPhiEl.value = formatVND(chiPhiKehoach);

  card.setAttribute('data-mooc-luu', phiLuuMooc);
  card.setAttribute('data-mooc-kehoach', chiPhiKehoach);
  updateCostSummary();
}

function calcMoocFromDates(card) {
  if (!card) return;
  const dv = (f) => { const el = card.querySelector(`[data-field="${f}"]`); return el ? el.value : ''; };

  // Ưu tiên ngày thực tế, fallback ngày dự kiến
  const ngayToiKho = dv('ngayToiKhoTT') || dv('ngayToiKho');
  const ngayMoocOLai = dv('ngayMoocOLai');

  if (ngayToiKho && ngayMoocOLai) {
    const d1 = new Date(ngayToiKho + 'T00:00:00');
    const d2 = new Date(ngayMoocOLai + 'T00:00:00');
    const days = Math.max(0, Math.ceil((d2 - d1) / (1000*60*60*24)));
    const luuMoocEl = card.querySelector('[data-field="luuMooc"]');
    if (luuMoocEl) luuMoocEl.value = days;
  }
  calcMoocCost(card);
}

function checkWarehouseDateWarnings(card) {
  if (!card) return;
  const etd = getETDValue();
  const ngayDuHang = card.querySelector('[data-field="ngayDuHang"]');
  if (!ngayDuHang) return;

  const duHangVal = ngayDuHang.value;
  const warnKD = card.querySelector('.warn-kiem-dich');
  const warnBai = card.querySelector('.warn-vao-bai');
  const lyDoWrap = card.querySelector('.lydo-tre-wrap');

  let hasWarning = false;

  function fmtDate(d) { const p=d.split('-'); return p.length===3 ? p[2]+'/'+p[1]+'/'+p[0] : d; }

  if (warnKD) {
    warnKD.classList.remove('visible');
    warnKD.innerHTML = '';
    if (etd && duHangVal) {
      const ngayKD = calcDateOffset(etd, -4);
      if (ngayKD && duHangVal > ngayKD) {
        const d1 = new Date(ngayKD + 'T00:00:00');
        const d2 = new Date(duHangVal + 'T00:00:00');
        const diff = Math.ceil((d2 - d1) / (1000*60*60*24));
        warnKD.innerHTML = `⚠ <b>Quá ngày kiểm dịch!</b> Hạn KD: <b>${fmtDate(ngayKD)}</b> → Chất hàng: <b>${fmtDate(duHangVal)}</b> | Trễ <b style="color:#c53030;font-size:.9rem">${diff} ngày</b>`;
        warnKD.classList.add('visible');
        hasWarning = true;
      }
    }
  }

  if (warnBai) {
    warnBai.classList.remove('visible');
    warnBai.innerHTML = '';
    if (etd && duHangVal) {
      const ngayBai = calcDateOffset(etd, -2);
      if (ngayBai && duHangVal > ngayBai) {
        const d1 = new Date(ngayBai + 'T00:00:00');
        const d2 = new Date(duHangVal + 'T00:00:00');
        const diff = Math.ceil((d2 - d1) / (1000*60*60*24));
        warnBai.innerHTML = `⚠ <b>Quá ngày vào bãi tàu!</b> Hạn bãi: <b>${fmtDate(ngayBai)}</b> → Chất hàng: <b>${fmtDate(duHangVal)}</b> | Trễ <b style="color:#c53030;font-size:.9rem">${diff} ngày</b>`;
        warnBai.classList.add('visible');
        hasWarning = true;
      }
    }
  }

  if (lyDoWrap) {
    lyDoWrap.style.display = hasWarning ? 'block' : 'none';
  }
}

function toggleKiemDich(card) {
  if (!card) return;
  const sel = card.querySelector('[data-field="kiemDich"]');
  const wrap = card.querySelector('.kd-date-wrap');
  if (sel && wrap) {
    wrap.style.display = sel.value === '1' ? 'block' : 'none';
  }
}

function addHtExtraCost(btn) {
  const card = btn.closest('.dispatch-card');
  const tbody = card.querySelector('.ht-extra-tbody');
  if (!tbody) return;
  const rowCount = tbody.querySelectorAll('tr').length;
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-field="htExtraName_${rowCount}" placeholder="Tên chi phí..." style="width:100%"/></td>
    <td><input data-field="htExtraCost_${rowCount}" value="0" onchange="calcHungThinhCost(this.closest('.dispatch-card'))" style="width:100%"/></td>
    <td class="ht-auto-val">0đ</td>
    <td style="width:30px;text-align:center"><button type="button" onclick="this.closest('tr').remove();calcHungThinhCost(this.closest('.dispatch-card'))" style="border:none;background:none;color:#c53030;cursor:pointer;font-size:.85rem">✕</button></td>`;
  tbody.appendChild(tr);
}

function toggleBaiDay(card) {
  if (!card) return;
  const sel = card.querySelector('[data-field="baiDay"]');
  const section = card.querySelector('.ht-section');
  if (sel && section) {
    if (sel.value === '1') {
      section.classList.add('visible');
    } else {
      section.classList.remove('visible');
    }
  }
  updateCostSummary();
}

function updateCostSummary() {
  const wrapper = document.getElementById('cost-summary-wrapper');
  if (!wrapper) return;

  const cards = document.querySelectorAll('.dispatch-card');
  if (cards.length === 0) { wrapper.innerHTML = ''; return; }

  // Preserve values
  const existingKhac = wrapper.querySelector('#cs-chi-phi-khac');
  const khacVal = existingKhac ? existingKhac.value : '0';

  // ── Build per-container rows ──
  let grandTotal = 0;
  let contRows = '';

  cards.forEach((card, idx) => {
    const contNum = card.querySelector('.dc-cont-num');
    const contLabel = contNum ? contNum.textContent : `Container ${idx+1}`;
    const nhaxeEl = card.querySelector('[data-field="nhaxe"]');
    const nhaxe = nhaxeEl ? nhaxeEl.value : '—';
    const luuMoocEl = card.querySelector('[data-field="luuMooc"]');
    const luuMoocNgay = parseInt(luuMoocEl ? luuMoocEl.value : 0) || 0;
    const kehoachEl = card.querySelector('[data-field="kehoach"]');
    const kehoachVal = parseInt(kehoachEl ? kehoachEl.value : 0) || 0;

    // Read pre-calculated values from data attributes
    const moocLuu = parseInt(card.getAttribute('data-mooc-luu')) || 0;
    const moocKH = parseInt(card.getAttribute('data-mooc-kehoach')) || 0;
    const htTotal = parseInt(card.getAttribute('data-ht-total')) || 0;

    const baiDayEl = card.querySelector('[data-field="baiDay"]');
    const hasBaiDay = baiDayEl && baiDayEl.value === '1';

    const contTotal = moocLuu + moocKH + htTotal;
    grandTotal += contTotal;

    // ── Build detail lines ──
    let details = '';

    // MOOC section
    const kehoachLabels = {0:'Đổi rỗng (free)', 1:'Cắt mooc mới', 2:'Cuốn mooc', 3:'Rút mooc'};
    const kehoachLabel = kehoachLabels[kehoachVal] || '—';

    if (moocKH > 0 || moocLuu > 0 || luuMoocNgay > 0) {
      details += `<div style="margin-bottom:4px"><b style="color:var(--slate)"> Nhà xe: ${nhaxe}</b></div>`;
      details += `<div>• Kế hoạch: ${kehoachLabel}`;
      if (moocKH > 0) details += ` → <b style="color:#c53030">${formatVND(moocKH)}đ</b>`;
      details += `</div>`;

      if (luuMoocNgay > 0) {
        const freeD = Math.min(luuMoocNgay, 3);
        const chargeD = Math.max(0, luuMoocNgay - 3);
        if (chargeD > 0) {
          details += `<div>• Lưu mooc: ${luuMoocNgay} ngày (free ${freeD}d + ${chargeD}d × 500k) → <b style="color:#c53030">${formatVND(moocLuu)}đ</b></div>`;
        } else {
          details += `<div>• Lưu mooc: ${luuMoocNgay} ngày <span style="color:#38a169">(miễn phí)</span></div>`;
        }
      }
    } else {
      details += `<div style="color:#8898aa">${nhaxe} — Chưa phát sinh mooc</div>`;
    }

    // HT section
    if (hasBaiDay && htTotal > 0) {
      // Read the HT total-val text directly from the card (already calculated by calcHungThinhCost)
      const htTotalEl = card.querySelector('.ht-total-val');
      const htTotalText = htTotalEl ? htTotalEl.textContent : formatVND(htTotal) + 'đ';
      details += `<div style="margin-top:4px;padding-top:4px;border-top:1px dashed #e0e7f0"><b style="color:#7a4a00">Bãi Hưng Thịnh</b> → <b style="color:#c53030">${htTotalText}</b> <span style="color:#8898aa;font-size:.7rem">(incl. VAT 8%)</span></div>`;
    } else if (hasBaiDay) {
      details += `<div style="margin-top:4px;padding-top:4px;border-top:1px dashed #e0e7f0;color:#8898aa">Bãi HT — Chưa nhập ngày</div>`;
    }

    // Row style: highlight if has costs
    const rowBg = contTotal > 0 ? 'background:rgba(197,48,48,.03);' : '';

    contRows += `<tr style="${rowBg}">
      <td class="cs-vendor-name">
        <span style="background:var(--navy);color:#fff;padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700">#${idx+1}</span><br>
        <span style="font-size:.72rem;color:var(--navy);font-weight:600;word-break:break-all">${contLabel}</span>
      </td>
      <td>${details}</td>
      <td class="cs-amount" style="font-size:1rem;${contTotal > 0 ? 'color:#c53030;font-weight:700' : 'color:#8898aa'}">${formatVND(contTotal)}đ</td>
    </tr>`;
  });

  // ── Chi phí khác ──
  const khacAmount = parseVND(khacVal);
  grandTotal += khacAmount;

  // ── Assemble HTML ──
  let html = `<div class="cost-summary-section">
    <div class="cs-title">Bảng chi phí phát sinh dự kiến 预估额外费用</div>
    <table class="cost-summary-table">
      <thead><tr>
        <th style="width:160px">Container</th>
        <th>Chi tiết phát sinh</th>
        <th style="text-align:right;width:120px">Thành tiền</th>
      </tr></thead>
      <tbody>
        ${contRows}
        <tr>
          <td class="cs-vendor-name">Chi phí khác</td>
          <td><input id="cs-chi-phi-khac" value="${khacVal}" placeholder="Nhập số tiền..." style="width:160px;padding:4px 8px;border:1px solid #d0d8e8;border-radius:6px;font-size:.78rem" onchange="updateCostSummary()"/></td>
          <td class="cs-amount">${formatVND(khacAmount)}đ</td>
        </tr>
        <tr class="cs-grand-total">
          <td colspan="2" style="text-align:right;padding-right:16px;font-size:.88rem">TỔNG CỘNG 总额外费用</td>
          <td class="cs-amount cs-total" style="font-size:1.1rem">${formatVND(grandTotal)}đ</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top:8px;font-size:.7rem;color:#8898aa;font-style:italic">
      * Phí lưu mooc: miễn phí 3 ngày đầu, 500,000đ/ngày từ ngày thứ 4.<br>
      * Phí bãi HT đã bao gồm VAT 8%. Số liệu lấy trực tiếp từ bảng chi phí HT ở mỗi container.
    </div>
  </div>`;

  wrapper.innerHTML = html;
}

// ══════════════════════════════════════
//  DISPATCH CARDS (per-container) — v2
// ══════════════════════════════════════
function renderDispatchCards(lot) {
  const list = document.getElementById('dispatch-list');
  if (!list) return;
  list.innerHTML = '';

  const etd = getETDValue();
  const containers = lot.containers || [];
  containers.forEach((c, idx) => {
    // Backward compat defaults
    const d = {
      nhaxe:       c.nhaxe       || (idx === 0 ? (lot.nhaxe || '') : ''),
      kiemDich:    c.kiemDich    != null ? String(c.kiemDich) : '0',
      ngayKiemDich:c.ngayKiemDich|| '',
      ngayVaoBai:  c.ngayVaoBai  || '',
      baiDay:      c.baiDay      != null ? String(c.baiDay) : '0',
      htNgayVao:   c.htNgayVao   || '',
      htNgayRa:    c.htNgayRa    || '',
      htPhiDien:   c.htPhiDien   || '3,960,000',
      htLuuBai:    c.htLuuBai    || '100,000',
      htNangHa:    c.htNangHa    || '500,000',
      htTrucking:  c.htTrucking  || '1,000,000',
      htKeoCang:   c.htKeoCang   || '2,000,000',
      htDemDet:    c.htDemDet    || '2,000,000',
      htExtras:    c.htExtras    || [], // [{name:'...', cost:'...'}]
      taiXe:       c.taiXe       || '',
      sdtTaiXe:    c.sdtTaiXe    || '',
      ngayToiKho:  c.ngayToiKho  || '',
      ngayToiKhoTT:c.ngayToiKhoTT|| '',
      ngayMoocOLai:c.ngayMoocOLai|| '',
      kehoach:     c.kehoach     != null ? c.kehoach : (idx === 0 ? (lot.kehoach || 0) : 0),
      luuMooc:     c.luuMooc     != null ? c.luuMooc : (idx === 0 ? (lot.luuMooc || 0) : 0),
      phiMooc:     c.phiMooc     || (idx === 0 ? (lot.phiMooc || '0') : '0'),
      cuonMooc:    c.cuonMooc    || (idx === 0 ? (lot.cuonMooc || '0') : '0'),
      khuVuc:      c.khuVuc      || '',
      tenKho:      c.tenKho      || '',
      nhanVienKho: c.nhanVienKho || '',
      sdtKho:      c.sdtKho      || '',
      ngayDuHang:  c.ngayDuHang  || '',
      lyDoTre:     c.lyDoTre     || '',
      ghiChuDCL:   c.ghiChuDCL   || '',
      ghiChuCont:  c.ghiChuCont  || ''
    };

    // Auto-calc default dates from ETD
    if (!d.ngayKiemDich && etd) d.ngayKiemDich = calcDateOffset(etd, -4);
    if (!d.ngayVaoBai && etd) d.ngayVaoBai = calcDateOffset(etd, -2);

    const contLabel = c.cont || `Container ${idx + 1}`;
    const nhaxeDisplay = d.nhaxe || '—';
    const showKD = d.kiemDich === '1';

    // Calculate HT days for initial display
    let htSoNgay = 0;
    if (d.htNgayVao && d.htNgayRa) {
      htSoNgay = Math.max(0, Math.ceil((new Date(d.htNgayRa+'T00:00:00') - new Date(d.htNgayVao+'T00:00:00')) / (1000*60*60*24)));
    }

    // Build HT extra rows HTML
    let htExtrasHtml = '';
    (d.htExtras || []).forEach((ex, ei) => {
      htExtrasHtml += `<tr>
        <td><input data-field="htExtraName_${ei}" value="${ex.name||''}" placeholder="Tên chi phí..." style="width:100%"/></td>
        <td><input data-field="htExtraCost_${ei}" value="${ex.cost||'0'}" onchange="calcHungThinhCost(this.closest('.dispatch-card'))" style="width:100%"/></td>
        <td class="ht-auto-val">${ex.cost||'0'}đ</td>
        <td style="width:30px;text-align:center"><button type="button" onclick="this.closest('tr').remove();calcHungThinhCost(this.closest('.dispatch-card'))" style="border:none;background:none;color:#c53030;cursor:pointer;font-size:.85rem">✕</button></td>
      </tr>`;
    });

    const card = document.createElement('div');
    card.className = 'dispatch-card';
    card.setAttribute('data-idx', idx);
    card.setAttribute('data-ht-total', '0');
    card.setAttribute('data-ht-extra', '0');
    card.setAttribute('data-mooc-luu', '0');
    card.setAttribute('data-mooc-kehoach', '0');

    card.innerHTML = `
      <div class="dc-header" onclick="toggleDispatchCard(this)">
        <span class="dc-cont-badge">#${idx + 1}</span>
        <span class="dc-cont-num">${contLabel}</span>
        <span class="dc-nhaxe-tag">${nhaxeDisplay}</span>
        <span class="dc-toggle">▼</span>
      </div>
      <div class="dc-body">

        <!-- ═══ SECTION 1: Thông tin chung ═══ -->
        <div class="dc-section-title">Thông tin chung</div>
        <div class="form-grid-3">
          <div class="form-group"><label>Kiểm dịch 检疫</label>
            <select data-field="kiemDich" onchange="toggleKiemDich(this.closest('.dispatch-card'))">
              <option value="0" ${d.kiemDich==='0'?'selected':''}>Không</option>
              <option value="1" ${d.kiemDich==='1'?'selected':''}>Có</option>
            </select>
          </div>
          <div class="form-group kd-date-wrap" style="display:${showKD?'block':'none'}">
            <label>Ngày kiểm dịch 检疫日 <span class="dc-auto-badge">ETD-4</span></label>
            <input type="date" data-field="ngayKiemDich" value="${d.ngayKiemDich}"/>
            <div class="dc-hint">${etd ? 'Tự tính: ETD(' + dateToDdmm(etd) + ') - 4 ngày' : 'Chưa có ETD'}</div>
          </div>
          <div class="form-group">
            <label>Ngày vào bãi tàu (lý tưởng) 进港日 <span class="dc-auto-badge">ETD-2</span></label>
            <input type="date" data-field="ngayVaoBai" value="${d.ngayVaoBai}"/>
            <div class="dc-hint">${etd ? 'Tự tính: ETD(' + dateToDdmm(etd) + ') - 2 ngày' : 'Chưa có ETD'}</div>
          </div>
        </div>

        <!-- ═══ SECTION 2: Nhà xe (gom tài xế + kế hoạch) ═══ -->
        <div class="dc-section-title">Nhà xe & Tài xế</div>
        <div class="form-grid-3">
          <div class="form-group"><label>Nhà xe vận chuyển</label>
            <select data-field="nhaxe" onchange="updateDispatchBadge(this)">
              <option value="">— Chọn nhà xe —</option>
              <option value="TTK" ${d.nhaxe==='TTK'?'selected':''}>TTK (Tân Trường Khoa)</option>
              <option value="LINKLUCK" ${d.nhaxe==='LINKLUCK'?'selected':''}>LINKLUCK</option>
              <option value="VT LSG" ${d.nhaxe==='VT LSG'?'selected':''}>VT Lạnh Sài Gòn</option>
              <option value="PT GLOBAL" ${d.nhaxe==='PT GLOBAL'?'selected':''}>PT Global</option>
            </select>
          </div>
          <div class="form-group"><label>Tài xế 司机</label><input type="text" data-field="taiXe" value="${d.taiXe}" placeholder="Tên tài xế..."/></div>
          <div class="form-group"><label>SĐT tài xế 电话</label><input type="text" data-field="sdtTaiXe" value="${d.sdtTaiXe}" placeholder="0xxx..."/></div>
          <div class="form-group"><label>Ngày tới kho (dự kiến)</label><input type="date" data-field="ngayToiKho" value="${d.ngayToiKho}" onchange="calcMoocFromDates(this.closest('.dispatch-card'))"/></div>
          <div class="form-group"><label>Ngày tới kho (thực tế)</label><input type="date" data-field="ngayToiKhoTT" value="${d.ngayToiKhoTT}" onchange="calcMoocFromDates(this.closest('.dispatch-card'))"/></div>
          <div class="form-group"><label>Kế hoạch mooc 车架计划</label>
            <select data-field="kehoach" onchange="calcMoocCost(this.closest('.dispatch-card'))">
              <option value="0" ${d.kehoach==0?'selected':''}>Đổi rỗng 还重 (miễn phí)</option>
              <option value="1" ${d.kehoach==1?'selected':''}>Cắt mooc mới 新车架 (500,000đ)</option>
              <option value="2" ${d.kehoach==2?'selected':''}>Cuốn mooc 还车架 (500,000đ)</option>
              <option value="3" ${d.kehoach==3?'selected':''}>Rút mooc (500,000đ)</option>
            </select>
          </div>
          <div class="form-group"><label>Chi phí mooc <span class="dc-auto-badge">Tự tính</span></label>
            <input data-field="cuonMooc" value="${d.cuonMooc}" readonly style="background:#f0f3f7;cursor:not-allowed"/>
          </div>
          <div class="form-group">
            <label>Ngày mooc ở lại 车架留日</label>
            <input type="date" data-field="ngayMoocOLai" value="${d.ngayMoocOLai}" onchange="calcMoocFromDates(this.closest('.dispatch-card'))"/>
            <div class="dc-hint">Chọn ngày → tự tính số ngày lưu mooc</div>
          </div>
          <div class="form-group">
            <label>Lưu mooc (ngày) <span class="dc-auto-badge">Tự tính</span></label>
            <input type="number" data-field="luuMooc" value="${d.luuMooc}" min="0" onchange="calcMoocCost(this.closest('.dispatch-card'))" style="background:#f0f3f7"/>
            <div class="dc-hint">Miễn phí 3 ngày đầu, sau đó 500,000đ/ngày</div>
          </div>
          <div class="form-group"><label>Phí lưu mooc <span class="dc-auto-badge">Tự tính</span></label>
            <input data-field="phiMooc" value="${d.phiMooc}" readonly style="background:#f0f3f7;cursor:not-allowed"/>
          </div>
        </div>

        <!-- ═══ SECTION 3: Nhà kho ═══ -->
        <div class="dc-section-title">Nhà kho</div>
        <div class="form-grid-3">
          <div class="form-group"><label>Khu vực 地区</label>
            <select data-field="khuVuc">
              <option value="">— Chọn khu vực —</option>
              <option value="Trảng Bom" ${d.khuVuc==='Trảng Bom'?'selected':''}>Trảng Bom</option>
              <option value="Thống Nhất" ${d.khuVuc==='Thống Nhất'?'selected':''}>Thống Nhất</option>
              <option value="Bình Phước" ${d.khuVuc==='Bình Phước'?'selected':''}>Bình Phước</option>
              <option value="Tây Ninh" ${d.khuVuc==='Tây Ninh'?'selected':''}>Tây Ninh</option>
              <option value="Củ Chi" ${d.khuVuc==='Củ Chi'?'selected':''}>Củ Chi</option>
              <option value="Long Khánh" ${d.khuVuc==='Long Khánh'?'selected':''}>Long Khánh</option>
              <option value="Cẩm Mỹ" ${d.khuVuc==='Cẩm Mỹ'?'selected':''}>Cẩm Mỹ</option>
              <option value="Vũng Tàu" ${d.khuVuc==='Vũng Tàu'?'selected':''}>Vũng Tàu</option>
              <option value="Khác" ${d.khuVuc==='Khác'?'selected':''}>Khác</option>
            </select>
          </div>
          <div class="form-group"><label>Tên nhà kho 仓库名</label><input type="text" data-field="tenKho" value="${d.tenKho}"/></div>
          <div class="form-group"><label>Nhân viên kho 仓库员工</label><input type="text" data-field="nhanVienKho" value="${d.nhanVienKho}"/></div>
          <div class="form-group"><label>SĐT kho 仓库电话</label><input type="text" data-field="sdtKho" value="${d.sdtKho}"/></div>
          <div class="form-group" style="grid-column: span 2">
            <label style="font-weight:700;color:var(--navy)">Ngày chất đủ hàng 装满日期</label>
            <input type="date" data-field="ngayDuHang" value="${d.ngayDuHang}" style="border:2px solid var(--slate)" onchange="checkWarehouseDateWarnings(this.closest('.dispatch-card'))"/>
            <div class="date-warning warn-kiem-dich"></div>
            <div class="date-warning warn-vao-bai"></div>
          </div>
        </div>
        <div class="lydo-tre-wrap" style="display:none">
          <div class="form-grid-2">
            <div class="form-group"><label style="color:#c53030;font-weight:700">⚠ Lý do kho trễ 延迟原因</label><textarea data-field="lyDoTre" placeholder="Kho báo lý do trễ...">${d.lyDoTre}</textarea></div>
            <div class="form-group"><label>Ghi chú ĐCL về việc trễ</label><textarea data-field="ghiChuDCL" placeholder="Ghi chú nội bộ ĐCL...">${d.ghiChuDCL}</textarea></div>
          </div>
        </div>

        <!-- ═══ SECTION 4: Bãi đầy → Hưng Thịnh ═══ -->
        <div class="dc-section-title">Bãi tàu</div>
        <div class="form-grid-3">
          <div class="form-group"><label>Bãi đầy? 堆场满</label>
            <select data-field="baiDay" onchange="toggleBaiDay(this.closest('.dispatch-card'))">
              <option value="0" ${d.baiDay==='0'?'selected':''}>Không</option>
              <option value="1" ${d.baiDay==='1'?'selected':''}>Có — chuyển qua bãi Hưng Thịnh</option>
            </select>
          </div>
        </div>
        <div class="ht-section ${d.baiDay==='1'?'visible':''}">
          <div style="font-weight:700;color:#7a4a00;font-size:.85rem;margin-bottom:10px;padding:6px 10px;background:#fff3cd;border-radius:6px;display:inline-block">🏗 Bãi Hưng Thịnh 兴盛堆场</div>
          <div class="form-grid-3">
            <div class="form-group"><label>Ngày vào bãi HT</label><input type="date" data-field="htNgayVao" value="${d.htNgayVao}" onchange="calcHungThinhCost(this.closest('.dispatch-card'))"/></div>
            <div class="form-group"><label>Ngày ra bãi HT</label><input type="date" data-field="htNgayRa" value="${d.htNgayRa}" onchange="calcHungThinhCost(this.closest('.dispatch-card'))"/></div>
            <div class="form-group"><label>Số ngày lưu bãi</label><span class="ht-so-ngay" style="font-weight:700;color:var(--navy);font-size:1rem;display:block;padding:6px 0">${htSoNgay} ngày</span></div>
          </div>
          <table class="ht-cost-table">
            <thead><tr><th style="width:40%">Hạng mục 项目</th><th>Đơn giá / Ghi chú</th><th style="width:120px;text-align:right">Thành tiền</th><th style="width:30px"></th></tr></thead>
            <tbody>
              <tr><td>1. Phí điện 电费</td><td><input data-field="htPhiDien" value="${d.htPhiDien}" onchange="calcHungThinhCost(this.closest('.dispatch-card'))"/></td><td class="ht-fixed-auto-val" style="text-align:right">${d.htPhiDien}đ</td><td></td></tr>
              <tr><td>2. Phí lưu bãi 堆场费</td><td><input data-field="htLuuBai" value="${d.htLuuBai}" onchange="calcHungThinhCost(this.closest('.dispatch-card'))"/> <span style="color:#8898aa;font-size:.72rem">× số ngày</span></td><td class="ht-fixed-auto-val" style="text-align:right">0đ</td><td></td></tr>
              <tr><td>3. Nâng hạ 吊装费</td><td><input data-field="htNangHa" value="${d.htNangHa}" onchange="calcHungThinhCost(this.closest('.dispatch-card'))"/></td><td class="ht-fixed-auto-val" style="text-align:right">${d.htNangHa}đ</td><td></td></tr>
              <tr><td>4. Trucking 拖车费</td><td><input data-field="htTrucking" value="${d.htTrucking}" onchange="calcHungThinhCost(this.closest('.dispatch-card'))"/></td><td class="ht-fixed-auto-val" style="text-align:right">${d.htTrucking}đ</td><td></td></tr>
              <tr><td>5. Kéo cont về cảng HP 拖柜到协福港</td><td><input data-field="htKeoCang" value="${d.htKeoCang}" onchange="calcHungThinhCost(this.closest('.dispatch-card'))"/></td><td class="ht-fixed-auto-val" style="text-align:right">${d.htKeoCang}đ</td><td></td></tr>
              <tr><td>6. DEM/DET phát sinh 滞箱/滞港费</td><td><input data-field="htDemDet" value="${d.htDemDet}" onchange="calcHungThinhCost(this.closest('.dispatch-card'))"/></td><td class="ht-fixed-auto-val" style="text-align:right">${d.htDemDet}đ</td><td></td></tr>
            </tbody>
            <tbody class="ht-extra-tbody">${htExtrasHtml}</tbody>
            <tbody>
              <tr><td colspan="4" style="padding:4px"><button type="button" onclick="addHtExtraCost(this)" style="background:none;border:1px dashed #b0b8c8;border-radius:6px;padding:4px 12px;font-size:.72rem;color:var(--slate);cursor:pointer;width:100%">+ Thêm chi phí phát sinh</button></td></tr>
              <tr class="ht-subtotal"><td colspan="3" style="text-align:right;font-weight:700">Tạm tính 小计</td><td class="ht-subtotal-val" style="text-align:right;font-weight:700">0đ</td></tr>
              <tr><td colspan="3" style="text-align:right">VAT 8%</td><td class="ht-vat-val" style="text-align:right">0đ</td></tr>
              <tr class="ht-total"><td colspan="3" style="text-align:right;font-weight:700;font-size:.88rem">TỔNG 合计</td><td class="ht-total-val" style="text-align:right;font-weight:700;font-size:.88rem;color:#c53030">0đ</td></tr>
            </tbody>
          </table>
        </div>

      </div>`;

    list.appendChild(card);

    // Initial calculations
    if (d.baiDay === '1') calcHungThinhCost(card);
    calcMoocCost(card);
    checkWarehouseDateWarnings(card);
  });

  // Build cost summary
  updateCostSummary();
}

function toggleDispatchCard(header) {
  header.closest('.dispatch-card').classList.toggle('collapsed');
}

function updateDispatchBadge(sel) {
  const card = sel.closest('.dispatch-card');
  const badge = card.querySelector('.dc-nhaxe-tag');
  if (badge) badge.textContent = sel.value || '\u2014';
  updateNhaxeSummary();
  updateCostSummary();
}

function deriveNhaxeFromDispatch() {
  const cards = document.querySelectorAll('.dispatch-card');
  const nhaxes = [];
  cards.forEach(card => {
    const el = card.querySelector('[data-field="nhaxe"]');
    if (el && el.value) nhaxes.push(el.value);
  });
  const unique = [...new Set(nhaxes)];
  if (unique.length === 0) return '\u2014';
  if (unique.length === 1) return unique[0];
  return unique.join(' / ');
}

function updateNhaxeSummary() {
  const summary = deriveNhaxeFromDispatch();
  const el = document.getElementById('f-nhaxe');
  if (el) el.value = summary;
}

function applyFirstDispatchToAll() {
  const cards = document.querySelectorAll('.dispatch-card');
  if (cards.length < 2) return;

  const firstCard = cards[0];
  const fields = [
    'nhaxe','kiemDich','ngayKiemDich','ngayVaoBai','baiDay',
    'htNgayVao','htNgayRa','htPhiDien','htLuuBai','htNangHa','htTrucking','htKeoCang','htDemDet',
    'taiXe','sdtTaiXe','ngayToiKho','ngayToiKhoTT','ngayMoocOLai',
    'kehoach','luuMooc','phiMooc','cuonMooc',
    'khuVuc','tenKho','nhanVienKho','sdtKho','ngayDuHang','lyDoTre','ghiChuDCL'
  ];

  const firstVals = {};
  fields.forEach(f => {
    const el = firstCard.querySelector(`[data-field="${f}"]`);
    if (el) firstVals[f] = el.value;
  });

  for (let i = 1; i < cards.length; i++) {
    fields.forEach(f => {
      const el = cards[i].querySelector(`[data-field="${f}"]`);
      if (el) el.value = firstVals[f] || '';
    });
    // Update nhaxe badge
    const badge = cards[i].querySelector('.dc-nhaxe-tag');
    if (badge) badge.textContent = firstVals.nhaxe || '\u2014';
    // Toggle sections
    toggleKiemDich(cards[i]);
    toggleBaiDay(cards[i]);
    // Recalculate costs
    calcHungThinhCost(cards[i]);
    calcMoocCost(cards[i]);
    checkWarehouseDateWarnings(cards[i]);
  }
  updateNhaxeSummary();
  updateCostSummary();
  showToast('\u0110\u00E3 \u00E1p d\u1EE5ng th\u00F4ng tin cont 1 cho t\u1EA5t c\u1EA3 containers');
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
  // Populate port select then set value
  populatePortSelect();
  v('f-cang', lot.cang);
  // Populate vessel select for this port, then try to match
  populateVesselSelect(lot.cang, lot.tau);
  v('f-hang', lot.hang);
  // Set ETD/ETA - try yyyy-mm-dd first (new format), fallback to dd/mm conversion
  v('f-ngay-goi', (lot.ngaygoi||'').includes('-') ? lot.ngaygoi : ddmmToDate(lot.ngaygoi));
  v('f-etd', (lot.etd||'').includes('-') ? lot.etd : ddmmToDate(lot.etd));
  v('f-eta', (lot.eta||'').includes('-') ? lot.eta : ddmmToDate(lot.eta));
  v('f-cutoff', (lot.cutoff||'').includes('T') ? lot.cutoff : cutoffToDatetime(lot.cutoff));
  v('f-etd-kho', (lot.etdKho||'').includes('-') ? lot.etdKho : ddmmToDate(lot.etdKho));
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

  // Dieu do (lot-level)
  v('f-ngay-bao', lot.ngayBao);
  v('f-dieu-do', lot.dieuDo);
  v('f-det', lot.det);
  v('f-ghi-chu-dd', lot.ghiChuDD);

  // Dieu do (per-container dispatch cards)
  renderDispatchCards(lot);
  // Update nhaxe summary in General tab
  updateNhaxeSummary();

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
  // Re-populate port select and reset vessel
  populatePortSelect();
  populateVesselSelect('', '');
  // Clear dispatch cards
  const dispatchList = document.getElementById('dispatch-list');
  if (dispatchList) dispatchList.innerHTML = '';
}

function collectModalData() {
  const v = id => { const e = document.getElementById(id); return e ? e.value : ''; };

  // Collect containers (from Tab 2)
  const containers = [];
  document.querySelectorAll('#cont-list .cont-row').forEach((row, idx) => {
    const inputs = row.querySelectorAll('input');
    const sel = row.querySelector('select');
    if (inputs[0] && inputs[0].value.trim()) {
      const contData = {
        cont: inputs[0].value.trim(),
        seal: inputs[1] ? inputs[1].value.trim() : '',
        status: sel ? sel.value : 'empty'
      };
      // Merge dispatch data from Tab 3 dispatch cards
      const dispatchCard = document.querySelector(`.dispatch-card[data-idx="${idx}"]`);
      if (dispatchCard) {
        const dv = (name) => { const el = dispatchCard.querySelector(`[data-field="${name}"]`); return el ? el.value : ''; };
        // Section 1: General & Schedule
        contData.nhaxe = dv('nhaxe');
        contData.kiemDich = dv('kiemDich');
        contData.ngayKiemDich = dv('ngayKiemDich');
        contData.ngayVaoBai = dv('ngayVaoBai');
        contData.baiDay = dv('baiDay');
        // Hung Thinh
        contData.htNgayVao = dv('htNgayVao');
        contData.htNgayRa = dv('htNgayRa');
        contData.htPhiDien = dv('htPhiDien');
        contData.htLuuBai = dv('htLuuBai');
        contData.htNangHa = dv('htNangHa');
        contData.htTrucking = dv('htTrucking');
        contData.htKeoCang = dv('htKeoCang');
        contData.htDemDet = dv('htDemDet');
        // Driver & Carrier
        contData.taiXe = dv('taiXe');
        contData.sdtTaiXe = dv('sdtTaiXe');
        contData.ngayToiKho = dv('ngayToiKho');
        contData.ngayToiKhoTT = dv('ngayToiKhoTT');
        contData.ngayMoocOLai = dv('ngayMoocOLai');
        contData.kehoach = parseInt(dv('kehoach'))||0;
        contData.luuMooc = parseInt(dv('luuMooc'))||0;
        contData.phiMooc = dv('phiMooc');
        contData.cuonMooc = dv('cuonMooc');
        // Warehouse
        contData.khuVuc = dv('khuVuc');
        contData.tenKho = dv('tenKho');
        contData.nhanVienKho = dv('nhanVienKho');
        contData.sdtKho = dv('sdtKho');
        contData.ngayDuHang = dv('ngayDuHang');
        contData.lyDoTre = dv('lyDoTre');
        contData.ghiChuDCL = dv('ghiChuDCL');
        // HT extra costs
        const htExtras = [];
        const extraTbody = dispatchCard.querySelector('.ht-extra-tbody');
        if (extraTbody) {
          extraTbody.querySelectorAll('tr').forEach(tr => {
            const nameInput = tr.querySelector('input[data-field^="htExtraName"]');
            const costInput = tr.querySelector('input[data-field^="htExtraCost"]');
            if (nameInput || costInput) {
              htExtras.push({ name: nameInput ? nameInput.value : '', cost: costInput ? costInput.value : '0' });
            }
          });
        }
        contData.htExtras = htExtras;
        contData.ghiChuCont = dv('ghiChuCont') || '';
      }
      containers.push(contData);
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
    tau: getVesselName(),
    ngaygoi: dateToDdmm(v('f-ngay-goi')),
    etd: dateToDdmm(v('f-etd')),
    eta: dateToDdmm(v('f-eta')),
    cutoff: datetimeToCutoff(v('f-cutoff')),
    etdKho: dateToDdmm(v('f-etd-kho')),
    nhaxe: deriveNhaxeFromDispatch(),
    gia: v('f-gia'),
    tem: v('f-tem') === '1',
    cskh: v('f-cskh'),
    note: v('f-note'),
    containers: containers.length ? containers : [{cont:'—',seal:'—',status:'empty'}],
    // ePort
    ngayEport: v('f-ngay-eport'), eportStatus: parseInt(v('f-eport-status'))||0,
    maHa: v('f-ma-ha'), ngayThanhLy: v('f-ngay-thanh-ly'),
    // Dieu do (lot-level)
    ngayBao: v('f-ngay-bao'),
    dieuDo: v('f-dieu-do'), det: parseInt(v('f-det'))||14, ghiChuDD: v('f-ghi-chu-dd'),
    // Legacy lot-level fields (keep for backward compat)
    ngayCont:'', ngayDay:'', ngayVao:'', ngayRa:'', ngayHa:'',
    kehoach:0, luuMooc:0, phiMooc:'0', cuonMooc:'0',
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

  // When switching to Điều độ tab, sync dispatch cards with current container list
  if (tabId === 'tab-dieudo') {
    syncDispatchWithContainers();
  }
}

function syncDispatchWithContainers() {
  // Collect current containers from Tab 2
  const contRows = document.querySelectorAll('#cont-list .cont-row');
  const existingCards = document.querySelectorAll('.dispatch-card');

  // Build current container list
  const currentConts = [];
  contRows.forEach((row, idx) => {
    const inputs = row.querySelectorAll('input');
    currentConts.push({
      cont: inputs[0] ? inputs[0].value.trim() : '',
      seal: inputs[1] ? inputs[1].value.trim() : ''
    });
  });

  // Collect existing dispatch data
  const existingData = [];
  existingCards.forEach(card => {
    const dv = (name) => { const el = card.querySelector(`[data-field="${name}"]`); return el ? el.value : ''; };
    existingData.push({
      nhaxe: dv('nhaxe'), kiemDich: dv('kiemDich'), ngayKiemDich: dv('ngayKiemDich'),
      ngayVaoBai: dv('ngayVaoBai'), baiDay: dv('baiDay'),
      htNgayVao: dv('htNgayVao'), htNgayRa: dv('htNgayRa'),
      htPhiDien: dv('htPhiDien'), htLuuBai: dv('htLuuBai'), htNangHa: dv('htNangHa'),
      htTrucking: dv('htTrucking'), htKeoCang: dv('htKeoCang'), htDemDet: dv('htDemDet'),
      taiXe: dv('taiXe'), sdtTaiXe: dv('sdtTaiXe'), ngayToiKho: dv('ngayToiKho'),
      ngayToiKhoTT: dv('ngayToiKhoTT'), ngayMoocOLai: dv('ngayMoocOLai'),
      kehoach: dv('kehoach'), luuMooc: dv('luuMooc'), phiMooc: dv('phiMooc'),
      cuonMooc: dv('cuonMooc'),
      khuVuc: dv('khuVuc'), tenKho: dv('tenKho'), nhanVienKho: dv('nhanVienKho'),
      sdtKho: dv('sdtKho'), ngayDuHang: dv('ngayDuHang'), lyDoTre: dv('lyDoTre'),
      ghiChuDCL: dv('ghiChuDCL'),
      ghiChuCont: dv('ghiChuCont')
    });
  });

  // Only re-render if container count changed
  if (currentConts.length !== existingCards.length) {
    const fakeLot = {
      nhaxe: '', ngayCont:'', ngayDay:'', ngayVao:'', ngayRa:'', ngayHa:'',
      kehoach:0, luuMooc:0, phiMooc:'0', cuonMooc:'0',
      containers: currentConts.map((c, i) => ({
        ...c, status: 'empty',
        // Preserve existing dispatch data
        ...(existingData[i] || {})
      }))
    };
    renderDispatchCards(fakeLot);
  }
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
  loadSchedules();
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
