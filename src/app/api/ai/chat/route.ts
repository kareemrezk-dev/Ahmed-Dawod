import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  products,
  searchProducts,
  topCategoryLabels,
  categoryLabelsI18n,
  getCategoryLabel,
  getProductName,
  type Product,
  type TopCategory,
} from "@/lib/products";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// ─── Product context builder ──────────────────────────────────────────────────
function buildProductContext(): string {
  const categories = Object.entries(topCategoryLabels)
    .map(([key, v]) => `- ${v.en} (${v.ar}): /${key}`)
    .join("\n");

  const brands = [...new Set(products.map((p) => p.brand))].sort().join(", ");
  const totalProducts = products.length;

  return `
PRODUCT CATALOG SUMMARY:
- Total products: ${totalProducts}
- Brands available: ${brands}
- Categories:
${categories}

IMPORTANT PRODUCT MODELS (sample):
${products
  .slice(0, 60)
  .map((p) => `${p.brand} ${p.modelNumber} — ${p.nameEn} (${p.category})`)
  .join("\n")}
`;
}

// ─── System prompt ────────────────────────────────────────────────────────────
function getSystemPrompt(): string {
  const catalog = buildProductContext();

  return `You are "مساعد أحمد داود" (Ahmed Dawod Assistant), the AI-powered product advisor for Ahmed Dawod Bearings — a leading industrial bearings supplier in Egypt since 2015.

YOUR ROLE:
- Help customers find the right bearing, linear motion, ball screw, or other industrial product
- Answer questions about products, specifications, and compatibility
- Recommend products based on the customer's application or machine
- Provide information about the company

COMPANY INFO:
- Name: Ahmed Dawod for Bearings Trading (أحمد داود لتجارة رولمان البلي)
- Location: 10th of Ramadan City, Sharqia, Egypt — El Masreya Center 1 Mall, Shop 30 & 86
- Phone: 01069994050
- WhatsApp: 01065445000
- Email: Ahmed@ahmeddawod.com
- Speciality: All types of genuine ball bearings, linear motion, ball screws, hard chrome shafts, and CNC spare parts
- Brands: SKF, NSK, NTN, FAG, TIMKEN, KOYO, INA, HIWIN, THK, and more

${catalog}

BEHAVIOR RULES:
1. ALWAYS reply in the SAME language the user writes in. If Arabic, reply in Egyptian Arabic (عامية مصرية). If English, reply in English.
2. Be friendly, professional, and helpful — like a knowledgeable salesman.
3. When recommending products, include the model number and suggest the user view it on the website using this format: [اسم المنتج](/ar/products/SLUG) or [Product Name](/en/products/SLUG)
4. If you don't know the exact answer, suggest the customer contact via WhatsApp (01065445000) for a precise quote.
5. Keep responses concise but informative — max 3-4 paragraphs.
6. When asked about pricing, say "الأسعار بتتغير حسب الكمية والموديل، تواصل معانا عالواتساب عشان نديك أفضل سعر" or equivalent in English.
7. For image search results, help interpret what the user uploaded and suggest matching products.
8. Use emojis sparingly (1-2 per message max) to keep it professional but friendly.
9. NEVER make up product models that don't exist. Only recommend from the catalog above.
10. If someone asks about something unrelated to bearings/industrial products, politely redirect them.`;
}

// ─── Gemini API call with model fallback ──────────────────────────────────────
const MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
];

async function callGemini(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }

      // If 429 (rate limit), try next model
      if (response.status === 429) {
        console.log(`Model ${model} rate limited, trying next...`);
        continue;
      }

      // If 404 (model not found), try next model
      if (response.status === 404) {
        console.log(`Model ${model} not found, trying next...`);
        continue;
      }

      // Other errors — log and try next
      console.error(`Gemini ${model} error:`, response.status);
    } catch (err) {
      console.error(`Gemini ${model} fetch error:`, err);
    }
  }

  // All models failed
  return null;
}

