// ===== الحالة =====
const MEALS = [
  { id: "breakfast", name: "ريوگ", icon: "☕" },
  { id: "lunch", name: "غدا", icon: "🍛" },
  { id: "dinner", name: "عشا", icon: "🌙" },
  { id: "snack", name: "سناك", icon: "🍪" },
];
const CAT_ICONS = {
  "فطور": "🍳", "خبز": "🫓", "تمن": "🍚", "مرگ": "🍲", "شعبي": "🥘", "مشويات": "🍢",
  "سندويچات": "🌯", "مقبلات": "🥗", "حلويات": "🍯", "مشروبات": "🥤", "فواكه": "🍎",
};

let currentDate = todayKey();
let goal = 2000;
let activeCat = "الكل";
let selectedFood = null;   // الأكلة المفتوحة بنافذة الكمية
let scanner = null;
let scanBusy = false;

const $ = (id) => document.getElementById(id);

// ===== أدوات =====
function todayKey(d = new Date()) {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
}
function shiftDate(key, days) {
  const d = new Date(key + "T12:00:00");
  d.setDate(d.getDate() + days);
  return todayKey(d);
}
function dateLabel(key) {
  const t = todayKey();
  if (key === t) return "اليوم";
  if (key === shiftDate(t, -1)) return "البارحة";
  return new Date(key + "T12:00:00").toLocaleDateString("ar-IQ", { weekday: "short", day: "numeric", month: "short" });
}
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function normalize(s) {
  // يخلي البحث يلگى "گ" لو كتبت "ك" و "ة" لو كتبت "ه" وهكذا
  return s.toLowerCase()
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
    .replace(/گ/g, "ك").replace(/چ/g, "ج").replace(/پ/g, "ب").replace(/ڤ/g, "ف")
    .replace(/[ً-ْ]/g, "");
}
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ===== التبويبات =====
document.querySelectorAll(".tabbar button").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.view));
});
function showView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
  document.querySelectorAll(".tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  if (name === "db") renderProducts();
  window.scrollTo(0, 0);
}

// ===== التاريخ =====
$("prevDay").onclick = () => { currentDate = shiftDate(currentDate, -1); renderToday(); };
$("nextDay").onclick = () => {
  if (currentDate >= todayKey()) return;
  currentDate = shiftDate(currentDate, 1);
  renderToday();
};

// ===== شاشة اليوم =====
async function renderToday() {
  $("dateLabel").textContent = dateLabel(currentDate);
  $("nextDay").disabled = currentDate >= todayKey();
  $("nextDay").style.opacity = currentDate >= todayKey() ? 0.3 : 1;

  const entries = await DB.entriesByDate(currentDate);
  const sum = entries.reduce((a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, c: a.c + e.c, f: a.f + e.f }), { kcal: 0, p: 0, c: 0, f: 0 });

  const remaining = Math.round(goal - sum.kcal);
  $("goalVal").textContent = goal;
  $("eatenVal").textContent = Math.round(sum.kcal);
  $("remaining").textContent = Math.abs(remaining);
  $("remainingLabel").textContent = remaining >= 0 ? "باقي" : "زايد";
  $("ring").classList.toggle("over", remaining < 0);
  const ratio = Math.min(sum.kcal / goal, 1);
  $("ringFg").style.strokeDashoffset = 326.7 * (1 - ratio);

  // أهداف الماكروز: 25% بروتين، 50% كارب، 25% دهون
  const targets = { p: (goal * 0.25) / 4, c: (goal * 0.5) / 4, f: (goal * 0.25) / 9 };
  for (const k of ["p", "c", "f"]) {
    $("bar" + k.toUpperCase()).style.width = Math.min((sum[k] / targets[k]) * 100, 100) + "%";
    $("val" + k.toUpperCase()).textContent = `${Math.round(sum[k])} / ${Math.round(targets[k])} غ`;
  }

  $("meals").innerHTML = MEALS.map((m) => {
    const items = entries.filter((e) => e.meal === m.id);
    const total = Math.round(items.reduce((a, e) => a + e.kcal, 0));
    return `
      <div class="card meal">
        <div class="meal-head">
          <h3>${m.icon} ${m.name} <span>${total ? total + " سعرة" : ""}</span></h3>
          <button data-addmeal="${m.id}">+ أضف</button>
        </div>
        ${items.length ? `<ul>${items.map((e) => `
          <li>
            <div><div class="name">${esc(e.name)}</div><small>${esc(e.amount)}</small></div>
            <div><span class="kcal">${Math.round(e.kcal)}</span>
            <button class="del" data-del="${e.id}" aria-label="حذف">✕</button></div>
          </li>`).join("")}</ul>` : `<p class="empty">ما سجلت شي بعد</p>`}
      </div>`;
  }).join("");
}

