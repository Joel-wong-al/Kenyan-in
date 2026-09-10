/* ═══════════════════════════════════════════════════════════
   Kenyan'in — campus food delivery prototype
   Vanilla JS SPA. Hash router. In-memory state (localStorage).
═══════════════════════════════════════════════════════════ */

// ─── State ──────────────────────────────────────────────────
const STATE_KEY = 'kenyanin.v1';
const defaultState = () => ({
  user: { name: 'Joel Wong', initials: 'JW', sid: '2024001', location: 'Block K, Room 305', locNote: 'Near the whiteboard entrance' },
  role: null, // 'buyer' | 'seller' | 'delivery' | null
  onboarded: false,
  cart: [],           // {itemId, storeId, qty}
  cartStoreId: null,
  cartNote: '',
  deliveryTime: 'ASAP',
  scheduledTime: '12:00',
  paymentMethod: 'gopay',
  _locReturn: '/buyer/home',
  dietary: ['halal', 'veg'],
  orders: [],         // buyer's orders {id, storeId, items, subtotal, fee, delivery, total, status, courier, placedAt, weight}
  sellerOnline: true,
  deliveryOnline: true,
  activeDelivery: null,   // {orderId, step}
  deliveryHistory: [],
  notifications: 3,
  soldOut: [],        // itemIds sold out at seller
  favoriteStores: [1],
});

let state = load();
function load() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) {}
  return defaultState();
}
function save() {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {}
}
function reset() { localStorage.removeItem(STATE_KEY); state = defaultState(); seed(); }

// ─── Seed data ──────────────────────────────────────────────
const stores = [
  { id: 1, name: 'Warung Bu Siti', prep: '~8 min', rating: 4.8, hue: 24, tags: ['Halal', 'Rice Bowls'], desc: 'Homey Indonesian classics', open: true, block: 'Block C' },
  { id: 2, name: 'Kopi Sudut', prep: '~5 min', rating: 4.9, hue: 200, tags: ['Drinks'], desc: 'Coffee & light bites', open: true, block: 'Canteen' },
  { id: 3, name: 'Bakso Kampus', prep: '~12 min', rating: 4.6, hue: 0, tags: ['Halal', 'Noodles'], desc: 'Meatball soup, always fresh', open: true, block: 'Block B' },
  { id: 4, name: 'Green Bowl', prep: '~10 min', rating: 4.7, hue: 120, tags: ['Vegetarian'], desc: 'Salads, bowls, smoothies', open: true, block: 'Block A' },
  { id: 5, name: 'Nasi Padang Uni', prep: '~7 min', rating: 4.7, hue: 40, tags: ['Halal'], desc: 'Padang staples with sambal', open: false, block: 'Block F' },
  { id: 6, name: 'Boba Time', prep: '~4 min', rating: 4.5, hue: 280, tags: ['Drinks'], desc: 'Bubble tea & snacks', open: true, block: 'Canteen' },
];

const menu = {
  1: {
    Mains: [
      { id: 101, name: 'Nasi Ayam Bakar', desc: 'Grilled chicken, rice, sambal, veggies', price: 22000, hue: 30, weight: 0.6, tags: ['halal', 'spicy'] },
      { id: 102, name: 'Nasi Rendang', desc: 'Slow-cooked beef in coconut curry', price: 28000, hue: 15, weight: 0.7, tags: ['halal'] },
      { id: 103, name: 'Nasi Sayur', desc: 'Rice with tofu, tempeh & veggies', price: 18000, hue: 100, weight: 0.5, tags: ['veg', 'halal'] },
      { id: 104, name: 'Ayam Geprek', desc: 'Smashed fried chicken, sambal bawang', price: 24000, hue: 40, weight: 0.6, tags: ['halal', 'spicy'] },
    ],
    Sides: [
      { id: 105, name: 'Tempeh Goreng', desc: 'Crispy fried tempeh, 5 pcs', price: 8000, hue: 45, weight: 0.2, tags: ['veg', 'halal'] },
      { id: 106, name: 'Perkedel', desc: 'Potato patties, 3 pcs', price: 6000, hue: 50, weight: 0.2, tags: ['veg', 'halal'] },
    ],
    Drinks: [
      { id: 107, name: 'Es Teh Manis', desc: 'Sweet iced tea', price: 5000, hue: 30, weight: 0.4, tags: [] },
      { id: 108, name: 'Es Jeruk', desc: 'Fresh iced orange', price: 7000, hue: 40, weight: 0.4, tags: [] },
    ],
  },
  2: {
    Coffee: [
      { id: 201, name: 'Latte', desc: 'Double shot, oat milk option', price: 22000, hue: 30, weight: 0.4, tags: [] },
      { id: 202, name: 'Kopi Susu', desc: 'Indonesian style palm-sugar coffee', price: 18000, hue: 25, weight: 0.4, tags: [] },
    ],
    Bites: [
      { id: 203, name: 'Croissant', desc: 'Butter croissant, warm', price: 12000, hue: 40, weight: 0.15, tags: ['veg'] },
    ],
  },
  3: {
    Mains: [
      { id: 301, name: 'Bakso Spesial', desc: 'Beef meatballs, noodles, broth', price: 28000, hue: 0, weight: 0.6, tags: ['halal'] },
      { id: 302, name: 'Mie Ayam', desc: 'Chicken noodle soup', price: 22000, hue: 30, weight: 0.6, tags: ['halal'] },
    ],
  },
  4: {
    Bowls: [
      { id: 401, name: 'Caesar Salad', desc: 'Romaine, parmesan, croutons', price: 38000, hue: 100, weight: 0.4, tags: ['veg'] },
      { id: 402, name: 'Quinoa Bowl', desc: 'Roast veg, quinoa, tahini', price: 42000, hue: 60, weight: 0.5, tags: ['veg'] },
    ],
  },
  5: {
    Mains: [
      { id: 501, name: 'Nasi Padang Komplit', desc: 'Rice, rendang, sayur, sambal', price: 32000, hue: 20, weight: 0.7, tags: ['halal', 'spicy'] },
    ],
  },
  6: {
    Drinks: [
      { id: 601, name: 'Brown Sugar Boba', desc: 'Fresh milk, tapioca pearls', price: 22000, hue: 30, weight: 0.5, tags: ['veg'] },
      { id: 602, name: 'Matcha Latte', desc: 'Japanese matcha, oat option', price: 24000, hue: 100, weight: 0.5, tags: ['veg'] },
    ],
  },
};

function seed() {
  if (state.orders.length === 0) {
    state.orders.push({
      id: 'KY-1039', storeId: 2, items: [{ id: 201, qty: 1 }, { id: 203, qty: 1 }],
      subtotal: 34000, fee: 6800, delivery: 3000, total: 43800,
      status: 'delivered', courier: 'Nadia S.', placedAt: 'Yesterday', weight: 0.55, rated: 5,
    });
    state.orders.push({
      id: 'KY-1032', storeId: 3, items: [{ id: 301, qty: 1 }],
      subtotal: 28000, fee: 5600, delivery: 3000, total: 36600,
      status: 'delivered', courier: 'Rahmat A.', placedAt: '2 days ago', weight: 0.6, rated: 4,
    });
    state.orders.push({
      id: 'KY-1015', storeId: 4, items: [{ id: 401, qty: 1 }],
      subtotal: 38000, fee: 7600, delivery: 3000, total: 48600,
      status: 'delivered', courier: 'Yudi P.', placedAt: 'Sep 5', weight: 0.4, rated: 0,
    });
  }
  if (state.deliveryHistory.length === 0) {
    state.deliveryHistory = [
      { store: 'Warung Bu Siti', dest: 'Block K · 305', weight: 2.1, fee: 3000, time: '12:04 PM' },
      { store: 'Kopi Sudut', dest: 'Library · 12', weight: 0.9, fee: 3000, time: '11:32 AM' },
      { store: 'Green Bowl', dest: 'Block C · 108', weight: 1.4, fee: 3000, time: '10:48 AM' },
      { store: 'Bakso Kampus', dest: 'Block F · 210', weight: 3.5, fee: 4000, time: '10:14 AM' },
      { store: 'Kopi Sudut', dest: 'Block K · 201', weight: 0.6, fee: 3000, time: '09:32 AM' },
      { store: 'Green Bowl', dest: 'Block A · 12', weight: 1.1, fee: 3000, time: '09:04 AM' },
    ];
  }
  save();
}
seed();

// Available orders for delivery mode (regenerated each visit; not persisted)
function availableOrders() {
  return [
    { orderId: 'KY-1044', store: 'Warung Bu Siti', storeLoc: 'Block C', dest: 'Block K · Rm 305', destUser: 'Aditya P.', items: 3, weight: 2.1, fee: 3000, walk: '~3 min', urgent: false, hue: 24 },
    { orderId: 'KY-1043', store: 'Kopi Sudut', storeLoc: 'Canteen', dest: 'Library · Rm 12', destUser: 'Sarah W.', items: 2, weight: 0.9, fee: 3000, walk: '~5 min', urgent: true, hue: 200 },
    { orderId: 'KY-1041', store: 'Bakso Kampus', storeLoc: 'Block B', dest: 'Block F · Rm 210', destUser: 'Dimas K.', items: 4, weight: 3.5, fee: 4000, walk: '~7 min', urgent: false, hue: 0 },
    { orderId: 'KY-1040', store: 'Green Bowl', storeLoc: 'Block A', dest: 'Block C · Rm 108', destUser: 'Rani F.', items: 1, weight: 0.4, fee: 3000, walk: '~4 min', urgent: false, hue: 120 },
  ];
}

// Incoming orders for seller
function incomingOrders() {
  return [
    { id: 'KY-1044', buyer: 'Aditya P.', time: 'ASAP', placedAt: '12:08 PM', items: [{ name: 'Nasi Ayam Bakar', qty: 1 }, { name: 'Es Teh', qty: 1 }], total: 26000 },
    { id: 'KY-1045', buyer: 'Sarah W.', time: '12:30', placedAt: '12:09 PM', items: [{ name: 'Nasi Rendang', qty: 2 }, { name: 'Es Jeruk', qty: 1 }], total: 44000 },
  ];
}

// ─── Utilities ──────────────────────────────────────────────
const fmt = n => 'Rp ' + n.toLocaleString('id-ID').replace(/,/g, '.');
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function getItem(id) {
  for (const sid in menu) {
    for (const cat in menu[sid]) {
      const it = menu[sid][cat].find(x => x.id === id);
      if (it) return { ...it, storeId: +sid };
    }
  }
  return null;
}
function getStore(id) { return stores.find(s => s.id === id); }

// Map coordinates for each campus block (center as canvas ratio)
const blockCoords = {
  A: [0.21, 0.22], B: [0.45, 0.16], C: [0.68, 0.22],
  K: [0.24, 0.47], Lib: [0.53, 0.44], Cant: [0.78, 0.47],
  D: [0.24, 0.75], E: [0.51, 0.74], F: [0.77, 0.75],
};
function userBlock() {
  const m = (state.user.location || '').match(/Block (\w+)/i);
  return (m && blockCoords[m[1]]) ? m[1] : 'K';
}
function userBlockCoord() { return blockCoords[userBlock()] || blockCoords.K; }
function cartCount() { return state.cart.reduce((n, i) => n + i.qty, 0); }
function cartSubtotal() { return state.cart.reduce((s, i) => s + (getItem(i.id)?.price || 0) * i.qty, 0); }
function cartWeight() { return state.cart.reduce((w, i) => w + (getItem(i.id)?.weight || 0) * i.qty, 0); }
function deliveryFee(w) {
  if (w <= 2.5) return 3000;
  return 3000 + Math.ceil(w - 2.5) * 1000;
}
function platformFee(sub) { return Math.round(sub * 0.20); }

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

