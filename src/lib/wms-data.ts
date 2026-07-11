// CORTA WMS — seed data for a rich demo experience.

export type InvStatus = "AVAILABLE" | "RESERVED" | "HOLD" | "QUARANTINED" | "IN_TRANSIT";
export type OrderStatus = "OPEN" | "PARTIAL" | "COMPLETE" | "CLOSED" | "CANCELLED";
export type ShipStatus = "PLANNED" | "PICKING" | "PACKED" | "SHIPPED" | "DELIVERED";

export const plantKpis = {
  inventoryValue: 4_812_450,
  skus: 1284,
  turnover: 8.3,
  accuracy: 98.7,
  fillRate: 96.4,
  activeWOs: 42,
  openReceipts: 7,
  openShipments: 19,
  onHold: 34,
  quarantined: 8,
  cycleCountsDue: 12,
  laborUtil: 87,
};

export const warehouses = [
  { id: "WH-01", name: "Riyadh DC", code: "RUH-01", type: "Distribution", country: "SA", zones: 8, locations: 1240, active: true },
  { id: "WH-02", name: "Jeddah Plant", code: "JED-02", type: "Manufacturing", country: "SA", zones: 6, locations: 890, active: true },
  { id: "WH-03", name: "Dammam Cold Store", code: "DMM-03", type: "Cold Storage", country: "SA", zones: 4, locations: 420, active: true },
  { id: "WH-04", name: "Dubai Hub", code: "DXB-04", type: "Distribution", country: "AE", zones: 5, locations: 720, active: true },
  { id: "WH-05", name: "Cairo Depot", code: "CAI-05", type: "Distribution", country: "EG", zones: 3, locations: 310, active: false },
];

export const zones = [
  { id: "Z-01", warehouse: "WH-01", name: "Receiving Dock", type: "RECEIVING", locations: 24 },
  { id: "Z-02", warehouse: "WH-01", name: "Bulk Storage A", type: "STORAGE", locations: 380 },
  { id: "Z-03", warehouse: "WH-01", name: "Bulk Storage B", type: "STORAGE", locations: 380 },
  { id: "Z-04", warehouse: "WH-01", name: "Pick Face", type: "PICKING", locations: 220 },
  { id: "Z-05", warehouse: "WH-01", name: "Packing", type: "PACKING", locations: 12 },
  { id: "Z-06", warehouse: "WH-01", name: "QA Hold", type: "QA", locations: 40 },
  { id: "Z-07", warehouse: "WH-01", name: "Shipping Lanes", type: "SHIPPING", locations: 18 },
  { id: "Z-08", warehouse: "WH-01", name: "Returns", type: "RETURNS", locations: 8 },
];

export const products = [
  { id: "SKU-1001", name: "Cardamom Powder 250g", category: "Spices", uom: "EA", weight: 0.28, lot: true, serial: false, min: 200, max: 4000, onHand: 3120 },
  { id: "SKU-1002", name: "Saffron Threads 5g", category: "Spices", uom: "EA", weight: 0.008, lot: true, serial: false, min: 100, max: 1500, onHand: 842 },
  { id: "SKU-1003", name: "Basmati Rice 5kg", category: "Grains", uom: "BAG", weight: 5.0, lot: true, serial: false, min: 300, max: 6000, onHand: 4210 },
  { id: "SKU-1004", name: "Olive Oil 1L PET", category: "Oils", uom: "BTL", weight: 0.95, lot: true, serial: false, min: 500, max: 8000, onHand: 6842 },
  { id: "SKU-1005", name: "Date Syrup 500ml", category: "Sweeteners", uom: "BTL", weight: 0.62, lot: true, serial: false, min: 200, max: 3000, onHand: 1120 },
  { id: "SKU-1006", name: "Tahini Paste 400g", category: "Pastes", uom: "JAR", weight: 0.42, lot: true, serial: false, min: 300, max: 3500, onHand: 2410 },
  { id: "SKU-1007", name: "Wheat Flour 25kg", category: "Grains", uom: "BAG", weight: 25.0, lot: true, serial: false, min: 40, max: 800, onHand: 96 },
  { id: "SKU-1008", name: "Sugar Refined 50kg", category: "Sweeteners", uom: "BAG", weight: 50.0, lot: true, serial: false, min: 20, max: 400, onHand: 148 },
  { id: "SKU-1009", name: "Packaging Film Roll", category: "Packaging", uom: "ROLL", weight: 12.0, lot: false, serial: true, min: 10, max: 120, onHand: 42 },
  { id: "SKU-1010", name: "Glass Jar 500ml", category: "Packaging", uom: "EA", weight: 0.32, lot: false, serial: false, min: 5000, max: 40000, onHand: 28400 },
  { id: "SKU-1011", name: "Cinnamon Sticks 100g", category: "Spices", uom: "EA", weight: 0.11, lot: true, serial: false, min: 200, max: 3000, onHand: 1980 },
  { id: "SKU-1012", name: "Chickpeas 900g Can", category: "Canned", uom: "CAN", weight: 0.94, lot: true, serial: false, min: 400, max: 6000, onHand: 5220 },
];

