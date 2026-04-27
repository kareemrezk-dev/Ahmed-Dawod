import scrapedProductsData from "./scraped-products.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TopCategory =
  | "bearings"
  | "linear"
  | "ball-screw"
  | "hard-chrome"
  | "lead-screw"
  | "fasteners"
  | "housings"
  | "pulleys"
  | "misc";

export type CategoryName =
  // Bearings subcategories
  | "بلي 6000"
  | "بلي إبري"
  | "بلي اتجاه واحد"
  | "بلي كامه"
  | "بلي مسمار"
  | "بلي حراري واستانلس"
  | "بلي اسطمبات"
  | "بلي سرعات اسبندل"
  | "بلي Miniature"
  | "بلي متنوع"
  // Linear Motion
  | "بلي لينير"
  | "عواميد لينير"
  // Ball Screw
  | "بول سكرو عواميد"
  | "بول سكرو بلي"
  | "مخروط جاهز"
  // Hard Chrome
  | "بلي هارد كروم"
  | "عواميد هارد كروم بالقعدة"
  | "عواميد هارد كروم"
  // Lead Screw
  | "ليد سكرو"
  // Housings
  | "كراسي بلاستيك"
  | "كراسي ستانلس ستيل"
  | "كراسي صلب وزهر"
  | "كراسي متنوعة"
  // Fasteners / Mounts
  | "تثبيتات بول سكرو"
  | "تثبيتات كروم بدون قعدة"
  | "صواميل وملحقات"
  // Bushings (Pulleys)
  | "جلب Adapter Sleeves"
  | "جلب سبيكة مشقوقة"
  | "جلب مسننة وعادية"
  // Misc
  | "زيوت تشحيم"
  | "أختام صناعية";

export const topCategoryMap: Record<TopCategory, CategoryName[]> = {
  bearings: [
    "بلي 6000",
    "بلي إبري",
    "بلي اتجاه واحد",
    "بلي كامه",
    "بلي مسمار",
    "بلي حراري واستانلس",
    "بلي اسطمبات",
    "بلي سرعات اسبندل",
    "بلي Miniature",
    "بلي متنوع",
  ],
  linear: ["بلي لينير", "عواميد لينير"],
  "ball-screw": ["بول سكرو عواميد", "بول سكرو بلي", "مخروط جاهز"],
  "hard-chrome": ["بلي هارد كروم", "عواميد هارد كروم بالقعدة", "عواميد هارد كروم"],
  "lead-screw": ["ليد سكرو"],
  fasteners: ["تثبيتات بول سكرو", "تثبيتات كروم بدون قعدة", "صواميل وملحقات"],
  housings: ["كراسي بلاستيك", "كراسي ستانلس ستيل", "كراسي صلب وزهر", "كراسي متنوعة"],
  pulleys: ["جلب Adapter Sleeves", "جلب سبيكة مشقوقة", "جلب مسننة وعادية"],
  misc: ["زيوت تشحيم", "أختام صناعية"],
};

export const topCategoryLabels: Record<TopCategory, { ar: string; en: string }> = {
  bearings: { ar: "بلي", en: "Bearings" },
  linear: { ar: "لينير", en: "Linear" },
  "ball-screw": { ar: "بول سكرو", en: "Ball Screw" },
  "hard-chrome": { ar: "هارد كروم", en: "Hard Chrome" },
  "lead-screw": { ar: "ليد سكرو", en: "Lead Screw" },
  fasteners: { ar: "تثبيتات", en: "Fasteners" },
  housings: { ar: "كراسي", en: "Housings" },
  pulleys: { ar: "جلب", en: "Pulleys" },
  misc: { ar: "منتجات متنوعة", en: "Misc Products" },
};

export interface ProductSpec {
  labelAr: string;
  labelEn: string;
  value: string;
}

export interface Product {
  slug: string;
  modelNumber: string;
  topCategory: TopCategory;
  category: CategoryName;
  brand: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  specs: ProductSpec[];
  tags: string[];
  sizes?: string[];
  featured?: boolean;
  /** WebP image path under /public */
  image?: string;
  images?: string[];
  price?: number;
}