// ─── Icon library ───────────────────────────────────────────
const I = {
  bell: (c = 'currentColor') => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></svg>`,
  search: (c = 'currentColor') => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`,
  pin: (c = 'var(--orange)') => `<svg width="14" height="14" viewBox="0 0 24 24" fill="${c}"><path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"/></svg>`,
  heart: (c = 'currentColor', filled) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="${filled ? c : 'none'}" stroke="${c}" stroke-width="2" stroke-linejoin="round"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6C19 16.5 12 21 12 21z"/></svg>`,
  star: (c = 'var(--amber)', s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M12 2l3 6.5 7 .8-5.2 4.8L18 21l-6-3.5L6 21l1.2-6.9L2 9.3l7-.8L12 2z"/></svg>`,
  starOutline: (c = 'var(--ink4)', s = 28) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2l3 6.5 7 .8-5.2 4.8L18 21l-6-3.5L6 21l1.2-6.9L2 9.3l7-.8L12 2z"/></svg>`,
  clock: (c = 'currentColor', s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  home: (c, filled) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="${filled ? c : 'none'}" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><path d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z"/></svg>`,
  bag: (c, filled) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="${filled ? c : 'none'}" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><path d="M5 8h14l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 8z"/><path d="M9 8a3 3 0 016 0"/></svg>`,
  map: c => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z"/><path d="M9 4v14M15 6v14"/></svg>`,
  user: (c, filled) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="${filled ? c : 'none'}" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4 4-6 8-6s8 2 8 6"/></svg>`,
  chevR: (c = 'var(--ink3)') => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>`,
  chevD: (c = 'var(--ink3)') => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
  back: (c = 'currentColor') => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>`,
  plus: (c = 'currentColor') => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  minus: (c = 'currentColor') => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/></svg>`,
  info: (c = 'var(--ink3)') => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 12v5"/></svg>`,
  check: (c = '#fff', s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-11"/></svg>`,
  chat: (c = 'currentColor') => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H9l-4 4V6z"/></svg>`,
  phone: (c = 'currentColor') => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><path d="M5 4h4l2 5-3 2a11 11 0 005 5l2-3 5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z"/></svg>`,
  run: (c = 'currentColor') => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="4" r="2"/><path d="M8 22l2-6-3-3 3-4 3 2 4 1"/><path d="M13 15l3 2 3-5"/></svg>`,
  fire: (c = 'var(--orange)') => `<svg width="16" height="16" viewBox="0 0 24 24" fill="${c}"><path d="M12 2s3 4 3 8a3 3 0 01-6 0c0-1 1-2 1-2s-4 2-4 7a6 6 0 0012 0c0-6-6-13-6-13z"/></svg>`,
  store: (c = 'currentColor') => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><path d="M3 9l1-5h16l1 5M3 9v10h18V9M3 9h18M9 19v-5h6v5"/></svg>`,
  edit: (c = 'var(--ink3)') => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6-11 11H3v-6L14 4z"/></svg>`,
  drag: (c = 'var(--ink4)') => `<svg width="14" height="14" viewBox="0 0 24 24" fill="${c}"><circle cx="9" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>`,
  cart: (c = 'currentColor') => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2 12h11l2-8H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></svg>`,
  wallet: (c = 'currentColor') => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M16 13a1 1 0 100-2 1 1 0 000 2z" fill="${c}"/></svg>`,
  settings: c => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6c.6 0 1.15-.33 1.44-.84.19-.28.29-.61.29-.94V3a2 2 0 014 0v.09c0 .33.1.66.29.94.29.51.84.84 1.44.84.44 0 .87-.16 1.19-.44l.06-.06a2 2 0 012.83 2.83l-.06.06c-.44.42-.6 1.06-.44 1.66"/></svg>`,
  bars: c => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>`,
  menu: c => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,
  logout: (c = 'var(--danger)') => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>`,
  help: (c = 'var(--orange)') => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 116 0c0 2-3 2-3 5M12 17v.01"/></svg>`,
};

// ─── Brand mark (bowl + cap + steam + tassel) ──────────────
function brandMark(size = 48, opts = {}) {
  const bowl = opts.bowl || 'var(--orange)';
  const bowlRim = opts.bowlRim || 'var(--orange-deep)';
  const cap = opts.cap || 'var(--charcoal)';
  const tassel = opts.tassel || 'var(--amber)';
  const steam = opts.steam !== false;
  return `<svg width="${size}" height="${size}" viewBox="0 0 96 96" aria-label="Kenyan'in">
    ${steam ? `
    <path d="M40 12 Q36 20 40 26 Q44 32 40 40" stroke="${cap}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".85"/>
    <path d="M52 10 Q48 18 52 24 Q56 30 52 38" stroke="${cap}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".85"/>` : ''}
    <path d="M74 34 L74 50" stroke="${cap}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="74" cy="52" r="3" fill="${tassel}"/>
    <path d="M22 34 L48 24 L74 34 L48 44 Z" fill="${cap}"/>
    <path d="M14 46 Q14 74 48 84 Q82 74 82 46 Z" fill="${bowl}"/>
    <path d="M14 46 L82 46" stroke="${bowlRim}" stroke-width="2"/>
  </svg>`;
}
// Compact mark for small headers/nav (no steam)
function brandMarkTight(size = 22) {
  return brandMark(size, { steam: false });
}

// ─── Reusable UI helpers ────────────────────────────────────
function foodImg(w, h, hue, r = 14) {
  return `<div style="width:${w};height:${h};border-radius:${r}px;background:linear-gradient(135deg, hsl(${hue},70%,78%), hsl(${(hue + 30) % 360},65%,68%));position:relative;overflow:hidden;flex-shrink:0">
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 40%, rgba(255,255,255,.5), transparent 50%)"></div>
    <div style="position:absolute;bottom:-10px;right:-10px;width:60%;height:60%;border-radius:50%;background:rgba(255,255,255,.18)"></div>
  </div>`;
}
function storeBanner(hue, h = 160) {
  return `<div style="width:100%;height:${h}px;background:linear-gradient(135deg, hsl(${hue},65%,62%), hsl(${(hue + 40) % 360},55%,52%));position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 70% 30%, rgba(255,220,180,.5), transparent 60%)"></div>
    <div style="position:absolute;bottom:-30px;left:-20px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.12)"></div>
    <div style="position:absolute;top:-40px;right:20px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)"></div>
  </div>`;
}
function avatarEl(initials, bg, size = 36) {
  return `<div class="avatar" style="width:${size}px;height:${size}px;background:${bg};font-size:${Math.round(size * 0.38)}px">${initials}</div>`;
}

// Campus map — stylized top-down SVG
function campusMap(w, h, opts = {}) {
  const { highlights = [], stores: pins = [], dest = null, you = null, path = null, onBlock = null } = opts;
  const blocks = [
    { id: 'A', x: 0.10, y: 0.15, w: 0.22, h: 0.14, color: '#E8D9C0' },
    { id: 'B', x: 0.36, y: 0.10, w: 0.18, h: 0.12, color: '#E8D9C0' },
    { id: 'C', x: 0.58, y: 0.14, w: 0.20, h: 0.16, color: '#E8D9C0' },
    { id: 'K', x: 0.12, y: 0.38, w: 0.24, h: 0.18, color: '#FFD9C4' },
    { id: 'Lib', x: 0.42, y: 0.36, w: 0.22, h: 0.16, color: '#DDEBF9' },
    { id: 'Cant', x: 0.68, y: 0.40, w: 0.20, h: 0.14, color: '#D8F5E7' },
    { id: 'D', x: 0.14, y: 0.68, w: 0.20, h: 0.14, color: '#E8D9C0' },
    { id: 'E', x: 0.42, y: 0.66, w: 0.18, h: 0.16, color: '#E8D9C0' },
    { id: 'F', x: 0.66, y: 0.68, w: 0.22, h: 0.14, color: '#E8D9C0' },
  ];
  const sx = (v, dim) => v * (dim === 'w' ? w : h);
  const walkways = `<g stroke="var(--border)" stroke-width="3" fill="none" stroke-linecap="round">
    <path d="M ${sx(0.05, 'w')} ${sx(0.32, 'h')} L ${sx(0.95, 'w')} ${sx(0.32, 'h')}"/>
    <path d="M ${sx(0.05, 'w')} ${sx(0.60, 'h')} L ${sx(0.95, 'w')} ${sx(0.60, 'h')}"/>
    <path d="M ${sx(0.38, 'w')} ${sx(0.05, 'h')} L ${sx(0.38, 'w')} ${sx(0.90, 'h')}"/>
  </g>`;
  const b = blocks.map(bl => {
    const hi = highlights.includes(bl.id);
    return `<g ${onBlock ? `class="block-tap" data-block="${bl.id}" style="cursor:pointer"` : ''}>
      <rect x="${sx(bl.x, 'w')}" y="${sx(bl.y, 'h')}" width="${sx(bl.w, 'w')}" height="${sx(bl.h, 'h')}" rx="8" fill="${hi ? 'var(--orange-soft)' : bl.color}" stroke="${hi ? 'var(--orange)' : 'none'}" stroke-width="${hi ? 2 : 0}"/>
      <text x="${sx(bl.x + bl.w / 2, 'w')}" y="${sx(bl.y + bl.h / 2, 'h') + 4}" font-family="'Plus Jakarta Sans'" font-size="11" font-weight="700" fill="var(--ink2)" text-anchor="middle">${bl.id}</text>
    </g>`;
  }).join('');
  const sp = pins.map(([x, y]) => `<g transform="translate(${sx(x, 'w')},${sx(y, 'h')})"><circle r="10" fill="var(--orange)"/><circle r="4" fill="#fff"/></g>`).join('');
  const dp = dest ? `<g transform="translate(${sx(dest[0], 'w')},${sx(dest[1], 'h')})"><circle r="10" fill="var(--mint)"/><circle r="4" fill="#fff"/></g>` : '';
  const yp = you ? `<g transform="translate(${sx(you[0], 'w')},${sx(you[1], 'h')})"><circle r="14" fill="var(--blue)" opacity=".25"><animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite"/></circle><circle r="7" fill="var(--blue)" stroke="#fff" stroke-width="2"/></g>` : '';
  const p = path ? `<path d="${path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p[0], 'w')} ${sx(p[1], 'h')}`).join(' ')}" stroke="var(--orange)" stroke-width="3" stroke-dasharray="6 4" fill="none" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite"/></path>` : '';
  return `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" class="map">${walkways}${b}${p}${sp}${dp}${yp}</svg>`;
}

// ─── Router ─────────────────────────────────────────────────
const routes = {};
function route(path, fn) { routes[path] = fn; }
function go(path) { location.hash = '#' + path; }
function currentRoute() {
  const h = location.hash.slice(1) || '/';
  for (const p in routes) {
    const parts = p.split('/'), got = h.split('/');
    if (parts.length !== got.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith(':')) params[parts[i].slice(1)] = decodeURIComponent(got[i]);
      else if (parts[i] !== got[i]) { ok = false; break; }
    }
    if (ok) return { fn: routes[p], params };
  }
  return { fn: routes['/'], params: {} };
}
let _splashShown = false;
function render() {
  save();
  const app = $('#app');
  const { fn, params } = currentRoute();
  app.innerHTML = fn(params);
  // First-load splash — one time per page open
  if (!_splashShown) {
    _splashShown = true;
    const s = document.createElement('div');
    s.className = 'splash';
    s.innerHTML = `
      <div class="mark">${brandMark(78)}</div>
      <div class="word">Kenyan<span class="ap">'</span>in</div>
      <div class="tag">Between classes, we deliver.</div>`;
    app.appendChild(s);
    setTimeout(() => s.remove(), 1600);
  }
  bindTaps();
  window.scrollTo(0, 0);
  const sc = app.querySelector('.scroll');
  if (sc) sc.scrollTop = 0;
}
function bindTaps() {
  $$('[data-go]').forEach(el => el.addEventListener('click', e => {
    e.stopPropagation();
    go(el.dataset.go);
  }));
  $$('[data-action]').forEach(el => el.addEventListener('click', e => {
    e.stopPropagation();
    // Split on '|' so args can contain colons (e.g. time strings like "12:00")
    // Fallback: split first ':' only for backward compat.
    const raw = el.dataset.action;
    let parts;
    if (raw.includes('|')) parts = raw.split('|');
    else {
      const i = raw.indexOf(':');
      parts = i === -1 ? [raw] : [raw.slice(0, i), ...raw.slice(i + 1).split(':')];
    }
    const [name, ...args] = parts;
    if (actions[name]) actions[name](...args, el);
  }));
  if (typeof wireMapBlocks === 'function') wireMapBlocks();
}