export const suppliers = [
  { id: "SUP-01", name: "Al Marai Spice Co.", country: "SA", contact: "Ahmed Al Otaibi", email: "orders@almarai-spice.sa", terms: "NET30", rating: 4.7, orders: 128 },
  { id: "SUP-02", name: "Med Oil Partners", country: "TN", contact: "Youssef Ben Ali", email: "sales@medoil.tn", terms: "NET45", rating: 4.4, orders: 62 },
  { id: "SUP-03", name: "Indus Grain Traders", country: "PK", contact: "Faisal Malik", email: "orders@indusgrain.pk", terms: "NET30", rating: 4.6, orders: 210 },
  { id: "SUP-04", name: "Levant Glassworks", country: "JO", contact: "Rania Kassab", email: "sales@levantglass.jo", terms: "NET60", rating: 4.2, orders: 40 },
  { id: "SUP-05", name: "Nile Sweet Refinery", country: "EG", contact: "Karim Fouad", email: "sales@nilesweet.eg", terms: "NET30", rating: 4.5, orders: 88 },
];

export const customers = [
  { id: "CUS-01", name: "Panda Hypermarket", type: "Retail Chain", country: "SA", credit: 850000, orders: 342 },
  { id: "CUS-02", name: "Carrefour KSA", type: "Retail Chain", country: "SA", credit: 1200000, orders: 512 },
  { id: "CUS-03", name: "LuLu Group", type: "Retail Chain", country: "AE", credit: 980000, orders: 421 },
  { id: "CUS-04", name: "Tamimi Markets", type: "Retail Chain", country: "SA", credit: 620000, orders: 210 },
  { id: "CUS-05", name: "Al Rawabi Restaurants", type: "HoReCa", country: "SA", credit: 180000, orders: 96 },
  { id: "CUS-06", name: "Bin Dawood Group", type: "Retail Chain", country: "SA", credit: 540000, orders: 188 },
];

export const purchaseOrders = [
  { id: "PO-24081", supplier: "SUP-01", supplierName: "Al Marai Spice Co.", eta: "2026-07-14", status: "OPEN" as OrderStatus, lines: 4, value: 82400, received: 0 },
  { id: "PO-24082", supplier: "SUP-03", supplierName: "Indus Grain Traders", eta: "2026-07-12", status: "PARTIAL" as OrderStatus, lines: 6, value: 148200, received: 62 },
  { id: "PO-24083", supplier: "SUP-02", supplierName: "Med Oil Partners", eta: "2026-07-15", status: "OPEN" as OrderStatus, lines: 3, value: 96800, received: 0 },
  { id: "PO-24084", supplier: "SUP-04", supplierName: "Levant Glassworks", eta: "2026-07-18", status: "OPEN" as OrderStatus, lines: 2, value: 24500, received: 0 },
  { id: "PO-24080", supplier: "SUP-05", supplierName: "Nile Sweet Refinery", eta: "2026-07-11", status: "COMPLETE" as OrderStatus, lines: 5, value: 71200, received: 100 },
  { id: "PO-24079", supplier: "SUP-01", supplierName: "Al Marai Spice Co.", eta: "2026-07-10", status: "CLOSED" as OrderStatus, lines: 3, value: 41800, received: 100 },
];

