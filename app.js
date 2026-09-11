/* ═══════════════════════════════════════════════════════════
   mampir — campus food delivery prototype
   Vanilla JS SPA. Hash router. In-memory state (localStorage).
═══════════════════════════════════════════════════════════ */

// ─── State ──────────────────────────────────────────────────
const STATE_KEY = 'kenyanin.v1';
const SESSION_KEY = 'kenyanin.session'; // sessionStorage → cleared on tab close/reload
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
  soldOut: [],        // itemIds sold out at seller (legacy)
  favoriteStores: [1],
  // ── Carousell-style requests marketplace ──
  requests: [],       // all posts (mine + community)
  chats: {},          // reqId -> [{from:'buyer'|'runner', text, time}]
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
  { id: 7, name: 'Apotek TarUMA', prep: '~6 min', rating: 4.8, hue: 150, tags: ['Pharmacy'], desc: 'Meds, vitamins & first aid', open: true, block: 'Block D' },
  { id: 8, name: 'PrintKu', prep: '~10 min', rating: 4.6, hue: 220, tags: ['Printing'], desc: 'Print, bind & photocopy', open: true, block: 'Library' },
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
  7: {
    'Pain & Fever': [
      { id: 701, name: 'Paracetamol 500mg', desc: 'Strip of 10 tablets', price: 8000, hue: 150, weight: 0.05, tags: [] },
      { id: 702, name: 'Ibuprofen 400mg', desc: 'Strip of 10 tablets', price: 14000, hue: 150, weight: 0.05, tags: [] },
    ],
    'Cough & Cold': [
      { id: 703, name: 'Cough Syrup 60ml', desc: 'Bottle of expectorant syrup', price: 22000, hue: 30, weight: 0.15, tags: [] },
      { id: 704, name: 'Tolak Angin sachet', desc: 'Herbal wellness drink, 5 sachets', price: 15000, hue: 40, weight: 0.1, tags: [] },
      { id: 705, name: 'Vicks VapoRub', desc: 'Small jar', price: 18000, hue: 190, weight: 0.08, tags: [] },
    ],
    'Vitamins': [
      { id: 706, name: 'Vitamin C 500mg', desc: 'Bottle of 30 tablets', price: 32000, hue: 45, weight: 0.15, tags: [] },
      { id: 707, name: 'Vitamin B Complex', desc: 'Bottle of 30 tablets', price: 28000, hue: 55, weight: 0.15, tags: [] },
    ],
    'Stomach': [
      { id: 708, name: 'Antasid tablet', desc: 'Strip of 10 chewables', price: 9000, hue: 195, weight: 0.05, tags: [] },
      { id: 709, name: 'Oralit sachet', desc: 'Rehydration salts, 5 sachets', price: 10000, hue: 60, weight: 0.05, tags: [] },
      { id: 710, name: 'Antimo', desc: 'Motion sickness, 4 tablets', price: 6000, hue: 200, weight: 0.03, tags: [] },
    ],
    'First Aid': [
      { id: 711, name: 'Plasters (10 pcs)', desc: 'Assorted sizes', price: 8000, hue: 10, weight: 0.05, tags: [] },
      { id: 712, name: 'Betadine 15ml', desc: 'Antiseptic solution', price: 15000, hue: 25, weight: 0.08, tags: [] },
      { id: 713, name: 'Gauze roll', desc: 'Sterile, 5 metres', price: 12000, hue: 200, weight: 0.1, tags: [] },
      { id: 714, name: 'Menthol balm', desc: 'Balsem Lang, small', price: 10000, hue: 130, weight: 0.05, tags: [] },
    ],
    'Everyday': [
      { id: 715, name: 'Face masks (5 pcs)', desc: 'Disposable, blue', price: 6000, hue: 210, weight: 0.04, tags: [] },
      { id: 716, name: 'Hand sanitizer 60ml', desc: 'Alcohol-based gel', price: 12000, hue: 180, weight: 0.08, tags: [] },
      { id: 717, name: 'Tissue pack', desc: 'Pocket size, 2 packs', price: 5000, hue: 0, weight: 0.05, tags: [] },
    ],
  },
  8: {
    'Print': [
      { id: 801, name: 'B&W A4 print', desc: 'Per page, plain paper', price: 500, hue: 220, weight: 0.005, tags: [] },
      { id: 802, name: 'Colour A4 print', desc: 'Per page, plain paper', price: 1500, hue: 260, weight: 0.005, tags: [] },
      { id: 803, name: 'Colour A3 print', desc: 'Per page, larger format', price: 4000, hue: 260, weight: 0.02, tags: [] },
      { id: 804, name: 'Photo print 4R', desc: 'Glossy photo paper', price: 3500, hue: 30, weight: 0.01, tags: [] },
    ],
    'Photocopy': [
      { id: 805, name: 'Photocopy A4', desc: 'Per page, B&W', price: 300, hue: 220, weight: 0.005, tags: [] },
      { id: 806, name: 'Photocopy A3', desc: 'Per page, B&W', price: 800, hue: 220, weight: 0.02, tags: [] },
    ],
    'Bind & Finish': [
      { id: 807, name: 'Spiral bind', desc: 'Up to 100 pages', price: 12000, hue: 210, weight: 0.4, tags: [] },
      { id: 808, name: 'Hardcover bind (thesis)', desc: 'Skripsi binding, standard', price: 45000, hue: 15, weight: 0.9, tags: [] },
      { id: 809, name: 'Laminate A4', desc: 'Per sheet, glossy', price: 3000, hue: 200, weight: 0.02, tags: [] },
    ],
    'Extras': [
      { id: 810, name: 'Scan to email', desc: 'Per page, PDF', price: 1000, hue: 230, weight: 0.001, tags: [] },
      { id: 811, name: 'A4 copy paper (rim)', desc: '500 sheets, 70gsm', price: 55000, hue: 40, weight: 2.5, tags: [] },
      { id: 812, name: 'Business cards (100)', desc: 'Standard matte finish', price: 40000, hue: 220, weight: 0.15, tags: [] },
    ],
  },
};

// Seed a handful of community requests so the runner feed is never empty.
function seedCommunityRequests() {
  return [
    { id: 'REQ-1004', buyerId: 'u4', buyerName: 'Dimas K.', buyerInitials: 'D', items: '2× Paracetamol · 1× Vitamin C', storeName: 'Apotek TarUMA', storeBlock: 'Block D', estCost: 40000, deliverTo: 'Block K · Rm 301', deliverBlock: 'K', initialFee: 5000, note: 'Headache — please hurry 🙏', status: 'open', postedAt: '1 min ago', urgent: true, offers: [] },
    { id: 'REQ-1003', buyerId: 'u3', buyerName: 'Sarah W.', buyerInitials: 'S', items: '1× Nasi Ayam Bakar · 1× Es Teh', storeName: 'Warung Bu Siti', storeBlock: 'Block C', estCost: 27000, deliverTo: 'Library · Rm 12', deliverBlock: 'Lib', initialFee: 4000, note: 'No chili please', status: 'open', postedAt: '3 min ago', offers: [] },
    { id: 'REQ-1002', buyerId: 'u2', buyerName: 'Aditya P.', buyerInitials: 'A', items: '1× Bakso Spesial', storeName: 'Bakso Kampus', storeBlock: 'Block B', estCost: 28000, deliverTo: 'Block F · Rm 210', deliverBlock: 'F', initialFee: 5000, note: 'Extra sambal on side', status: 'open', postedAt: '8 min ago', offers: [] },
    { id: 'REQ-1001', buyerId: 'u1', buyerName: 'Rani F.', buyerInitials: 'R', items: 'Caesar Salad · Es Jeruk', storeName: 'Green Bowl', storeBlock: 'Block A', estCost: 45000, deliverTo: 'Block C · Rm 108', deliverBlock: 'C', initialFee: 3500, note: '', status: 'open', postedAt: '12 min ago', offers: [] },
    { id: 'REQ-1000', buyerId: 'u5', buyerName: 'Yudi P.', buyerInitials: 'Y', items: 'Thesis binding (hardcover)', storeName: 'PrintKu', storeBlock: 'Library', estCost: 45000, deliverTo: 'Block E · Rm 205', deliverBlock: 'E', initialFee: 6000, note: 'Skripsi due tomorrow!', status: 'open', postedAt: '20 min ago', urgent: true, offers: [] },
  ];
}