// ─── Actions ────────────────────────────────────────────────
const actions = {
  addToCart(itemId) {
    itemId = +itemId;
    const item = getItem(itemId);
    if (state.cartStoreId && state.cartStoreId !== item.storeId) {
      if (!confirm('Your cart has items from another store. Clear it and add this?')) return;
      state.cart = []; state.cartStoreId = null;
    }
    state.cartStoreId = item.storeId;
    const found = state.cart.find(c => c.id === itemId);
    if (found) found.qty++;
    else state.cart.push({ id: itemId, qty: 1 });
    toast(`Added ${item.name}`);
    save(); render();
  },
  qtyInc(itemId) { const c = state.cart.find(c => c.id === +itemId); if (c) c.qty++; save(); render(); },
  qtyDec(itemId) {
    const c = state.cart.find(c => c.id === +itemId);
    if (!c) return;
    c.qty--;
    if (c.qty <= 0) state.cart = state.cart.filter(x => x.id !== +itemId);
    if (state.cart.length === 0) state.cartStoreId = null;
    save(); render();
  },
  clearCart() { state.cart = []; state.cartStoreId = null; save(); render(); },
  setTime(t) { state.deliveryTime = t; save(); render(); },
  setPayment(p) { state.paymentMethod = p; save(); render(); },
  toggleFav(sid) {
    sid = +sid;
    state.favoriteStores = state.favoriteStores.includes(sid)
      ? state.favoriteStores.filter(x => x !== sid)
      : [...state.favoriteStores, sid];
    save(); render();
  },
  placeOrder() {
    const sub = cartSubtotal(), fee = platformFee(sub), w = cartWeight(), del = deliveryFee(w);
    const order = {
      id: 'KY-' + (1040 + state.orders.length + 5),
      storeId: state.cartStoreId,
      items: state.cart.map(c => ({ id: c.id, qty: c.qty })),
      subtotal: sub, fee, delivery: del, total: sub + fee + del,
      status: 'preparing',
      courier: 'Rahmat A.',
      placedAt: 'Just now',
      weight: w,
    };
    state.orders.unshift(order);
    state.cart = []; state.cartStoreId = null; state.cartNote = '';
    save();
    go('/buyer/success/' + order.id);
  },
  toggleSellerOnline() { state.sellerOnline = !state.sellerOnline; save(); render(); },
  toggleDeliveryOnline() { state.deliveryOnline = !state.deliveryOnline; save(); render(); },
  toggleSoldOut(iid) {
    iid = +iid;
    state.soldOut = state.soldOut.includes(iid)
      ? state.soldOut.filter(x => x !== iid)
      : [...state.soldOut, iid];
    save(); render();
  },
  acceptOrder(id) { toast(`Order ${id} accepted`); },
  declineOrder(id) { toast(`Order ${id} declined`); },
  markReady(id) { toast(`Order ${id} ready for pickup — notifying courier`); },
  claimOrder(id) {
    state.activeDelivery = { orderId: id, step: 1 };
    save(); go('/delivery/active');
  },
  confirmPickup() { if (state.activeDelivery) { state.activeDelivery.step = 2; save(); render(); } },
  confirmDelivered() {
    state.activeDelivery = null;
    state.deliveryHistory.unshift({ store: 'Warung Bu Siti', dest: 'Block K · 305', weight: 2.1, fee: 3000, time: 'Just now' });
    save(); toast('Delivered! +Rp 3.000 earned'); go('/delivery/home');
  },
  switchRole(r) {
    state.role = r; save();
    if (r === 'buyer') go('/buyer/home');
    else if (r === 'seller') go('/seller/dashboard');
    else if (r === 'delivery') go('/delivery/home');
  },
  onboardContinue(r) {
    state.role = r; state.onboarded = true; save();
    actions.switchRole(r);
  },
  selectRole(r) { state._pickedRole = r; render(); },
  toggleDietary(d) {
    state.dietary = state.dietary.includes(d) ? state.dietary.filter(x => x !== d) : [...state.dietary, d];
    save(); render();
  },
  rateOrder(id, n) {
    const o = state.orders.find(o => o.id === id);
    if (o) { o.rated = +n; save(); toast(`Rated ${n} stars — thanks!`); render(); }
  },
  rateCourier(id, n) {
    const o = state.orders.find(o => o.id === id);
    if (o) { o.courierRated = +n; save(); toast(`Rated courier ${n} stars`); render(); }
  },
  reorder(id) {
    const o = state.orders.find(o => o.id === id);
    if (!o) return;
    state.cart = o.items.map(i => ({ id: i.id, qty: i.qty }));
    state.cartStoreId = o.storeId; save();
    go('/buyer/cart');
  },
  logout() {
    if (!confirm('Log out and reset the app?')) return;
    reset(); go('/');
  },
  goStore(id) { go('/buyer/store/' + id); },
  showLocation(from) {
    state._locReturn = from || location.hash.slice(1) || '/buyer/home';
    save(); go('/buyer/location');
  },
  pickBlock(b) {
    state._pickedBlock = b;
    save(); render();
  },
  saveLocation() {
    const block = state._pickedBlock || (state.user.location.match(/Block (\w+)/) || [])[1] || 'K';
    const roomEl = document.getElementById('room-input');
    const noteEl = document.getElementById('note-input');
    const room = (roomEl && roomEl.value.trim()) || '—';
    const note = (noteEl && noteEl.value.trim()) || '';
    state.user.location = `Block ${block}, Room ${room}`;
    state.user.locNote = note;
    state._pickedBlock = null;
    save();
    toast(`Location saved`);
    go(state._locReturn || '/buyer/home');
  },
  setScheduledTime(t) {
    state.scheduledTime = t;
    state.deliveryTime = 'Scheduled';
    save(); closeSheet();
  },
  showSheet(name) { openSheet(name); },
  closeSheet() { closeSheet(); },
  setCartNote(v) { state.cartNote = v; save(); },
};

// ─── Sheets ─────────────────────────────────────────────────
let sheetName = null;
function openSheet(name) { sheetName = name; render(); }
function closeSheet() { sheetName = null; render(); }
function sheetOverlay() {
  if (!sheetName) return '';
  let content = '';
  if (sheetName === 'delivery-fee') {
    content = `
      <div class="sheet-handle"></div>
      <div class="h2">Delivery pricing</div>
      <div class="body mt-8">Delivery fee is calculated from your order's total estimated weight.</div>
      <div class="card-flat mt-16" style="background:var(--cream);border:1px dashed var(--border)">
        <div class="row spread"><span class="body">1 – 2.5 KG</span><span class="h3">Rp 3.000</span></div>
        <div class="divider"></div>
        <div class="row spread"><span class="body">Each additional 1 KG</span><span class="h3">+Rp 1.000</span></div>
        <div class="divider"></div>
        <div class="row spread"><span class="body">Example: 3.5 KG</span><span class="h3">Rp 4.000</span></div>
      </div>
      <div class="body muted mt-12">Your current order: ~${cartWeight().toFixed(1)} KG → ${fmt(deliveryFee(cartWeight()))}</div>
      <button class="btn btn-primary btn-block mt-16" data-action="closeSheet">Got it</button>`;
  } else if (sheetName === 'notifications') {
    content = `
      <div class="sheet-handle"></div>
      <div class="h2">Notifications</div>
      <div class="col gap-10 mt-16">
        ${[
      { icon: I.check('var(--mint)'), title: 'Order KY-1039 delivered', sub: 'Kopi Sudut · Yesterday' },
      { icon: I.fire('var(--orange)'), title: '20% off at Warung Bu Siti', sub: 'Today only · tap to view' },
      { icon: I.bell('var(--blue)'), title: 'New store: Boba Time', sub: 'Now open at Canteen' },
    ].map(n => `<div class="card row gap-12"><div style="width:36px;height:36px;background:var(--cream);border-radius:10px;display:flex;align-items:center;justify-content:center">${n.icon}</div><div class="col grow gap-4"><div class="h3">${n.title}</div><div class="muted">${n.sub}</div></div></div>`).join('')}
      </div>
      <button class="btn btn-primary btn-block mt-16" data-action="closeSheet">Close</button>`;
  } else if (sheetName === 'schedule-time') {
    // Build 10-minute slots from 11:00 to 14:00
    const slots = [];
    for (let h = 11; h < 14; h++) {
      for (let m = 0; m < 60; m += 10) {
        const label = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        slots.push(label);
      }
    }
    slots.push('14:00');
    const cur = state.scheduledTime || '12:00';
    content = `
      <div class="sheet-handle"></div>
      <div class="h2">Schedule pickup time</div>
      <div class="body mt-4">Choose when your order should arrive. Slots run every 10 minutes.</div>
      <div class="lbl mt-16" style="color:var(--charcoal)">Available slots · today</div>
      <div id="time-scroll" style="display:flex;gap:8px;overflow-x:auto;padding:12px 0 4px;scrollbar-width:none;-ms-overflow-style:none">
        ${slots.map(s => `<div data-action="setScheduledTime|${s}" style="flex-shrink:0;min-width:70px;padding:14px 12px;border-radius:14px;text-align:center;cursor:pointer;background:${s === cur ? 'var(--orange)' : 'var(--cream)'};color:${s === cur ? '#fff' : 'var(--charcoal)'};border:1.5px solid ${s === cur ? 'var(--orange)' : 'var(--border)'};font-weight:${s === cur ? '800' : '600'};font-size:14px">${s}</div>`).join('')}
      </div>
      <style>#time-scroll::-webkit-scrollbar{display:none}</style>
      <div class="card-flat mt-16" style="background:var(--cream);border:1px dashed var(--border)">
        <div class="row spread"><span class="body">Selected time</span><span class="h3" style="color:var(--orange)">${cur}</span></div>
      </div>
      <button class="btn btn-primary btn-block mt-16" data-action="closeSheet">Confirm</button>`;
  } else if (sheetName === 'add-item') {
    content = `
      <div class="sheet-handle"></div>
      <div class="h2">Add menu item</div>
      <div class="body mt-4">Add a dish to your store.</div>
      <div class="col gap-12 mt-16">
        <div class="col gap-6"><label class="lbl">Photo</label><div style="width:100%;height:100px;background:var(--cream);border:2px dashed var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--ink3);font-size:13px">Tap to upload</div></div>
        <div class="col gap-6"><label class="lbl">Name</label><input type="text" placeholder="e.g. Nasi Goreng Kampung" style="padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--cream)"></div>
        <div class="col gap-6"><label class="lbl">Description</label><textarea placeholder="Short description" rows="2" style="padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--cream);resize:none"></textarea></div>
        <div class="row gap-8">
          <div class="col gap-6 grow"><label class="lbl">Price (IDR)</label><input type="text" placeholder="20000" style="padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--cream)"></div>
          <div class="col gap-6 grow"><label class="lbl">Weight (KG)</label><input type="text" placeholder="0.5" style="padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--cream)"></div>
        </div>
        <div class="col gap-6"><label class="lbl">Dietary tags</label>
          <div class="row gap-6" style="flex-wrap:wrap">
            ${['Halal', 'Spicy', 'Vegetarian', 'No Peanuts'].map(t => `<span class="pill pill-ghost" style="cursor:pointer">${t}</span>`).join('')}
          </div>
        </div>
        <button class="btn btn-blue btn-block" data-action="closeSheet">Save Item</button>
      </div>`;
  }
  return `<div class="sheet-bg" data-action="closeSheet"><div class="sheet" onclick="event.stopPropagation()">${content}</div></div>`;
}

// ─── Bottom navs ────────────────────────────────────────────
function bottomNav(active, kind = 'buyer') {
  const map = {
    buyer: [
      { k: 'home', label: 'Home', route: '/buyer/home', ic: (c, f) => I.home(c, f) },
      { k: 'orders', label: 'My Orders', route: '/buyer/orders', ic: (c, f) => I.bag(c, f) },
      { k: 'map', label: 'Campus Map', route: '/map', ic: c => I.map(c) },
      { k: 'profile', label: 'Profile', route: '/profile', ic: (c, f) => I.user(c, f) },
    ],
    seller: [
      { k: 'orders', label: 'Orders', route: '/seller/dashboard', ic: (c, f) => I.bag(c, f) },
      { k: 'menu', label: 'Menu', route: '/seller/menu', ic: c => I.menu(c) },
      { k: 'analytics', label: 'Analytics', route: '/seller/analytics', ic: c => I.bars(c) },
      { k: 'settings', label: 'Settings', route: '/profile', ic: c => I.settings(c) },
    ],
    delivery: [
      { k: 'home', label: 'Home', route: '/delivery/home', ic: c => I.run(c) },
      { k: 'active', label: 'Active', route: '/delivery/active', ic: (c, f) => I.bag(c, f) },
      { k: 'map', label: 'Map', route: '/map', ic: c => I.map(c) },
      { k: 'profile', label: 'Profile', route: '/profile', ic: (c, f) => I.user(c, f) },
    ],
  };
  const items = map[kind];
  const tint = kind === 'buyer' ? 'var(--orange)' : kind === 'seller' ? 'var(--blue)' : 'var(--mint)';
  return `<div class="bottomnav">
    ${items.map(i => {
    const isActive = i.k === active;
    const c = isActive ? tint : 'var(--ink3)';
    return `<div class="bn-item ${kind} ${isActive ? 'active' : ''}" data-go="${i.route}">${i.ic(c, isActive)}<span style="color:${isActive ? tint : 'var(--ink3)'}">${i.label}</span></div>`;
  }).join('')}
  </div>`;
}

// ─── SCREENS ────────────────────────────────────────────────