// ─── Scraped Data Type Assertion ──────────────────────────────────────────────
const scrapedProducts = scrapedProductsData as Product[];

// ─── Product Data ─────────────────────────────────────────────────────────────

export const products: Product[] = [
  ...scrapedProducts
    .filter(p => !p.nameAr.includes("كتالوج") && !p.nameEn.toLowerCase().includes("catalog"))
    .map(p => {
      const product = { ...p };

      // ── Only remap products stuck in the catch-all "بلي متنوع" bucket ──
      // Products already assigned to a specific category are left untouched.
      if (product.category !== "بلي متنوع") return product;

      const nameAr = product.nameAr || "";
      const nameEn = (product.nameEn || "").toLowerCase();
      const model  = (product.modelNumber || "").toLowerCase();
      const slug   = (product.slug || "").toLowerCase();
      const tags   = (product.tags || []).join(" ").toLowerCase();
      const desc   = (product.descriptionEn || "").toLowerCase();

      // 1. One-way / Clutch (CSK)
      if (
        model.includes("csk") || nameEn.includes("csk") || slug.includes("csk") ||
        nameAr.includes("اتجاه واحد") || nameEn.includes("one way") || nameEn.includes("one-way") ||
        nameEn.includes("clutch") || desc.includes("one-way") || desc.includes("clutch bearing")
      ) { product.category = "بلي اتجاه واحد"; return product; }

      // 2. Needle (HK, NK, NA, RNA, NKI, BK)
      if (
        /\b(hk\d|nk[is]?\d|na4|na6|rna|bk\d|nkib|nkia|needle|nk\d)/i.test(model) ||
        nameEn.includes("needle") || nameAr.includes("إبري") || nameAr.includes("ابري") ||
        tags.includes("needle") || /needle/i.test(desc.substring(0, 200))
      ) { product.category = "بلي إبري"; return product; }

      // 3. Cam Followers (KR, NUKR)
      if (
        /\b(kr\d|nukr|cf\d|cam)/i.test(model) ||
        nameEn.includes("cam") || nameAr.includes("كامه") || tags.includes("cam")
      ) { product.category = "بلي كامه"; return product; }

      // 4. Rod End (SA, PHS, SI)
      if (
        /\b(sa\d|phs|si\d|rod.?end)/i.test(model) ||
        nameEn.includes("rod end") || nameAr.includes("مسمار") || tags.includes("rod end")
      ) { product.category = "بلي مسمار"; return product; }

      // 5. Linear (LM, SC, SCS)
      if (
        /\b(lm\d|lme\d|lmk\d|lmf\d|sc\d|scs\d|linear)/i.test(model) ||
        (nameEn.includes("linear") && !nameEn.includes("ball screw")) ||
        nameAr.includes("لينير")
      ) { product.category = "بلي لينير"; return product; }

      // 6. Hard Chrome (SBR, TBR)
      if (
        /\b(sbr\d|tbr\d)/i.test(model) ||
        nameEn.includes("hard chrome") || nameAr.includes("هارد كروم")
      ) { product.category = "بلي هارد كروم"; return product; }

      // 7. Ball Screw nuts
      if (
        /\b(sfu|sfe|dfu).*nut/i.test(model) ||
        (nameEn.includes("ball screw") && nameEn.includes("nut")) ||
        (nameAr.includes("بول سكرو") && nameAr.includes("جشمة"))
      ) { product.category = "بول سكرو بلي"; return product; }

      // 8. Ball Screw shafts
      if (
        /\b(sfu|sfe|dfu|ball.?screw)/i.test(model) ||
        nameEn.includes("ball screw") || nameAr.includes("بول سكرو")
      ) { product.category = "بول سكرو عواميد"; return product; }

      // 9. Miniature (MR, MF, 68x, 69x)
      if (
        /\b(mr\d|mf\d|68\d{1,2}\b|69\d{1,2}\b|f6[89]\d)/i.test(model) ||
        nameEn.includes("miniature") || tags.includes("miniature") || nameAr.includes("Miniature")
      ) { product.category = "بلي Miniature"; return product; }

      // 10. Pillow Block / Housings
      if (
        /\b(uc[pfkl]\d|ucp\d|ucf\d|ucfl\d|p2\d{2}|pillow)/i.test(model) ||
        nameEn.includes("pillow") || nameAr.includes("كرسي")
      ) { product.category = "كراسي متنوعة"; return product; }

      // 11. Spindle Speed
      if (nameEn.includes("spindle") || nameAr.includes("اسبندل") || tags.includes("spindle")) {
        product.category = "بلي سرعات اسبندل"; return product;
      }

      // 12. Ball Cage / Stamping
      if (nameEn.includes("ball cage") || nameAr.includes("اسطمبات") || tags.includes("ball cage")) {
        product.category = "بلي اسطمبات"; return product;
      }

      // 13. 6000 Series
      if (nameAr.includes("6000") || model.includes("6000") || slug.includes("6000") || tags.includes("6000")) {
        product.category = "بلي 6000"; return product;
      }

      // 14. Adapter Sleeves
      if (
        /\b(h3[01]\d|h2\d{2}|adapter.?sleeve)/i.test(model) ||
        nameEn.includes("adapter sleeve") || nameAr.includes("جلب")
      ) { product.category = "جلب Adapter Sleeves"; return product; }

      // 15. High Temp / Stainless
      if (
        /\bss\d|stainless/i.test(model) ||
        nameEn.includes("stainless") || nameEn.includes("high temp") ||
        nameAr.includes("حراري") || nameAr.includes("استانلس")
      ) { product.category = "بلي حراري واستانلس"; return product; }

      return product;
    }),
];