$("meals").addEventListener("click", async (e) => {
  const del = e.target.closest("[data-del]");
  if (del) {
    await DB.deleteEntry(Number(del.dataset.del));
    renderToday();
    return;
  }
  const add = e.target.closest("[data-addmeal]");
  if (add) {
    $("pdMeal").value = add.dataset.addmeal;
    $("pdMeal").dataset.locked = "1";
    showView("add");
  }
});

// ===== قائمة الأكلات العراقية =====
$("catChips").innerHTML = FOOD_CATEGORIES.map((c) =>
  `<button class="chip ${c === activeCat ? "active" : ""}" data-cat="${c}">${CAT_ICONS[c] || ""} ${c}</button>`
).join("");
$("catChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  activeCat = chip.dataset.cat;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === chip));
  renderFoods();
});
$("searchInput").addEventListener("input", renderFoods);

async function renderFoods() {
  const q = normalize($("searchInput").value.trim());
  let list = IRAQI_FOODS.map((f) => ({ ...f, kind: "dish" }));

  // نضيف المنتجات المحفوظة بالباركود حتى تطلع بالبحث
  if (q) {
    const products = await DB.allProducts();
    list = list.concat(products.map((p) => ({ ...p, id: p.barcode, cat: "منتجات", kind: "product" })));
  }
  list = list.filter((f) => (activeCat === "الكل" || f.cat === activeCat || q) &&
    (!q || normalize(f.name + " " + (f.brand || "")).includes(q)));

  $("foodList").innerHTML = list.length ? list.map(foodRow).join("") :
    `<p class="list-empty">ما لگينا "${esc($("searchInput").value)}" — جرب تقرأ الباركود أو أضفه من تبويب قاعدتي</p>`;
}

function foodRow(f) {
  const thumb = f.image ? `<img src="${esc(f.image)}" alt="" loading="lazy">` : (CAT_ICONS[f.cat] || "📦");
  const sub = f.kind === "product"
    ? `${esc(f.brand || "منتج")} · لكل 100غ`
    : `${f.portionName} (${f.portion}غ) · ${Math.round((f.kcal * f.portion) / 100)} سعرة`;
  return `
    <button class="food" data-kind="${f.kind}" data-id="${esc(f.id)}">
      <div class="thumb">${thumb}</div>
      <div class="info"><b>${esc(f.name)}</b><small>${sub}</small></div>
      <div class="kc">${Math.round(f.kcal)}<small>/100غ</small></div>
    </button>`;
}

$("foodList").addEventListener("click", async (e) => {
  const row = e.target.closest(".food");
  if (!row) return;
  const food = row.dataset.kind === "dish"
    ? IRAQI_FOODS.find((f) => f.id === row.dataset.id)
    : await DB.getProduct(row.dataset.id);
  if (food) openPortion(food);
});

// ===== نافذة الكمية =====
function openPortion(food) {
  selectedFood = food;
  const isProduct = !!food.barcode;
  $("pdName").textContent = food.name;
  $("pdSub").textContent = isProduct ? `${food.brand || ""} · ${food.barcode}` : `${food.kcal} سعرة لكل 100غ`;
  $("pdImage").hidden = !food.image;
  if (food.image) $("pdImage").src = food.image;
  $("pdUnit").textContent = food.portionName ? `${food.portionName} (${food.portion}غ)` : `حصة (${food.portion}غ)`;
  $("pdQty").value = 1;
  $("pdGrams").value = food.portion;
  if (!$("pdMeal").dataset.locked) $("pdMeal").value = guessMeal();
  delete $("pdMeal").dataset.locked;
  updatePortion();
  $("portionDialog").returnValue = "";
  $("portionDialog").showModal();
}

function guessMeal() {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 17) return "lunch";
  if (h < 22) return "dinner";
  return "snack";
}