function seed() {
  // Migration: seller role is no longer part of the app
  if (state.role === 'seller') state.role = 'buyer';
  if (state._pickedRole === 'seller') state._pickedRole = 'buyer';
  if (!state.requests || state.requests.length === 0) {
    state.requests = seedCommunityRequests();
  }
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

// ─── Brand mascot: mampir running courier (official artwork) ───
// Uses the team's mascot image with transparent background. Sized via CSS width.
function brandMark(size = 64) {
  return `<img src="assets/mampir-mascot.png" alt="mampir" style="width:${size}px;height:auto;display:block">`;
}
function brandMarkTight(size = 22) {
  return `<img src="assets/mampir-mascot.png" alt="mampir" style="width:${size}px;height:auto;display:block">`;
}
// Custom wordmark: 'mampir' in navy with the two little underline strokes from the ref
function brandWord(fontSize = 34, color = '#1F2E5A') {
  return `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:2px">
    <span style="font-size:${fontSize}px;font-weight:800;letter-spacing:-1px;color:${color};line-height:1;font-family:'Plus Jakarta Sans',sans-serif">mampir</span>
    <span style="display:flex;gap:${Math.round(fontSize * 0.35)}px;margin-top:2px">
      <span style="width:${Math.round(fontSize * 0.55)}px;height:${Math.max(2, Math.round(fontSize * 0.07))}px;background:${color};border-radius:2px"></span>
      <span style="width:${Math.round(fontSize * 0.55)}px;height:${Math.max(2, Math.round(fontSize * 0.07))}px;background:${color};border-radius:2px"></span>
    </span>
  </span>`;
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

// Campus map — stylized top-down SVG. `onBlock` may be truthy or an action name.
function campusMap(w, h, opts = {}) {
  const { highlights = [], stores: pins = [], dest = null, you = null, path = null, onBlock = null, courier = null } = opts;
  const blockAction = typeof onBlock === 'string' ? onBlock : (onBlock ? 'pickBlock' : null);
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
    const tapAttr = blockAction ? `data-action="${blockAction}:${bl.id}" style="cursor:pointer"` : '';
    return `<g ${tapAttr}>
      <rect x="${sx(bl.x, 'w')}" y="${sx(bl.y, 'h')}" width="${sx(bl.w, 'w')}" height="${sx(bl.h, 'h')}" rx="8" fill="${hi ? 'var(--orange-soft)' : bl.color}" stroke="${hi ? 'var(--orange)' : 'none'}" stroke-width="${hi ? 2 : 0}"/>
      <text x="${sx(bl.x + bl.w / 2, 'w')}" y="${sx(bl.y + bl.h / 2, 'h') + 4}" font-family="'Plus Jakarta Sans'" font-size="11" font-weight="700" fill="var(--ink2)" text-anchor="middle">${bl.id}</text>
    </g>`;
  }).join('');
  const sp = pins.map(([x, y]) => `<g transform="translate(${sx(x, 'w')},${sx(y, 'h')})"><circle r="10" fill="var(--orange)"/><circle r="4" fill="#fff"/></g>`).join('');
  const dp = dest ? `<g transform="translate(${sx(dest[0], 'w')},${sx(dest[1], 'h')})"><circle r="10" fill="var(--mint)"/><circle r="4" fill="#fff"/></g>` : '';
  const yp = you ? `<g transform="translate(${sx(you[0], 'w')},${sx(you[1], 'h')})"><circle r="14" fill="var(--blue)" opacity=".25"><animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite"/></circle><circle r="7" fill="var(--blue)" stroke="#fff" stroke-width="2"/></g>` : '';
  const cp = courier ? `<g transform="translate(${sx(courier[0], 'w')},${sx(courier[1], 'h')})"><circle r="12" fill="#1F2E5A" opacity=".20"><animate attributeName="r" values="8;14;8" dur="1.8s" repeatCount="indefinite"/></circle><rect x="-8" y="-8" width="16" height="16" rx="4" fill="#1F2E5A"/><text x="0" y="4" font-family="'Plus Jakarta Sans'" font-size="9" font-weight="800" fill="#F5C842" text-anchor="middle">M</text></g>` : '';
  const p = path ? `<path d="${path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p[0], 'w')} ${sx(p[1], 'h')}`).join(' ')}" stroke="var(--orange)" stroke-width="3" stroke-dasharray="6 4" fill="none" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1s" repeatCount="indefinite"/></path>` : '';
  return `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" class="map">${walkways}${b}${p}${sp}${dp}${yp}${cp}</svg>`;
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
      <div class="grain"></div>
      <div class="splash-chrome-top">
        <span>Mampir · Tarumanagara</span>
        <span>01 / Welcome</span>
      </div>
      <div class="mark"><img src="assets/mampir-logo.png" alt="mampir · small stops, big help" style="width:280px;max-width:74vw;height:auto;display:block"></div>
      <div class="splash-chrome-bottom">
        <span>Est. 2026</span>
        <span style="display:inline-flex;align-items:center;gap:10px"><span class="dot"></span>Loading</span>
        <span>v1.0</span>
      </div>`;
    app.appendChild(s);
    setTimeout(() => s.remove(), 1900);
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
    sessionStorage.setItem(SESSION_KEY, '1');
    if (r === 'buyer') go('/buyer/home');
    else if (r === 'seller') go('/seller/dashboard');
    else if (r === 'delivery') go('/delivery/home');
  },
  onboardContinue(r) {
    state.role = r; state.onboarded = true; save();
    sessionStorage.setItem(SESSION_KEY, '1');
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
  logIn() {
    sessionStorage.setItem(SESSION_KEY, '1');
    if (state.onboarded && state.role) {
      if (state.role === 'buyer') go('/buyer/home');
      else if (state.role === 'seller') go('/seller/dashboard');
      else if (state.role === 'delivery') go('/delivery/home');
      else go('/role');
    } else {
      go('/role');
    }
  },
  logout() {
    if (!confirm('Log out?')) return;
    sessionStorage.removeItem(SESSION_KEY);
    go('/');
  },
  logoutReset() {
    if (!confirm('Log out and reset the app?')) return;
    sessionStorage.removeItem(SESSION_KEY);
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
  mapSelect(b) {
    state._mapSelected = b;
    save(); render();
  },
  clearMapSelect() {
    state._mapSelected = null;
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
  setCategory(c) { activeCategory = c; render(); },

  // ── Requests marketplace ────────────────────────────────
  newRequest() {
    const g = id => document.getElementById(id);
    const items = (g('req-items')?.value || '').trim();
    const storeName = g('req-store')?.value || '';
    const deliverTo = (g('req-dest')?.value || state.user.location).trim();
    const estCost = parseInt(g('req-cost')?.value) || 0;
    const initialFee = parseInt(g('req-fee')?.value) || 3000;
    const note = (g('req-note')?.value || '').trim();
    if (!items) { toast('Add what food you want'); return; }
    if (!storeName) { toast('Pick a store'); return; }
    const store = stores.find(s => s.name === storeName);
    const req = {
      id: 'REQ-' + (2000 + state.requests.length + 1),
      buyerId: 'me', buyerName: state.user.name, buyerInitials: state.user.initials,
      items, storeName,
      storeBlock: store?.block || '',
      estCost, deliverTo,
      deliverBlock: (state.user.location.match(/Block (\w+)/) || [])[1] || 'K',
      initialFee, note, status: 'open',
      postedAt: 'Just now',
      offers: [],
    };
    state.requests.unshift(req);
    save();
    toast('Request posted');
    go('/buyer/request/' + req.id);
  },
  cancelRequest(id) {
    if (!confirm('Cancel this request?')) return;
    const req = state.requests.find(r => r.id === id);
    if (req) req.status = 'cancelled';
    save(); toast('Request cancelled'); go('/buyer/home');
  },
  takeDelivery(reqId) {
    const req = state.requests.find(r => r.id === reqId);
    if (!req) return;
    const fee = req.finalFee || req.initialFee;
    const offer = {
      id: 'OFR-' + Date.now(),
      from: 'runner',
      runnerName: state.user.name,
      runnerInitials: state.user.initials,
      fee, msg: `Taking at ${fmt(fee)}`, time: 'Just now',
      status: 'accepted',
    };
    req.offers.push(offer);
    req.acceptedOffer = offer;
    req.status = 'accepted';
    req.courier = state.user.name;
    req.courierInitials = state.user.initials;
    req.finalFee = fee;
    // Decline other pending offers
    req.offers.forEach(o => { if (o.id !== offer.id && o.status === 'pending') o.status = 'declined'; });
    state.activeDelivery = { orderId: reqId, step: 1 };
    save(); toast(`Delivery accepted · ${fmt(fee)}`);
    go('/delivery/active');
  },
  sendChat(reqId) {
    const inp = document.getElementById('chat-input');
    const text = (inp?.value || '').trim();
    if (!text) return;
    if (!state.chats) state.chats = {};
    if (!state.chats[reqId]) state.chats[reqId] = [];
    // Sender = current role
    const from = state.role === 'buyer' ? 'buyer' : 'runner';
    state.chats[reqId].push({ from, text, time: 'now' });
    save();
    // Fake auto-reply from the other party after a beat (prototype flavor)
    if (from === 'runner') {
      setTimeout(() => {
        state.chats[reqId].push({ from: 'buyer', text: 'OK, sounds good 👍', time: 'now' });
        save(); render();
      }, 900);
    }
    render();
  },
  submitAdjustedOffer(reqId) {
    const feeEl = document.getElementById('adj-fee');
    const msgEl = document.getElementById('adj-msg');
    const fee = parseInt(feeEl?.value) || 0;
    const msg = (msgEl?.value || '').trim() || `Proposing ${fmt(fee)}`;
    if (!fee) { toast('Enter a fee'); return; }
    const req = state.requests.find(r => r.id === reqId);
    if (!req) return;
    req.offers.push({
      id: 'OFR-' + Date.now(),
      from: 'runner',
      runnerName: state.user.name,
      runnerInitials: state.user.initials,
      fee, msg, time: 'Just now', status: 'pending',
    });
    if (req.status === 'open') req.status = 'negotiating';
    save(); closeSheet(); toast('Offer sent to buyer');
  },
  makeOffer(reqId) {
    const feeEl = document.getElementById('offer-fee');
    const msgEl = document.getElementById('offer-msg');
    const fee = parseInt(feeEl?.value) || 0;
    const msg = (msgEl?.value || '').trim();
    if (!fee) { toast('Enter a fee'); return; }
    const req = state.requests.find(r => r.id === reqId);
    if (!req) return;
    req.offers.push({
      id: 'OFR-' + Date.now(),
      from: 'runner',
      runnerName: state.user.name,
      runnerInitials: state.user.initials,
      fee, msg, time: 'Just now', status: 'pending',
    });
    if (req.status === 'open') req.status = 'negotiating';
    save();
    toast('Offer sent');
    go('/delivery/home');
  },
  acceptOffer(reqId, offerId) {
    const req = state.requests.find(r => r.id === reqId);
    const offer = req?.offers.find(o => o.id === offerId);
    if (!offer) return;
    offer.status = 'accepted';
    req.acceptedOffer = offer;
    req.status = 'accepted';
    req.courier = offer.runnerName;
    req.courierInitials = offer.runnerInitials;
    req.finalFee = offer.fee;
    req.acceptedAt = 'Just now';
    req.offers.forEach(o => { if (o.id !== offerId && o.status === 'pending') o.status = 'declined'; });
    // Link into activeDelivery so the runner side picks it up too
    state.activeDelivery = { orderId: reqId, step: 1 };
    save(); toast(`Accepted ${offer.runnerName}'s offer`);
    // Stay on buyer's request detail — it now shows the tracking view
    render();
  },
  // ── Demo helpers: advance the courier through pickup → on the way → delivered
  demoAdvance(reqId) {
    const req = state.requests.find(r => r.id === reqId);
    if (!req) return;
    if (req.status === 'accepted') {
      req.status = 'picked_up';
      if (state.activeDelivery && state.activeDelivery.orderId === reqId) state.activeDelivery.step = 2;
      toast(`${req.courier} picked up your order`);
    } else if (req.status === 'picked_up') {
      req.status = 'on_way';
      toast(`${req.courier} is on the way`);
    } else if (req.status === 'on_way') {
      req.status = 'delivered';
      req.deliveredAt = 'Just now';
      state.activeDelivery = null;
      // Log into delivery history so the runner's history/earnings reflect it
      state.deliveryHistory = state.deliveryHistory || [];
      state.deliveryHistory.unshift({ store: req.storeName, dest: req.deliverTo, weight: 1.2, fee: req.finalFee, time: 'Just now' });
      toast(`Delivered! Rate your runner`);
    }
    save(); render();
  },
  rateRunner(reqId, n) {
    const req = state.requests.find(r => r.id === reqId);
    if (req) { req.rating = +n; save(); toast(`Rated ${n} stars — thanks!`); render(); }
  },
  declineOffer(reqId, offerId) {
    const req = state.requests.find(r => r.id === reqId);
    const offer = req?.offers.find(o => o.id === offerId);
    if (offer) { offer.status = 'declined'; save(); render(); }
  },
  prefillRequest(storeId) {
    state._prefillStoreId = +storeId;
    save(); go('/buyer/new-request');
  },
  counterOffer(reqId, offerId) {
    // Open the counter sheet with both ids in the payload
    openSheet('counter', { reqId, offerId });
  },
  submitCounter(reqId, offerId) {
    const feeEl = document.getElementById('cnt-fee');
    const msgEl = document.getElementById('cnt-msg');
    const fee = parseInt(feeEl?.value) || 0;
    const msg = (msgEl?.value || '').trim() || `Counter at ${fmt(fee)}`;
    if (!fee) { toast('Enter a fee'); return; }
    const req = state.requests.find(r => r.id === reqId);
    if (!req) return;
    req.offers.push({
      id: 'OFR-' + Date.now(),
      from: 'buyer',
      runnerName: state.user.name,
      runnerInitials: state.user.initials,
      fee, msg, time: 'Just now', status: 'pending',
      counterOf: offerId,
    });
    save(); closeSheet(); toast(`Countered at ${fmt(fee)}`);
  },
  acceptLatest(reqId) {
    const req = state.requests.find(r => r.id === reqId);
    if (!req) return;
    const latest = [...req.offers].reverse().find(o => o.from === 'runner' && o.status === 'pending');
    if (!latest) { toast('No open offer to accept'); return; }
    actions.acceptOffer(reqId, latest.id);
  },
  counterLatest(reqId) {
    const req = state.requests.find(r => r.id === reqId);
    if (!req) return;
    const latest = [...req.offers].reverse().find(o => o.from === 'runner' && o.status === 'pending');
    if (!latest) { toast('No open offer to counter'); return; }
    openSheet('counter', { reqId, offerId: latest.id });
  },
  showSheet(name, payload) { openSheet(name, payload); },
  closeSheet() { closeSheet(); },
  setCartNote(v) { state.cartNote = v; save(); },
};

