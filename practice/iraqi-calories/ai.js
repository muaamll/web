// ===== تحليل الأكل بالذكاء الاصطناعي (Claude) =====
// تشرح شنو أكلت بالكلام، أو تدز صورة، وClaude يطلعلك الأكلات والسعرات.
// المفتاح (API key) مالتك ينحفظ بس بتليفونك — لا تحطه بالكود أبداً لأن الـ repo عام.

import Anthropic from "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.1.0/+esm";

const MODEL = "claude-opus-5-5";

// شكل الجواب اللي نريده من Claude (JSON مضبوط)
const RESULT_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "اسم الأكلة بالعربي (باللهجة العراقية إذا أكلة عراقية)" },
          amount: { type: "string", description: "وصف الكمية، مثل: ماعون، 2 صمونة، استكان" },
          grams: { type: "number", description: "الوزن التقريبي بالغرام" },
          kcal: { type: "number", description: "السعرات لهذي الكمية كلها" },
          p: { type: "number", description: "بروتين بالغرام لهذي الكمية" },
          c: { type: "number", description: "كاربوهيدرات بالغرام لهذي الكمية" },
          f: { type: "number", description: "دهون بالغرام لهذي الكمية" },
        },
        required: ["name", "amount", "grams", "kcal", "p", "c", "f"],
        additionalProperties: false,
      },
    },
    note: { type: "string", description: "ملاحظة قصيرة بالعراقي، مثلاً إذا الكمية مو واضحة. فارغة إذا ماكو شي." },
  },
  required: ["items", "note"],
  additionalProperties: false,
};

function systemPrompt() {
  // نعطي Claude قيم قاعدتنا حتى تطلع الأرقام متناسقة ويا باقي التطبيق
  const ref = IRAQI_FOODS.map(
    (f) => `${f.name}: ${f.kcal} سعرة/100غ (ب${f.p} ك${f.c} د${f.f})، ${f.portionName}≈${f.portion}غ`
  ).join("\n");

  return `انت خبير تغذية تعرف الأكل العراقي زين. المستخدم يوصفلك شنو أكل (بالعراقي أو بالفصحى) أو يدزلك صورة أكل.
طلّع كل أكلة بقائمة منفصلة ويا كميتها ووزنها التقريبي وسعراتها والماكروز للكمية كلها (مو لكل 100غ).

قواعد:
- إذا الأكلة موجودة بالجدول تحت، استعمل قيمه وحصصه المعتادة.
- إذا ما محدد الكمية، افترض الحصة العراقية المعتادة.
- بالصورة: قدّر الكمية من حجم الماعون والأشياء اللي حواليه.
- الخبز والصمون والچاي والمشروبات تنحسب كأكلات منفصلة إذا مذكورة أو باينة.
- إذا الكلام أو الصورة ما بيهم أكل، رجّع قائمة فارغة ووضح بالملاحظة.

جدول الأكلات العراقية (لكل 100غ):
${ref}`;
}

async function getClient() {
  const apiKey = await DB.getSetting("apiKey", "");
  if (!apiKey) throw new Error("NO_KEY");
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

// يصغّر الصورة قبل الإرسال (أسرع وأرخص) ويرجعها base64
function resizeImage(file, maxSide = 1280) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    };
    img.onerror = () => reject(new Error("BAD_IMAGE"));
    img.src = URL.createObjectURL(file);
  });
}

async function analyzeMeal({ text = "", imageFile = null }) {
  const client = await getClient();

  const content = [];
  if (imageFile) {
    const data = await resizeImage(imageFile);
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } });
  }
  content.push({
    type: "text",
    text: text.trim() || "شنو الأكل اللي بالصورة؟ احسبلي سعراته.",
  });

  let response;
  try {
    response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low", // مهمة بسيطة — جواب أسرع وأرخص
        format: { type: "json_schema", schema: RESULT_SCHEMA },
      },
      system: systemPrompt(),
      messages: [{ role: "user", content }],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new Error("BAD_KEY");
    if (err instanceof Anthropic.RateLimitError) throw new Error("RATE_LIMIT");
    if (err instanceof Anthropic.APIConnectionError) throw new Error("NETWORK");
    if (err instanceof Anthropic.APIError) throw new Error("API:" + (err.message || err.status));
    throw err;
  }

  if (response.stop_reason === "refusal") throw new Error("REFUSED");
  if (response.stop_reason === "max_tokens") throw new Error("TRUNCATED");

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("EMPTY");
  return JSON.parse(textBlock.text);
}

window.AI = { analyzeMeal };