function updatePortion() {
  const grams = Number($("pdGrams").value) || 0;
  const r = grams / 100;
  const f = selectedFood;
  $("pdKcal").textContent = Math.round(f.kcal * r);
  $("pdMacros").textContent = `بروتين ${(f.p * r).toFixed(1)}غ · كارب ${(f.c * r).toFixed(1)}غ · دهون ${(f.f * r).toFixed(1)}غ`;
}

$("pdQty").addEventListener("input", () => {
  $("pdGrams").value = Math.round((Number($("pdQty").value) || 0) * selectedFood.portion);
  updatePortion();
});
$("pdGrams").addEventListener("input", () => {
  $("pdQty").value = +((Number($("pdGrams").value) || 0) / selectedFood.portion).toFixed(2);
  updatePortion();
});
document.querySelectorAll(".step").forEach((b) => b.addEventListener("click", () => {
  const v = Math.max(0.25, (Number($("pdQty").value) || 0) + Number(b.dataset.step));
  $("pdQty").value = v;
  $("pdQty").dispatchEvent(new Event("input"));
}));

$("portionDialog").addEventListener("close", async () => {
  if ($("portionDialog").returnValue !== "ok" || !selectedFood) return;
  const grams = Number($("pdGrams").value) || 0;
  if (grams <= 0) return;
  const r = grams / 100;
  const f = selectedFood;
  const qty = Number($("pdQty").value);
  const unit = f.portionName || "حصة";
  await DB.addEntry({
    date: currentDate,
    meal: $("pdMeal").value,
    name: f.name,
    amount: `${qty} ${unit} · ${grams}غ`,
    kcal: f.kcal * r, p: f.p * r, c: f.c * r, f: f.f * r,
    ref: f.barcode || f.id,
  });
  toast(`انضاف ${f.name} ✓`);
  showView("today");
  renderToday();
});

// ===== الباركود =====
async function handleBarcode(code) {
  code = String(code).replace(/\D/g, "");
  if (code.length < 6) { toast("رقم الباركود غلط"); return; }

  // 1) قاعدتك المحلية
  let product = await DB.getProduct(code);
  if (product) { openPortion(product); return; }

  // 2) قاعدة Open Food Facts
  toast("دا ندور على المنتج...");
  try {
    product = await lookupOpenFoodFacts(code);
  } catch {
    toast("ماكو انترنت — تگدر تضيف المنتج يدوياً");
    openProductForm(code, "ما گدرنا نتصل بالقاعدة العالمية.");
    return;
  }
  if (product) {
    product.added = Date.now();
    await DB.saveProduct(product);
    openPortion(product);
  } else {
    // 3) ما موجود — المستخدم يضيفه
    openProductForm(code, "هذا المنتج مو موجود بالقاعدة. أضفه مرة وحدة وراح ينحفظ عندك.");
  }
}

$("manualBarcodeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = $("manualBarcode").value.trim();
  if (v) handleBarcode(v);
  $("manualBarcode").value = "";
});

// --- الكاميرا ---
$("openScanner").addEventListener("click", startScanner);
$("closeScanner").addEventListener("click", () => $("scanDialog").close());
$("scanDialog").addEventListener("close", stopScanner);

const BARCODE_FORMATS = () => [
  Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
];

async function startScanner() {
  if (typeof Html5Qrcode === "undefined") { toast("مكتبة السكانر ما تحملت — تأكد من الانترنت"); return; }
  $("scanDialog").showModal();
  $("scanStatus").textContent = "دا نفتح الكاميرا...";
  scanBusy = false;
  scanner = new Html5Qrcode("reader", { formatsToSupport: BARCODE_FORMATS(), verbose: false });
  try {
    await scanner.start(
      { facingMode: "environment" },
      { fps: 12, qrbox: (w, h) => ({ width: Math.min(w * 0.85, 320), height: Math.min(h * 0.45, 160) }) },
      onScanSuccess
    );
    $("scanStatus").textContent = "قرّب الباركود للكاميرا";
  } catch (err) {
    $("scanStatus").textContent = location.protocol === "file:"
      ? "الكاميرا تحتاج Live Server (localhost) — أو اقرأ من صورة"
      : "ما گدرنا نفتح الكاميرا — اسمح بالإذن أو اقرأ من صورة";
  }
}