// ─── Smart Local Fallback ─────────────────────────────────────────────────────
function extractSearchTerms(msg: string): string[] {
  const terms: string[] = [];
  // Extract model numbers (e.g., 6205, 6204, LM20, SBR16, etc.)
  const modelMatches = msg.match(/\b[A-Za-z]*\d{3,5}[A-Za-z]*/gi);
  if (modelMatches) terms.push(...modelMatches);

  // Extract known brand names
  const brands = ["skf", "nsk", "ntn", "fag", "timken", "koyo", "ina", "hiwin", "thk"];
  for (const b of brands) {
    if (msg.toLowerCase().includes(b)) terms.push(b);
  }

  // Extract product type keywords
  const typeKeywords: Record<string, string[]> = {
    "بلي": ["بلي", "bearing", "رولمان", "بيرنج"],
    "لينير": ["لينير", "linear", "خطي"],
    "بول سكرو": ["بول سكرو", "ball screw", "بولسكرو"],
    "هارد كروم": ["هارد كروم", "hard chrome", "كروم"],
    "كراسي": ["كرسي", "كراسي", "housing", "pillow"],
    "إبري": ["إبري", "ابري", "needle"],
    "كامه": ["كامه", "cam", "كام"],
  };

  for (const [, keywords] of Object.entries(typeKeywords)) {
    for (const kw of keywords) {
      if (msg.toLowerCase().includes(kw.toLowerCase())) {
        terms.push(kw);
        break;
      }
    }
  }

  return terms;
}