// ─── Query Functions ──────────────────────────────────────────────────────────

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: CategoryName): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsByTopCategory(topCategory: TopCategory): Product[] {
  return products.filter((p) => p.topCategory === topCategory);
}

export function getProductsByBrand(brand: string): Product[] {
  return products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
}

export function getAllCategories(): CategoryName[] {
  return [
    "بلي 6000",
    "بلي إبري",
    "بلي اتجاه واحد",
    "بلي كامه",
    "بلي مسمار",
    "بلي حراري واستانلس",
    "بلي اسطمبات",
    "بلي سرعات اسبندل",
    "بلي Miniature",
    "بلي متنوع",
    "بلي لينير",
    "عواميد لينير",
    "بول سكرو عواميد",
    "بول سكرو بلي",
    "مخروط جاهز",
    "بلي هارد كروم",
    "عواميد هارد كروم بالقعدة",
    "عواميد هارد كروم",
    "ليد سكرو",
    "كراسي بلاستيك",
    "كراسي ستانلس ستيل",
    "كراسي صلب وزهر",
    "كراسي متنوعة",
    "تثبيتات بول سكرو",
    "تثبيتات كروم بدون قعدة",
    "صواميل وملحقات",
    "جلب Adapter Sleeves",
    "جلب سبيكة مشقوقة",
    "جلب مسننة وعادية",
    "زيوت تشحيم",
    "أختام صناعية"
  ];
}

/** Localized category labels for all 3 locales */
export const categoryLabelsI18n: Record<CategoryName, { en: string }> = {
  "بلي 6000": { en: "6000 Series Bearings" },
  "بلي إبري": { en: "Needle Bearings" },
  "بلي اتجاه واحد": { en: "One-way Bearings" },
  "بلي كامه": { en: "Cam Followers" },
  "بلي مسمار": { en: "Rod End Bearings" },
  "بلي حراري واستانلس": { en: "High Temp & Stainless Bearings" },
  "بلي اسطمبات": { en: "Ball Cage Retainers" },
  "بلي سرعات اسبندل": { en: "Spindle Speed Bearings" },
  "بلي Miniature": { en: "Miniature Bearings" },
  "بلي متنوع": { en: "Miscellaneous Bearings" },
  "بلي لينير": { en: "Linear Bearings" },
  "عواميد لينير": { en: "Linear Shafts" },
  "بول سكرو عواميد": { en: "Ball Screw Shafts" },
  "بول سكرو بلي": { en: "Ball Screw Nuts" },
  "مخروط جاهز": { en: "Machined Ends" },
  "بلي هارد كروم": { en: "Hard Chrome Bearings" },
  "عواميد هارد كروم بالقعدة": { en: "Hard Chrome Rails with Base" },
  "عواميد هارد كروم": { en: "Hard Chrome Shafts" },
  "ليد سكرو": { en: "Lead Screws" },
  "كراسي بلاستيك": { en: "Plastic Housings" },
  "كراسي ستانلس ستيل": { en: "Stainless Steel Housings" },
  "كراسي صلب وزهر": { en: "Cast Iron & Steel Housings" },
  "كراسي متنوعة": { en: "Miscellaneous Housings" },
  "تثبيتات بول سكرو": { en: "Ball Screw Supports" },
  "تثبيتات كروم بدون قعدة": { en: "Shaft Supports (No Base)" },
  "صواميل وملحقات": { en: "Nuts & Accessories" },
  "جلب Adapter Sleeves": { en: "Adapter Sleeves" },
  "جلب سبيكة مشقوقة": { en: "Slotted Alloy Bushings" },
  "جلب مسننة وعادية": { en: "Pulleys & Bushings" },
  "زيوت تشحيم": { en: "Lubricants" },
  "أختام صناعية": { en: "Industrial Seals" },
};