// 1. WELCOME
route('/', () => {
  if (state.onboarded) {
    // route into current role if any
    if (state.role === 'buyer') { setTimeout(() => go('/buyer/home'), 0); }
    else if (state.role === 'seller') { setTimeout(() => go('/seller/dashboard'), 0); }
    else if (state.role === 'delivery') { setTimeout(() => go('/delivery/home'), 0); }
    else { setTimeout(() => go('/role'), 0); }
    return `<div class="screen"></div>`;
  }
  return `<div class="screen" style="padding:40px 28px;justify-content:space-between">
    <div class="row" style="justify-content:flex-end">
      <span style="font-size:12px;font-weight:600;color:var(--ink3);letter-spacing:.5px;cursor:pointer" data-go="/role">SKIP</span>
    </div>
    <div class="center" style="padding:20px 0">
      <svg width="300" height="260" viewBox="0 0 300 260">
        <ellipse cx="150" cy="240" rx="120" ry="10" fill="rgba(30,30,46,.06)"/>
        <rect x="20" y="40" width="80" height="180" rx="6" fill="var(--orange-soft)"/>
        <rect x="30" y="50" width="60" height="150" rx="4" fill="var(--cream)"/>
        <circle cx="82" cy="125" r="3" fill="var(--orange-deep)"/>
        <text x="60" y="30" font-family="'Plus Jakarta Sans'" font-size="10" font-weight="700" fill="var(--ink3)" text-anchor="middle">BLOCK K · 305</text>
        <g transform="translate(200,90)">
          <circle cx="0" cy="0" r="18" fill="#F5C69C"/>
          <path d="M -16 -4 Q -14 -22 0 -22 Q 14 -22 16 -4 L 16 -10 Q 8 -18 0 -16 Q -8 -18 -16 -10 Z" fill="var(--charcoal)"/>
          <path d="M -20 20 Q -22 60 -18 90 L 18 90 Q 22 60 20 20 Z" fill="var(--mint)"/>
          <path d="M -15 22 L 25 55" stroke="var(--charcoal)" stroke-width="3" fill="none"/>
          <path d="M -18 30 Q -50 40 -60 55" stroke="#F5C69C" stroke-width="10" stroke-linecap="round" fill="none"/>
          <rect x="-80" y="52" width="30" height="26" rx="4" fill="var(--orange)"/>
          <rect x="-77" y="56" width="24" height="4" rx="2" fill="rgba(255,255,255,.4)"/>
        </g>
        <g transform="translate(130,110)">
          <circle cx="0" cy="0" r="16" fill="#E8B080"/>
          <path d="M -14 -6 Q -10 -20 0 -20 Q 12 -20 14 -6 Q 10 -14 0 -14 Q -10 -14 -14 -6 Z" fill="#3A2820"/>
          <path d="M -18 16 Q -20 55 -16 80 L 16 80 Q 20 55 18 16 Z" fill="var(--orange)"/>
          <path d="M 16 26 Q 35 32 45 40" stroke="#E8B080" stroke-width="9" stroke-linecap="round" fill="none"/>
        </g>
        <rect x="10" y="220" width="280" height="6" rx="2" fill="var(--border)"/>
        <circle cx="175" cy="140" r="3" fill="var(--amber)"/>
        <circle cx="182" cy="132" r="2" fill="var(--amber)"/>
        <circle cx="168" cy="148" r="2" fill="var(--amber)"/>
      </svg>
    </div>
    <div class="col gap-16" style="align-items:center;text-align:center">
      <div class="row gap-10">
        ${brandMark(52)}
        <div style="font-size:34px;font-weight:800;letter-spacing:-1.2px;color:var(--charcoal)">Kenyan<span style="color:var(--orange)">'</span>in</div>
      </div>
      <div style="font-size:17px;color:var(--charcoal);max-width:280px;line-height:1.35;font-weight:800;letter-spacing:-.3px">Between classes,<br>we deliver.</div>
      <div style="font-size:12.5px;color:var(--ink3);max-width:260px;line-height:1.45;font-weight:500">Campus food from the stores you know — straight to your classroom.</div>
    </div>
    <div class="col gap-12">
      <button class="btn btn-primary btn-block" data-go="/role">Get Started</button>
      <div style="text-align:center;font-size:13px;color:var(--ink3)">Already have an account? <span style="color:var(--orange);font-weight:700;cursor:pointer" data-go="/role">Log in</span></div>
    </div>
  </div>`;
});

// 2. ROLE SELECTION
route('/role', () => {
  const picked = state._pickedRole || 'buyer';
  const label = picked === 'buyer' ? 'Buyer' : picked === 'seller' ? 'Seller' : 'Delivery';
  const rc = (r, icon, title, desc, color, softColor) => {
    const sel = picked === r;
    return `<div class="role-card" style="background:${softColor};color:${color};${sel ? '' : 'border:2px solid transparent'}" data-action="selectRole:${r}">
      <div class="role-icon" style="background:${color}">${icon}</div>
      <div class="col gap-4 grow"><div class="h2" style="color:var(--charcoal)">${title}</div><div style="font-size:12.5px;color:var(--ink2);line-height:1.4">${desc}</div></div>
      ${sel ? `<div class="role-check">${I.check('#fff')}</div>` : '<div class="role-uncheck"></div>'}
    </div>`;
  };
  return `<div class="screen" style="padding:28px 24px">
    <div class="col gap-6" style="margin:12px 0 28px">
      <div class="lbl">Step 2 of 2</div>
      <div style="font-size:26px;font-weight:800;letter-spacing:-.6px;line-height:1.15">How do you want to<br>use Kenyan'in?</div>
      <div class="body mt-4">Choose your primary role — you can switch anytime.</div>
    </div>
    <div class="col gap-14 grow">
      ${rc('buyer', I.cart('#fff'), '🛒 Buyer', 'Order food from campus stores, delivered to your class', 'var(--orange)', 'var(--orange-soft)')}
      ${rc('seller', I.store('#fff'), '🏪 Seller', 'Set up your store, manage your menu, receive orders', 'var(--blue)', 'var(--blue-soft)')}
      ${rc('delivery', I.run('#fff'), '🏃 Delivery', 'Pick up and deliver orders, earn money between classes', 'var(--mint)', 'var(--mint-soft)')}
    </div>
    <div class="col gap-14 mt-16">
      <button class="btn btn-primary btn-block" data-action="onboardContinue:${picked}">Continue as ${label}</button>
      <div style="text-align:center;font-size:12px;color:var(--ink3)">You can switch roles anytime from your profile</div>
    </div>
  </div>`;
});

// 3. BUYER HOME
route('/buyer/home', () => {
  const activeOrder = state.orders.find(o => o.status !== 'delivered');
  return `<div class="screen">
    <div class="topbar">
      <div class="row spread" style="align-items:flex-start">
        <div class="col gap-8">
          <div class="row gap-8">
            ${avatarEl(state.user.initials, 'var(--orange)', 40)}
            <div class="col gap-4" style="justify-content:center">
              <div style="font-size:12px;color:var(--ink3);font-weight:500">Hi, ${state.user.name.split(' ')[0]} 👋</div>
              <div style="font-size:14px;font-weight:700">Ready to eat?</div>
            </div>
          </div>
          <div class="row gap-6" style="background:#fff;border-radius:999px;padding:8px 12px;box-shadow:var(--shadow-sm);width:fit-content;cursor:pointer" data-action="showLocation:/buyer/home">
            ${I.pin()}<span style="font-size:12px;font-weight:600">${state.user.location}</span>${I.chevD()}
          </div>
        </div>
        <div class="topbar-icon" style="position:relative;cursor:pointer" data-action="showSheet:notifications">
          ${I.bell()}${state.notifications ? '<div class="badge-dot"></div>' : ''}
        </div>
      </div>
      <div class="searchbar mt-16">${I.search()}Search stores or dishes...</div>
    </div>
    <div class="scroll">
      <div class="chips">
        ${['All', 'Rice Bowls', 'Noodles', 'Drinks', 'Snacks', 'Halal', 'Vegetarian'].map((n, i) =>
    `<div class="chip ${i === 0 ? 'active' : ''}">${n}</div>`).join('')}
      </div>
      <div class="px-20 mt-8">
        <div class="row spread" style="align-items:baseline;margin-bottom:12px">
          <div class="h2">Campus Stores</div>
          <span style="font-size:12px;color:var(--orange);font-weight:700;cursor:pointer">See all</span>
        </div>
      </div>
      <div class="store-grid">
        ${stores.filter(s => s.open).map(s => `
          <div class="store-card" data-action="goStore:${s.id}">
            <div class="store-thumb" style="background:linear-gradient(135deg, hsl(${s.hue},65%,62%), hsl(${(s.hue + 40) % 360},55%,52%))"></div>
            <div class="store-body">
              <div class="store-name">${s.name}</div>
              <div class="store-meta">${I.star()}<span style="font-weight:600;color:var(--charcoal)">${s.rating}</span><span style="color:var(--ink4)">·</span>${I.clock()}<span>${s.prep}</span></div>
              ${s.tags[0] ? `<div class="pill ${s.tags[0] === 'Vegetarian' ? 'pill-mint' : 'pill-orange'}" style="margin-top:8px">${s.tags[0]}</div>` : '<div style="height:22px"></div>'}
            </div>
          </div>`).join('')}
      </div>
      <div class="p-20">
        <div class="h2" style="margin-bottom:12px">Your Scheduled Orders</div>
        <div class="card row gap-12" style="border:1.5px dashed var(--border);box-shadow:none">
          <div style="width:44px;height:44px;background:var(--orange-soft);border-radius:12px;display:flex;align-items:center;justify-content:center">${I.clock('var(--orange)', 20)}</div>
          <div class="col gap-4 grow">
            <div class="h3">Kopi Sudut · Latte</div>
            <div class="muted">Every weekday · 09:30</div>
          </div>
          ${I.edit()}
        </div>
        ${activeOrder ? `
          <div class="card mt-16" data-go="/buyer/track/${activeOrder.id}" style="cursor:pointer;background:var(--orange);color:#fff">
            <div class="row spread">
              <div class="col gap-4">
                <div style="font-size:11px;font-weight:700;opacity:.85">ORDER IN PROGRESS</div>
                <div class="h3">${getStore(activeOrder.storeId).name}</div>
                <div style="font-size:11px;opacity:.85">Arriving in ~4 min · Track live</div>
              </div>
              ${I.chevR('#fff')}
            </div>
          </div>` : ''}
      </div>
    </div>
    ${bottomNav('home', 'buyer')}
    ${sheetOverlay()}
  </div>`;
});

// Location picker (helper screen — tap map, then fill room + note)
route('/buyer/location', () => {
  // Derive current block (from a fresh tap or from saved location)
  const currentBlock = state._pickedBlock || (state.user.location.match(/Block (\w+)/) || [])[1] || 'K';
  const currentRoom = (state.user.location.match(/Room ([^,]+)/) || [])[1] || '';
  const roomVal = currentRoom === '—' ? '' : currentRoom;
  const noteVal = state.user.locNote || '';
  // Map: highlight the picked block; tapping a block re-renders with new pick
  const html = campusMap(360, 340, { highlights: [currentBlock], onBlock: true });
  const backRoute = state._locReturn || '/buyer/home';
  return `<div class="screen">
    <div class="topbar row gap-12">
      <div class="topbar-icon" data-go="${backRoute}">${I.back()}</div>
      <div class="col gap-2 grow">
        <div class="h1">Delivery Location</div>
        <div class="muted">Tap a building, then add the room</div>
      </div>
    </div>
    <div class="scroll">
      <div class="px-16">${html}</div>
      <div class="p-20 col gap-12">
        <div class="card">
          <div class="lbl" style="color:var(--charcoal);margin-bottom:8px">Selected building</div>
          <div class="row gap-8">
            ${I.pin('var(--orange)')}
            <div class="h2">Block ${currentBlock}</div>
          </div>
          <div class="muted mt-4">Tap another block on the map to change</div>
        </div>
        <div class="card">
          <div class="lbl" style="color:var(--charcoal);margin-bottom:10px">Room / Floor</div>
          <input id="room-input" type="text" placeholder="e.g. 305, Floor 3" value="${roomVal.replace(/"/g, '&quot;')}"
            style="width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:14px;outline:none">
        </div>
        <div class="card">
          <div class="lbl" style="color:var(--charcoal);margin-bottom:10px">Note for courier (optional)</div>
          <input id="note-input" type="text" placeholder="e.g. Near the whiteboard entrance" value="${noteVal.replace(/"/g, '&quot;')}"
            style="width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:14px;outline:none">
        </div>
      </div>
    </div>
    <div class="p-16" style="background:linear-gradient(180deg,transparent,var(--cream) 30%);flex-shrink:0">
      <button class="btn btn-primary btn-block" data-action="saveLocation">Save Location</button>
    </div>
  </div>`;
});

// Map-block tap wiring: attach after every render, since router replaces DOM
function wireMapBlocks() {
  $$('.block-tap').forEach(el => {
    el.addEventListener('click', () => actions.pickBlock(el.dataset.block));
  });
}

// 4. STORE MENU
route('/buyer/store/:id', ({ id }) => {
  const s = getStore(+id);
  if (!s) return `<div class="screen p-20"><div class="empty">Store not found</div><button class="btn btn-primary" data-go="/buyer/home">Back to home</button></div>`;
  const fav = state.favoriteStores.includes(s.id);
  const cats = menu[s.id];
  const cartN = cartCount(), cartTotal = cartSubtotal();
  return `<div class="screen">
    <div class="scroll">
      <div class="topbar row spread">
        <div class="topbar-icon" data-go="/buyer/home">${I.back()}</div>
        <div class="topbar-icon" style="color:var(--orange)" data-action="toggleFav:${s.id}">${I.heart('var(--orange)', fav)}</div>
      </div>
      <div class="card" style="margin:4px 16px 0;box-shadow:var(--shadow)">
        <div class="row spread" style="align-items:flex-start">
          <div class="col gap-6">
            <div class="h1">${s.name}</div>
            <div class="row gap-8">
              <span class="row gap-4">${I.star()}<span style="font-size:12px;font-weight:700">${s.rating}</span></span>
              <span style="color:var(--ink4)">·</span>
              <span class="row gap-4">${I.clock()}<span style="font-size:12px;color:var(--ink3);font-weight:500">${s.prep} prep</span></span>
            </div>
          </div>
          <span class="pill pill-mint">${s.open ? 'OPEN' : 'CLOSED'}</span>
        </div>
        <div class="row gap-6" style="margin-top:12px;flex-wrap:wrap">
          ${s.tags.map((t, i) => `<span class="pill ${i === 0 ? 'pill-orange' : 'pill-ghost'}">${t.toUpperCase()}</span>`).join('')}
        </div>
      </div>
      ${Object.entries(cats).map(([cat, items]) => `
        <div class="px-20 mt-16"><div class="h2">${cat}</div></div>
        <div class="px-16">
          ${items.map(item => `
            <div class="menu-item">
              <div class="item-thumb" style="background:linear-gradient(135deg, hsl(${item.hue},70%,78%), hsl(${(item.hue + 30) % 360},65%,68%))"></div>
              <div class="item-body">
                <div class="item-name">${item.name}</div>
                <div class="item-desc">${item.desc}</div>
                <div class="item-tags">${item.tags.map(t => `<span class="item-tag ${t}">${t.toUpperCase()}</span>`).join('')}</div>
              </div>
              <div class="col gap-6" style="align-items:flex-end;flex-shrink:0">
                <div class="item-price">${fmt(item.price)}</div>
                <button class="add-btn" data-action="addToCart:${item.id}">${I.plus('#fff')} Add</button>
              </div>
            </div>`).join('')}
        </div>
      `).join('')}
      <div style="height:${cartN > 0 ? '100px' : '20px'}"></div>
    </div>
    ${cartN > 0 ? `
      <div class="cart-bar" data-go="/buyer/cart">
        <div class="row gap-10">
          <div class="cart-badge">${I.cart('#fff')}<div class="n">${cartN}</div></div>
          <div class="col gap-2"><div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:600">${cartN} item${cartN > 1 ? 's' : ''}</div><div style="font-size:14px;font-weight:800">View Cart</div></div>
        </div>
        <div style="font-size:15px;font-weight:800">${fmt(cartTotal)}</div>
      </div>` : ''}
  </div>`;
});

