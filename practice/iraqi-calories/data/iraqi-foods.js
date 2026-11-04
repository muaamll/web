// قاعدة بيانات الأكلات العراقية (القيم لكل 100 غرام — تقريبية لأن كل بيت يطبخ بطريقته)
// kcal = سعرات، p = بروتين، c = كاربوهيدرات، f = دهون
// portion = الحصة المعتادة بالغرام، portionName = اسمها

const IRAQI_FOODS = [
  // ===== الريوگ (الفطور) =====
  { id: "kahi", name: "كاهي", cat: "فطور", kcal: 380, p: 6, c: 45, f: 20, portion: 120, portionName: "قطعة" },
  { id: "geymar", name: "كيمر", cat: "فطور", kcal: 350, p: 3, c: 3, f: 37, portion: 40, portionName: "ملعقتين كبار" },
  { id: "kahi-geymar", name: "كاهي وكيمر ودبس", cat: "فطور", kcal: 360, p: 5, c: 42, f: 20, portion: 200, portionName: "صحن" },
  { id: "bagilla", name: "باقلاء بالدهن", cat: "فطور", kcal: 170, p: 7, c: 18, f: 8, portion: 300, portionName: "ماعون مع خبز" },
  { id: "makhlama", name: "مخلمة", cat: "فطور", kcal: 160, p: 8, c: 6, f: 12, portion: 250, portionName: "طاوة" },
  { id: "egg-boiled", name: "بيض مسلوق", cat: "فطور", kcal: 155, p: 13, c: 1, f: 11, portion: 50, portionName: "بيضة" },
  { id: "egg-fried", name: "بيض مقلي", cat: "فطور", kcal: 196, p: 13.6, c: 0.8, f: 15, portion: 50, portionName: "بيضة" },
  { id: "cheese-white", name: "جبن أبيض (عرب)", cat: "فطور", kcal: 260, p: 17, c: 3, f: 20, portion: 30, portionName: "قطعة" },
  { id: "labneh", name: "لبنة", cat: "فطور", kcal: 170, p: 7, c: 5, f: 13, portion: 30, portionName: "ملعقتين" },
  { id: "dibis-rashi", name: "دبس وراشي", cat: "فطور", kcal: 420, p: 6, c: 55, f: 20, portion: 40, portionName: "ملعقتين" },

  // ===== الخبز =====
  { id: "samoon", name: "صمون عراقي", cat: "خبز", kcal: 270, p: 9, c: 54, f: 1.5, portion: 90, portionName: "صمونة" },
  { id: "khubz-tannour", name: "خبز تنور", cat: "خبز", kcal: 275, p: 9, c: 55, f: 1.5, portion: 120, portionName: "رغيف" },
  { id: "khubz-ruqaq", name: "خبز رقاق", cat: "خبز", kcal: 300, p: 9, c: 62, f: 1.5, portion: 40, portionName: "رغيف" },

  // ===== التمن والأكلات الرئيسية =====
  { id: "timman", name: "تمن عنبر", cat: "تمن", kcal: 150, p: 2.8, c: 30, f: 2.5, portion: 250, portionName: "ماعون" },
  { id: "timman-shaariya", name: "تمن بالشعرية", cat: "تمن", kcal: 165, p: 3, c: 31, f: 3.5, portion: 250, portionName: "ماعون" },
  { id: "biryani", name: "برياني عراقي", cat: "تمن", kcal: 190, p: 8, c: 25, f: 7, portion: 350, portionName: "ماعون" },
  { id: "timman-bagilla", name: "تمن باقلاء", cat: "تمن", kcal: 175, p: 6, c: 28, f: 4.5, portion: 300, portionName: "ماعون" },
  { id: "maqlouba", name: "مقلوبة", cat: "تمن", kcal: 170, p: 7, c: 22, f: 6.5, portion: 350, portionName: "ماعون" },
  { id: "quzi", name: "قوزي على تمن", cat: "تمن", kcal: 230, p: 12, c: 20, f: 11, portion: 400, portionName: "ماعون" },

  // ===== المرگ =====
  { id: "marag-bamya", name: "مرگة باميا", cat: "مرگ", kcal: 90, p: 6, c: 6, f: 5, portion: 250, portionName: "ماعون" },
  { id: "marag-fasoulia", name: "مرگة فاصوليا يابسة", cat: "مرگ", kcal: 110, p: 7, c: 12, f: 4, portion: 250, portionName: "ماعون" },
  { id: "marag-fasoulia-green", name: "مرگة فاصوليا خضرة", cat: "مرگ", kcal: 75, p: 5, c: 6, f: 3.5, portion: 250, portionName: "ماعون" },
  { id: "marag-bazalia", name: "مرگة بزاليا", cat: "مرگ", kcal: 95, p: 6, c: 9, f: 4, portion: 250, portionName: "ماعون" },
  { id: "marag-sabzi", name: "قورمة سبزي", cat: "مرگ", kcal: 110, p: 7, c: 7, f: 6, portion: 250, portionName: "ماعون" },
  { id: "qeema", name: "قيمة", cat: "مرگ", kcal: 140, p: 8, c: 12, f: 7, portion: 250, portionName: "ماعون" },
  { id: "fesenjoon", name: "فسنجون", cat: "مرگ", kcal: 220, p: 10, c: 12, f: 15, portion: 250, portionName: "ماعون" },
  { id: "tepsi", name: "تبسي باذنجان", cat: "مرگ", kcal: 130, p: 6, c: 8, f: 8.5, portion: 300, portionName: "ماعون" },
  { id: "shorbat-adas", name: "شوربة عدس", cat: "مرگ", kcal: 70, p: 4.5, c: 10, f: 1.5, portion: 300, portionName: "طاسة" },

  // ===== الأكلات الشعبية =====
  { id: "dolma", name: "دولمة", cat: "شعبي", kcal: 150, p: 4, c: 20, f: 6, portion: 350, portionName: "ماعون" },
  { id: "pacha", name: "پاچة", cat: "شعبي", kcal: 210, p: 15, c: 10, f: 12, portion: 400, portionName: "ماعون مع خبز" },
  { id: "tashreeb", name: "تشريب لحم", cat: "شعبي", kcal: 150, p: 8, c: 15, f: 6.5, portion: 400, portionName: "ماعون" },
  { id: "tashreeb-bagilla", name: "تشريب باقلاء", cat: "شعبي", kcal: 160, p: 7, c: 18, f: 7, portion: 350, portionName: "ماعون" },
  { id: "kubba-halab", name: "كبة حلب", cat: "شعبي", kcal: 230, p: 8, c: 28, f: 9, portion: 70, portionName: "قطعة" },
  { id: "kubba-burghul", name: "كبة برغل مقلية", cat: "شعبي", kcal: 280, p: 10, c: 25, f: 15, portion: 70, portionName: "قطعة" },
  { id: "kubba-mosul", name: "كبة موصلية", cat: "شعبي", kcal: 260, p: 11, c: 22, f: 14, portion: 150, portionName: "قطعة" },
  { id: "kubba-shorba", name: "شوربة كبة (كبة حامض)", cat: "شعبي", kcal: 110, p: 6, c: 12, f: 4, portion: 350, portionName: "طاسة" },
  { id: "lablabi", name: "لبلبي", cat: "شعبي", kcal: 120, p: 6.5, c: 18, f: 2.5, portion: 250, portionName: "طاسة" },
  { id: "mutabbaq", name: "مطبگ سمك", cat: "شعبي", kcal: 190, p: 12, c: 18, f: 7.5, portion: 350, portionName: "ماعون" },
  { id: "lahm-bajeen", name: "لحم بعجين", cat: "شعبي", kcal: 260, p: 10, c: 30, f: 11, portion: 120, portionName: "قطعة" },
  { id: "urouk", name: "عروگ", cat: "شعبي", kcal: 260, p: 10, c: 18, f: 16, portion: 80, portionName: "قطعة" },

  // ===== المشويات =====
  { id: "kebab", name: "كباب عراقي", cat: "مشويات", kcal: 250, p: 18, c: 2, f: 19, portion: 100, portionName: "شيش" },
  { id: "tikka", name: "تكة لحم", cat: "مشويات", kcal: 200, p: 24, c: 1, f: 11, portion: 100, portionName: "شيش" },
  { id: "tikka-chicken", name: "تكة دجاج", cat: "مشويات", kcal: 160, p: 26, c: 2, f: 5, portion: 120, portionName: "شيش" },
  { id: "masgouf", name: "سمك مسگوف", cat: "مشويات", kcal: 180, p: 20, c: 0, f: 11, portion: 300, portionName: "حصة" },
  { id: "chicken-grill", name: "دجاج مشوي (فروج)", cat: "مشويات", kcal: 215, p: 25, c: 0, f: 12.5, portion: 250, portionName: "نص فروج" },

  // ===== سندويچات وأكل شارع =====
  { id: "falafel-sandwich", name: "لفة فلافل", cat: "سندويچات", kcal: 240, p: 7, c: 32, f: 9.5, portion: 250, portionName: "لفة صمون" },
  { id: "shawarma-meat", name: "لفة گص لحم", cat: "سندويچات", kcal: 230, p: 12, c: 22, f: 10.5, portion: 280, portionName: "لفة" },
  { id: "shawarma-chicken", name: "لفة شاورما دجاج", cat: "سندويچات", kcal: 210, p: 13, c: 22, f: 8, portion: 280, portionName: "لفة" },
  { id: "kebab-sandwich", name: "لفة كباب", cat: "سندويچات", kcal: 250, p: 11, c: 24, f: 12, portion: 250, portionName: "لفة" },
  { id: "aroog-sandwich", name: "لفة عروگ", cat: "سندويچات", kcal: 255, p: 8, c: 28, f: 12, portion: 220, portionName: "لفة" },
  { id: "bajella", name: "باگلة بالدهن (صمونة)", cat: "سندويچات", kcal: 210, p: 7.5, c: 30, f: 6.5, portion: 250, portionName: "صمونة" },

  // ===== المقبلات والسلطات =====
  { id: "salata", name: "زلاطة", cat: "مقبلات", kcal: 35, p: 1, c: 5, f: 1.5, portion: 150, portionName: "صحن" },
  { id: "jajeek", name: "جاجيك", cat: "مقبلات", kcal: 60, p: 3.5, c: 4.5, f: 3, portion: 150, portionName: "طاسة" },
  { id: "torshi", name: "طرشي", cat: "مقبلات", kcal: 20, p: 0.5, c: 4, f: 0.2, portion: 50, portionName: "صحن صغير" },
  { id: "hummus", name: "حمص بطحينة", cat: "مقبلات", kcal: 170, p: 8, c: 14, f: 9.5, portion: 100, portionName: "صحن" },
  { id: "amba", name: "عمبة", cat: "مقبلات", kcal: 60, p: 0.5, c: 12, f: 1, portion: 20, portionName: "ملعقة" },

  // ===== الحلويات =====
  { id: "kleicha", name: "كليچة", cat: "حلويات", kcal: 450, p: 6, c: 60, f: 21, portion: 40, portionName: "قطعة" },
  { id: "zalabia", name: "زلابية", cat: "حلويات", kcal: 400, p: 3, c: 60, f: 17, portion: 50, portionName: "قطعة" },
  { id: "baklava", name: "بقلاوة", cat: "حلويات", kcal: 430, p: 6, c: 50, f: 23, portion: 30, portionName: "قطعة" },
  { id: "mann-salwa", name: "من السما", cat: "حلويات", kcal: 380, p: 5, c: 75, f: 7, portion: 30, portionName: "قطعة" },
  { id: "halawa-timman", name: "حلاوة تمن", cat: "حلويات", kcal: 230, p: 2.5, c: 40, f: 7, portion: 150, portionName: "صحن" },
  { id: "zarda", name: "زردة وحليب", cat: "حلويات", kcal: 160, p: 3, c: 30, f: 3, portion: 200, portionName: "طاسة" },
  { id: "dates", name: "تمر (زهدي/برحي)", cat: "حلويات", kcal: 280, p: 2.5, c: 75, f: 0.4, portion: 10, portionName: "تمرة" },

  // ===== المشروبات =====
  { id: "chai", name: "استكان چاي بشكر", cat: "مشروبات", kcal: 35, p: 0, c: 9, f: 0, portion: 100, portionName: "استكان" },
  { id: "chai-nosugar", name: "استكان چاي بدون شكر", cat: "مشروبات", kcal: 1, p: 0, c: 0.2, f: 0, portion: 100, portionName: "استكان" },
  { id: "laban", name: "لبن (شنينة)", cat: "مشروبات", kcal: 35, p: 2, c: 3, f: 1.5, portion: 250, portionName: "گلاص" },
  { id: "noomi-basra", name: "نومي بصرة", cat: "مشروبات", kcal: 30, p: 0, c: 8, f: 0, portion: 250, portionName: "گلاص" },
  { id: "pepsi", name: "مشروب غازي", cat: "مشروبات", kcal: 42, p: 0, c: 11, f: 0, portion: 330, portionName: "علبة" },
  { id: "shirbet-zbeeb", name: "شربت زبيب", cat: "مشروبات", kcal: 70, p: 0.3, c: 18, f: 0, portion: 250, portionName: "گلاص" },

  // ===== فواكه =====
  { id: "apple", name: "تفاح", cat: "فواكه", kcal: 52, p: 0.3, c: 14, f: 0.2, portion: 180, portionName: "تفاحة" },
  { id: "banana", name: "موز", cat: "فواكه", kcal: 89, p: 1.1, c: 23, f: 0.3, portion: 120, portionName: "موزة" },
  { id: "orange", name: "برتقال", cat: "فواكه", kcal: 47, p: 0.9, c: 12, f: 0.1, portion: 150, portionName: "برتقالة" },
  { id: "watermelon", name: "رگي", cat: "فواكه", kcal: 30, p: 0.6, c: 7.5, f: 0.2, portion: 300, portionName: "شريحة" },
  { id: "melon", name: "بطيخ", cat: "فواكه", kcal: 34, p: 0.8, c: 8, f: 0.2, portion: 250, portionName: "شريحة" },
];

const FOOD_CATEGORIES = ["الكل", "فطور", "خبز", "تمن", "مرگ", "شعبي", "مشويات", "سندويچات", "مقبلات", "حلويات", "مشروبات", "فواكه"];