/** Returns category name in the given locale */
export function getCategoryLabel(cat: CategoryName, locale: string): string {
  if (locale === "en") return categoryLabelsI18n[cat]?.en ?? cat;
  return cat; // ar — already Arabic
}

/** Returns all categories as localized {value, label} pairs */
export function getAllCategoriesLocalized(locale: string): { value: CategoryName; label: string }[] {
  return getAllCategories().map((cat) => ({
    value: cat,
    label: getCategoryLabel(cat, locale),
  }));
}

export function getAllTopCategories(): TopCategory[] {
  return [
    "bearings",
    "linear",
    "ball-screw",
    "hard-chrome",
    "lead-screw",
    "fasteners",
    "housings",
    "pulleys",
    "misc",
  ];
}

export function getAllBrands(): string[] {
  const brands = [...new Set(products.map((p) => p.brand))];
  return brands.sort();
}

export function getAllSlugs(): string[] {
  return products.map((p) => p.slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured === true);
}

export function getRelatedProducts(product: Product, limit = 6): Product[] {
  // First: same topCategory, excluding current product
  const sameCat = products.filter(
    (p) => p.slug !== product.slug && p.topCategory === product.topCategory
  );
  if (sameCat.length >= limit) return sameCat.slice(0, limit);

  // Fallback: fill remaining slots from same subcategory across all topCategories
  const sameSubCat = products.filter(
    (p) => p.slug !== product.slug && p.category === product.category && !sameCat.includes(p)
  );
  return [...sameCat, ...sameSubCat].slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.modelNumber.toLowerCase().includes(q) ||
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.descriptionAr.toLowerCase().includes(q) ||
      p.descriptionEn.toLowerCase().includes(q)
  );
}