export const receipts = [
  { id: "RCV-9081", po: "PO-24082", supplier: "Indus Grain Traders", dock: "D-02", received: "2026-07-11 08:42", status: "INSPECTING", lines: 6, accepted: 4, rejected: 0 },
  { id: "RCV-9080", po: "PO-24080", supplier: "Nile Sweet Refinery", dock: "D-01", received: "2026-07-11 07:15", status: "PUTAWAY", lines: 5, accepted: 5, rejected: 0 },
  { id: "RCV-9079", po: "-", supplier: "Med Oil Partners", dock: "D-03", received: "2026-07-10 15:22", status: "COMPLETED", lines: 2, accepted: 2, rejected: 0 },
  { id: "RCV-9078", po: "PO-24079", supplier: "Al Marai Spice Co.", dock: "D-01", received: "2026-07-10 11:08", status: "COMPLETED", lines: 3, accepted: 3, rejected: 0 },
  { id: "RCV-9077", po: "PO-24078", supplier: "Levant Glassworks", dock: "D-02", received: "2026-07-09 14:31", status: "COMPLETED", lines: 2, accepted: 1, rejected: 1 },
];

export const salesOrders = [
  { id: "SO-77201", customer: "CUS-01", customerName: "Panda Hypermarket", requested: "2026-07-12", status: "OPEN" as OrderStatus, lines: 12, value: 34200, picked: 0 },
  { id: "SO-77202", customer: "CUS-02", customerName: "Carrefour KSA", requested: "2026-07-12", status: "PARTIAL" as OrderStatus, lines: 18, value: 62100, picked: 42 },
  { id: "SO-77203", customer: "CUS-03", customerName: "LuLu Group", requested: "2026-07-13", status: "OPEN" as OrderStatus, lines: 22, value: 88400, picked: 0 },
  { id: "SO-77204", customer: "CUS-04", customerName: "Tamimi Markets", requested: "2026-07-11", status: "COMPLETE" as OrderStatus, lines: 9, value: 21800, picked: 100 },
  { id: "SO-77205", customer: "CUS-05", customerName: "Al Rawabi Restaurants", requested: "2026-07-14", status: "OPEN" as OrderStatus, lines: 5, value: 8420, picked: 0 },
  { id: "SO-77206", customer: "CUS-06", customerName: "Bin Dawood Group", requested: "2026-07-11", status: "PARTIAL" as OrderStatus, lines: 14, value: 41200, picked: 71 },
];

export const pickWaves = [
  { id: "WAVE-321", strategy: "WAVE", orders: 6, lines: 74, picker: "Yousef K.", status: "RUNNING", progress: 62, started: "07:30" },
  { id: "WAVE-322", strategy: "CLUSTER", orders: 4, lines: 42, picker: "Nawal S.", status: "RUNNING", progress: 88, started: "08:10" },
  { id: "WAVE-323", strategy: "ORDER", orders: 1, lines: 22, picker: "—", status: "PLANNED", progress: 0, started: "—" },
  { id: "WAVE-320", strategy: "WAVE", orders: 8, lines: 92, picker: "Salah M.", status: "COMPLETED", progress: 100, started: "05:45" },
];

export const shipments = [
  { id: "SHP-5501", so: "SO-77202", customer: "Carrefour KSA", carrier: "AramexPro", status: "PACKED" as ShipStatus, tracking: "AR3299881122", pallets: 6, weight: 1820, dock: "D-08" },
  { id: "SHP-5502", so: "SO-77206", customer: "Bin Dawood Group", carrier: "SMSA", status: "PICKING" as ShipStatus, tracking: "-", pallets: 4, weight: 1290, dock: "D-07" },
  { id: "SHP-5500", so: "SO-77204", customer: "Tamimi Markets", carrier: "DHL Freight", status: "SHIPPED" as ShipStatus, tracking: "DHL8821770021", pallets: 2, weight: 640, dock: "D-06" },
  { id: "SHP-5499", so: "SO-77198", customer: "LuLu Group", carrier: "AramexPro", status: "DELIVERED" as ShipStatus, tracking: "AR3299881000", pallets: 3, weight: 920, dock: "D-08" },
  { id: "SHP-5503", so: "SO-77203", customer: "LuLu Group", carrier: "SMSA", status: "PLANNED" as ShipStatus, tracking: "-", pallets: 5, weight: 1580, dock: "D-05" },
];

