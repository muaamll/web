// ===== قاعدة البيانات (IndexedDB) =====
// products: المنتجات اللي ليها باركود (من Open Food Facts أو اللي تضيفها انت)
// log:      الأكل اللي سجلته كل يوم
// settings: الهدف اليومي ومعلوماتك

const DB_NAME = "iraqi-calories";
const DB_VERSION = 1;
let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "barcode" });
      }
      if (!db.objectStoreNames.contains("log")) {
        const log = db.createObjectStore("log", { keyPath: "id", autoIncrement: true });
        log.createIndex("date", "date");
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function dbRun(store, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
  });
}

const DB = {
  // المنتجات
  getProduct: (barcode) => dbRun("products", "readonly", (s) => s.get(barcode)),
  saveProduct: (product) => dbRun("products", "readwrite", (s) => s.put(product)),
  deleteProduct: (barcode) => dbRun("products", "readwrite", (s) => s.delete(barcode)),
  allProducts: () => dbRun("products", "readonly", (s) => s.getAll()),

  // سجل الأكل
  addEntry: (entry) => dbRun("log", "readwrite", (s) => s.add(entry)),
  deleteEntry: (id) => dbRun("log", "readwrite", (s) => s.delete(id)),
  entriesByDate: (date) => dbRun("log", "readonly", (s) => s.index("date").getAll(date)),

  // الإعدادات
  getSetting: async (key, fallback) => {
    const row = await dbRun("settings", "readonly", (s) => s.get(key));
    return row ? row.value : fallback;
  },
  setSetting: (key, value) => dbRun("settings", "readwrite", (s) => s.put({ key, value })),
};

// ===== البحث عن باركود بقاعدة Open Food Facts العالمية =====
// قاعدة مجانية ومفتوحة، فيها منتجات كثيرة تنباع بالعراق (تركية، إيرانية، خليجية، أوروبية...)
async function lookupOpenFoodFacts(barcode) {
  const fields = "product_name,product_name_ar,product_name_en,brands,nutriments,serving_quantity,image_front_small_url";
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${fields}`;
  const res = await fetch(url);
  if (!res.ok && res.status !== 404) throw new Error("network");
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const p = data.product;
  const n = p.nutriments || {};
  let kcal = n["energy-kcal_100g"];
  if (kcal == null && n["energy_100g"] != null) kcal = n["energy_100g"] / 4.184; // تحويل من كيلوجول
  if (kcal == null) return null; // بدون سعرات ما يفيدنا

  return {
    barcode,
    name: p.product_name_ar || p.product_name || p.product_name_en || "منتج بدون اسم",
    brand: p.brands || "",
    kcal: round1(kcal),
    p: round1(n.proteins_100g || 0),
    c: round1(n.carbohydrates_100g || 0),
    f: round1(n.fat_100g || 0),
    portion: Number(p.serving_quantity) || 100,
    image: p.image_front_small_url || "",
    source: "off",
  };
}

function round1(x) {
  return Math.round(Number(x) * 10) / 10;
}