export function shuffleProducts(arr: Product[]): Product[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getTopCategoryForSubcategory(category: CategoryName): TopCategory | null {
  for (const [top, subs] of Object.entries(topCategoryMap)) {
    if ((subs as string[]).includes(category)) return top as TopCategory;
  }
  return null;
}

/**
 * Strip Arabic characters from a string.
 * Handles || delimiters, strips Arabic/Persian Unicode ranges, and normalises whitespace.
 */
export function stripArabic(text: string): string {
  let raw = text;
  // If there is a || delimiter, try to pick the non-Arabic part first
  if (raw.includes("||")) {
    const parts = raw.split("||").map((s) => s.trim());
    const enPart = parts.find((p) => !/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(p));
    if (enPart && enPart.length > 1) return enPart.trim();
  }
  // Strip all Arabic/Persian Unicode characters
  return raw
    .replace(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+/g, " ")
    .replace(/[||]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Get localized product model number.
 */
export function getProductModelNumber(product: Product, locale: string): string {
  if (locale === "ar") return product.modelNumber;
  return stripArabic(product.modelNumber || "");
}

/**
 * Get localized product name.
 */
export function getProductName(product: Product, locale: string): string {
  if (locale === "ar") {
    return product.nameAr || product.nameEn || "منتج بدون اسم";
  }

  // English locale: aggressively strip Arabic
  const fromNameEn = stripArabic(product.nameEn || "");
  if (fromNameEn.length >= 2) return fromNameEn;

  const fromNameAr = stripArabic(product.nameAr || "");
  if (fromNameAr.length >= 2) return fromNameAr;

  // Fallback: model number (also stripped)
  const fromModel = stripArabic(product.modelNumber || "");
  if (fromModel.length >= 2) return fromModel;

  // Final fallback: brand + category label (english)
  const catLabel = categoryLabelsI18n[product.category as CategoryName]?.en;
  if (catLabel) return `${product.brand} ${catLabel}`;

  return product.brand || "Industrial Product";
}

/**
 * Get localized product description.
 */
export function getProductDescription(product: Product, locale: string): string {
  if (locale === "ar") return product.descriptionAr;
  // English: strip Arabic from descriptionEn, fallback to stripped descriptionAr
  const cleaned = stripArabic(product.descriptionEn || "");
  if (cleaned.length > 10) return cleaned;
  const fromAr = stripArabic(product.descriptionAr || "");
  if (fromAr.length > 10) return fromAr;
  return cleaned || fromAr || "";
}

/**
 * Get the product image path. Falls back to category-level SVG if no custom image.
 */
export function getProductImagePath(product: Product): string {
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.image) return product.image;
  return `/products/${product.topCategory}/${product.slug}.svg`;
}

/**
 * Get alt text for a product image: "{Brand} {PartNumber} {Product Type}"
 */
export function getProductImageAlt(product: Product): string {
  const nameClean = stripArabic(product.nameEn || product.modelNumber || "");
  const modelClean = stripArabic(product.modelNumber || "");
  return `${product.brand} ${modelClean} ${nameClean}`.replace(/\s+/g, " ").trim();
}

/**
 * Returns WebP path if .webp is explicitly set, otherwise SVG placeholder.
 * Priority: product.image → /products/{cat}/{slug}.webp (if exists) → /products/{cat}/{slug}.svg → /products/placeholder.svg
 */
export function getProductWebPPath(product: Product): string {
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.image) return product.image;
  // WebP takes priority when it exists (real photo)
  // SVG placeholder always exists for our 30 products
  return `/products/${product.topCategory}/${product.slug}.svg`;
}

/** True when the image is a vector placeholder (not a real photo) */
export function isPlaceholderImage(product: Product): boolean {
  if (product.images && product.images.length > 0) return false;
  const path = getProductImagePath(product);
  return path.endsWith(".svg") && !product.image;
}

/* ────────────────────────────────────────────────────────────
   Category Descriptions  (T12 — shown above product grid)
──────────────────────────────────────────────────────────── */
export const categoryDescriptions: Record<TopCategory, { ar: string[]; en: string[] }> = {
  bearings: {
    ar: [
      "نوفر جميع أنواع رولمان البلي الكروي والمخروطي والأسطواني بمقاسات مختلفة ومن أشهر الماركات العالمية مثل SKF و NSK و NTN و FAG.",
      "تستخدم هذه المنتجات في الماكينات الصناعية والمحركات وصناديق التروس والتطبيقات الهندسية المختلفة.",
    ],
    en: [
      "We supply a wide range of industrial bearings including deep groove ball bearings, tapered roller bearings and cylindrical roller bearings.",
      "Our products come from leading global brands such as SKF, NSK, NTN and FAG and are widely used in industrial machinery, motors, gearboxes and manufacturing equipment.",
    ],
  },
  linear: {
    ar: [
      "نوفر سكك خطية وعربات تشغيل وأعمدة خطية عالية الدقة من HIWIN وTHK لتطبيقات الأتمتة الصناعية والماكينات CNC.",
      "تتميز منتجاتنا بدقة عالية وعمر تشغيلي طويل، مناسبة لجميع تطبيقات الحركة الخطية الصناعية.",
    ],
    en: [
      "We supply precision linear rails, carriages and shafts from HIWIN and THK for industrial automation and CNC machine applications.",
      "Our linear motion products offer high accuracy and long service life, suitable for all industrial linear motion applications.",
    ],
  },
  "ball-screw": {
    ar: [
      "نوفر بول سكرو عالي الدقة للتطبيقات الصناعية والماكينات CNC بمختلف الأحجام والخطوات من أفضل الماركات.",
      "تتميز بول سكرو لدينا بكفاءة ميكانيكية عالية وإمكانية التحميل العكسي الذاتي.",
    ],
    en: [
      "We supply high-precision ball screws for industrial and CNC machine applications in various sizes and lead values from top brands.",
      "Our ball screws feature high mechanical efficiency and self-reversibility for demanding positioning applications.",
    ],
  },
  "hard-chrome": {
    ar: [
      "نوفر أعمدة هارد كروم وبوشينج عالية الجودة مقاومة للتآكل والصدأ للاستخدام في الهيدروليك والأوتوماتيك.",
      "تتوفر بأقطار وأطوال متنوعة مع دقة تشغيلية عالية تناسب جميع الاستخدامات الصناعية.",
    ],
    en: [
      "We supply high-quality hard chrome shafts and bushings with excellent wear and corrosion resistance for hydraulic and automation applications.",
      "Available in various diameters and lengths with high machining precision suitable for all industrial uses.",
    ],
  },
  "lead-screw": {
    ar: [
      "نوفر ليد سكرو TR وACME للتطبيقات التي تتطلب حركة دقيقة وتحريك الأحمال بكفاءة في الماكينات الصناعية.",
      "تتوفر بمختلف الخطوات والأقطار لتناسب التطبيقات الخفيفة والثقيلة على حد سواء.",
    ],
    en: [
      "We supply TR and ACME lead screws for applications requiring precise motion and efficient load transfer in industrial machinery.",
      "Available in various pitches and diameters to suit both light and heavy-duty applications.",
    ],
  },
  fasteners: {
    ar: [
      "نوفر مسامير وصواميل وعناصر تثبيت صناعية عالية الجودة من المواد المختلفة لتلبية متطلبات التجميع الصناعي.",
      "تشمل تشكيلتنا مسامير الصرف الستة والصواميل والواشرات وعناصر التثبيت الخاصة.",
    ],
    en: [
      "We supply high-quality industrial bolts, nuts and fasteners in various materials to meet assembly requirements across industries.",
      "Our range includes hex bolts, nuts, washers and specialty fastening elements.",
    ],
  },
  housings: {
    ar: [
      "نوفر كراسي فلانشة وبيلو بلوك بجميع المقاسات من SKF وFAG وNTN لتركيب الرولمان بسهولة في المنشآت الصناعية.",
      "تتوفر بمواد مختلفة من حديد الزهر والفولاذ المقاوم للصدأ لتناسب البيئات الصناعية المختلفة.",
    ],
    en: [
      "We supply flange and pillow block housings in all sizes from SKF, FAG and NTN for easy bearing installation in industrial facilities.",
      "Available in cast iron and stainless steel materials to suit various industrial environments.",
    ],
  },
  pulleys: {
    ar: [
      "نوفر جلب مسننة وعادية بمختلف الأحجام ونسب الإرسال للاستخدام في أنظمة نقل الحركة الصناعية.",
      "تتوفر من الألومنيوم والحديد الزهر والبولي يوريثان لتناسب جميع التطبيقات.",
    ],
    en: [
      "We supply timing and V-belt pulleys in various sizes and transmission ratios for industrial power transmission systems.",
      "Available in aluminium, cast iron and polyurethane to suit all applications.",
    ],
  },
  misc: {
    ar: [
      "نوفر مواد تشحيم وأختام صناعية وقطع غيار متنوعة من أفضل الماركات لصيانة الماكينات والمعدات الصناعية.",
      "تشمل تشكيلتنا شحوم SKF والأختام المطاطية والفلورية لجميع التطبيقات الصناعية.",
    ],
    en: [
      "We supply lubricants, industrial seals and miscellaneous spare parts from top brands for maintenance of industrial machines and equipment.",
      "Our range includes SKF greases, rubber and fluoropolymer seals for all industrial applications.",
    ],
  },
};

// ─── WhatsApp URL helper ──────────────────────────────────────────────────────
/** Strips non-digits and returns a ready-to-use wa.me URL */
export function waUrl(whatsapp: string, message?: string): string {
  const number = whatsapp.replace(/\D/g, "");
  return message
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${number}`;
}