// 5. CART / CHECKOUT
route('/buyer/cart', () => {
  const cartN = cartCount();
  if (cartN === 0) {
    return `<div class="screen">
      <div class="topbar row spread">
        <div class="row gap-12"><div class="topbar-icon" data-go="/buyer/home">${I.back()}</div><div class="h1">Checkout</div></div>
      </div>
      <div class="scroll">
        <div class="empty">
          <div class="brand-float" style="opacity:.7">${brandMark(72)}</div>
          <div style="font-size:16px;font-weight:700;color:var(--charcoal);margin-top:12px">No items yet — hungry?</div>
          <div class="mt-8">Browse stores to add food to your cart.</div>
          <button class="btn btn-primary mt-16" data-go="/buyer/home" style="max-width:200px;margin:16px auto 0">Browse Stores</button>
        </div>
      </div>
    </div>`;
  }
  const sub = cartSubtotal(), fee = platformFee(sub), w = cartWeight(), del = deliveryFee(w), total = sub + fee + del;
  const store = getStore(state.cartStoreId);
  return `<div class="screen">
    <div class="topbar row spread" style="background:var(--cream)">
      <div class="row gap-12"><div class="topbar-icon" data-go="/buyer/store/${state.cartStoreId}">${I.back()}</div><div class="h1">Checkout</div></div>
      <div class="muted" style="font-weight:600">${store.name}</div>
    </div>
    <div class="scroll px-16">
      <div class="card mt-8">
        ${state.cart.map((c, i) => {
    const it = getItem(c.id);
    return `<div class="row gap-10" style="padding:8px 0;${i < state.cart.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}">
            ${foodImg('48px', '48px', it.hue, 10)}
            <div class="col gap-4 grow"><div class="h3">${it.name}</div><div class="muted">${fmt(it.price)}</div></div>
            <div class="qty">
              <button class="minus" data-action="qtyDec:${c.id}">${I.minus()}</button>
              <div class="n">${c.qty}</div>
              <button class="plus" data-action="qtyInc:${c.id}">${I.plus('#fff')}</button>
            </div>
          </div>`;
  }).join('')}
        <div class="mt-8" style="padding:8px 10px;background:var(--cream);border-radius:10px">
          <div class="lbl" style="color:var(--ink2);margin-bottom:4px">Note to store</div>
          <input type="text" placeholder="e.g. no chili please" value="${state.cartNote}" data-note style="width:100%;background:transparent;border:none;font-size:13px;color:var(--charcoal);outline:none">
        </div>
      </div>

      <div class="card mt-12">
        <div class="row spread" style="margin-bottom:10px">
          <div class="lbl" style="color:var(--charcoal)">Delivery Location</div>
          <span style="font-size:11px;color:var(--orange);font-weight:700;cursor:pointer" data-action="showLocation:/buyer/cart">Change</span>
        </div>
        ${campusMap(322, 110, { highlights: [userBlock()], dest: userBlockCoord() })}
        <div class="row gap-8 mt-8">${I.pin('var(--mint)')}<div class="col gap-2"><div class="h3">${state.user.location}</div><div class="muted">${state.user.locNote || 'No note added'}</div></div></div>
      </div>

      <div class="card mt-12">
        <div class="lbl" style="color:var(--charcoal);margin-bottom:10px">Delivery Time</div>
        <div class="row gap-8">
          <div data-action="setTime:ASAP" style="flex:1;padding:12px;border:2px solid ${state.deliveryTime === 'ASAP' ? 'var(--orange)' : 'var(--border)'};background:${state.deliveryTime === 'ASAP' ? 'var(--orange-soft)' : '#fff'};border-radius:12px;text-align:center;cursor:pointer">
            <div style="font-size:13px;font-weight:800;color:${state.deliveryTime === 'ASAP' ? 'var(--orange-deep)' : 'var(--ink2)'}">ASAP</div>
            <div class="muted mt-4">~18 min</div>
          </div>
          <div data-action="showSheet:schedule-time" style="flex:1;padding:12px;border:2px solid ${state.deliveryTime === 'Scheduled' ? 'var(--orange)' : 'var(--border)'};background:${state.deliveryTime === 'Scheduled' ? 'var(--orange-soft)' : '#fff'};border-radius:12px;text-align:center;cursor:pointer">
            <div style="font-size:13px;font-weight:${state.deliveryTime === 'Scheduled' ? '800' : '700'};color:${state.deliveryTime === 'Scheduled' ? 'var(--orange-deep)' : 'var(--ink2)'}">Scheduled</div>
            <div class="muted mt-4">${state.deliveryTime === 'Scheduled' ? state.scheduledTime : 'Pick a time'}</div>
          </div>
        </div>
      </div>

      <div class="card-flat mt-12" style="background:var(--cream);border:1px dashed var(--border)">
        <div class="row spread">
          <div class="row gap-6" style="cursor:pointer" data-action="showSheet:delivery-fee">${I.info('var(--ink2)')}<span style="font-size:12px;font-weight:700;color:var(--ink2)">Delivery pricing</span></div>
          <span class="muted">Est. weight: ~${w.toFixed(1)} KG</span>
        </div>
        <div class="row gap-16 mt-8" style="font-size:11px;color:var(--ink3)">
          <div>1–2.5 KG → <span style="color:var(--charcoal);font-weight:700">Rp 3.000</span></div>
          <div>+1 KG → <span style="color:var(--charcoal);font-weight:700">+Rp 1.000</span></div>
        </div>
      </div>

      <div class="card mt-12">
        <div class="lbl" style="color:var(--charcoal);margin-bottom:10px">Payment Method</div>
        ${[
      { k: 'gopay', name: 'GoPay', bal: 'Rp 250.000 available', color: '#00AA13', label: 'GP' },
      { k: 'ovo', name: 'OVO', bal: 'Rp 128.000 available', color: '#4C2A85', label: 'OVO' },
      { k: 'dana', name: 'Dana', bal: 'Rp 88.000 available', color: '#118EEA', label: 'DN' },
      { k: 'card', name: 'Campus Card', bal: 'Balance Rp 320.000', color: 'var(--charcoal)', label: 'CC' },
    ].map(p => `
          <div class="row spread" style="padding:8px 0;cursor:pointer" data-action="setPayment:${p.k}">
            <div class="row gap-10">
              <div style="width:38px;height:38px;background:${p.color};border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:11px">${p.label}</div>
              <div class="col gap-2"><div class="h3">${p.name}</div><div class="muted">${p.bal}</div></div>
            </div>
            <div style="width:22px;height:22px;border-radius:50%;border:2px solid ${state.paymentMethod === p.k ? 'var(--orange)' : 'var(--ink4)'};display:flex;align-items:center;justify-content:center">${state.paymentMethod === p.k ? `<div style="width:12px;height:12px;background:var(--orange);border-radius:50%"></div>` : ''}</div>
          </div>`).join('')}
      </div>

      <div class="mt-12" style="padding:4px">
        <div class="row spread" style="padding:6px 0"><span class="body">Subtotal</span><span style="font-size:13px;font-weight:600">${fmt(sub)}</span></div>
        <div class="row spread" style="padding:6px 0"><span class="body">Platform Fee (20%)</span><span style="font-size:13px;font-weight:600">${fmt(fee)}</span></div>
        <div class="row spread" style="padding:6px 0">
          <div class="row gap-6" style="cursor:pointer" data-action="showSheet:delivery-fee"><span class="body">Delivery Fee</span>${I.info()}</div>
          <span style="font-size:13px;font-weight:600">${fmt(del)}</span>
        </div>
        <div class="divider"></div>
        <div class="row spread" style="padding:6px 0"><span style="font-size:14px;font-weight:800">Total</span><span style="font-size:17px;font-weight:800;color:var(--orange)">${fmt(total)}</span></div>
      </div>
      <div style="height:24px"></div>
    </div>
    <div class="p-16" style="background:linear-gradient(180deg,transparent,var(--cream) 30%)">
      <button class="btn btn-primary btn-block" data-action="placeOrder">
        <span>Place Order</span><span>${fmt(total)}</span>
      </button>
    </div>
    ${sheetOverlay()}
  </div>`;
});

// Hook the note input after render
document.addEventListener('input', e => {
  if (e.target && e.target.matches('[data-note]')) {
    state.cartNote = e.target.value; save();
  }
});

// 5b. ORDER SUCCESS — celebratory interstitial before tracking
route('/buyer/success/:id', ({ id }) => {
  const o = state.orders.find(x => x.id === id);
  if (!o) { setTimeout(() => go('/buyer/orders'), 0); return `<div class="screen"></div>`; }
  const s = getStore(o.storeId);
  // Auto-forward to tracking after 2.4s
  setTimeout(() => { if (location.hash.includes('/success/')) go('/buyer/track/' + o.id); }, 2400);
  return `<div class="screen"><div class="success">
    <div class="ring"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-11"/></svg></div>
    <h2>Order placed!</h2>
    <p><b>${s.name}</b> is preparing your food. We'll track your courier from here.</p>
    <div class="courier-badge">
      ${avatarEl('R', 'var(--mint)', 32)}
      <div class="col gap-2"><div style="font-size:12px;font-weight:800">${o.courier} is on it</div><div style="font-size:10.5px;color:var(--ink3);font-weight:500">Order #${o.id} · ${fmt(o.total)}</div></div>
    </div>
  </div></div>`;
});

// 6. ORDER TRACKING
route('/buyer/track/:id', ({ id }) => {
  const o = state.orders.find(x => x.id === id);
  if (!o) { setTimeout(() => go('/buyer/orders'), 0); return `<div class="screen"></div>`; }
  const s = getStore(o.storeId);
  const stepIdx = o.status === 'delivered' ? 5 : 3; // Order placed→prep→picked up→on way → delivered
  const steps = [
    { label: 'Order Placed', time: o.placedAt.slice(0, 5) || '11:42' },
    { label: 'Store Preparing', time: '11:44' },
    { label: 'Delivery Picked Up', time: '11:52' },
    { label: 'On the Way', time: '11:53' },
    { label: 'Delivered', time: o.status === 'delivered' ? '11:57' : '—' },
  ];
  return `<div class="screen">
    <div class="topbar row gap-12">
      <div class="topbar-icon" data-go="/buyer/orders">${I.back()}</div>
      <div class="col gap-2">
        <div style="font-size:11px;color:var(--ink3);font-weight:600">ORDER #${o.id}</div>
        <div class="h2">${s.name}</div>
      </div>
    </div>
    <div class="scroll px-16">
      <div class="card" style="padding:0;overflow:hidden">
        ${(() => {
    const ub = userBlock(); const dc = userBlockCoord();
    const sc = blockCoords[getStore(o.storeId)?.block?.replace('Block ', '') || 'C'] || [0.68, 0.22];
    // Meeting point midway between store and destination
    const mid = [(sc[0] + dc[0]) / 2, (sc[1] + dc[1]) / 2];
    return campusMap(360, 180, { highlights: [ub], stores: [sc], dest: dc, you: mid, path: [sc, mid, dc] });
  })()}
        <div style="padding:14px 16px;background:#fff">
          <div class="row spread" style="align-items:baseline">
            <div class="col gap-2">
              <div class="lbl">Arriving in</div>
              <div style="font-size:26px;font-weight:800;color:var(--orange);letter-spacing:-.6px">~4 min</div>
            </div>
            <span class="pill pill-orange">ON THE WAY</span>
          </div>
        </div>
      </div>
      <div class="card mt-12">
        <div class="lbl" style="color:var(--charcoal);margin-bottom:14px">Order Progress</div>
        <div class="stepper">
          ${steps.map((s, i) => {
    const st = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'pending';
    return `<div class="step ${st}">
              <div class="line"></div>
              <div class="dot">${st === 'done' ? I.check('#fff') : st === 'active' ? '<div style="width:8px;height:8px;border-radius:50%;background:#fff"></div>' : ''}</div>
              <div class="col gap-2 grow"><div class="step-lbl">${s.label}</div></div>
              <div class="muted" style="font-weight:500">${s.time}</div>
            </div>`;
  }).join('')}
        </div>
      </div>
      <div class="card row gap-12 mt-12">
        ${avatarEl('R', 'var(--mint)', 46)}
        <div class="col gap-4 grow">
          <div class="h3">${o.courier}</div>
          <div class="row gap-4">${I.star()}<span style="font-size:11px;font-weight:600">4.9</span><span style="color:var(--ink4);margin:0 2px">·</span><span class="muted">Your courier</span></div>
        </div>
        <div style="width:38px;height:38px;background:var(--cream);border-radius:12px;display:flex;align-items:center;justify-content:center">${I.chat()}</div>
        <div style="width:38px;height:38px;background:var(--mint);border-radius:12px;display:flex;align-items:center;justify-content:center">${I.phone('#fff')}</div>
      </div>
      <div class="card row spread mt-12" style="cursor:pointer">
        <div class="col gap-2">
          <div class="lbl" style="color:var(--charcoal)">Order Details</div>
          <div class="muted">${o.items.length} item${o.items.length > 1 ? 's' : ''} · ${fmt(o.total)}</div>
        </div>
        ${I.chevD()}
      </div>
      <div style="height:24px"></div>
    </div>
  </div>`;
});