async function stopScanner() {
  if (scanner) {
    try { if (scanner.isScanning) await scanner.stop(); scanner.clear(); } catch {}
    scanner = null;
  }
}

function onScanSuccess(code) {
  if (scanBusy) return;
  scanBusy = true;
  if (navigator.vibrate) navigator.vibrate(80);
  $("scanDialog").close();
  handleBarcode(code);
}

$("scanFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await stopScanner();
  const fileScanner = new Html5Qrcode("reader", { formatsToSupport: BARCODE_FORMATS(), verbose: false });
  try {
    const code = await fileScanner.scanFile(file, false);
    $("scanDialog").close();
    handleBarcode(code);
  } catch {
    $("scanStatus").textContent = "ما لگينا باركود بالصورة — جرب صورة أوضح";
  }
  e.target.value = "";
});

// ===== قاعدتي =====
async function renderProducts() {
  const products = (await DB.allProducts()).sort((a, b) => (b.added || 0) - (a.added || 0));
  $("productList").innerHTML = products.length ? products.map((p) => `
    <div class="food">
      <div class="thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : "📦"}</div>
      <div class="info"><b>${esc(p.name)}</b>
        <small>${esc(p.brand || "")} · ${esc(p.barcode)} · ${p.source === "off" ? "🌍 عالمية" : "✍️ يدوي"}</small></div>
      <div class="kc">${Math.round(p.kcal)}<small>/100غ</small></div>
      <button class="remove" data-remove="${esc(p.barcode)}" aria-label="حذف">🗑</button>
    </div>`).join("") : `<p class="list-empty">بعدك ما قريت أي باركود</p>`;
}
$("productList").addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-remove]");
  if (!btn) return;
  if (!confirm("تمسح هذا المنتج من قاعدتك؟")) return;
  await DB.deleteProduct(btn.dataset.remove);
  renderProducts();
});

$("addProductBtn").addEventListener("click", () => openProductForm("", ""));

function openProductForm(barcode, hint) {
  const form = $("productForm");
  form.reset();
  form.barcode.value = barcode;
  $("productHint").textContent = hint;
  $("productHint").hidden = !hint;
  $("productDialog").returnValue = "";
  $("productDialog").showModal();
}

$("productDialog").addEventListener("close", async () => {
  if ($("productDialog").returnValue !== "ok") return;
  const fd = new FormData($("productForm"));
  const product = {
    barcode: String(fd.get("barcode")).replace(/\D/g, ""),
    name: fd.get("name").trim(),
    brand: fd.get("brand").trim(),
    kcal: Number(fd.get("kcal")),
    p: Number(fd.get("p")) || 0,
    c: Number(fd.get("c")) || 0,
    f: Number(fd.get("f")) || 0,
    portion: Number(fd.get("portion")) || 100,
    source: "user",
    added: Date.now(),
  };
  if (!product.barcode) return;
  await DB.saveProduct(product);
  toast("انحفظ المنتج ✓");
  renderProducts();
  if (document.querySelector("#view-add.active")) openPortion(product);
});

// ===== الإعدادات =====
$("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target));
  // معادلة Mifflin-St Jeor
  const bmr = 10 * fd.weight + 6.25 * fd.height - 5 * fd.age + (fd.sex === "m" ? 5 : -161);
  const tdee = bmr * Number(fd.activity);
  goal = Math.max(1200, Math.round((tdee + Number(fd.goal)) / 10) * 10);
  await DB.setSetting("goal", goal);
  await DB.setSetting("profile", fd);
  $("profileResult").textContent = `حرقك اليومي تقريباً ${Math.round(tdee)} سعرة — هدفك: ${goal} سعرة`;
  renderToday();
});

$("goalForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  goal = Number(e.target.goal.value);
  await DB.setSetting("goal", goal);
  toast(`الهدف صار ${goal} سعرة`);
  renderToday();
});

// ===== التشغيل =====
(async function init() {
  goal = await DB.getSetting("goal", 2000);
  const profile = await DB.getSetting("profile", null);
  if (profile) {
    for (const [k, v] of Object.entries(profile)) {
      const el = $("profileForm").elements[k];
      if (el) el.value = v;
    }
  }
  $("goalForm").goal.value = goal;
  renderFoods();
  renderToday();
})();