export const carriers = [
  { id: "CAR-01", name: "AramexPro", integrated: true, service: "Ground / Express", scac: "ARMX", avgTransit: 1.8, onTime: 96.4 },
  { id: "CAR-02", name: "SMSA", integrated: true, service: "Domestic", scac: "SMSA", avgTransit: 1.2, onTime: 94.1 },
  { id: "CAR-03", name: "DHL Freight", integrated: true, service: "International", scac: "DHLF", avgTransit: 3.6, onTime: 92.7 },
  { id: "CAR-04", name: "FedEx MENA", integrated: false, service: "International", scac: "FDXM", avgTransit: 4.1, onTime: 90.2 },
];

export const inventory = [
  { sku: "SKU-1003", name: "Basmati Rice 5kg", warehouse: "WH-01", location: "A-12-03-B", lot: "LOT-BR2401", qty: 820, uom: "BAG", status: "AVAILABLE" as InvStatus, expiry: "2027-03-01" },
  { sku: "SKU-1004", name: "Olive Oil 1L PET", warehouse: "WH-01", location: "B-08-01-A", lot: "LOT-OO2402", qty: 1240, uom: "BTL", status: "AVAILABLE" as InvStatus, expiry: "2027-01-14" },
  { sku: "SKU-1001", name: "Cardamom Powder 250g", warehouse: "WH-02", location: "C-04-02-D", lot: "LOT-CP2401", qty: 620, uom: "EA", status: "HOLD" as InvStatus, expiry: "2026-12-08" },
  { sku: "SKU-1005", name: "Date Syrup 500ml", warehouse: "WH-01", location: "B-11-04-C", lot: "LOT-DS2402", qty: 480, uom: "BTL", status: "AVAILABLE" as InvStatus, expiry: "2026-11-01" },
  { sku: "SKU-1002", name: "Saffron Threads 5g", warehouse: "WH-01", location: "V-01-01-A", lot: "LOT-SF2401", qty: 210, uom: "EA", status: "AVAILABLE" as InvStatus, expiry: "2027-06-01" },
  { sku: "SKU-1006", name: "Tahini Paste 400g", warehouse: "WH-01", location: "B-09-02-A", lot: "LOT-TP2402", qty: 940, uom: "JAR", status: "RESERVED" as InvStatus, expiry: "2026-10-30" },
  { sku: "SKU-1007", name: "Wheat Flour 25kg", warehouse: "WH-02", location: "F-02-01-A", lot: "LOT-WF2401", qty: 96, uom: "BAG", status: "AVAILABLE" as InvStatus, expiry: "2027-02-11" },
  { sku: "SKU-1008", name: "Sugar Refined 50kg", warehouse: "WH-03", location: "S-01-03-B", lot: "LOT-SR2401", qty: 148, uom: "BAG", status: "AVAILABLE" as InvStatus, expiry: "2028-01-01" },
  { sku: "SKU-1011", name: "Cinnamon Sticks 100g", warehouse: "WH-01", location: "C-06-01-B", lot: "LOT-CS2401", qty: 320, uom: "EA", status: "QUARANTINED" as InvStatus, expiry: "2026-09-14" },
  { sku: "SKU-1012", name: "Chickpeas 900g Can", warehouse: "WH-01", location: "D-03-02-A", lot: "LOT-CC2401", qty: 1420, uom: "CAN", status: "AVAILABLE" as InvStatus, expiry: "2028-04-20" },
  { sku: "SKU-1010", name: "Glass Jar 500ml", warehouse: "WH-01", location: "P-04-01-C", lot: "-", qty: 8200, uom: "EA", status: "IN_TRANSIT" as InvStatus, expiry: "-" },
  { sku: "SKU-1009", name: "Packaging Film Roll", warehouse: "WH-02", location: "P-01-02-B", lot: "-", qty: 18, uom: "ROLL", status: "AVAILABLE" as InvStatus, expiry: "-" },
];

export const adjustments = [
  { id: "ADJ-4401", sku: "SKU-1001", location: "C-04-02-D", delta: -12, reason: "Damaged", by: "N. Salem", when: "2026-07-11 09:20", approved: true },
  { id: "ADJ-4400", sku: "SKU-1004", location: "B-08-01-A", delta: +24, reason: "Cycle count found", by: "F. Al Otaibi", when: "2026-07-11 08:12", approved: true },
  { id: "ADJ-4399", sku: "SKU-1011", location: "C-06-01-B", delta: -8, reason: "Expired", by: "QA Bot", when: "2026-07-10 16:44", approved: true },
  { id: "ADJ-4398", sku: "SKU-1005", location: "B-11-04-C", delta: -3, reason: "Sample pull", by: "Lab", when: "2026-07-10 13:11", approved: false },
];