// 7. MY ORDERS
let ordersTab = 'active';
route('/buyer/orders', () => {
  const active = state.orders.filter(o => o.status !== 'delivered');
  const past = state.orders.filter(o => o.status === 'delivered');
  const list = ordersTab === 'active' ? active : past;
  return `<div class="screen">
    <div style="padding:18px 20px 8px"><div class="h1">My Orders</div></div>
    <div class="tabs">
      <div class="tab ${ordersTab === 'active' ? 'active' : ''}" onclick="ordersTab='active';render()">Active${active.length ? ` <span class="pill" style="background:var(--orange);color:#fff;padding:1px 6px;font-size:10px;margin-left:4px">${active.length}</span>` : ''}</div>
      <div class="tab ${ordersTab === 'past' ? 'active' : ''}" onclick="ordersTab='past';render()">Past</div>
    </div>
    <div class="scroll px-16" style="padding-top:16px">
      ${list.length === 0 ? `<div class="empty">${I.bag('var(--ink4)')}<div style="font-size:15px;font-weight:700;color:var(--charcoal);margin-top:12px">${ordersTab === 'active' ? 'No active orders' : 'No past orders yet'}</div><div class="mt-8">${ordersTab === 'active' ? 'Place an order to see it here.' : ''}</div></div>`
      : list.map(o => {
        const s = getStore(o.storeId);
        const itemNames = o.items.map(i => getItem(i.id)?.name).filter(Boolean).join(', ');
        if (ordersTab === 'active') {
          return `<div class="card mt-12">
              <div class="row spread" style="margin-bottom:12px">
                <div class="row gap-8"><div style="width:8px;height:8px;background:var(--orange);border-radius:50%"></div><span style="font-size:11px;font-weight:800;color:var(--orange-deep);letter-spacing:.5px">ON THE WAY</span></div>
                <span class="muted" style="font-weight:600">#${o.id}</span>
              </div>
              <div class="row gap-10" style="margin-bottom:12px">
                ${foodImg('52px', '52px', s.hue, 12)}
                <div class="col gap-4 grow"><div class="h3">${s.name}</div><div class="muted">${itemNames}</div></div>
                <div style="font-size:13px;font-weight:800">${fmt(o.total)}</div>
              </div>
              <div class="divider"></div>
              <div class="row spread mt-8">
                <div class="row gap-8">${avatarEl('R', 'var(--mint)', 28)}<div class="col" style="gap:1px"><div style="font-size:12px;font-weight:700">${o.courier}</div><div style="font-size:10px;color:var(--ink3)">${state.user.location.split(',')[0]}</div></div></div>
                <button class="btn btn-primary btn-sm" data-go="/buyer/track/${o.id}">Track Order</button>
              </div>
            </div>`;
        } else {
          return `<div class="card mt-12">
              <div class="row gap-10">
                ${foodImg('44px', '44px', s.hue, 10)}
                <div class="col gap-2 grow">
                  <div class="row spread"><div class="h3">${s.name}</div><div style="font-size:13px;font-weight:800">${fmt(o.total)}</div></div>
                  <div class="muted">${itemNames} · ${o.placedAt}</div>
                </div>
              </div>
              <div class="row gap-8 mt-12">
                <button class="btn btn-sm" style="flex:1;background:var(--orange-soft);color:var(--orange-deep)" data-action="reorder:${o.id}">Reorder</button>
                ${o.rated > 0
              ? `<button class="btn btn-sm btn-ghost" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px">${I.star()}<span>Rated ${o.rated}</span></button>`
              : `<button class="btn btn-sm btn-outline" style="flex:1" data-go="/buyer/rate/${o.id}">Rate Order</button>`}
              </div>
            </div>`;
        }
      }).join('')}
      <div style="height:24px"></div>
    </div>
    ${bottomNav('orders', 'buyer')}
  </div>`;
});

// Rate order screen
route('/buyer/rate/:id', ({ id }) => {
  const o = state.orders.find(x => x.id === id);
  if (!o) { setTimeout(() => go('/buyer/orders'), 0); return `<div class="screen"></div>`; }
  const s = getStore(o.storeId);
  return `<div class="screen">
    <div class="topbar row gap-12"><div class="topbar-icon" data-go="/buyer/orders">${I.back()}</div><div class="h1">Rate your order</div></div>
    <div class="scroll p-20">
      <div class="card center col gap-8">
        ${foodImg('72px', '72px', s.hue, 16)}
        <div class="h2 mt-8">${s.name}</div>
        <div class="muted">${o.placedAt} · ${fmt(o.total)}</div>
      </div>
      <div class="card mt-12">
        <div class="h3" style="text-align:center">Rate the store</div>
        <div class="rating">
          ${[1, 2, 3, 4, 5].map(n => `<span data-action="rateOrder:${o.id}:${n}">${I.starOutline(n <= (o.rated || 0) ? 'var(--amber)' : 'var(--ink4)', 34)}</span>`).join('')}
        </div>
        <div class="muted" style="text-align:center">Tap a star</div>
      </div>
      <div class="card mt-12">
        <div class="h3" style="text-align:center">Rate the delivery</div>
        <div class="row gap-10 mt-16" style="justify-content:center">
          ${avatarEl('R', 'var(--mint)', 48)}
        </div>
        <div style="text-align:center;font-weight:700;margin-top:4px">${o.courier}</div>
        <div class="rating">
          ${[1, 2, 3, 4, 5].map(n => `<span data-action="rateCourier:${o.id}:${n}">${I.starOutline(n <= (o.courierRated || 0) ? 'var(--amber)' : 'var(--ink4)', 34)}</span>`).join('')}
        </div>
      </div>
      <button class="btn btn-primary btn-block mt-16" data-go="/buyer/orders">Submit</button>
    </div>
  </div>`;
});

// 8. SELLER DASHBOARD
route('/seller/dashboard', () => {
  const incoming = incomingOrders();
  return `<div class="screen bg-seller">
    <div class="topbar tint-seller">
      <div class="row spread">
        <div class="row gap-10">
          <div style="width:42px;height:42px;background:var(--blue-soft);border-radius:12px;display:flex;align-items:center;justify-content:center">${I.store('var(--blue)')}</div>
          <div class="col gap-2"><div class="h2">Warung Bu Siti</div><div class="muted">Seller Dashboard</div></div>
        </div>
        <div class="row gap-8" style="background:${state.sellerOnline ? 'var(--mint-soft)' : '#F0EDE7'};border-radius:999px;padding:5px 5px 5px 12px;cursor:pointer" data-action="toggleSellerOnline">
          <span style="font-size:12px;font-weight:700;color:${state.sellerOnline ? 'var(--mint-deep)' : 'var(--ink3)'}">${state.sellerOnline ? 'Open' : 'Closed'}</span>
          <div class="toggle sm ${state.sellerOnline ? 'on' : ''}"></div>
        </div>
      </div>
    </div>
    <div class="scroll px-16" style="padding-top:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        <div class="card" style="padding:12px 10px"><div style="font-size:20px;font-weight:800">24</div><div class="lbl mt-4">TODAY'S ORDERS</div></div>
        <div class="card" style="padding:12px 10px;background:var(--blue);color:#fff"><div style="font-size:18px;font-weight:800">Rp 528K</div><div class="lbl mt-4" style="color:#fff;opacity:.85">REVENUE</div></div>
        <div class="card" style="padding:12px 10px"><div style="font-size:20px;font-weight:800">7<span style="font-size:11px;color:var(--ink3);font-weight:600"> min</span></div><div class="lbl mt-4">AVG PREP</div></div>
      </div>
      <div class="row spread" style="margin-bottom:10px"><div class="h2">Incoming Orders</div>${incoming.length ? `<div class="row gap-6"><div style="width:8px;height:8px;background:var(--orange);border-radius:50%"></div><span style="font-size:11px;color:var(--orange);font-weight:700">${incoming.length} NEW</span></div>` : ''}</div>
      ${incoming.map(o => `
        <div class="card mt-8" style="border-left:4px solid var(--orange)">
          <div class="row spread"><div class="col gap-2"><div class="muted" style="font-weight:700">#${o.id} · ${o.placedAt}</div><div class="h3">${o.buyer} · ${o.time}</div></div><div style="font-size:13px;font-weight:800">${fmt(o.total)}</div></div>
          <div class="mt-8" style="padding:8px 10px;background:var(--cream);border-radius:8px;font-size:12px;color:var(--ink2)">${o.items.map(i => `${i.qty}× ${i.name}`).join(' · ')}</div>
          <div class="row gap-8 mt-12">
            <button class="btn btn-sm btn-ghost" style="flex:1" data-action="declineOrder:${o.id}">Decline</button>
            <button class="btn btn-sm btn-blue" style="flex:2" data-action="acceptOrder:${o.id}">Accept</button>
          </div>
        </div>`).join('')}
      <div class="h2 mt-16" style="margin-bottom:10px">In Progress</div>
      <div class="card">
        <div class="row spread">
          <div class="col gap-2">
            <div class="row gap-6"><span class="muted" style="font-weight:700">#KY-1042</span><span class="pill" style="background:var(--amber);color:#fff">PREPARING</span></div>
            <div class="h3 mt-4">Joel W. · Nasi Ayam + Nasi Sayur</div>
          </div>
        </div>
        <button class="btn btn-mint btn-block mt-12" data-action="markReady:KY-1042">Ready for Pickup</button>
      </div>
      <div style="height:24px"></div>
    </div>
    ${bottomNav('orders', 'seller')}
  </div>`;
});

// 9. MENU MANAGEMENT
route('/seller/menu', () => {
  const items = menu[1]; // Bu Siti
  return `<div class="screen bg-seller">
    <div class="topbar row spread" style="background:#fff;border-bottom:1px solid var(--border)">
      <div class="topbar-icon" data-go="/seller/dashboard">${I.back()}</div>
      <div style="background:var(--cream);color:var(--ink2);font-size:11px;font-weight:600;padding:6px 12px;border-radius:999px;display:flex;align-items:center;gap:6px;cursor:pointer">${I.edit()}<span>Edit store photo</span></div>
    </div>
    <div style="padding:16px 20px 10px;background:#fff;border-bottom:1px solid var(--border)">
      <div class="row spread">
        <div class="col gap-2"><div class="h1">Menu</div><div class="muted">${Object.values(items).reduce((a, b) => a + b.length, 0)} items · ${Object.keys(items).length} categories</div></div>
        <button class="btn btn-blue btn-sm" data-action="showSheet:add-item">${I.plus('#fff')} Add Item</button>
      </div>
    </div>
    <div class="tabs seller" style="background:#fff">
      ${Object.entries(items).map(([cat, list], i) => `<div class="tab ${i === 0 ? 'active' : ''}">${cat} (${list.length})</div>`).join('')}
    </div>
    <div class="scroll px-16" style="padding-top:12px">
      ${Object.values(items).flat().map(item => {
    const soldOut = state.soldOut.includes(item.id);
    return `<div class="card mt-8 row gap-12">
          <div style="opacity:.5">${I.drag()}</div>
          <div class="item-thumb" style="width:56px;height:56px;background:linear-gradient(135deg, hsl(${item.hue},70%,78%), hsl(${(item.hue + 30) % 360},65%,68%));border-radius:12px"></div>
          <div class="col gap-4 grow" style="min-width:0">
            <div class="h3">${item.name}</div>
            <div class="row gap-6"><span style="font-size:12px;font-weight:800">${fmt(item.price)}</span><span style="color:var(--ink4);font-size:10px">·</span><span class="muted">${item.weight} KG</span></div>
          </div>
          <div class="col gap-4" style="align-items:flex-end">
            <div class="toggle sm ${soldOut ? '' : 'on'}" data-action="toggleSoldOut:${item.id}"></div>
            <span style="font-size:9.5px;font-weight:700;color:${soldOut ? 'var(--ink3)' : 'var(--mint)'}">${soldOut ? 'SOLD OUT' : 'IN STOCK'}</span>
          </div>
          <div style="width:32px;height:32px;background:var(--cream);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer" data-action="showSheet:add-item">${I.edit()}</div>
        </div>`;
  }).join('')}
      <div style="height:24px"></div>
    </div>
    ${bottomNav('menu', 'seller')}
    ${sheetOverlay()}
  </div>`;
});