// ─── Sheets ─────────────────────────────────────────────────
let sheetName = null;
let sheetPayload = null;
function openSheet(name, payload) { sheetName = name; sheetPayload = payload || null; render(); }
function closeSheet() { sheetName = null; sheetPayload = null; render(); }
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
  } else if (sheetName === 'chat') {
    const reqId = sheetPayload;
    const req = state.requests.find(r => r.id === reqId);
    const messages = (state.chats && state.chats[reqId]) || [];
    const otherName = req ? (state.role === 'buyer' ? (req.courier || 'Runner') : req.buyerName) : 'Chat';
    const otherInitials = req ? (state.role === 'buyer' ? (req.courierInitials || 'R') : req.buyerInitials) : 'C';
    content = `
      <div class="sheet-handle"></div>
      <div class="row gap-10" style="align-items:center;padding-bottom:12px;border-bottom:1px solid var(--border)">
        ${avatarEl(otherInitials, `hsl(${(otherInitials.charCodeAt(0) * 37) % 360},55%,55%)`, 40)}
        <div class="col gap-2 grow"><div class="h3">${otherName}</div><div class="muted">${req ? `#${req.id.replace('REQ-', '')} · ${req.items.slice(0, 40)}${req.items.length > 40 ? '…' : ''}` : ''}</div></div>
        <div class="topbar-icon" data-action="closeSheet">${I.chevD()}</div>
      </div>

      <div id="chat-list" style="max-height:44vh;overflow-y:auto;padding:14px 4px;display:flex;flex-direction:column;gap:8px">
        ${messages.length === 0 ? `
          <div class="muted" style="text-align:center;padding:20px 0;font-size:12px">Say hi — this is a live chat with ${otherName.split(' ')[0]}.</div>
        ` : messages.map(m => {
      const mine = (state.role === 'buyer' && m.from === 'buyer') || (state.role !== 'buyer' && m.from === 'runner');
      return `<div style="display:flex;justify-content:${mine ? 'flex-end' : 'flex-start'}">
            <div style="max-width:78%;padding:10px 14px;border-radius:${mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};background:${mine ? 'var(--orange)' : '#fff'};color:${mine ? '#fff' : 'var(--charcoal)'};font-size:13.5px;line-height:1.4;box-shadow:${mine ? 'none' : '0 2px 8px rgba(0,0,0,.05)'};border:${mine ? 'none' : '1px solid var(--border)'}">${m.text}</div>
          </div>`;
    }).join('')}
      </div>

      <div class="row gap-8" style="padding-top:10px;border-top:1px solid var(--border)">
        <input id="chat-input" type="text" placeholder="Type a message…" autofocus
          style="flex:1;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:999px;font-size:14px;outline:none;font-family:inherit"
          onkeydown="if(event.key==='Enter'){event.preventDefault();actions.sendChat('${reqId}')}">
        <button class="btn btn-primary" style="padding:12px 16px;border-radius:999px" data-action="sendChat:${reqId}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
        </button>
      </div>
      <div class="muted mt-8" style="text-align:center;font-size:10.5px">Chats stay private between buyer and runner</div>`;
  } else if (sheetName === 'counter') {
    const { reqId, offerId } = sheetPayload || {};
    const req = state.requests.find(r => r.id === reqId);
    const offer = req?.offers.find(o => o.id === offerId);
    if (!req || !offer) content = `<div class="sheet-handle"></div><div class="empty">Offer not found</div>`;
    else {
      // Suggestions: buyer's opening offer and a midpoint between opening and runner's ask
      const opening = req.initialFee;
      const mid = Math.round((opening + offer.fee) / 2 / 500) * 500;
      content = `
      <div class="sheet-handle"></div>
      <div class="h2">Counter ${offer.runnerName || 'runner'}'s offer</div>
      <div class="body mt-4">They asked <b>${fmt(offer.fee)}</b>. Propose what you'd pay instead — they can accept, counter, or decline.</div>

      <div class="row gap-8 mt-16">
        <div class="card-flat" style="flex:1;padding:12px;text-align:center;cursor:pointer" onclick="document.getElementById('cnt-fee').value='${opening}'">
          <div class="muted" style="font-weight:600">Your opening</div>
          <div style="font-size:14px;font-weight:800;color:var(--orange);margin-top:2px">${fmt(opening)}</div>
        </div>
        <div class="card-flat" style="flex:1;padding:12px;text-align:center;cursor:pointer" onclick="document.getElementById('cnt-fee').value='${mid}'">
          <div class="muted" style="font-weight:600">Meet halfway</div>
          <div style="font-size:14px;font-weight:800;color:var(--orange);margin-top:2px">${fmt(mid)}</div>
        </div>
      </div>

      <div class="mt-16">
        <label class="lbl" style="color:var(--charcoal);margin-bottom:6px;display:block">Your counter (Rp)</label>
        <input id="cnt-fee" type="number" inputmode="numeric" value="${mid}"
          style="width:100%;padding:14px 16px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:20px;font-weight:800;outline:none;color:var(--charcoal)">
      </div>

      <div class="mt-12">
        <label class="lbl" style="color:var(--charcoal);margin-bottom:6px;display:block">Note (optional)</label>
        <input id="cnt-msg" type="text" placeholder="e.g. Sorry, that's my max budget"
          style="width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:13.5px;outline:none">
      </div>

      <div class="row gap-8 mt-16">
        <button class="btn btn-ghost" style="flex:1" data-action="closeSheet">Cancel</button>
        <button class="btn btn-primary" style="flex:2" data-action="submitCounter:${reqId}:${offerId}">Send counter</button>
      </div>`;
    }
  } else if (sheetName === 'adjust') {
    const reqId = sheetPayload;
    const req = state.requests.find(r => r.id === reqId);
    if (!req) content = `<div class="sheet-handle"></div><div class="empty">Request not found</div>`;
    else {
      const suggested = Math.round(req.initialFee * 1.25 / 500) * 500; // +25% rounded to Rp 500
      const suggested2 = Math.round(req.initialFee * 1.5 / 500) * 500;
      content = `
      <div class="sheet-handle"></div>
      <div class="h2">Adjust delivery fee</div>
      <div class="body mt-4">Buyer's opening offer is <b>${fmt(req.initialFee)}</b>. Suggest what you'd take instead.</div>

      <div class="row gap-8 mt-16">
        <div class="card-flat" style="flex:1;padding:12px;text-align:center;cursor:pointer" onclick="document.getElementById('adj-fee').value='${suggested}'">
          <div class="muted" style="font-weight:600">+25%</div>
          <div style="font-size:14px;font-weight:800;color:var(--orange);margin-top:2px">${fmt(suggested)}</div>
        </div>
        <div class="card-flat" style="flex:1;padding:12px;text-align:center;cursor:pointer" onclick="document.getElementById('adj-fee').value='${suggested2}'">
          <div class="muted" style="font-weight:600">+50%</div>
          <div style="font-size:14px;font-weight:800;color:var(--orange);margin-top:2px">${fmt(suggested2)}</div>
        </div>
      </div>

      <div class="mt-16">
        <label class="lbl" style="color:var(--charcoal);margin-bottom:6px;display:block">Your delivery fee (Rp)</label>
        <input id="adj-fee" type="number" inputmode="numeric" value="${req.initialFee}"
          style="width:100%;padding:14px 16px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:20px;font-weight:800;outline:none;color:var(--charcoal)">
      </div>

      <div class="mt-12">
        <label class="lbl" style="color:var(--charcoal);margin-bottom:6px;display:block">Note (optional)</label>
        <input id="adj-msg" type="text" placeholder="e.g. I'm at Block C already, 5 min away"
          style="width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:13.5px;outline:none">
      </div>

      <div class="card-flat mt-12" style="background:var(--orange-soft);border:1px dashed var(--orange)">
        <div class="row gap-8">${I.info('var(--orange-deep)')}<span style="font-size:11.5px;color:var(--orange-deep);font-weight:600;line-height:1.4">Buyer sees your offer and can accept, counter, or decline.</span></div>
      </div>

      <div class="row gap-8 mt-16">
        <button class="btn btn-ghost" style="flex:1" data-action="closeSheet">Cancel</button>
        <button class="btn btn-mint" style="flex:2" data-action="submitAdjustedOffer:${reqId}">Send offer</button>
      </div>`;
    }
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
      { k: 'history', label: 'History', route: '/delivery/history', ic: c => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9 9 0 00-8 5"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>` },
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

// 1. WELCOME / LOGIN (always shown on a fresh session)
route('/', () => {
  const loggedIn = sessionStorage.getItem(SESSION_KEY);
  // A logged-in session with a picked role: bounce to their home
  if (loggedIn && state.onboarded && state.role) {
    if (state.role === 'buyer') setTimeout(() => go('/buyer/home'), 0);
    else if (state.role === 'seller') setTimeout(() => go('/seller/dashboard'), 0);
    else if (state.role === 'delivery') setTimeout(() => go('/delivery/home'), 0);
    return `<div class="screen"></div>`;
  }
  // Returning user (has role) but no session — show a personalized welcome-back
  const returning = state.onboarded && state.role;
  const primaryLabel = returning ? `Welcome back, ${state.user.name.split(' ')[0]}` : 'Get Started';
  const roleLabel = returning ? state.role[0].toUpperCase() + state.role.slice(1) : '';
  return `<div class="screen" style="background:var(--paper);position:relative;overflow:hidden">
    <div class="grain"></div>

    <!-- Editorial chrome: top corners -->
    <div class="chrome-label" style="top:22px;left:24px">Mampir · 01</div>
    <div class="chrome-label" style="top:22px;right:24px;cursor:pointer" ${returning ? '' : 'data-action="logIn"'}>${returning ? 'Tarumanagara' : 'Skip →'}</div>

    <!-- Ambient warm mesh behind everything -->
    <div style="position:absolute;inset:-10%;background:radial-gradient(ellipse 55% 40% at 50% 30%, rgba(255,107,53,.09), transparent 60%), radial-gradient(circle at 15% 85%, rgba(31,46,90,.05), transparent 55%);pointer-events:none"></div>

    <div class="scroll" style="padding:56px 28px 24px;position:relative;display:flex;flex-direction:column;gap:0">

      <!-- Eyebrow -->
      <div class="reveal" style="opacity:0;animation:fadeUp .9s .1s var(--ease-editorial) forwards">
        <span class="eyebrow">${returning ? 'Welcome back' : 'Campus delivery'} · Est. 2026</span>
      </div>

      <!-- Hero: the actual brand lockup (mascot + hand-drawn wordmark + tagline) -->
      <div style="margin-top:40px;text-align:center;opacity:0;animation:fadeUp 1s .25s var(--ease-editorial) forwards">
        <img src="assets/mampir-logo.png" alt="mampir · small stops, big help" class="brand-float" style="width:100%;max-width:320px;height:auto;display:block;margin:0 auto">
      </div>

      <!-- Hairline break -->
      <div class="hairline" style="margin:32px 0 20px;opacity:0;animation:fadeIn 1s .55s var(--ease-editorial) forwards"></div>

      <!-- Body copy -->
      <div style="text-align:center;opacity:0;animation:fadeUp 1s .65s var(--ease-editorial) forwards">
        <div style="font-size:14px;color:var(--ink2);font-weight:500;max-width:280px;margin:0 auto;line-height:1.55">Campus food from the stores you know — arriving before the bell.</div>
      </div>
    </div>

    <!-- Fluid island CTA + footer chrome -->
    <div style="padding:0 24px 28px;position:relative;opacity:0;animation:fadeUp 1s .75s var(--ease-editorial) forwards">
      <button class="fluid-btn" data-action="logIn">
        <span>${returning ? `Continue as ${roleLabel}` : 'Get Started'}</span>
        <span class="arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
        </span>
      </button>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;font-family:'Plus Jakarta Sans';font-size:10.5px;letter-spacing:.28em;text-transform:uppercase;color:var(--ink3);font-weight:600">
        <span>${returning ? `Not ${state.user.name.split(' ')[0]}?` : 'Have an account?'}</span>
        <span style="color:var(--charcoal);cursor:pointer;font-weight:700" data-action="${returning ? 'logout' : 'logIn'}">${returning ? 'Log out →' : 'Log in →'}</span>
      </div>
    </div>
  </div>`;
});