export const cycleCounts = [
  { id: "CC-2201", zone: "Z-04", assigned: "Y. Kadri", scheduled: "2026-07-11", status: "IN_PROGRESS", scanned: 62, target: 120, variance: 3 },
  { id: "CC-2202", zone: "Z-02", assigned: "S. Mahmoud", scheduled: "2026-07-11", status: "OPEN", scanned: 0, target: 80, variance: 0 },
  { id: "CC-2203", zone: "Z-03", assigned: "N. Salem", scheduled: "2026-07-12", status: "OPEN", scanned: 0, target: 90, variance: 0 },
  { id: "CC-2200", zone: "Z-04", assigned: "H. Rashid", scheduled: "2026-07-10", status: "COMPLETED", scanned: 108, target: 108, variance: 4 },
  { id: "CC-2199", zone: "Z-02", assigned: "F. Al Otaibi", scheduled: "2026-07-09", status: "COMPLETED", scanned: 80, target: 80, variance: 1 },
];

export const qualityHolds = [
  { id: "QH-771", sku: "SKU-1001", lot: "LOT-CP2401", qty: 620, reason: "Aflatoxin retest pending", raised: "2026-07-10", status: "HOLD" as const, inspector: "L. Farah" },
  { id: "QH-770", sku: "SKU-1011", lot: "LOT-CS2401", qty: 320, reason: "Foreign matter suspected", raised: "2026-07-09", status: "QUARANTINED" as const, inspector: "L. Farah" },
  { id: "QH-769", sku: "SKU-1006", lot: "LOT-TP2311", qty: 40, reason: "Seal integrity", raised: "2026-07-08", status: "RELEASED" as const, inspector: "L. Farah" },
  { id: "QH-768", sku: "SKU-1004", lot: "LOT-OO2311", qty: 12, reason: "Sensory failure", raised: "2026-07-07", status: "REJECTED" as const, inspector: "L. Farah" },
];

export const users = [
  { id: "U-01", name: "Faisal Al Otaibi", email: "faisal@corta.io", role: "Warehouse Manager", warehouse: "WH-01", active: true, lastLogin: "10 min ago" },
  { id: "U-02", name: "Nawal Salem", email: "nawal@corta.io", role: "Supervisor", warehouse: "WH-01", active: true, lastLogin: "1h ago" },
  { id: "U-03", name: "Yousef Kadri", email: "yousef@corta.io", role: "Operator", warehouse: "WH-01", active: true, lastLogin: "just now" },
  { id: "U-04", name: "Salah Mahmoud", email: "salah@corta.io", role: "Operator", warehouse: "WH-02", active: true, lastLogin: "20 min ago" },
  { id: "U-05", name: "Layla Farah", email: "layla@corta.io", role: "Quality Inspector", warehouse: "WH-01", active: true, lastLogin: "5 min ago" },
  { id: "U-06", name: "Hisham Rashid", email: "hisham@corta.io", role: "Maintenance", warehouse: "WH-03", active: true, lastLogin: "3h ago" },
  { id: "U-07", name: "Omar Sadiq", email: "omar@corta.io", role: "Administrator", warehouse: "ALL", active: true, lastLogin: "yesterday" },
];

export const auditLog = [
  { t: "09:41", user: "faisal", action: "APPROVE_ADJUSTMENT", entity: "ADJ-4401", detail: "delta -12 on SKU-1001" },
  { t: "09:32", user: "yousef", action: "PICK_CONFIRM", entity: "WAVE-321 · line 42", detail: "SKU-1003 x 20 BAG @ A-12-03-B" },
  { t: "09:12", user: "layla", action: "PLACE_HOLD", entity: "QH-771", detail: "Lot LOT-CP2401 (620 EA)" },
  { t: "08:58", user: "nawal", action: "RECEIVE_LINE", entity: "RCV-9081", detail: "PO-24082 line 4, 240 BAG accepted" },
  { t: "08:42", user: "system", action: "MES_CONSUME", entity: "WO-11245", detail: "SKU-1010 x 480 EA (production consumption)" },
  { t: "08:15", user: "omar", action: "CREATE_USER", entity: "U-08", detail: "New operator" },
  { t: "07:55", user: "salah", action: "PUTAWAY_CONFIRM", entity: "PA-2201", detail: "20 BAG SKU-1003 → A-12-03-B" },
];