// 10. SELLER ANALYTICS
let analyticsPeriod = 'week';
route('/seller/analytics', () => {
  return `<div class="screen bg-seller">
    <div class="topbar tint-seller">
      <div class="row spread"><div class="h1">Analytics</div>${I.bell()}</div>
      <div class="seg mt-16">
        <div class="${analyticsPeriod === 'today' ? 'active' : ''}" onclick="analyticsPeriod='today';render()">Today</div>
        <div class="${analyticsPeriod === 'week' ? 'active' : ''}" onclick="analyticsPeriod='week';render()">This Week</div>
        <div class="${analyticsPeriod === 'month' ? 'active' : ''}" onclick="analyticsPeriod='month';render()">This Month</div>
      </div>
    </div>
    <div class="scroll px-16" style="padding-top:14px">
      <div style="background:var(--blue);color:#fff;border-radius:20px;padding:20px;position:relative;overflow:hidden">
        <div style="position:absolute;right:-30px;bottom:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)"></div>
        <div class="lbl" style="color:#fff;opacity:.85">TOTAL REVENUE · ${analyticsPeriod.toUpperCase()}</div>
        <div style="font-size:32px;font-weight:800;letter-spacing:-.6px;margin-top:6px">${analyticsPeriod === 'today' ? 'Rp 528.000' : analyticsPeriod === 'week' ? 'Rp 3.240.000' : 'Rp 13.8M'}</div>
        <div class="row gap-6 mt-4">
          <div style="background:rgba(255,255,255,.2);padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700">↑ 18%</div>
          <span style="font-size:12px;opacity:.85">vs last ${analyticsPeriod === 'today' ? 'day' : analyticsPeriod === 'week' ? 'week' : 'month'}</span>
        </div>
        <div class="mt-12" style="font-size:11px;opacity:.85;font-style:italic">After 20% platform fee deduction</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
        <div class="card"><div class="lbl">ORDERS</div><div style="font-size:22px;font-weight:800;margin-top:4px">147</div><div style="font-size:11px;color:var(--mint);font-weight:700">↑ 12 vs last week</div></div>
        <div class="card"><div class="lbl">RATING</div><div class="row gap-4 mt-4"><div style="font-size:22px;font-weight:800">4.8</div>${I.star('var(--amber)', 16)}</div><div class="muted">from 89 reviews</div></div>
      </div>
      <div class="card mt-12">
        <div class="row spread" style="margin-bottom:10px"><div class="h3">Peak Order Hours</div><span class="muted">This week</span></div>
        <div class="bar-chart">
          ${[8, 15, 12, 42, 58, 72, 38, 22, 18, 45, 52, 25].map(v => `<div class="bar ${v > 50 ? 'hot' : ''}" style="height:${v}%"></div>`).join('')}
        </div>
        <div class="row spread mt-8" style="font-size:10px;color:var(--ink3);font-weight:600"><span>8a</span><span>10a</span><span>12p</span><span>2p</span><span>4p</span><span>6p</span></div>
        <div class="row gap-6 mt-8">${I.info('var(--blue)')}<span style="font-size:11px;color:var(--ink2)">Busiest: <span style="font-weight:700;color:var(--charcoal)">12–1 PM</span></span></div>
      </div>
      <div class="card mt-12">
        <div class="h3" style="margin-bottom:10px">Top-Selling Items</div>
        ${[
      { name: 'Nasi Ayam Bakar', count: 42, hue: 30 },
      { name: 'Nasi Rendang', count: 38, hue: 15 },
      { name: 'Ayam Geprek', count: 31, hue: 40 },
      { name: 'Nasi Sayur', count: 22, hue: 100 },
    ].map((it, i) => `
          <div class="row gap-10" style="padding:8px 0;${i < 3 ? 'border-bottom:1px solid var(--border)' : ''}">
            <div style="width:22px;height:22px;background:var(--blue-soft);color:var(--blue);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">${i + 1}</div>
            ${foodImg('32px', '32px', it.hue, 8)}
            <div class="col gap-2 grow"><div style="font-size:12.5px;font-weight:700">${it.name}</div><div style="height:4px;background:var(--border);border-radius:4px;overflow:hidden"><div style="width:${it.count * 2}%;height:100%;background:var(--blue)"></div></div></div>
            <div style="font-size:13px;font-weight:800">${it.count}</div>
          </div>`).join('')}
      </div>
      <div style="height:24px"></div>
    </div>
    ${bottomNav('analytics', 'seller')}
  </div>`;
});

// 11. DELIVERY HOME
route('/delivery/home', () => {
  const orders = availableOrders();
  return `<div class="screen bg-delivery">
    <div class="topbar tint-delivery">
      <div class="row spread mt-4">
        <div class="row gap-8">
          <div style="width:32px;height:32px;background:var(--mint);border-radius:10px;display:flex;align-items:center;justify-content:center">${I.run('#fff')}</div>
          <div class="h2">Delivery Mode</div>
        </div>
        <div class="topbar-icon" style="position:relative;background:var(--cream)" data-action="showSheet:notifications">${I.bell()}${state.notifications ? `<div class="badge-dot" style="background:var(--mint)"></div>` : ''}</div>
      </div>
      <div class="mt-16" style="background:linear-gradient(135deg, var(--mint), var(--mint-deep));border-radius:16px;padding:14px 16px;position:relative;overflow:hidden">
        <div style="position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.1)"></div>
        <div class="row spread" style="align-items:flex-start">
          <div>
            <div class="lbl" style="color:#fff;opacity:.85">TODAY'S EARNINGS</div>
            <div style="font-size:26px;font-weight:800;color:#fff;letter-spacing:-.5px;margin-top:4px">Rp 45.000</div>
            <div class="row gap-6 mt-4">
              <div style="background:rgba(255,255,255,.2);padding:2px 8px;border-radius:999px;font-size:10px;font-weight:800;color:#fff;display:flex;align-items:center;gap:4px">${I.fire('#fff')}<span>6 DELIVERIES</span></div>
            </div>
          </div>
          <div class="col" style="align-items:flex-end;gap:6px">
            <span style="font-size:10px;color:#fff;opacity:.85;font-weight:700">${state.deliveryOnline ? 'AVAILABLE' : 'OFFLINE'}</span>
            <div class="toggle ${state.deliveryOnline ? 'on' : ''}" style="background:${state.deliveryOnline ? '#fff' : 'rgba(255,255,255,.4)'}" data-action="toggleDeliveryOnline"></div>
          </div>
        </div>
      </div>
    </div>
    ${state.deliveryOnline ? `
    <div style="padding:14px 20px 8px">
      <div class="row spread"><div class="h2">Available Orders</div><div class="row gap-6"><div style="width:8px;height:8px;background:var(--mint);border-radius:50%"></div><span style="font-size:11px;color:var(--mint);font-weight:800">${orders.length} NEARBY</span></div></div>
      <div class="muted mt-4">Sorted by nearest store</div>
    </div>
    <div class="scroll px-16">
      ${orders.map(o => `
        <div class="card mt-8" style="${o.urgent ? 'border:1.5px solid var(--orange)' : ''}">
          ${o.urgent ? `<div class="row gap-4" style="margin-bottom:8px"><div style="width:6px;height:6px;background:var(--orange);border-radius:50%"></div><span style="font-size:10px;font-weight:800;color:var(--orange);letter-spacing:.5px">URGENT · 12 MIN LEFT</span></div>` : ''}
          <div class="row spread" style="align-items:flex-start">
            <div class="col gap-6 grow">
              <div class="row gap-6">${I.store()}<div class="h3">${o.store}</div></div>
              <div class="row gap-4"><span class="muted">Pickup:</span><span style="font-size:11px;font-weight:700;color:var(--ink2)">${o.storeLoc}</span></div>
              <div class="row gap-4">${I.pin('var(--mint)')}<span style="font-size:12px;font-weight:700">${o.dest}</span></div>
            </div>
            <div class="col" style="align-items:flex-end;gap:4px">
              <div style="font-size:11px;color:var(--ink3);font-weight:600">EARN</div>
              <div style="font-size:18px;font-weight:800;color:var(--mint)">${fmt(o.fee)}</div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="row spread">
            <div class="row gap-10">
              <div class="row gap-4">${I.clock()}<span style="font-size:11px;color:var(--ink3);font-weight:600">${o.walk}</span></div>
              <span class="muted">${o.items} items · ~${o.weight} KG</span>
            </div>
            <button class="btn btn-mint btn-sm" data-action="claimOrder:${o.orderId}">Claim Order</button>
          </div>
        </div>`).join('')}
      <div style="height:24px"></div>
    </div>` : `
    <div class="scroll">
      <div class="empty" style="padding-top:80px">
        ${I.run('var(--ink4)')}
        <div style="font-size:15px;font-weight:700;color:var(--charcoal);margin-top:12px">You're offline</div>
        <div class="mt-8">Toggle available to start receiving orders.</div>
      </div>
    </div>`}
    ${bottomNav('home', 'delivery')}
    ${sheetOverlay()}
  </div>`;
});

// 12. ACTIVE DELIVERY
route('/delivery/active', () => {
  const ad = state.activeDelivery;
  if (!ad) {
    return `<div class="screen bg-delivery">
      <div class="topbar row gap-12"><div class="topbar-icon" data-go="/delivery/home">${I.back()}</div><div class="h1">Active Delivery</div></div>
      <div class="scroll">
        <div class="empty" style="padding-top:60px">
          ${I.bag('var(--ink4)')}
          <div style="font-size:15px;font-weight:700;color:var(--charcoal);margin-top:12px">No available orders — check back soon!</div>
          <button class="btn btn-mint mt-16" data-go="/delivery/home" style="max-width:200px;margin:16px auto 0">Browse Orders</button>
        </div>
      </div>
      ${bottomNav('active', 'delivery')}
    </div>`;
  }
  return `<div class="screen bg-delivery">
    <div class="topbar row gap-12 tint-delivery">
      <div class="topbar-icon" style="background:var(--cream)" data-go="/delivery/home">${I.back()}</div>
      <div class="col gap-2 grow"><div class="muted">#${ad.orderId} · Warung Bu Siti</div><div class="h2">Active Delivery</div></div>
      <span class="pill pill-mint">STEP ${ad.step}/2</span>
    </div>
    <div class="scroll px-16" style="padding-top:14px">
      <!-- Step 1 -->
      <div class="card mt-8" style="${ad.step > 1 ? 'opacity:.7' : `border:2px solid var(--mint)`}">
        <div class="row gap-10">
          <div style="width:32px;height:32px;border-radius:50%;background:${ad.step > 1 ? 'var(--mint)' : 'var(--mint-soft)'};color:${ad.step > 1 ? '#fff' : 'var(--mint-deep)'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;position:relative">
            ${ad.step > 1 ? I.check() : '1'}
            ${ad.step === 1 ? `<div style="position:absolute;inset:-4px;border-radius:50%;background:var(--mint);opacity:.3"></div>` : ''}
          </div>
          <div class="col gap-2 grow">
            <div class="lbl" style="color:var(--mint-deep)">STEP 1${ad.step > 1 ? ' · DONE' : ' · ACTIVE'}</div>
            <div class="h3">Pick up from Warung Bu Siti · Block C</div>
          </div>
        </div>
        ${ad.step === 1 ? `
        <div class="mt-12">
          ${campusMap(324, 140, { highlights: ['C'], stores: [[0.68, 0.22]], you: [0.52, 0.35], path: [[0.52, 0.35], [0.68, 0.22]] })}
          <div class="card-flat mt-8" style="background:var(--cream)">
            <div class="lbl mb-4">Item checklist</div>
            <div class="col gap-4 mt-4">
              <div class="row gap-6"><div style="width:16px;height:16px;border-radius:4px;background:var(--mint);display:flex;align-items:center;justify-content:center">${I.check('#fff', 10)}</div><span style="font-size:12px">1× Nasi Ayam Bakar</span></div>
              <div class="row gap-6"><div style="width:16px;height:16px;border-radius:4px;background:var(--mint);display:flex;align-items:center;justify-content:center">${I.check('#fff', 10)}</div><span style="font-size:12px">1× Nasi Sayur</span></div>
            </div>
          </div>
          <button class="btn btn-mint btn-block mt-12" data-action="confirmPickup">Confirm Picked Up</button>
        </div>` : ''}
      </div>
      <!-- Step 2 -->
      <div class="card mt-12" style="${ad.step === 2 ? `border:2px solid var(--mint);padding:0;overflow:hidden` : ''}">
        <div style="${ad.step === 2 ? 'padding:12px 14px;background:var(--mint-soft)' : ''}">
          <div class="row gap-10">
            <div style="width:32px;height:32px;border-radius:50%;background:${ad.step === 2 ? 'var(--mint)' : '#fff'};color:${ad.step === 2 ? '#fff' : 'var(--ink3)'};border:${ad.step === 2 ? 'none' : '1.5px solid var(--ink4)'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;position:relative">
              2
              ${ad.step === 2 ? `<div style="position:absolute;inset:-4px;border-radius:50%;background:var(--mint);opacity:.3"></div>` : ''}
            </div>
            <div class="col gap-2 grow">
              <div class="lbl" style="color:var(--mint-deep)">STEP 2 ${ad.step === 2 ? '· ACTIVE' : ''}</div>
              <div class="h3">Deliver to Joel W.</div>
            </div>
          </div>
        </div>
        ${ad.step === 2 ? `
          <div style="padding:12px 14px">
            ${(() => {
              const ub = userBlock(); const dc = userBlockCoord();
              const sc = [0.68, 0.22]; // Warung Bu Siti · Block C
              const mid = [(sc[0] + dc[0]) / 2, (sc[1] + dc[1]) / 2 - 0.05];
              return campusMap(324, 160, { highlights: [ub], stores: [sc], dest: dc, you: mid, path: [sc, mid, dc] });
            })()}
            <div class="row gap-6 mt-8 card-flat" style="background:var(--cream);padding:8px 10px">
              ${I.pin('var(--mint)')}
              <div class="col gap-2 grow"><div class="h3">${state.user.location}</div><div class="muted">${state.user.locNote} · ~3 min walk</div></div>
            </div>
          </div>
          <div style="padding:0 14px 14px">
            <div class="row gap-10 card-flat" style="background:var(--cream);padding:10px">
              ${avatarEl('J', 'var(--orange)', 36)}
              <div class="col gap-2 grow"><div class="h3">Joel W.</div><div class="muted">Waiting at Block K</div></div>
              <div style="width:34px;height:34px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center">${I.chat()}</div>
              <div style="width:34px;height:34px;background:var(--mint);border-radius:10px;display:flex;align-items:center;justify-content:center">${I.phone('#fff')}</div>
            </div>
          </div>
          <button class="btn btn-mint btn-block" style="border-radius:0" data-action="confirmDelivered">Confirm Delivered</button>` : ''}
      </div>
      <div class="card row spread mt-12">
        <div class="col gap-2"><div class="lbl" style="color:var(--charcoal)">Order Details</div><div class="muted">2 items · Est. 1.8 KG</div></div>
        ${I.chevD()}
      </div>
      <div style="height:24px"></div>
    </div>
    ${bottomNav('active', 'delivery')}
  </div>`;
});