// 2. ROLE SELECTION
route('/role', () => {
  let picked = state._pickedRole || 'buyer';
  if (picked === 'seller') picked = 'buyer'; // legacy safety
  const label = picked === 'buyer' ? 'Buyer' : 'Runner';
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
      <div style="font-size:26px;font-weight:800;letter-spacing:-.6px;line-height:1.15">How do you want to<br>use mampir?</div>
      <div class="body mt-4">Post what you want. Or pick it up for someone else. Switch anytime.</div>
    </div>
    <div class="col gap-14 grow">
      ${rc('buyer', I.cart('#fff'), '🛒 Buyer', 'Post what you want from campus stores. Runners will bid to pick it up.', 'var(--orange)', 'var(--orange-soft)')}
      ${rc('delivery', I.run('#fff'), '🏃 Runner', 'Browse posts from students. Offer a fee, deliver, and earn between classes.', 'var(--mint)', 'var(--mint-soft)')}
    </div>
    <div class="col gap-14 mt-16">
      <button class="btn btn-primary btn-block" data-action="onboardContinue:${picked}">Continue as ${label}</button>
      <div style="text-align:center;font-size:12px;color:var(--ink3)">You can switch roles anytime from your profile</div>
    </div>
  </div>`;
});

// 3. BUYER HOME
route('/buyer/home', () => {
  const myReqs = state.requests.filter(r => r.buyerId === 'me' && r.status !== 'cancelled' && r.status !== 'delivered');
  const others = state.requests.filter(r => r.buyerId !== 'me' && r.status === 'open').slice(0, 3);
  const statusPill = (s, extra) => {
    const map = {
      open: { c: 'pill-orange', t: 'Open · waiting for a runner' },
      negotiating: { c: 'pill-blue', t: `${extra || 0} offer${extra === 1 ? '' : 's'} — tap to review` },
      accepted: { c: 'pill-mint', t: 'Accepted · runner assigned' },
      picked_up: { c: 'pill-mint', t: 'Picked up · on the way' },
    };
    const p = map[s] || map.open;
    return `<span class="pill ${p.c}">${p.t}</span>`;
  };
  return `<div class="screen">
    <div class="topbar">
      <div class="row spread" style="align-items:flex-start">
        <div class="col gap-8">
          <div class="row gap-8">
            ${avatarEl(state.user.initials, 'var(--orange)', 40)}
            <div class="col gap-4" style="justify-content:center">
              <div style="font-size:12px;color:var(--ink3);font-weight:500">Hi, ${state.user.name.split(' ')[0]} 👋</div>
              <div style="font-size:14px;font-weight:700">Post what you want.</div>
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
    </div>
    <div class="scroll">
      <!-- BIG POST CTA -->
      <div class="px-20" style="margin-top:8px">
        <div class="card" style="background:var(--orange);color:#fff;padding:18px;cursor:pointer;box-shadow:0 12px 32px -8px rgba(255,107,53,.5)" data-go="/buyer/new-request">
          <div class="row spread" style="align-items:flex-start">
            <div class="col gap-6 grow">
              <div style="font-size:11px;font-weight:800;opacity:.85;letter-spacing:.5px">POST A REQUEST</div>
              <div class="h1" style="color:#fff">What do you want today?</div>
              <div style="font-size:12.5px;opacity:.9;line-height:1.4">Say what food, from which store, where to drop it. Runners will bid to bring it to you.</div>
            </div>
            <div style="width:48px;height:48px;background:rgba(255,255,255,.2);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${I.plus('#fff')}</div>
          </div>
        </div>
      </div>

      <!-- MY ACTIVE REQUESTS -->
      ${myReqs.length > 0 ? `
        <div class="px-20 mt-16">
          <div class="row spread" style="align-items:baseline;margin-bottom:12px">
            <div class="h2">Your active posts</div>
            <span class="muted" style="font-weight:600">${myReqs.length}</span>
          </div>
          <div class="col gap-10">
            ${myReqs.map(r => {
    const openOffers = r.offers.filter(o => o.status === 'pending' && o.from === 'runner').length;
    return `<div class="card" data-go="/buyer/request/${r.id}" style="cursor:pointer">
                <div class="row spread" style="margin-bottom:6px">
                  <div class="muted" style="font-weight:600">#${r.id.replace('REQ-', '')} · ${r.postedAt}</div>
                  ${statusPill(r.status, openOffers)}
                </div>
                <div class="h3" style="line-height:1.35">${r.items}</div>
                <div class="muted mt-4">${r.storeName} → ${r.deliverTo}</div>
                <div class="row spread mt-8">
                  <div class="row gap-8">${I.wallet('var(--ink3)')}<span style="font-size:12px;color:var(--ink2);font-weight:600">Fee: ${fmt(r.finalFee || r.initialFee)}</span></div>
                  <span style="font-size:12px;color:var(--orange);font-weight:800">${openOffers > 0 ? `${openOffers} new offer${openOffers > 1 ? 's' : ''} →` : 'View →'}</span>
                </div>
              </div>`;
  }).join('')}
          </div>
        </div>` : ''}

      <!-- FEED OF OTHER STUDENTS' POSTS (browse) -->
      <div class="px-20 mt-16">
        <div class="row spread" style="align-items:baseline;margin-bottom:12px">
          <div class="h2">Others posting now</div>
          <span class="muted" style="font-weight:600">${state.requests.filter(r => r.buyerId !== 'me' && r.status === 'open').length} open</span>
        </div>
        <div class="col gap-10">
          ${others.map(r => `
            <div class="card row gap-10" style="align-items:flex-start">
              ${avatarEl(r.buyerInitials, `hsl(${(r.buyerInitials.charCodeAt(0) * 37) % 360},55%,55%)`, 36)}
              <div class="col gap-4 grow" style="min-width:0">
                <div class="row spread"><div class="h3">${r.buyerName}</div><span class="muted">${r.postedAt}</span></div>
                <div style="font-size:12.5px;color:var(--ink2);line-height:1.4">${r.items}</div>
                <div class="muted">${r.storeName} → ${r.deliverTo}${r.urgent ? ' <span style="color:var(--orange);font-weight:800">· URGENT</span>' : ''}</div>
              </div>
            </div>`).join('')}
        </div>
        <div class="muted mt-12" style="text-align:center;font-size:11px">Switch to Runner mode from your profile to fulfill these.</div>
      </div>

      <!-- STORES REFERENCE (for inspiration) -->
      <div class="px-20 mt-16">
        <div class="row spread" style="align-items:baseline;margin-bottom:12px">
          <div class="h2">Popular campus stores</div>
        </div>
      </div>
      <div class="chips">
        ${['All', 'Halal', 'Vegetarian', 'Drinks', 'Pharmacy', 'Printing'].map(n =>
    `<div class="chip ${activeCategory === n ? 'active' : ''}" data-action="setCategory:${n}">${n}</div>`).join('')}
      </div>
      ${(() => {
    const filtered = stores.filter(s => s.open && (activeCategory === 'All' || s.tags.includes(activeCategory)));
    if (filtered.length === 0) return `<div class="empty" style="padding:20px">No stores in "${activeCategory}".</div>`;
    return `<div class="store-grid">
          ${filtered.map(s => `
            <div class="store-card" data-action="prefillRequest:${s.id}">
              <div class="store-thumb" style="background:linear-gradient(135deg, hsl(${s.hue},65%,62%), hsl(${(s.hue + 40) % 360},55%,52%))"></div>
              <div class="store-body">
                <div class="store-name">${s.name}</div>
                <div class="store-meta">${I.star()}<span style="font-weight:600;color:var(--charcoal)">${s.rating}</span><span style="color:var(--ink4)">·</span><span>${s.block}</span></div>
                ${s.tags[0] ? `<div class="pill ${s.tags[0] === 'Vegetarian' ? 'pill-mint' : 'pill-orange'}" style="margin-top:8px">${s.tags[0]}</div>` : '<div style="height:22px"></div>'}
              </div>
            </div>`).join('')}
        </div>`;
  })()}
      <div style="height:32px"></div>
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

// Map-block taps are handled by the standard data-action binder now.
function wireMapBlocks() { /* no-op — kept for backward compat */ }

// ── NEW REQUEST (post form) ──
route('/buyer/new-request', () => {
  const openStores = stores.filter(s => s.open);
  const prefill = state._prefillStoreId ? getStore(state._prefillStoreId) : null;
  state._prefillStoreId = null; // clear after use
  return `<div class="screen">
    <div class="topbar row gap-12">
      <div class="topbar-icon" data-go="/buyer/home">${I.back()}</div>
      <div class="col gap-2 grow"><div class="h1">New Request</div><div class="muted">Post what you need — runners will bid</div></div>
    </div>
    <div class="scroll p-20">
      <div class="col gap-14">

        <div class="card">
          <label class="lbl" style="color:var(--charcoal);margin-bottom:8px;display:block">What food / item</label>
          <textarea id="req-items" placeholder="e.g. 1× Nasi Ayam Bakar + 1× Es Teh" rows="3"
            style="width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:14px;outline:none;resize:none;font-family:inherit"></textarea>
        </div>

        <div class="card">
          <label class="lbl" style="color:var(--charcoal);margin-bottom:8px;display:block">From which store</label>
          <select id="req-store" style="width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:14px;outline:none;font-family:inherit;-webkit-appearance:none">
            <option value="">Pick a store…</option>
            ${openStores.map(s => `<option value="${s.name}" ${prefill && prefill.id === s.id ? 'selected' : ''}>${s.name} · ${s.block}</option>`).join('')}
          </select>
        </div>

        <div class="card">
          <label class="lbl" style="color:var(--charcoal);margin-bottom:8px;display:block">Deliver to</label>
          <input id="req-dest" type="text" value="${state.user.location.replace(/"/g, '&quot;')}"
            style="width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:14px;outline:none;font-family:inherit">
          <div class="muted mt-8">Change from location picker if wrong</div>
        </div>

        <div class="row gap-10">
          <div class="card grow">
            <label class="lbl" style="color:var(--charcoal);margin-bottom:8px;display:block">Est. food cost (Rp)</label>
            <input id="req-cost" type="number" inputmode="numeric" placeholder="25000"
              style="width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:14px;outline:none;font-family:inherit">
          </div>
          <div class="card grow">
            <label class="lbl" style="color:var(--charcoal);margin-bottom:8px;display:block">Delivery offer (Rp)</label>
            <input id="req-fee" type="number" inputmode="numeric" value="4000" placeholder="4000"
              style="width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:14px;outline:none;font-family:inherit">
          </div>
        </div>

        <div class="card">
          <label class="lbl" style="color:var(--charcoal);margin-bottom:8px;display:block">Note for runner (optional)</label>
          <input id="req-note" type="text" placeholder="e.g. no chili, extra sambal on side"
            style="width:100%;padding:12px 14px;background:var(--cream);border:1px solid var(--border);border-radius:12px;font-size:14px;outline:none;font-family:inherit">
        </div>

        <div class="card-flat" style="background:var(--orange-soft);border:1px dashed var(--orange)">
          <div class="row gap-8">${I.info('var(--orange-deep)')}<span style="font-size:12px;color:var(--orange-deep);font-weight:600;line-height:1.4">This is your opening offer. Runners can accept, or bid a higher fee — you choose.</span></div>
        </div>

      </div>
    </div>
    <div class="p-16" style="background:linear-gradient(180deg,transparent,var(--cream) 30%);flex-shrink:0">
      <button class="btn btn-primary btn-block" data-action="newRequest">Post request</button>
    </div>
  </div>`;
});

// ── BUYER'S REQUEST DETAIL (see offers, accept/counter/decline) ──
// ── Buyer's live tracking view (shown after a runner is locked in) ──
function renderBuyerTracking(req) {
  const chatCount = (state.chats && state.chats[req.id] && state.chats[req.id].length) || 0;
  // Step index by status
  const stepIdx = { accepted: 1, picked_up: 2, on_way: 3, delivered: 4 }[req.status] || 0;
  const steps = [
    { key: 'placed', label: 'Offer accepted', done: true },
    { key: 'pickup', label: `Runner heading to ${req.storeName}`, done: stepIdx >= 2, active: stepIdx === 1 },
    { key: 'transit', label: 'On the way to you', done: stepIdx >= 3, active: stepIdx === 2 },
    { key: 'delivered', label: 'Delivered', done: stepIdx >= 4, active: stepIdx === 3 },
  ];
  // Map coords
  const storeBlock = (req.storeBlock || '').replace('Block ', '') || 'C';
  const storeCoord = blockCoords[storeBlock] || blockCoords.C;
  const destCoord = blockCoords[req.deliverBlock] || userBlockCoord();
  // Courier position glides between store and destination based on status
  const t = stepIdx === 1 ? 0.15 : stepIdx === 2 ? 0.35 : stepIdx === 3 ? 0.7 : 1;
  const courierPos = [
    storeCoord[0] + (destCoord[0] - storeCoord[0]) * t,
    storeCoord[1] + (destCoord[1] - storeCoord[1]) * t,
  ];
  const hueOfInitial = ch => `hsl(${(ch.charCodeAt(0) * 37) % 360},55%,55%)`;

  const heroByStatus = {
    accepted: { title: `${req.courier} is on it`, sub: `Heading to ${req.storeName} to pick up your order`, color: 'var(--mint)' },
    picked_up: { title: 'Order picked up', sub: `${req.courier} has your food and is walking over`, color: 'var(--mint)' },
    on_way: { title: 'Almost there', sub: `${req.courier} is close — arriving in ~2 min`, color: 'var(--orange)' },
    delivered: { title: 'Delivered!', sub: 'Enjoy — leave a rating for your runner', color: 'var(--mint-deep)' },
  };
  const hero = heroByStatus[req.status] || heroByStatus.accepted;
  const demoLabel = {
    accepted: '▶ Runner picks it up',
    picked_up: '▶ Runner starts walking',
    on_way: '▶ Runner delivers',
    delivered: '',
  }[req.status];

  return `<div class="screen">
    <div class="topbar row gap-12">
      <div class="topbar-icon" data-go="/buyer/home">${I.back()}</div>
      <div class="col gap-2 grow"><div class="muted">POST #${req.id.replace('REQ-', '')}</div><div class="h2">Live tracking</div></div>
    </div>
    <div class="scroll px-16" style="padding-top:12px">

      <!-- Hero status card -->
      <div class="card" style="padding:0;overflow:hidden;background:${hero.color};color:#fff">
        ${req.status === 'delivered' ? `
          <div style="padding:22px 20px;text-align:center;position:relative">
            <div style="width:64px;height:64px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;position:relative">
              ${I.check('#fff', 32)}
              <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(255,255,255,.3);animation:ripple 1.6s ease infinite"></div>
            </div>
            <div class="h1" style="color:#fff">${hero.title}</div>
            <div style="font-size:13px;opacity:.9;margin-top:6px">${hero.sub}</div>
          </div>
        ` : `
          <div style="padding:16px 18px">
            <div class="row spread">
              <div class="col gap-4">
                <div class="lbl" style="color:#fff;opacity:.85">${req.status === 'accepted' ? 'Picking up' : req.status === 'picked_up' ? 'On the way' : 'Almost there'}</div>
                <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.4px;line-height:1.1">${hero.title}</div>
                <div style="font-size:12.5px;opacity:.9">${hero.sub}</div>
              </div>
              <div style="width:52px;height:52px;background:rgba(255,255,255,.15);border-radius:14px;display:flex;align-items:center;justify-content:center">${I.run('#fff')}</div>
            </div>
          </div>
        `}
      </div>

      <!-- Live map -->
      <div class="card mt-12" style="padding:0;overflow:hidden">
        ${campusMap(360, 200, {
          highlights: [req.deliverBlock, storeBlock],
          stores: [storeCoord],
          dest: destCoord,
          courier: req.status === 'delivered' ? destCoord : courierPos,
          path: req.status === 'delivered' ? null : [storeCoord, courierPos, destCoord],
        })}
        <div style="padding:12px 14px;background:#fff">
          <div class="row spread">
            <div class="col gap-4">
              <div class="lbl">${req.status === 'delivered' ? 'ARRIVED AT' : 'HEADING TO'}</div>
              <div class="h3">${req.deliverTo}</div>
            </div>
            ${req.status !== 'delivered' ? `<div class="col" style="align-items:flex-end;gap:2px"><div class="muted">ETA</div><div style="font-size:16px;font-weight:800;color:var(--orange);letter-spacing:-.3px">~${req.status === 'accepted' ? '6' : req.status === 'picked_up' ? '4' : '2'} min</div></div>` : ''}
          </div>
        </div>
      </div>

      <!-- Status stepper -->
      <div class="card mt-12">
        <div class="lbl" style="color:var(--charcoal);margin-bottom:14px">Progress</div>
        <div class="stepper">
          ${steps.map((s, i) => {
            const st = s.done ? 'done' : s.active ? 'active' : 'pending';
            return `<div class="step ${st}">
              <div class="line"></div>
              <div class="dot">${st === 'done' ? I.check('#fff') : st === 'active' ? '<div style="width:8px;height:8px;border-radius:50%;background:#fff"></div>' : ''}</div>
              <div class="col gap-2 grow"><div class="step-lbl">${s.label}</div></div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Courier card -->
      <div class="card mt-12 row gap-12" style="align-items:center">
        ${avatarEl(req.courierInitials || 'R', hueOfInitial(req.courierInitials || 'R'), 48)}
        <div class="col gap-4 grow">
          <div class="h3">${req.courier}</div>
          <div class="row gap-4">${I.star()}<span style="font-size:11.5px;font-weight:600">4.9</span><span style="color:var(--ink4);margin:0 2px">·</span><span class="muted">Your runner</span></div>
        </div>
        <div style="width:38px;height:38px;background:var(--cream);border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative" data-action="showSheet:chat:${req.id}">
          ${I.chat()}
          ${chatCount ? `<div style="position:absolute;top:-4px;right:-4px;background:var(--orange);color:#fff;font-size:10px;font-weight:800;min-width:16px;height:16px;border-radius:999px;display:flex;align-items:center;justify-content:center;padding:0 4px">${chatCount}</div>` : ''}
        </div>
        <div style="width:38px;height:38px;background:var(--mint);border-radius:12px;display:flex;align-items:center;justify-content:center">${I.phone('#fff')}</div>
      </div>

      <!-- Order summary -->
      <div class="card mt-12">
        <div class="lbl" style="color:var(--charcoal);margin-bottom:10px">Order details</div>
        <div class="col gap-6">
          <div class="row gap-6">${I.store()}<span style="font-size:13px;color:var(--ink2)"><b>${req.storeName}</b> · ${req.storeBlock}</span></div>
          <div style="font-size:13.5px;color:var(--charcoal);font-weight:600">${req.items}</div>
          ${req.note ? `<div style="font-size:12px;color:var(--ink3);font-style:italic">"${req.note}"</div>` : ''}
        </div>
        <div class="divider"></div>
        <div class="row spread"><span class="muted">Food (est.)</span><span style="font-size:13px;font-weight:600">${fmt(req.estCost)}</span></div>
        <div class="row spread mt-4"><span class="muted">Delivery fee (agreed)</span><span style="font-size:13px;font-weight:700;color:var(--orange)">${fmt(req.finalFee)}</span></div>
        <div class="divider"></div>
        <div class="row spread"><span style="font-size:14px;font-weight:800">Total</span><span style="font-size:17px;font-weight:800;color:var(--charcoal)">${fmt(req.estCost + req.finalFee)}</span></div>
      </div>

      <!-- Rating (delivered only) -->
      ${req.status === 'delivered' ? `
        <div class="card mt-12">
          <div class="h3" style="text-align:center">How did ${req.courier.split(' ')[0]} do?</div>
          <div class="rating">
            ${[1, 2, 3, 4, 5].map(n => `<span data-action="rateRunner:${req.id}:${n}">${I.starOutline(n <= (req.rating || 0) ? 'var(--amber)' : 'var(--ink4)', 34)}</span>`).join('')}
          </div>
          <div class="muted" style="text-align:center;font-size:11px">${req.rating ? `You rated ${req.rating} stars` : 'Tap a star to rate'}</div>
        </div>
      ` : ''}

      <!-- Demo control -->
      ${req.status !== 'delivered' ? `
        <div class="card-flat mt-12" style="background:var(--charcoal);color:#fff;border:none">
          <div class="row spread" style="align-items:center">
            <div class="col gap-2">
              <div class="lbl" style="color:#fff;opacity:.7">DEMO CONTROL</div>
              <div style="font-size:12.5px;font-weight:600;opacity:.85">Advance courier for the pitch demo</div>
            </div>
            <button class="btn btn-sm" style="background:var(--orange);color:#fff;padding:9px 14px" data-action="demoAdvance:${req.id}">${demoLabel}</button>
          </div>
        </div>
      ` : ''}

      <div style="height:120px"></div>
    </div>

    <!-- Sticky bar: chat + primary action -->
    <div style="padding:12px 16px 16px;background:#fff;border-top:1px solid var(--border);flex-shrink:0;box-shadow:0 -8px 24px -12px rgba(30,30,46,.15)">
      ${req.status === 'delivered' ? `
        <div class="row gap-8">
          <button class="btn btn-ghost" style="flex:1" data-go="/buyer/home">Back home</button>
          <button class="btn btn-primary" style="flex:2" data-go="/buyer/home">Post another →</button>
        </div>
      ` : `
        <div class="row gap-8">
          <button class="btn btn-ghost" style="flex:1;flex-direction:column;padding:12px 8px;gap:4px;border-radius:14px" data-action="showSheet:chat:${req.id}">
            ${I.chat('var(--ink2)')}<span style="font-size:11px;font-weight:800">Chat${chatCount ? ` · ${chatCount}` : ''}</span>
          </button>
          <button class="btn btn-primary" style="flex:2;flex-direction:column;padding:12px 8px;gap:2px;border-radius:14px" data-action="showSheet:chat:${req.id}">
            <span style="font-size:14px;font-weight:800">${req.status === 'accepted' ? 'Watching pickup' : req.status === 'picked_up' ? 'On the way to you' : 'Almost here'}</span>
            <span style="font-size:11px;opacity:.9;font-weight:600">Message ${req.courier.split(' ')[0]} if needed</span>
          </button>
          <button class="btn" style="flex:1;background:var(--mint-soft);color:var(--mint-deep);flex-direction:column;padding:12px 8px;gap:4px;border-radius:14px">
            ${I.phone('var(--mint-deep)')}<span style="font-size:11px;font-weight:800">Call</span>
          </button>
        </div>
      `}
    </div>
    ${sheetOverlay()}
  </div>`;
}

route('/buyer/request/:id', ({ id }) => {
  const req = state.requests.find(r => r.id === id);
  if (!req) { setTimeout(() => go('/buyer/home'), 0); return `<div class="screen"></div>`; }
  // Once a runner is locked in, flip to the live tracking view
  if (req.status === 'accepted' || req.status === 'picked_up' || req.status === 'on_way' || req.status === 'delivered') {
    return renderBuyerTracking(req);
  }
  const runnerOffers = req.offers.filter(o => o.from === 'runner');
  const buyerCounters = req.offers.filter(o => o.from === 'buyer');
  const statusMap = {
    open: { c: 'var(--orange)', t: 'Waiting for runner offers' },
    negotiating: { c: 'var(--blue)', t: `${runnerOffers.filter(o => o.status === 'pending').length} pending offer(s)` },
    cancelled: { c: 'var(--ink3)', t: 'Cancelled' },
  };
  const st = statusMap[req.status] || statusMap.open;
  return `<div class="screen">
    <div class="topbar row gap-12">
      <div class="topbar-icon" data-go="/buyer/home">${I.back()}</div>
      <div class="col gap-2 grow"><div class="muted">POST #${req.id.replace('REQ-', '')}</div><div class="h2">Your request</div></div>
      ${req.status === 'open' || req.status === 'negotiating' ? `<div class="topbar-icon" style="background:#fff;color:var(--danger)" data-action="cancelRequest:${req.id}" title="Cancel">${I.logout('var(--danger)')}</div>` : ''}
    </div>
    <div class="scroll px-16" style="padding-top:12px">

      <!-- Request card -->
      <div class="card">
        <div class="row spread" style="margin-bottom:10px">
          <span class="pill" style="background:${st.c};color:#fff">${st.t}</span>
          <span class="muted">${req.postedAt}</span>
        </div>
        <div class="h2" style="line-height:1.35">${req.items}</div>
        <div class="mt-8 col gap-6">
          <div class="row gap-6">${I.store()}<span style="font-size:13px;color:var(--ink2)"><b>${req.storeName}</b> · ${req.storeBlock}</span></div>
          <div class="row gap-6">${I.pin('var(--mint)')}<span style="font-size:13px;color:var(--ink2)">${req.deliverTo}</span></div>
          ${req.note ? `<div class="row gap-6">${I.chat()}<span style="font-size:12.5px;color:var(--ink2);font-style:italic">"${req.note}"</span></div>` : ''}
        </div>
        <div class="divider"></div>
        <div class="row spread"><span class="muted">Est. food cost</span><span style="font-size:13px;font-weight:600">${fmt(req.estCost)}</span></div>
        <div class="row spread mt-4"><span class="muted">Your opening delivery offer</span><span style="font-size:13px;font-weight:700;color:var(--orange)">${fmt(req.initialFee)}</span></div>
        ${req.finalFee ? `<div class="row spread mt-4"><span class="muted">Agreed fee</span><span style="font-size:14px;font-weight:800;color:var(--mint-deep)">${fmt(req.finalFee)}</span></div>` : ''}
      </div>

      <!-- Offers list -->
      <div class="row spread mt-16" style="margin-bottom:10px">
        <div class="h2">Offers</div>
        <span class="muted" style="font-weight:600">${runnerOffers.length + buyerCounters.length} total</span>
      </div>

      ${runnerOffers.length === 0 && buyerCounters.length === 0 ? `
        <div class="empty">
          <div class="brand-float" style="opacity:.7">${brandMark(64)}</div>
          <div style="font-size:14px;font-weight:700;color:var(--charcoal);margin-top:12px">No offers yet</div>
          <div class="mt-8">Runners nearby will see your post. Sit tight — offers usually roll in within a few minutes.</div>
        </div>` : ''}

      <div class="col gap-10">
        ${[...runnerOffers, ...buyerCounters].sort((a, b) => (a.id > b.id ? 1 : -1)).map(o => {
    const isMine = o.from === 'buyer';
    const isAccepted = o.status === 'accepted';
    const isDeclined = o.status === 'declined';
    return `<div class="card" style="${isAccepted ? 'border:2px solid var(--mint);background:var(--mint-soft)' : ''}${isDeclined ? 'opacity:.55' : ''}">
            <div class="row gap-10" style="align-items:flex-start">
              ${avatarEl(isMine ? state.user.initials : o.runnerInitials, isMine ? 'var(--orange)' : `hsl(${(o.runnerInitials.charCodeAt(0) * 37) % 360},55%,55%)`, 40)}
              <div class="col gap-4 grow" style="min-width:0">
                <div class="row spread">
                  <div class="h3">${isMine ? 'You' : o.runnerName}</div>
                  <span class="muted">${o.time}</span>
                </div>
                <div style="font-size:18px;font-weight:800;color:${isAccepted ? 'var(--mint-deep)' : 'var(--charcoal)'};letter-spacing:-.3px">${fmt(o.fee)}</div>
                ${o.msg ? `<div style="font-size:12.5px;color:var(--ink2);line-height:1.4">${isMine ? '' : '"'}${o.msg}${isMine ? '' : '"'}</div>` : ''}
                ${isAccepted ? '<div class="pill pill-mint mt-4" style="width:fit-content">ACCEPTED</div>' : ''}
                ${isDeclined ? '<div class="muted mt-4">Declined</div>' : ''}
                ${!isMine && !isAccepted && !isDeclined && req.status !== 'accepted' ? `
                  <div class="row gap-8 mt-8">
                    <button class="btn btn-sm btn-mint" style="flex:2" data-action="acceptOffer:${req.id}:${o.id}">Accept ${fmt(o.fee)}</button>
                    <button class="btn btn-sm btn-ghost" data-action="counterOffer:${req.id}:${o.id}">Counter</button>
                    <button class="btn btn-sm" style="background:transparent;color:var(--ink3);padding:8px 8px" data-action="declineOffer:${req.id}:${o.id}" title="Decline">✕</button>
                  </div>` : ''}
              </div>
            </div>
          </div>`;
  }).join('')}
      </div>

      <div style="height:140px"></div>
    </div>

    ${(() => {
      // Sticky Carousell-style bottom bar for the buyer
      const latestPending = [...req.offers].reverse().find(o => o.from === 'runner' && o.status === 'pending');
      const chatCount = (state.chats && state.chats[req.id] && state.chats[req.id].length) || 0;
      // Case A: waiting for offers
      if (req.status === 'open' && !latestPending) {
        return `<div style="padding:12px 16px 16px;background:#fff;border-top:1px solid var(--border);flex-shrink:0;box-shadow:0 -8px 24px -12px rgba(30,30,46,.15)">
          <div class="row gap-8">
            <button class="btn btn-ghost" style="flex:1" data-action="cancelRequest:${req.id}">Cancel post</button>
            <button class="btn btn-primary" style="flex:2" disabled style="opacity:.6">Waiting for offers…</button>
          </div>
        </div>`;
      }
      // Case B: has a pending runner offer to act on
      if (latestPending) {
        return `<div style="padding:12px 16px 16px;background:#fff;border-top:1px solid var(--border);flex-shrink:0;box-shadow:0 -8px 24px -12px rgba(30,30,46,.15)">
          <div class="row spread" style="margin-bottom:10px">
            <div class="col gap-2">
              <div class="muted" style="font-weight:600">${latestPending.runnerName || 'Runner'} offered</div>
              <div style="font-size:20px;font-weight:800;letter-spacing:-.4px;color:var(--charcoal)">${fmt(latestPending.fee)}</div>
            </div>
            ${chatCount ? `<div class="pill pill-blue">${chatCount} msg</div>` : ''}
          </div>
          <div class="row gap-8">
            <button class="btn cta-tri" style="flex:1;background:var(--cream);color:var(--charcoal);border:1.5px solid var(--border);flex-direction:column;padding:12px 8px;gap:4px;border-radius:14px" data-action="showSheet:chat:${req.id}">
              ${I.chat('var(--charcoal)')}
              <span style="font-size:11px;font-weight:800">Chat</span>
            </button>
            <button class="btn cta-tri" style="flex:2;background:var(--mint);color:#fff;flex-direction:column;padding:12px 8px;gap:2px;border-radius:14px;box-shadow:0 8px 20px -8px rgba(46,206,139,.5)" data-action="acceptOffer:${req.id}:${latestPending.id}">
              <span style="font-size:14px;font-weight:800">Accept offer</span>
              <span style="font-size:11px;opacity:.9;font-weight:600">${fmt(latestPending.fee)}</span>
            </button>
            <button class="btn cta-tri" style="flex:1;background:var(--orange-soft);color:var(--orange-deep);border:none;flex-direction:column;padding:12px 8px;gap:4px;border-radius:14px" data-action="counterLatest:${req.id}">
              ${I.wallet('var(--orange-deep)')}
              <span style="font-size:11px;font-weight:800">Counter</span>
            </button>
          </div>
        </div>`;
      }
      // Case C: accepted → chat + track
      if (req.status === 'accepted' || req.status === 'picked_up') {
        return `<div style="padding:12px 16px 16px;background:#fff;border-top:1px solid var(--border);flex-shrink:0">
          <div class="row gap-8">
            <button class="btn btn-ghost" style="flex:1" data-action="showSheet:chat:${req.id}">${I.chat('var(--ink2)')} Chat with ${(req.courier || 'Runner').split(' ')[0]}</button>
            <button class="btn btn-primary" style="flex:2" data-go="/delivery/active">Track live →</button>
          </div>
        </div>`;
      }
      return '';
    })()}
    ${sheetOverlay()}
  </div>`;
});

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
let activeCategory = 'All';
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
  const openReqs = state.requests.filter(r =>
    r.buyerId !== 'me' && (r.status === 'open' || r.status === 'negotiating')
  );
  const totalPotential = openReqs.reduce((s, r) => s + r.initialFee, 0);
  return `<div class="screen bg-delivery">
    <div class="topbar tint-delivery">
      <div class="row spread mt-4">
        <div class="row gap-8">
          <div style="width:32px;height:32px;background:var(--mint);border-radius:10px;display:flex;align-items:center;justify-content:center">${I.run('#fff')}</div>
          <div class="h2">Runner Mode</div>
        </div>
        <div class="topbar-icon" style="position:relative;background:var(--cream)" data-action="showSheet:notifications">${I.bell()}${state.notifications ? `<div class="badge-dot" style="background:var(--mint)"></div>` : ''}</div>
      </div>
      <div class="mt-16" style="background:linear-gradient(135deg, var(--mint), var(--mint-deep));border-radius:16px;padding:14px 16px;position:relative;overflow:hidden">
        <div style="position:absolute;right:-20px;top:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.1)"></div>
        <div class="row spread" style="align-items:flex-start">
          <div>
            <div class="lbl" style="color:#fff;opacity:.85">TODAY'S EARNINGS</div>
            <div style="font-size:26px;font-weight:800;color:#fff;letter-spacing:-.5px;margin-top:4px">${fmt(45000)}</div>
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
      <div class="row spread">
        <div class="h2">Live requests</div>
        <div class="row gap-6"><div style="width:8px;height:8px;background:var(--mint);border-radius:50%"></div><span style="font-size:11px;color:var(--mint);font-weight:800">${openReqs.length} OPEN</span></div>
      </div>
      <div class="muted mt-4">Students posting now — tap to view and offer a fee</div>
    </div>
    <div class="scroll px-16">
      ${openReqs.length === 0 ? `
        <div class="empty" style="padding-top:40px">
          <div class="brand-float" style="opacity:.7">${brandMark(72)}</div>
          <div style="font-size:14px;font-weight:700;color:var(--charcoal);margin-top:12px">No open requests right now</div>
          <div class="mt-8">Sit tight — students post around lunch and between classes.</div>
        </div>
      ` : openReqs.map(r => {
    const myOffers = r.offers.filter(o => o.from === 'runner' && o.runnerName === state.user.name);
    const alreadyOffered = myOffers.some(o => o.status === 'pending');
    return `<div class="card mt-8" style="${r.urgent ? 'border:1.5px solid var(--orange)' : ''};cursor:pointer" data-go="/delivery/request/${r.id}">
          ${r.urgent ? `<div class="row gap-4" style="margin-bottom:8px"><div style="width:6px;height:6px;background:var(--orange);border-radius:50%"></div><span style="font-size:10px;font-weight:800;color:var(--orange);letter-spacing:.5px">URGENT</span></div>` : ''}
          <div class="row gap-10" style="align-items:flex-start">
            ${avatarEl(r.buyerInitials, `hsl(${(r.buyerInitials.charCodeAt(0) * 37) % 360},55%,55%)`, 40)}
            <div class="col gap-4 grow" style="min-width:0">
              <div class="row spread"><div class="h3">${r.buyerName}</div><span class="muted">${r.postedAt}</span></div>
              <div style="font-size:12.5px;color:var(--ink2);line-height:1.4">${r.items}</div>
              <div class="row gap-4 mt-4">${I.store()}<span style="font-size:11.5px;color:var(--ink2);font-weight:600">${r.storeName} · ${r.storeBlock}</span></div>
              <div class="row gap-4">${I.pin('var(--mint)')}<span style="font-size:11.5px;color:var(--ink2);font-weight:600">${r.deliverTo}</span></div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="row spread">
            <div class="col gap-2">
              <div class="muted" style="font-weight:600">Buyer's opening offer</div>
              <div style="font-size:15px;font-weight:800;color:var(--mint)">${fmt(r.initialFee)}</div>
            </div>
            ${alreadyOffered
        ? `<div class="pill pill-blue">Your offer sent</div>`
        : `<button class="btn btn-mint btn-sm" data-go="/delivery/request/${r.id}">View & offer</button>`}
          </div>
        </div>`;
  }).join('')}
      <div class="card mt-16 row gap-8" style="background:var(--cream);border:1px dashed var(--border);box-shadow:none">
        ${I.info()}<span style="font-size:11.5px;color:var(--ink2);font-weight:600">Total potential right now: <b style="color:var(--charcoal)">${fmt(totalPotential)}</b> across ${openReqs.length} requests</span>
      </div>
      <div style="height:24px"></div>
    </div>` : `
    <div class="scroll">
      <div class="empty" style="padding-top:80px">
        ${I.run('var(--ink4)')}
        <div style="font-size:15px;font-weight:700;color:var(--charcoal);margin-top:12px">You're offline</div>
        <div class="mt-8">Toggle available to start seeing requests.</div>
      </div>
    </div>`}
    ${bottomNav('home', 'delivery')}
    ${sheetOverlay()}
  </div>`;
});

// ── RUNNER'S REQUEST DETAIL: make an offer / see negotiation ──
route('/delivery/request/:id', ({ id }) => {
  const req = state.requests.find(r => r.id === id);
  if (!req) { setTimeout(() => go('/delivery/home'), 0); return `<div class="screen"></div>`; }
  const myOffers = req.offers.filter(o => o.from === 'runner' && o.runnerName === state.user.name);
  const buyerCounters = req.offers.filter(o => o.from === 'buyer');
  const latest = [...myOffers, ...buyerCounters].sort((a, b) => (a.id > b.id ? -1 : 1))[0];
  const acceptedByBuyer = req.status === 'accepted' && req.courier === state.user.name;
  return `<div class="screen bg-delivery">
    <div class="topbar row gap-12 tint-delivery">
      <div class="topbar-icon" style="background:var(--cream)" data-go="/delivery/home">${I.back()}</div>
      <div class="col gap-2 grow"><div class="muted">POST #${req.id.replace('REQ-', '')}</div><div class="h2">${req.buyerName}'s request</div></div>
    </div>
    <div class="scroll px-16" style="padding-top:12px">

      <div class="card">
        <div class="row gap-10" style="align-items:flex-start;margin-bottom:8px">
          ${avatarEl(req.buyerInitials, `hsl(${(req.buyerInitials.charCodeAt(0) * 37) % 360},55%,55%)`, 40)}
          <div class="col gap-2 grow"><div class="h3">${req.buyerName}</div><span class="muted">Posted ${req.postedAt}${req.urgent ? ' · <span style="color:var(--orange);font-weight:800">URGENT</span>' : ''}</span></div>
        </div>
        <div class="h2" style="line-height:1.35;margin-top:6px">${req.items}</div>
        <div class="mt-8 col gap-6">
          <div class="row gap-6">${I.store()}<span style="font-size:13px;color:var(--ink2)"><b>${req.storeName}</b> · ${req.storeBlock}</span></div>
          <div class="row gap-6">${I.pin('var(--mint)')}<span style="font-size:13px;color:var(--ink2)">${req.deliverTo}</span></div>
          ${req.note ? `<div class="row gap-6">${I.chat()}<span style="font-size:12.5px;color:var(--ink2);font-style:italic">"${req.note}"</span></div>` : ''}
        </div>
        <div class="divider"></div>
        <div class="row spread"><span class="muted">Est. food cost (you front)</span><span style="font-size:13px;font-weight:600">${fmt(req.estCost)}</span></div>
        <div class="row spread mt-4"><span class="muted">Buyer's opening offer</span><span style="font-size:15px;font-weight:800;color:var(--mint)">${fmt(req.initialFee)}</span></div>
      </div>

      ${acceptedByBuyer ? `
        <div class="card mt-12" style="background:var(--mint);color:#fff;border:none">
          <div class="lbl" style="color:#fff;opacity:.85">ACCEPTED · ${fmt(req.finalFee)}</div>
          <div class="h3 mt-4" style="color:#fff">Time to pick it up.</div>
          <button class="btn btn-block mt-12" style="background:rgba(255,255,255,.2);color:#fff" data-action="claimOrder:${req.id}">Start pickup</button>
        </div>
      ` : ''}

      <!-- Negotiation timeline -->
      ${(myOffers.length + buyerCounters.length) > 0 ? `
        <div class="h2 mt-16" style="margin-bottom:10px">Negotiation</div>
        <div class="col gap-8">
          ${[...myOffers, ...buyerCounters].sort((a, b) => (a.id > b.id ? 1 : -1)).map(o => {
    const mine = o.from === 'runner';
    return `<div class="card" style="${o.status === 'declined' ? 'opacity:.55' : ''}">
              <div class="row spread"><div class="row gap-6"><span class="pill ${mine ? 'pill-mint' : 'pill-orange'}">${mine ? 'YOU' : 'BUYER'}</span><span class="muted">${o.time}</span></div>
                <span class="muted" style="font-weight:700">${o.status === 'pending' ? 'Pending' : o.status === 'accepted' ? 'Accepted' : 'Declined'}</span></div>
              <div style="font-size:20px;font-weight:800;letter-spacing:-.3px;margin-top:6px">${fmt(o.fee)}</div>
              ${o.msg ? `<div style="font-size:12.5px;color:var(--ink2);margin-top:4px">${o.msg}</div>` : ''}
            </div>`;
  }).join('')}
        </div>` : ''}

      <div style="height:120px"></div>
    </div>

    ${!acceptedByBuyer ? `
    <!-- Carousell-style sticky 3-button bar -->
    <div style="padding:12px 16px 16px;background:#fff;border-top:1px solid var(--border);flex-shrink:0;box-shadow:0 -8px 24px -12px rgba(30,30,46,.15)">
      <div class="row spread" style="margin-bottom:10px">
        <div class="col gap-2">
          <div class="muted" style="font-weight:600">Current asked</div>
          <div style="font-size:20px;font-weight:800;letter-spacing:-.4px;color:var(--charcoal)">${fmt(req.finalFee || req.initialFee)}</div>
        </div>
        ${(state.chats && state.chats[req.id] && state.chats[req.id].length) ? `<div class="pill pill-blue">${state.chats[req.id].length} msg</div>` : ''}
      </div>
      <div class="row gap-8">
        <button class="btn cta-tri" style="flex:1;background:var(--cream);color:var(--charcoal);border:1.5px solid var(--border);flex-direction:column;padding:12px 8px;gap:4px;border-radius:14px" data-action="showSheet:chat:${req.id}">
          ${I.chat('var(--charcoal)')}
          <span style="font-size:11px;font-weight:800">Chat</span>
        </button>
        <button class="btn cta-tri" style="flex:2;background:var(--mint);color:#fff;flex-direction:column;padding:12px 8px;gap:2px;border-radius:14px;box-shadow:0 8px 20px -8px rgba(46,206,139,.5)" data-action="takeDelivery:${req.id}">
          <span style="font-size:14px;font-weight:800">Accept delivery</span>
          <span style="font-size:11px;opacity:.9;font-weight:600">at ${fmt(req.finalFee || req.initialFee)}</span>
        </button>
        <button class="btn cta-tri" style="flex:1;background:var(--orange-soft);color:var(--orange-deep);border:none;flex-direction:column;padding:12px 8px;gap:4px;border-radius:14px" data-action="showSheet:adjust:${req.id}">
          ${I.wallet('var(--orange-deep)')}
          <span style="font-size:11px;font-weight:800">Adjust</span>
        </button>
      </div>
    </div>
    ` : `
    <div style="padding:12px 16px 16px;background:#fff;border-top:1px solid var(--border);flex-shrink:0">
      <div class="row gap-8">
        <button class="btn btn-ghost" style="flex:1" data-action="showSheet:chat:${req.id}">${I.chat('var(--ink2)')} Chat with ${req.buyerName.split(' ')[0]}</button>
        <button class="btn btn-mint" style="flex:2" data-go="/delivery/active">Start pickup →</button>
      </div>
    </div>
    `}
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
      ${bottomNav('', 'delivery')}
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
    ${bottomNav('', 'delivery')}
  </div>`;
});

// 13. DELIVERY EARNINGS
// 12b. DELIVERY HISTORY — stats of past deliveries + ratings received
route('/delivery/history', () => {
  const hist = state.deliveryHistory || [];
  const totalTrips = hist.length;
  const totalEarned = hist.reduce((s, d) => s + d.fee, 0);
  const totalKg = hist.reduce((s, d) => s + d.weight, 0);
  const avgFee = totalTrips ? Math.round(totalEarned / totalTrips) : 0;
  // Fake but plausible rating breakdown (5★ heavy) — cached on state
  if (!state.deliveryRatings) {
    state.deliveryRatings = { avg: 4.9, count: 38, dist: { 5: 32, 4: 5, 3: 1, 2: 0, 1: 0 } };
    save();
  }
  const R = state.deliveryRatings;
  const maxRatingBar = Math.max(...Object.values(R.dist));
  return `<div class="screen bg-delivery">
    <div class="topbar tint-delivery">
      <div class="row spread"><div class="h1">History</div>${I.bell()}</div>
      <div class="muted mt-4">Every trip you've completed</div>
    </div>
    <div class="scroll px-16" style="padding-top:14px">

      <!-- Lifetime stat bar -->
      <div style="background:linear-gradient(135deg, var(--mint), var(--mint-deep));border-radius:20px;padding:18px 18px 16px;color:#fff;position:relative;overflow:hidden">
        <div style="position:absolute;right:-30px;top:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)"></div>
        <div class="lbl" style="color:#fff;opacity:.85">LIFETIME</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">
          <div><div style="font-size:22px;font-weight:800;letter-spacing:-.4px">${totalTrips}</div><div style="font-size:10px;opacity:.85;font-weight:700">TRIPS</div></div>
          <div><div style="font-size:22px;font-weight:800;letter-spacing:-.4px">${fmt(totalEarned).replace('Rp ', '')}</div><div style="font-size:10px;opacity:.85;font-weight:700">RUPIAH</div></div>
          <div><div style="font-size:22px;font-weight:800;letter-spacing:-.4px">${totalKg.toFixed(1)}<span style="font-size:12px;opacity:.7"> KG</span></div><div style="font-size:10px;opacity:.85;font-weight:700">CARRIED</div></div>
        </div>
      </div>

      <!-- 3-period breakdown -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px">
        <div class="card"><div class="lbl">TODAY</div><div style="font-size:16px;font-weight:800;margin-top:2px">${fmt(45000)}</div><div style="font-size:10px;color:var(--mint);font-weight:700">6 trips</div></div>
        <div class="card"><div class="lbl">WEEK</div><div style="font-size:16px;font-weight:800;margin-top:2px">${fmt(285000)}</div><div style="font-size:10px;color:var(--mint);font-weight:700">38 trips</div></div>
        <div class="card"><div class="lbl">AVG / TRIP</div><div style="font-size:16px;font-weight:800;margin-top:2px">${fmt(avgFee)}</div><div style="font-size:10px;color:var(--ink3);font-weight:700">per delivery</div></div>
      </div>

      <!-- Ratings card -->
      <div class="card mt-12">
        <div class="row spread" style="align-items:flex-start;margin-bottom:12px">
          <div class="col gap-4">
            <div class="lbl" style="color:var(--charcoal)">Your rating</div>
            <div class="row gap-6" style="align-items:baseline">
              <div style="font-size:34px;font-weight:800;letter-spacing:-.8px;color:var(--charcoal);line-height:1">${R.avg.toFixed(1)}</div>
              <div class="row gap-2">${[1, 2, 3, 4, 5].map(n => I.star(n <= Math.round(R.avg) ? 'var(--amber)' : 'var(--ink4)', 14)).join('')}</div>
            </div>
            <div class="muted">from ${R.count} customer${R.count > 1 ? 's' : ''}</div>
          </div>
          <div class="pill pill-mint">TOP COURIER</div>
        </div>
        ${[5, 4, 3, 2, 1].map(n => {
    const c = R.dist[n] || 0;
    const w = maxRatingBar ? Math.max(4, Math.round(c / maxRatingBar * 100)) : 0;
    return `<div class="row gap-8" style="padding:4px 0">
            <div style="width:14px;font-size:11px;font-weight:700;color:var(--ink2);text-align:right">${n}</div>
            ${I.star('var(--amber)', 10)}
            <div style="flex:1;height:6px;background:var(--border);border-radius:4px;overflow:hidden"><div style="width:${w}%;height:100%;background:${n >= 4 ? 'var(--mint)' : n === 3 ? 'var(--amber)' : 'var(--ink4)'};border-radius:4px"></div></div>
            <div style="width:20px;font-size:11px;font-weight:700;color:var(--ink3);text-align:right">${c}</div>
          </div>`;
  }).join('')}
      </div>

      <!-- Recent reviews snippet -->
      <div class="card mt-12">
        <div class="row spread" style="margin-bottom:10px"><div class="h3">Recent reviews</div><span style="font-size:11px;color:var(--mint);font-weight:700;cursor:pointer">See all</span></div>
        ${[
      { by: 'Joel W.', stars: 5, note: 'Super fast, arrived hot!', date: 'Today · 12:04 PM' },
      { by: 'Sarah L.', stars: 5, note: 'Very polite, thank you 🙏', date: 'Yesterday' },
      { by: 'Aditya P.', stars: 4, note: 'On time', date: 'Yesterday' },
    ].map((r, i, arr) => `
          <div style="padding:10px 0;${i < arr.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}">
            <div class="row spread"><div class="row gap-8">${avatarEl(r.by[0], 'var(--mint)', 26)}<div style="font-size:12.5px;font-weight:700">${r.by}</div></div>
              <div class="row gap-2">${[1, 2, 3, 4, 5].map(n => I.star(n <= r.stars ? 'var(--amber)' : 'var(--ink4)', 10)).join('')}</div>
            </div>
            <div class="body mt-4" style="font-size:12px">"${r.note}"</div>
            <div class="muted mt-4">${r.date}</div>
          </div>`).join('')}
      </div>

      <!-- Full trip history -->
      <div class="row spread" style="margin:18px 4px 10px"><div class="h2">All Trips</div><span class="muted" style="font-weight:600">${totalTrips} total</span></div>
      ${hist.length === 0 ? `<div class="empty">${I.bag('var(--ink4)')}<div style="font-size:14px;font-weight:700;margin-top:12px;color:var(--charcoal)">No deliveries yet</div><div class="mt-8">Claim your first order from Home.</div></div>`
      : hist.map((d, i, arr) => `
        <div style="padding:12px 4px;${i < arr.length - 1 ? 'border-bottom:1px solid var(--border)' : ''};display:flex;gap:12px;align-items:center">
          <div style="width:36px;height:36px;background:var(--mint-soft);border-radius:10px;display:flex;align-items:center;justify-content:center">${I.check('var(--mint)')}</div>
          <div class="col gap-2 grow"><div class="h3">${d.store} → ${d.dest}</div><div class="muted">${d.time} · ${d.weight} KG</div></div>
          <div class="col" style="align-items:flex-end;gap:2px">
            <div style="font-size:13px;font-weight:800;color:var(--mint)">+${fmt(d.fee)}</div>
            <div class="row gap-2">${I.star('var(--amber)', 9)}<span style="font-size:10px;font-weight:700;color:var(--ink2)">5.0</span></div>
          </div>
        </div>`).join('')}

      <div style="height:24px"></div>
    </div>
    ${bottomNav('history', 'delivery')}
  </div>`;
});

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
// Helper: extract block letter from strings like "Block C", "Canteen", "Library · Rm 12"
function normalizeBlock(s) {
  if (!s) return null;
  const m = s.match(/Block\s+(\w+)/i);
  if (m) return m[1].toUpperCase();
  if (/canteen/i.test(s)) return 'Cant';
  if (/library|lib/i.test(s)) return 'Lib';
  return null;
}

route('/map', () => {
  const kind = state.role || 'buyer';
  if (kind === 'delivery') return renderDeliveryMap();
  if (kind === 'seller') return renderSellerMap();
  // Block metadata
  const blockInfo = {
    A: { name: 'Block A', desc: 'Lecture halls · Ground: study lounge' },
    B: { name: 'Block B', desc: 'Lecture halls' },
    C: { name: 'Block C', desc: 'Faculty offices & classrooms' },
    K: { name: 'Block K', desc: 'Interactive Media studios · Year 3 base' },
    Lib: { name: 'Library', desc: 'Main library · Quiet floors 2–4' },
    Cant: { name: 'Canteen', desc: 'Food court · Multiple vendors' },
    D: { name: 'Block D', desc: 'Engineering classrooms' },
    E: { name: 'Block E', desc: 'Lecture halls · IT labs' },
    F: { name: 'Block F', desc: 'Business school' },
  };
  // Map each store to its block coordinate
  const storeBlockCoord = (s) => {
    const b = (s.block || '').replace('Block ', '');
    return blockCoords[b] || blockCoords[s.block] || null;
  };
  // Group stores by their block letter
  const storesByBlock = {};
  stores.forEach(s => {
    const b = (s.block || '').replace('Block ', '');
    if (!storesByBlock[b]) storesByBlock[b] = [];
    storesByBlock[b].push(s);
  });
  // Store pin coords for the map (offset slightly if two stores share a block)
  const storePins = stores.filter(s => s.open).map(s => storeBlockCoord(s)).filter(Boolean);

  // Live courier position — derived from active order (buyer) or active delivery (courier)
  const activeOrder = state.orders.find(o => o.status !== 'delivered');
  let courierCoord = null;
  if (state.activeDelivery && state.role === 'delivery') {
    // Own delivery flow — courier is 'you'
    courierCoord = state.activeDelivery.step === 1 ? [0.52, 0.35] : userBlockCoord();
  } else if (activeOrder) {
    // Buyer with an order in progress — courier is midway
    const s = getStore(activeOrder.storeId);
    const sc = s ? storeBlockCoord(s) : null;
    const dc = userBlockCoord();
    if (sc && dc) courierCoord = [(sc[0] + dc[0]) / 2, (sc[1] + dc[1]) / 2 - 0.03];
  }

  // Selected block for the info panel
  const sel = state._mapSelected || userBlock();
  const info = blockInfo[sel] || { name: sel, desc: '' };
  const storesHere = storesByBlock[sel] || [];
  const isYourBlock = sel === userBlock();
  const courierBlockLetter = courierCoord ? (() => {
    // Approximate which block the courier is over — pick the nearest block center
    let best = null, bestDist = Infinity;
    Object.entries(blockCoords).forEach(([k, [x, y]]) => {
      const d = Math.hypot(x - courierCoord[0], y - courierCoord[1]);
      if (d < bestDist) { bestDist = d; best = k; }
    });
    return bestDist < 0.12 ? best : null;
  })() : null;
  const isCourierHere = courierBlockLetter === sel;

  const html = campusMap(360, 400, {
    highlights: [sel],
    stores: storePins,
    dest: isYourBlock ? userBlockCoord() : null,
    you: [0.52, 0.35],
    courier: courierCoord,
    onBlock: 'mapSelect',
  });

  return `<div class="screen">
    <div class="topbar">
      <div class="row spread">
        <div class="h1">Campus Map</div>
        <div class="topbar-icon">${I.search()}</div>
      </div>
      <div class="muted mt-4">Tap any building to see who's there</div>
    </div>
    <div class="scroll px-16">
      <div style="border-radius:20px;overflow:hidden;box-shadow:var(--shadow);position:relative;background:#F5EEDF">
        ${html}
      </div>

      <!-- Selected block info -->
      <div class="card mt-12" style="border:1.5px solid var(--orange)">
        <div class="row spread" style="align-items:flex-start">
          <div class="col gap-4 grow">
            <div class="lbl">SELECTED</div>
            <div class="h1" style="letter-spacing:-.4px">${info.name}</div>
            <div class="body" style="line-height:1.4">${info.desc || 'Campus building'}</div>
          </div>
          <button class="topbar-icon" data-action="clearMapSelect" style="background:var(--cream)" title="Clear">${I.chevD()}</button>
        </div>

        <!-- Who / what is here -->
        <div class="col gap-8 mt-12">
          ${isYourBlock ? `
            <div class="row gap-10" style="padding:10px 12px;background:var(--mint-soft);border-radius:12px">
              <div style="width:28px;height:28px;background:var(--mint);border-radius:8px;display:flex;align-items:center;justify-content:center">${I.pin('#fff')}</div>
              <div class="col gap-2 grow"><div class="h3">Your delivery location</div><div class="muted">${state.user.location}</div></div>
            </div>` : ''}

          ${isCourierHere ? `
            <div class="row gap-10" style="padding:10px 12px;background:#EEF0F7;border-radius:12px">
              <div style="width:28px;height:28px;background:#1F2E5A;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#F5C842;font-weight:800;font-size:11px">M</div>
              <div class="col gap-2 grow"><div class="h3">Your courier is here</div><div class="muted">${activeOrder ? `On the way from ${getStore(activeOrder.storeId)?.name}` : 'Moving through campus'}</div></div>
            </div>` : ''}

          ${storesHere.length > 0 ? `
            <div class="lbl mt-8" style="color:var(--charcoal)">Stores here (${storesHere.length})</div>
            ${storesHere.map(s => `
              <div class="row gap-10" style="padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:12px;cursor:pointer" ${s.open ? `data-action="goStore:${s.id}"` : ''}>
                <div style="width:36px;height:36px;background:linear-gradient(135deg, hsl(${s.hue},65%,62%), hsl(${(s.hue + 40) % 360},55%,52%));border-radius:10px;flex-shrink:0"></div>
                <div class="col gap-2 grow">
                  <div class="row gap-6" style="align-items:center"><div class="h3">${s.name}</div>${!s.open ? '<span class="pill pill-ghost" style="font-size:9px;padding:2px 6px">CLOSED</span>' : ''}</div>
                  <div class="muted">${s.tags.join(' · ')} · ${s.prep}</div>
                </div>
                <div class="col" style="align-items:flex-end;gap:2px">
                  <div class="row gap-2">${I.star()}<span style="font-size:11px;font-weight:700">${s.rating}</span></div>
                  ${s.open ? I.chevR() : ''}
                </div>
              </div>`).join('')}
          ` : (!isYourBlock && !isCourierHere ? `
            <div class="muted" style="padding:6px 4px">No stores in this building.</div>
          ` : '')}
        </div>
      </div>

      <!-- Legend -->
      <div class="card-flat mt-12">
        <div class="lbl" style="margin-bottom:10px">Legend</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px">
          <div class="row gap-6"><div style="width:12px;height:12px;background:var(--orange);border-radius:50%"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">Store</span></div>
          <div class="row gap-6"><div style="width:12px;height:12px;background:var(--mint);border-radius:50%"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">Your location</span></div>
          <div class="row gap-6"><div style="width:12px;height:12px;background:#1F2E5A;border-radius:3px"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">Courier</span></div>
          <div class="row gap-6"><div style="width:12px;height:12px;background:var(--blue);border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px var(--border)"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">You (on map)</span></div>
        </div>
      </div>
      <div style="height:24px"></div>
    </div>
    ${bottomNav('map', kind)}
  </div>`;
});

// ── Delivery-role map: pickup and drop-off pins for available orders + active route ──
function renderDeliveryMap() {
  const avail = availableOrders();
  const active = state.activeDelivery;

  // Group orders by block (pickup and dropoff separately)
  const ordersAt = {}; // { blockLetter: { pickup: [], dropoff: [] } }
  const touch = (b, kind, entry) => {
    if (!b) return;
    ordersAt[b] = ordersAt[b] || { pickup: [], dropoff: [] };
    ordersAt[b][kind].push(entry);
  };
  const pickupPins = [], dropoffPins = [];
  avail.forEach(o => {
    const pb = normalizeBlock(o.storeLoc);
    const db = normalizeBlock(o.dest);
    if (pb && blockCoords[pb]) { pickupPins.push(blockCoords[pb]); touch(pb, 'pickup', o); }
    if (db && blockCoords[db]) { dropoffPins.push(blockCoords[db]); touch(db, 'dropoff', o); }
  });

  // Active delivery route (Warung Bu Siti · Block C → user's block)
  let activeRoute = null;
  if (active) {
    const sb = 'C';
    const db = userBlock();
    activeRoute = {
      pickup: { block: sb, coord: blockCoords[sb], store: 'Warung Bu Siti' },
      dropoff: { block: db, coord: userBlockCoord(), name: state.user.location },
      step: active.step,
    };
  }

  // Selected block defaults to active pickup, else first available pickup
  const sel = state._mapSelected
    || (activeRoute ? activeRoute.pickup.block : null)
    || (avail[0] ? normalizeBlock(avail[0].storeLoc) : 'C');
  const info = ({
    A: 'Block A', B: 'Block B', C: 'Block C', K: 'Block K',
    Lib: 'Library', Cant: 'Canteen', D: 'Block D', E: 'Block E', F: 'Block F',
  })[sel] || sel;
  const hits = ordersAt[sel] || { pickup: [], dropoff: [] };

  // My own position on the map — mid-campus while idle, else at the current step
  const myPos = activeRoute
    ? (activeRoute.step === 1 ? [0.52, 0.35] : activeRoute.dropoff.coord)
    : [0.5, 0.5];

  const highlights = [sel];
  if (activeRoute) { highlights.push(activeRoute.pickup.block); highlights.push(activeRoute.dropoff.block); }

  const mapPath = activeRoute
    ? (activeRoute.step === 1
      ? [myPos, activeRoute.pickup.coord]
      : [activeRoute.pickup.coord, myPos, activeRoute.dropoff.coord])
    : null;

  // Total potential earnings from all available orders
  const totalEarn = avail.reduce((s, o) => s + o.fee, 0);

  return `<div class="screen bg-delivery">
    <div class="topbar tint-delivery">
      <div class="row spread">
        <div class="col gap-2"><div class="h1">Delivery Map</div><div class="muted">Tap any block to see orders</div></div>
        <div class="pill pill-mint">${avail.length} AVAILABLE</div>
      </div>
    </div>
    <div class="scroll px-16">
      <div style="border-radius:20px;overflow:hidden;box-shadow:var(--shadow);position:relative;background:#F5EEDF">
        ${campusMap(360, 400, {
    highlights,
    stores: pickupPins,
    dest: activeRoute ? activeRoute.dropoff.coord : null,
    you: activeRoute ? null : myPos,
    courier: activeRoute ? myPos : null,
    path: mapPath,
    onBlock: 'mapSelect',
  })}
      </div>

      <!-- Active delivery ribbon (if any) -->
      ${activeRoute ? `
      <div class="card mt-12" style="background:var(--mint);color:#fff;border:none">
        <div class="row spread"><div class="lbl" style="color:#fff;opacity:.85">ACTIVE DELIVERY · STEP ${activeRoute.step}/2</div>${I.run('#fff')}</div>
        <div class="h2 mt-4" style="color:#fff">${activeRoute.step === 1 ? 'Head to' : 'Deliver to'} ${activeRoute.step === 1 ? activeRoute.pickup.store : activeRoute.dropoff.name}</div>
        <button class="btn btn-block mt-12" style="background:rgba(255,255,255,.2);color:#fff" data-go="/delivery/active">Open delivery</button>
      </div>` : ''}

      <!-- Selected block info -->
      <div class="card mt-12" style="border:1.5px solid var(--mint)">
        <div class="row spread" style="align-items:flex-start">
          <div class="col gap-4 grow">
            <div class="lbl">SELECTED</div>
            <div class="h1" style="letter-spacing:-.4px">${info}</div>
            <div class="body">${hits.pickup.length + hits.dropoff.length} order${(hits.pickup.length + hits.dropoff.length) === 1 ? '' : 's'} touching this block</div>
          </div>
          <button class="topbar-icon" data-action="clearMapSelect" style="background:var(--cream)">${I.chevD()}</button>
        </div>

        ${hits.pickup.length > 0 ? `
          <div class="lbl mt-12" style="color:var(--charcoal)">Pick up here (${hits.pickup.length})</div>
          <div class="col gap-8 mt-8">
            ${hits.pickup.map(o => `
              <div class="card-flat" style="border:1px solid var(--border);background:#fff">
                <div class="row spread">
                  <div class="col gap-4 grow">
                    <div class="row gap-6">${I.store('var(--charcoal)')}<div class="h3">${o.store}</div>${o.urgent ? '<span class="pill pill-orange" style="font-size:9px;padding:2px 7px">URGENT</span>' : ''}</div>
                    <div class="row gap-4">${I.pin('var(--mint)')}<span style="font-size:11px;font-weight:600;color:var(--ink2)">${o.dest}</span></div>
                    <div class="muted">${o.items} items · ~${o.weight} KG · ${o.walk}</div>
                  </div>
                  <div class="col" style="align-items:flex-end;gap:6px">
                    <div style="font-size:15px;font-weight:800;color:var(--mint)">${fmt(o.fee)}</div>
                    <button class="btn btn-mint btn-sm" data-action="claimOrder:${o.orderId}">Claim</button>
                  </div>
                </div>
              </div>`).join('')}
          </div>` : ''}

        ${hits.dropoff.length > 0 ? `
          <div class="lbl mt-12" style="color:var(--charcoal)">Deliver to here (${hits.dropoff.length})</div>
          <div class="col gap-8 mt-8">
            ${hits.dropoff.map(o => `
              <div class="card-flat" style="border:1px solid var(--border);background:#fff">
                <div class="row spread">
                  <div class="col gap-4 grow">
                    <div class="row gap-6">${I.pin('var(--mint)')}<div class="h3">${o.dest}</div></div>
                    <div class="muted">Pickup: ${o.store} · ${o.storeLoc} · ${o.items} items · ~${o.weight} KG</div>
                  </div>
                  <div class="col" style="align-items:flex-end;gap:6px">
                    <div style="font-size:15px;font-weight:800;color:var(--mint)">${fmt(o.fee)}</div>
                    <button class="btn btn-mint btn-sm" data-action="claimOrder:${o.orderId}">Claim</button>
                  </div>
                </div>
              </div>`).join('')}
          </div>` : ''}

        ${(hits.pickup.length + hits.dropoff.length) === 0 ? `
          <div class="muted" style="padding:8px 4px">No orders touching this block right now.</div>` : ''}
      </div>

      <!-- Earnings summary strip -->
      <div class="row gap-8 mt-12">
        <div class="card grow"><div class="lbl">POTENTIAL</div><div style="font-size:16px;font-weight:800;margin-top:2px">${fmt(totalEarn)}</div><div class="muted">across ${avail.length} orders</div></div>
        <div class="card grow"><div class="lbl">TODAY</div><div style="font-size:16px;font-weight:800;margin-top:2px">Rp 45.000</div><div style="font-size:11px;color:var(--mint);font-weight:700">6 trips done</div></div>
      </div>

      <!-- Legend -->
      <div class="card-flat mt-12">
        <div class="lbl" style="margin-bottom:10px">Legend</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px">
          <div class="row gap-6"><div style="width:12px;height:12px;background:var(--orange);border-radius:50%"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">Pickup (store)</span></div>
          <div class="row gap-6"><div style="width:12px;height:12px;background:var(--mint);border-radius:50%"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">Drop-off</span></div>
          <div class="row gap-6"><div style="width:12px;height:12px;background:#1F2E5A;border-radius:3px"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">You (on active job)</span></div>
          <div class="row gap-6"><div style="width:12px;height:12px;background:var(--blue);border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px var(--border)"></div><span style="font-size:11px;color:var(--ink2);font-weight:600">You (idle)</span></div>
        </div>
      </div>
      <div style="height:24px"></div>
    </div>
    ${bottomNav('map', 'delivery')}
  </div>`;
}

// ── Seller-role map: your store + where your incoming orders are going ──
function renderSellerMap() {
  const incoming = incomingOrders();
  const storeBlock = 'C'; // Warung Bu Siti
  const storeCoord = blockCoords[storeBlock];
  // Seed a fake dest block per incoming order (rotate through blocks)
  const destBlocks = ['K', 'Lib', 'F', 'E'];
  const destinations = incoming.map((o, i) => ({
    order: o, block: destBlocks[i % destBlocks.length], coord: blockCoords[destBlocks[i % destBlocks.length]],
  }));

  const sel = state._mapSelected || storeBlock;
  const info = ({ A: 'Block A', B: 'Block B', C: 'Block C', K: 'Block K', Lib: 'Library', Cant: 'Canteen', D: 'Block D', E: 'Block E', F: 'Block F' })[sel] || sel;
  const ordersToSel = destinations.filter(d => d.block === sel);
  const isStore = sel === storeBlock;

  return `<div class="screen bg-seller">
    <div class="topbar tint-seller">
      <div class="row spread"><div class="col gap-2"><div class="h1">Store Map</div><div class="muted">Where your orders are going</div></div><div class="pill pill-blue">${incoming.length} INCOMING</div></div>
    </div>
    <div class="scroll px-16">
      <div style="border-radius:20px;overflow:hidden;box-shadow:var(--shadow);position:relative;background:#F5EEDF">
        ${campusMap(360, 400, {
    highlights: [sel],
    stores: [storeCoord],
    dest: null,
    you: storeCoord,
    courier: null,
    onBlock: 'mapSelect',
  })}
      </div>
      <div class="card mt-12" style="border:1.5px solid var(--blue)">
        <div class="row spread"><div class="col gap-4 grow"><div class="lbl">SELECTED</div><div class="h1" style="letter-spacing:-.4px">${info}</div>${isStore ? '<div class="pill pill-blue" style="width:fit-content;margin-top:4px">YOUR STORE</div>' : ''}</div><button class="topbar-icon" data-action="clearMapSelect" style="background:var(--cream)">${I.chevD()}</button></div>
        ${ordersToSel.length > 0 ? `
          <div class="lbl mt-12" style="color:var(--charcoal)">Orders heading here (${ordersToSel.length})</div>
          <div class="col gap-8 mt-8">
            ${ordersToSel.map(d => `
              <div class="card-flat" style="border:1px solid var(--border);background:#fff">
                <div class="row spread"><div class="col gap-4 grow"><div class="h3">#${d.order.id} · ${d.order.buyer}</div><div class="muted">${d.order.items.map(i => `${i.qty}× ${i.name}`).join(' · ')}</div></div><div style="font-size:14px;font-weight:800">${fmt(d.order.total)}</div></div>
              </div>`).join('')}
          </div>` : `<div class="muted mt-12" style="padding:6px 4px">No orders heading to this block yet.</div>`}
      </div>
      <div style="height:24px"></div>
    </div>
    ${bottomNav('map', 'seller')}
  </div>`;
}

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
      <div class="card" style="padding:6px;display:grid;grid-template-columns:1fr 1fr;gap:4px">
        ${RoleBtn('buyer', '🛒', 'Buyer', 'var(--orange)')}
        ${RoleBtn('delivery', '🏃', 'Runner', 'var(--mint)')}
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
      <div class="row gap-8 mt-16">
        <button class="btn btn-ghost" style="flex:1" data-action="logout">${I.logout('var(--ink2)')} Log Out</button>
        <button class="btn btn-danger-soft" style="flex:1" data-action="logoutReset">Reset App</button>
      </div>
      <div style="text-align:center;font-size:10px;color:var(--ink3);margin-top:12px">mampir v1.0 · small stops, big help · TarUMA</div>
      <div style="height:24px"></div>
    </div>
    ${bottomNav('profile', role)}
  </div>`;
});

// ─── Init ───────────────────────────────────────────────────
window.addEventListener('hashchange', render);
window.render = render;

// Fresh page load / refresh: force login screen if this browser tab has no active session.
// sessionStorage clears on tab close, so opening the app again always plays the splash + login.
if (!sessionStorage.getItem(SESSION_KEY)) {
  if (location.hash && location.hash !== '#/') {
    // Rewrite the URL to '/' without triggering a duplicate render
    history.replaceState(null, '', location.pathname + location.search + '#/');
  }
}
render();

// Register a service-worker-free "install to home screen" hint (no-op if not PWA)