export const oeeTrend = Array.from({ length: 12 }).map((_, i) => ({
  hour: `${String(i + 6).padStart(2, "0")}:00`,
  received: 200 + Math.round(Math.sin(i) * 60 + Math.random() * 40 + 60),
  shipped: 180 + Math.round(Math.cos(i / 2) * 40 + Math.random() * 60 + 80),
  picks: 400 + Math.round(Math.sin(i / 3) * 120 + Math.random() * 80),
}));

export const stockByCategory = [
  { name: "Grains", value: 1420000, color: "oklch(0.78 0.16 195)" },
  { name: "Oils", value: 1120000, color: "oklch(0.78 0.18 75)" },
  { name: "Spices", value: 780000, color: "oklch(0.72 0.18 155)" },
  { name: "Packaging", value: 640000, color: "oklch(0.72 0.14 280)" },
  { name: "Sweeteners", value: 520000, color: "oklch(0.65 0.24 22)" },
  { name: "Other", value: 332000, color: "oklch(0.68 0.02 245)" },
];

export const accuracyTrend = Array.from({ length: 14 }).map((_, i) => ({
  day: `D-${13 - i}`,
  accuracy: 97 + Math.random() * 2.5,
  fillRate: 94 + Math.random() * 4,
}));

export const dockDoors = [
  { id: "D-01", type: "INBOUND", status: "OCCUPIED", vehicle: "TRK-4409", eta: "-" },
  { id: "D-02", type: "INBOUND", status: "OCCUPIED", vehicle: "TRK-4410", eta: "-" },
  { id: "D-03", type: "INBOUND", status: "FREE", vehicle: "-", eta: "11:20" },
  { id: "D-05", type: "OUTBOUND", status: "LOADING", vehicle: "AR-8821", eta: "-" },
  { id: "D-06", type: "OUTBOUND", status: "FREE", vehicle: "-", eta: "10:45" },
  { id: "D-07", type: "OUTBOUND", status: "LOADING", vehicle: "SMSA-441", eta: "-" },
  { id: "D-08", type: "OUTBOUND", status: "OCCUPIED", vehicle: "AR-8822", eta: "-" },
];

export const integrations = {
  MES: { enabled: true, connected: true, lastSync: "30s ago", events24h: 1284, endpoint: "https://mes.corta.internal/api/v2" },
  QMS: { enabled: true, connected: true, lastSync: "2m ago", events24h: 214, endpoint: "https://qms.corta.internal/api/v1" },
  OMS: { enabled: true, connected: true, lastSync: "12s ago", events24h: 802, endpoint: "https://oms.corta.internal/api/v3" },
  CMMS: { enabled: true, connected: false, lastSync: "3h ago", events24h: 42, endpoint: "https://cmms.corta.internal/api/v1" },
};

export const mesEvents = [
  { t: "09:41", type: "CONSUME", wo: "WO-11245", sku: "SKU-1010", qty: 480, uom: "EA" },
  { t: "09:22", type: "PRODUCE", wo: "WO-11244", sku: "SKU-1004", qty: 320, uom: "BTL" },
  { t: "08:58", type: "CONSUME", wo: "WO-11245", sku: "SKU-1004", qty: 320, uom: "BTL" },
  { t: "08:14", type: "SCRAP", wo: "WO-11243", sku: "SKU-1010", qty: 12, uom: "EA" },
  { t: "07:41", type: "PRODUCE", wo: "WO-11243", sku: "SKU-1001", qty: 620, uom: "EA" },
];

export const maintenanceEvents = [
  { t: "08:20", asset: "FL-04 Forklift", event: "PM completed", impact: "None", tech: "H. Rashid" },
  { t: "07:15", asset: "COLD-02 Chiller", event: "Temp excursion 2°C", impact: "Auto hold on LOT-DS2402", tech: "System" },
  { t: "yesterday", asset: "CONV-01 Conveyor", event: "Belt replaced", impact: "None", tech: "H. Rashid" },
];