// 13. DELIVERY EARNINGS
route('/delivery/earnings', () => {
  return `<div class="screen bg-delivery">
    <div class="topbar tint-delivery">
      <div class="row spread"><div class="row gap-12"><div class="topbar-icon" style="background:var(--cream)" data-go="/profile">${I.back()}</div><div class="h1">Earnings</div></div>${I.bell()}</div>
    </div>
    <div class="scroll px-16" style="padding-top:14px">
      <div style="background:linear-gradient(135deg, var(--mint), var(--mint-deep));border-radius:20px;padding:20px;color:#fff;position:relative;overflow:hidden">
        <div style="position:absolute;right:-40px;bottom:-40px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.08)"></div>
        <div class="lbl" style="color:#fff;opacity:.85">THIS WEEK</div>
        <div style="font-size:32px;font-weight:800;letter-spacing:-.6px;margin-top:6px">Rp 285.000</div>
        <div style="font-size:12px;opacity:.9;margin-top:4px">from 38 deliveries</div>
        <div class="mt-16" style="padding:10px 12px;background:rgba(255,255,255,.15);border-radius:12px;display:flex;align-items:center;gap:10px">
          ${I.fire('#fff')}
          <div class="col gap-2 grow"><div style="font-size:13px;font-weight:800">5-day streak!</div><div style="font-size:10px;opacity:.85">3 more deliveries to unlock bonus</div></div>
          <div style="font-size:11px;font-weight:800;background:rgba(255,255,255,.2);padding:4px 10px;border-radius:999px">🔥×5</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px">
        <div class="card"><div class="lbl">TODAY</div><div style="font-size:16px;font-weight:800;margin-top:2px">Rp 45K</div><div style="font-size:10px;color:var(--mint);font-weight:700">6 trips</div></div>
        <div class="card"><div class="lbl">WEEK</div><div style="font-size:16px;font-weight:800;margin-top:2px">Rp 285K</div><div style="font-size:10px;color:var(--mint);font-weight:700">38 trips</div></div>
        <div class="card"><div class="lbl">MONTH</div><div style="font-size:16px;font-weight:800;margin-top:2px">Rp 1.1M</div><div style="font-size:10px;color:var(--mint);font-weight:700">142 trips</div></div>
      </div>
      <div class="card mt-12 row gap-12">
        <div style="width:40px;height:40px;background:var(--mint-soft);border-radius:12px;display:flex;align-items:center;justify-content:center">${I.wallet('var(--mint)')}</div>
        <div class="col gap-2 grow"><div class="h3">Next payout: Friday</div><div class="muted">Weekly payout · GoPay</div></div>
        <button class="btn btn-dark btn-sm" onclick="toast('Payout requested')">Withdraw</button>
      </div>
      <div class="row spread" style="margin:18px 4px 10px"><div class="h2">Delivery History</div><span style="font-size:12px;color:var(--mint);font-weight:700">See all</span></div>
      ${state.deliveryHistory.map((d, i, arr) => `
        <div style="padding:12px 4px;${i < arr.length - 1 ? 'border-bottom:1px solid var(--border)' : ''};display:flex;gap:12px;align-items:center">
          <div style="width:36px;height:36px;background:var(--mint-soft);border-radius:10px;display:flex;align-items:center;justify-content:center">${I.check('var(--mint)')}</div>
          <div class="col gap-2 grow"><div class="h3">${d.store} → ${d.dest}</div><div class="muted">${d.time} · ${d.weight} KG</div></div>
          <div style="font-size:14px;font-weight:800;color:var(--mint)">+${fmt(d.fee)}</div>
        </div>`).join('')}
      <div style="height:24px"></div>
    </div>
  </div>`;
});

// 14. CAMPUS MAP (shared)
route('/map', () => {
  const kind = state.role || 'buyer';
  const html = campusMap(360, 440, { highlights: [userBlock()], stores: [[0.42, 0.22], [0.78, 0.47], [0.20, 0.44], [0.24, 0.74]], dest: userBlockCoord(), you: [0.52, 0.35] });
  return `<div class="screen">
    <div class="topbar">
      <div class="row spread">
        <div class="h1">Campus Map</div>
        <div class="topbar-icon">${I.search()}</div>
      </div>
      <div class="muted mt-4">Tap a building to set delivery location</div>
    </div>
    <div class="scroll px-16">
      <div style="border-radius:20px;overflow:hidden;box-shadow:var(--shadow);position:relative">
        ${html}
        <div style="position:absolute;top:170px;right:20px;background:#fff;border-radius:14px;padding:12px;box-shadow:var(--shadow-lg);width:170px">
          <div class="row gap-8" style="margin-bottom:6px"><div style="width:6px;height:6px;background:var(--mint);border-radius:50%"></div><span style="font-size:10px;font-weight:800;color:var(--mint)">OPEN</span></div>
          <div class="h3">Warung Bu Siti</div>
          <div class="muted mt-4">Block C · Rice bowls</div>
          <div class="row gap-4 mt-4">${I.star()}<span style="font-size:11px;font-weight:700">4.8</span></div>
          <button class="btn btn-primary btn-sm btn-block mt-8" data-action="goStore:1">View Menu</button>
          <div style="position:absolute;bottom:-8px;left:30px;width:16px;height:16px;background:#fff;transform:rotate(45deg);box-shadow:2px 2px 4px rgba(0,0,0,.05)"></div>
        </div>
      </div>
      <div class="card-flat mt-16">
        <div class="lbl" style="margin-bottom:10px">Legend</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          <div class="row gap-6"><div style="width:12px;height:12px;background:var(--orange);border-radius:50%"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">Store</span></div>
          <div class="row gap-6"><div style="width:12px;height:12px;background:var(--mint);border-radius:50%"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">Delivery</span></div>
          <div class="row gap-6"><div style="width:12px;height:12px;background:var(--blue);border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px var(--border)"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">You</span></div>
        </div>
      </div>
      <div style="height:24px"></div>
    </div>
    ${bottomNav('map', kind)}
  </div>`;
});

// 15. PROFILE
route('/profile', () => {
  const role = state.role || 'buyer';
  const RoleBtn = (r, emoji, label, color) => {
    const active = role === r;
    return `<div style="padding:12px 8px;background:${active ? 'var(--orange-soft)' : 'transparent'};border-radius:12px;text-align:center;${active ? `border:1.5px solid ${color}` : ''};cursor:pointer" data-action="switchRole:${r}">
      <div style="font-size:11px;font-weight:800;color:${active ? color : 'var(--ink3)'}">${emoji} ${label.toUpperCase()}</div>
      ${active ? `<div style="font-size:9px;color:${color};margin-top:2px;font-weight:600">ACTIVE</div>` : ''}
    </div>`;
  };
  const dietaryList = [
    { k: 'halal', label: 'Halal', color: 'orange' },
    { k: 'veg', label: 'Vegetarian', color: 'mint' },
    { k: 'noseafood', label: 'No Seafood', color: 'ghost' },
    { k: 'nopeanuts', label: 'No Peanuts', color: 'ghost' },
  ];
  return `<div class="screen">
    <div style="padding:24px 20px 20px;text-align:center;position:relative">
      <div style="position:absolute;top:16px;left:20px">${brandMarkTight(28)}</div>
      <div style="width:80px;height:80px;border-radius:50%;background:var(--orange);color:#fff;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;margin:0 auto 12px;border:4px solid #fff;box-shadow:0 4px 16px rgba(255,107,53,.25)">${state.user.initials}</div>
      <div style="font-size:20px;font-weight:800">${state.user.name}</div>
      <div class="muted mt-4">Tarumanagara University · SID ${state.user.sid}</div>
    </div>
    <div class="px-16">
      <div class="card" style="padding:6px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
        ${RoleBtn('buyer', '🛒', 'Buyer', 'var(--orange)')}
        ${RoleBtn('seller', '🏪', 'Seller', 'var(--blue)')}
        ${RoleBtn('delivery', '🏃', 'Delivery', 'var(--mint)')}
      </div>
    </div>
    <div class="scroll p-16">
      ${role === 'buyer' ? `
        <div class="card mt-12">
          <div class="row spread" style="margin-bottom:12px">
            <div class="lbl" style="color:var(--charcoal)">Dietary Preferences</div>
            <span style="font-size:11px;color:var(--orange);font-weight:700;cursor:pointer">Edit</span>
          </div>
          <div class="row gap-6" style="flex-wrap:wrap">
            ${dietaryList.map(d => {
      const on = state.dietary.includes(d.k);
      return `<span class="pill pill-${on ? (d.color === 'ghost' ? 'orange' : d.color) : 'ghost'}" style="cursor:pointer" data-action="toggleDietary:${d.k}">${d.label}${on ? ' ✓' : ''}</span>`;
    }).join('')}
          </div>
        </div>
      ` : role === 'seller' ? `
        <div class="card mt-12 row gap-12" style="cursor:pointer" data-go="/seller/dashboard">
          <div style="width:38px;height:38px;background:var(--blue-soft);border-radius:11px;display:flex;align-items:center;justify-content:center">${I.store('var(--blue)')}</div>
          <div class="col gap-2 grow"><div class="h3">My Store Dashboard</div><div class="muted">Warung Bu Siti · 24 orders today</div></div>
          ${I.chevR()}
        </div>
      ` : `
        <div class="card mt-12 row gap-12" style="cursor:pointer" data-go="/delivery/earnings">
          <div style="width:38px;height:38px;background:var(--mint-soft);border-radius:11px;display:flex;align-items:center;justify-content:center">${I.wallet('var(--mint)')}</div>
          <div class="col gap-2 grow"><div class="h3">My Earnings</div><div class="muted">Rp 285.000 this week</div></div>
          ${I.chevR()}
        </div>
      `}
      ${[
      { icon: I.pin('var(--orange)'), title: 'Default Delivery Location', sub: state.user.location, action: 'showLocation:/profile' },
      { icon: I.wallet('var(--orange)'), title: 'Payment Methods', sub: 'GoPay · OVO · Campus Card' },
      { icon: I.bell('var(--orange)'), title: 'Notification Settings', sub: 'Order updates on' },
      { icon: I.help('var(--orange)'), title: 'Help & Support', sub: 'FAQs, contact us' },
    ].map((r, i, arr) => `
        <div style="background:#fff;padding:14px;${i === 0 ? 'border-radius:14px 14px 0 0;margin-top:12px' : i === arr.length - 1 ? 'border-radius:0 0 14px 14px' : ''};${i < arr.length - 1 ? 'border-bottom:1px solid var(--border)' : ''};display:flex;align-items:center;gap:12px;cursor:pointer" ${r.action ? `data-action="${r.action}"` : ''}>
          <div style="width:38px;height:38px;background:var(--orange-soft);border-radius:11px;display:flex;align-items:center;justify-content:center">${r.icon}</div>
          <div class="col gap-2 grow"><div class="h3">${r.title}</div><div class="muted">${r.sub}</div></div>
          ${I.chevR()}
        </div>`).join('')}
      <button class="btn btn-danger-soft btn-block mt-16" data-action="logout">${I.logout()} Log Out & Reset</button>
      <div style="text-align:center;font-size:10px;color:var(--ink3);margin-top:12px">Kenyan'in v1.0 · Made for TarUMA</div>
      <div style="height:24px"></div>
    </div>
    ${bottomNav('profile', role)}
  </div>`;
});

// ─── Init ───────────────────────────────────────────────────
window.addEventListener('hashchange', render);
window.render = render;
render();

// Register a service-worker-free "install to home screen" hint (no-op if not PWA)