function localFallback(userMessage: string, locale: string): string {
  const msg = userMessage.toLowerCase().trim();
  const isAr = locale === "ar";

  // Try direct search first
  let matchedProducts = searchProducts(userMessage).slice(0, 5);

  // If no results, try extracting search terms and search each
  if (matchedProducts.length === 0) {
    const terms = extractSearchTerms(userMessage);
    for (const term of terms) {
      const results = searchProducts(term);
      if (results.length > 0) {
        matchedProducts = results.slice(0, 5);
        break;
      }
    }
  }

  // Check for specific patterns
  const greetings = ["سلام", "اهلا", "مرحبا", "هلو", "hello", "hi", "hey"];
  const isGreeting = greetings.some((g) => msg.includes(g));

  const priceWords = ["سعر", "كام", "بكام", "price", "cost", "how much"];
  const isPrice = priceWords.some((w) => msg.includes(w));

  const diffWords = ["فرق", "difference", "compare", "مقارنة", "احسن", "better", "best"];
  const isDiff = diffWords.some((w) => msg.includes(w));

  const contactWords = ["عنوان", "فين", "مكان", "address", "location", "where", "توصيل", "delivery"];
  const isContact = contactWords.some((w) => msg.includes(w));

  const cncWords = ["cnc", "سي ان سي", "ماكينة", "machine"];
  const isCnc = cncWords.some((w) => msg.includes(w));

  // Greeting
  if (isGreeting && matchedProducts.length === 0) {
    return isAr
      ? "أهلاً بيك! 👋 أنا مساعد أحمد داود. إزاي أقدر أساعدك النهارده؟ ممكن تقولي اسم المنتج أو الموديل اللي بتدور عليه."
      : "Hello! 👋 I'm Ahmed Dawod's assistant. How can I help you today? Tell me the product name or model you're looking for.";
  }

  // Pricing
  if (isPrice) {
    return isAr
      ? "الأسعار بتتغير حسب الكمية والموديل 📊\n\nتواصل معانا عالواتساب **01065445000** عشان نديك أفضل سعر.\n\nممكن كمان تقولي الموديل اللي عايزه وأقولك لو متوفر عندنا."
      : "Prices vary by quantity and model 📊\n\nContact us on WhatsApp **01065445000** for the best price.\n\nYou can also tell me the model you need and I'll check availability.";
  }

  // Contact / Location
  if (isContact) {
    return isAr
      ? "📍 **العنوان:** العاشر من رمضان، مول المصرية سنتر 1، محل رقم 30 و 86\n\n📞 **هاتف:** 01069994050\n💬 **واتساب:** 01065445000\n📧 **إيميل:** Ahmed@ahmeddawod.com\n\nبنوصل لجميع محافظات مصر! 🚚"
      : "📍 **Address:** 10th of Ramadan City, El Masreya Center 1 Mall, Shop 30 & 86\n\n📞 **Phone:** 01069994050\n💬 **WhatsApp:** 01065445000\n📧 **Email:** Ahmed@ahmeddawod.com\n\nWe deliver to all governorates in Egypt! 🚚";
  }

  // Brand comparison
  if (isDiff && (msg.includes("skf") || msg.includes("nsk") || msg.includes("ntn") || msg.includes("fag"))) {
    return isAr
      ? "كل الماركات دي أصلية وعالمية 🏆\n\n• **SKF** (السويد) — أعلى جودة، الأغلى سعراً\n• **NSK** (اليابان) — جودة ممتازة، سعر تنافسي\n• **NTN** (اليابان) — متانة عالية، سعر متوسط\n• **FAG** (ألمانيا) — دقة ألمانية، ممتاز للسرعات العالية\n\nالاختيار بيعتمد على التطبيق بتاعك. تواصل معانا عالواتساب **01065445000** ونساعدك تختار الأنسب."
      : "All these brands are genuine and world-class 🏆\n\n• **SKF** (Sweden) — Highest quality, premium pricing\n• **NSK** (Japan) — Excellent quality, competitive pricing\n• **NTN** (Japan) — High durability, mid-range pricing\n• **FAG** (Germany) — German precision, great for high-speed\n\nThe choice depends on your application. Contact us on WhatsApp **01065445000** and we'll help you choose.";
  }

  // CNC machines
  if (isCnc && matchedProducts.length === 0) {
    const cncProducts = products
      .filter((p) => p.topCategory === "ball-screw" || p.topCategory === "linear")
      .slice(0, 4);

    const productList = cncProducts
      .map((p) => `• **${p.brand} ${p.modelNumber}** — [${getProductName(p, locale)}](/${locale}/products/${p.slug})`)
      .join("\n");

    return isAr
      ? `لماكينات CNC، بنوفر بول سكرو ولينير عالي الدقة 🔧\n\n${productList}\n\nتواصل معانا عالواتساب **01065445000** بمواصفات ماكينتك ونساعدك تختار.`
      : `For CNC machines, we supply precision ball screws and linear motion 🔧\n\n${productList}\n\nContact us on WhatsApp **01065445000** with your machine specs and we'll help.`;
  }

  // Products found
  if (matchedProducts.length > 0) {
    const productList = matchedProducts
      .map((p) => `• **${p.brand} ${p.modelNumber}** — [${getProductName(p, locale)}](/${locale}/products/${p.slug})`)
      .join("\n");

    const count = matchedProducts.length;
    return isAr
      ? `لقيت ${count} منتج مطابق لطلبك 🎯\n\n${productList}\n\nاضغط على أي منتج لمعرفة التفاصيل، أو تواصل معانا عالواتساب **01065445000** للاستفسار.`
      : `Found ${count} product(s) matching your request 🎯\n\n${productList}\n\nClick any product for details, or contact us on WhatsApp **01065445000**.`;
  }

  // Generic fallback
  return isAr
    ? "مش قادر ألاقي منتج مطابق لطلبك حالياً 🤔\n\nجرب:\n• اكتب رقم الموديل (مثلاً 6205 أو SKF 6205)\n• أو اسم النوع (مثلاً بلي إبري، لينير، بول سكرو)\n\nأو تواصل معانا مباشرة عالواتساب **01065445000** وابعتلنا صورة أو وصف وهنساعدك 🙌"
    : "Couldn't find an exact match for your request 🤔\n\nTry:\n• Type a model number (e.g. 6205 or SKF 6205)\n• Or a product type (e.g. needle bearing, linear, ball screw)\n\nOr contact us directly on WhatsApp **01065445000** with a photo or description 🙌";
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, RATE_LIMITS.ai);
  if (limited) return limited;

  try {
    const { messages, locale = "ar" } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Get the last user message for fallback
    const lastUserMsg = [...messages]
      .reverse()
      .find((m: ChatMessage) => m.role === "user");
    const userText = lastUserMsg?.parts?.[0]?.text ?? "";

    // Try Gemini API first
    const recentMessages: ChatMessage[] = messages.slice(-20);
    const systemPrompt = getSystemPrompt();
    const geminiReply = await callGemini(recentMessages, systemPrompt);

    // If Gemini succeeded, use its reply
    if (geminiReply) {
      return NextResponse.json({ reply: geminiReply });
    }

    // Fallback to local smart search
    const fallbackReply = localFallback(userText, locale);
    return NextResponse.json({ reply: fallbackReply });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
