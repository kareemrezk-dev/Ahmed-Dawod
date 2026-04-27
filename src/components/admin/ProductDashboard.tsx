"use client";

import { useState, useEffect } from "react";
import styles from "./ProductDashboard.module.css";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TOP_CATEGORY_MAP: Record<string, string[]> = {
  bearings:      ["بلي كروي", "بلي مخروطي", "بلي أسطواني", "وحدات تحميل"],
  linear:        ["سكك لينير", "بلي لينير", "أعمدة لينير"],
  "ball-screw":  ["بول سكرو بلي", "بول سكرو عواميد"],
  "hard-chrome": ["عواميد هارد كروم", "بلي هارد كروم"],
  "lead-screw":  ["ليد سكرو TR", "ليد سكرو ACME"],
  fasteners:     ["مسامير تثبيت", "صواميل صناعية"],
  housings:      ["كراسي فلانشة", "كراسي بيلو بلوك"],
  pulleys:       ["جلب مسننة", "جلب عادية"],
  misc:          ["زيوت تشحيم", "أختام صناعية"],
};

const TOP_LABELS: Record<string, string> = {
  bearings: "بلي",
  linear: "لينير",
  "ball-screw": "بول سكرو",
  "hard-chrome": "هارد كروم",
  "lead-screw": "ليد سكرو",
  fasteners: "تثبيتات",
  housings: "كراسي",
  pulleys: "جلب",
  misc: "منتجات متنوعة",
};

const DEFAULT_BRANDS = ["SKF", "NSK", "NTN", "FAG", "HIWIN", "INA", "Timken", "THK", "بدون ماركة", "عام", "Other"];

const CAT_INFO: Record<string, { modelL: string; modelP: string; brandL: string; nameArP: string; nameEnP: string }> = {
  bearings: { modelL: "*رقم الموديل", modelP: "مثال: 6204-2RS", brandL: "*الماركة", nameArP: "رولمان بلي كروي 6204-2RS", nameEnP: "Deep Groove Ball Bearing 6204-2RS" },
  linear: { modelL: "*كود المنتج / الموديل", modelP: "مثال: HGR20", brandL: "*الماركة", nameArP: "سكة خطية HGR20", nameEnP: "Linear Guide Rail HGR20" },
  "ball-screw": { modelL: "*كود المنتج / الموديل", modelP: "مثال: SFU2005-300", brandL: "*الماركة", nameArP: "بول سكرو SFU2005", nameEnP: "Ball Screw SFU2005" },
  "hard-chrome": { modelL: "*كود المنتج", modelP: "مثال: HC-25-1000", brandL: "*الماركة", nameArP: "عمود هارد كروم 25mm", nameEnP: "Hard Chrome Rod" },
  "lead-screw": { modelL: "*كود المنتج", modelP: "مثال: TR16x4", brandL: "*الماركة", nameArP: "ليد سكرو TR16", nameEnP: "Lead Screw TR16" },
  fasteners: { modelL: "كود المنتج (اختياري)", modelP: "مثال: M12x50", brandL: "الماركة (اختياري)", nameArP: "مسمار سداسي M12", nameEnP: "Hex Bolt M12" },
  housings: { modelL: "*رقم الموديل", modelP: "مثال: UCP205", brandL: "*الماركة", nameArP: "كرسي بيلو بلوك UCP205", nameEnP: "Pillow Block UCP205" },
  pulleys: { modelL: "*كود المنتج", modelP: "مثال: SPB-100", brandL: "*الماركة", nameArP: "بكرة سير V قياس 100", nameEnP: "V-Belt Pulley 100mm" },
  misc: { modelL: "كود المنتج (اختياري)", modelP: "مثال: LGMT3-0.4", brandL: "الماركة (اختياري)", nameArP: "اسم المنتج بالعربي...", nameEnP: "Product Name in English..." },
};

// ─── Auth helper ──────────────────────────────────────────────────────────────
// ✅ Server-side auth: الباسورد يتفحص على السيرفر فقط.
// الـ hash مخزن في ADMIN_HASH (بدون NEXT_PUBLIC_) فلا يظهر في الـ client bundle.
//
// عشان تضبط الباسورد:
//   1. اعمل SHA-256 للباسورد: https://emn178.github.io/online-tools/sha256.html
//   2. حط الـ hash في .env.local كـ ADMIN_HASH=<hash>
//   3. اعمل restart للسيرفر (مش محتاج rebuild)

// ─── Types ────────────────────────────────────────────────────────────────────
interface Spec { labelAr: string; labelEn: string; value: string; }
interface ProductForm {
  slug: string; modelNumber: string; topCategory: string; category: string;
  brand: string; nameAr: string; nameEn: string;
  descriptionAr: string; descriptionEn: string;
  specs: Spec[]; tags: string; sizes: string; featured: boolean;
  imagesList: { preview: string; name: string; ext: string }[];
}

const EMPTY_SPEC: Spec = { labelAr: "", labelEn: "", value: "" };
const EMPTY_PRODUCT: ProductForm = {
  slug: "", modelNumber: "", topCategory: "bearings", category: "بلي كروي",
  brand: "SKF", nameAr: "", nameEn: "",
  descriptionAr: "", descriptionEn: "",
  specs: [{ ...EMPTY_SPEC }],
  tags: "", sizes: "", featured: false,
  imagesList: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(model: string) {
  return model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generateProductCode(p: ProductForm): string {
  const sizes = p.sizes.split(",").map(s => s.trim()).filter(Boolean);
  const tags = p.tags.split(",").map(s => s.trim()).filter(Boolean);
  const specs = p.specs.filter(s => s.labelAr && s.value);
  const slug = p.slug || toSlug(p.modelNumber || p.nameEn || "product");
  
  let imagesCode = "";
  if (p.imagesList?.length === 1) {
    imagesCode = `\n    image: "/products/${p.topCategory}/${slug}.${p.imagesList[0].ext}",\n    images: ["/products/${p.topCategory}/${slug}.${p.imagesList[0].ext}"],`;
  } else if (p.imagesList?.length > 1) {
    const paths = p.imagesList.map((img, i) => `"/products/${p.topCategory}/${slug}${i === 0 ? "" : "-" + (i + 1)}.${img.ext}"`);
    imagesCode = `\n    image: "${paths[0]}",\n    images: [\n      ${paths.map(url => `"${url}"`).join(",\n      ")}\n    ],`;
  }

  return `  {
    slug: "${slug}",
    modelNumber: "${p.modelNumber}",
    topCategory: "${p.topCategory}",
    category: "${p.category}",
    brand: "${p.brand}",
    nameAr: "${p.nameAr}",
    nameEn: "${p.nameEn}",
    descriptionAr: "${p.descriptionAr}",
    descriptionEn: "${p.descriptionEn}",${imagesCode}
    specs: [
${specs.map(s => `      { labelAr: "${s.labelAr}", labelEn: "${s.labelEn}", value: "${s.value}" },`).join("\n")}
    ],
    tags: [${tags.map((t: string) => `"${t}"`).join(", ")}],${sizes.length ? `\n    sizes: [${sizes.map((s: string) => `"${s}"`).join(", ")}],` : ""}${p.featured ? "\n    featured: true," : ""}
  },`;
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) { onLogin(); }
      else { setError(true); setTimeout(() => setError(false), 1500); }
    } catch {
      setError(true); setTimeout(() => setError(false), 1500);
    }
    setChecking(false);
  };

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
            <line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/>
            <line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/>
          </svg>
        </div>
        <h1 className={styles.loginTitle}>أحمد داود</h1>
        <p className={styles.loginSub}>لوحة التحكم</p>
        <div style={{ position: "relative", width: "100%" }}>
              <input
                className={`${styles.loginInput} ${error ? styles.loginInputError : ""}`}
                type={showPw ? "text" : "password"} placeholder="كلمة المرور"
                value={pw} onChange={e => setPw(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                autoFocus
                style={{ paddingLeft: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                style={{
                  position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#8a92a3",
                  padding: 4, display: "flex", alignItems: "center",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#e8b84b")}
                onMouseLeave={e => (e.currentTarget.style.color = "#8a92a3")}
              >
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {error && <p className={styles.loginError}>كلمة المرور غلط</p>}
            <button className={styles.loginBtn} onClick={submit} disabled={checking}>{checking ? "..." : "دخول"}</button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function ProductDashboard() {
  const [authed, setAuthed] = useState(false);
  const [products, setProducts] = useState<ProductForm[]>([]);
  const [form, setForm] = useState<ProductForm>({ ...EMPTY_PRODUCT, specs: [{ ...EMPTY_SPEC }] });
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "list" | "output">("form");
  const [filterCat, setFilterCat] = useState("all");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [brands, setBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [showBrandManager, setShowBrandManager] = useState(false);

  const [categoryMap, setCategoryMap] = useState<Record<string, string[]>>(TOP_CATEGORY_MAP);
  const [showCatManager, setShowCatManager] = useState(false);

  useEffect(() => {
    try {
      const savedBrands = localStorage.getItem("custom_brands");
      if (savedBrands) {
        const parsed = JSON.parse(savedBrands);
        if (Array.isArray(parsed) && parsed.length > 0) setBrands(parsed);
      }
      
      const savedCats = localStorage.getItem("custom_categories");
      if (savedCats) {
        const parsedCats = JSON.parse(savedCats);
        if (parsedCats && typeof parsedCats === "object" && !Array.isArray(parsedCats)) {
          setCategoryMap(parsedCats);
        }
      }
    } catch {}
  }, []);

  const updateBrands = (newBrands: string[]) => {
    setBrands(newBrands);
    try { localStorage.setItem("custom_brands", JSON.stringify(newBrands)); } catch {}
  };

  const editBrand = (index: number) => {
    const brand = brands[index];
    if (brand === "Other") return;
    const newName = window.prompt(`تعديل الماركة: ${brand}`, brand);
    if (newName && newName.trim() !== "" && newName !== brand) {
      if (window.confirm(`هل أنت متأكد من تغيير الماركة "${brand}" إلى "${newName.trim()}"؟`)) {
        const newBrands = [...brands];
        newBrands[index] = newName.trim();
        updateBrands(newBrands);
        setProducts(p => p.map(x => x.brand === brand ? { ...x, brand: newName.trim() } : x));
        if (form.brand === brand) setForm(f => ({ ...f, brand: newName.trim() }));
      }
    }
  };

  const deleteBrand = (index: number) => {
    const brand = brands[index];
    if (brand === "Other") return;
    if (window.confirm(`هل أنت متأكد من حذف الماركة: "${brand}"؟`)) {
      const newBrands = brands.filter((_, i) => i !== index);
      updateBrands(newBrands);
      if (form.brand === brand) setForm(f => ({ ...f, brand: newBrands[0] }));
    }
  };

  const updateCategoryMap = (newMap: Record<string, string[]>) => {
    setCategoryMap(newMap);
    try { localStorage.setItem("custom_categories", JSON.stringify(newMap)); } catch {}
  };

  const addSubCategory = () => {
    const top = form.topCategory;
    const newSub = window.prompt(`أدخل اسم الفئة الفرعية الجديدة تحت (${TOP_LABELS[top]}):`);
    if (newSub && newSub.trim() !== "") {
      const currentSubs = categoryMap[top] || [];
      if (!currentSubs.includes(newSub.trim())) {
        const newMap = { ...categoryMap, [top]: [...currentSubs, newSub.trim()] };
        updateCategoryMap(newMap);
        setForm(f => ({ ...f, category: newSub.trim() }));
      }
    }
  };

  const editSubCategory = (index: number) => {
    const top = form.topCategory;
    const subs = categoryMap[top] || [];
    const oldName = subs[index];
    const newName = window.prompt(`تعديل الفئة الفرعية: ${oldName}`, oldName);
    if (newName && newName.trim() !== "" && newName !== oldName) {
      if (window.confirm(`هل أنت متأكد من تغيير الفئة "${oldName}" إلى "${newName.trim()}"؟`)) {
        const newSubs = [...subs];
        newSubs[index] = newName.trim();
        const newMap = { ...categoryMap, [top]: newSubs };
        updateCategoryMap(newMap);
        setProducts(p => p.map(x => x.topCategory === top && x.category === oldName ? { ...x, category: newName.trim() } : x));
        if (form.category === oldName) setForm(f => ({ ...f, category: newName.trim() }));
      }
    }
  };

  const deleteSubCategory = (index: number) => {
    const top = form.topCategory;
    const subs = categoryMap[top] || [];
    const sub = subs[index];
    if (window.confirm(`هل أنت متأكد من حذف الفئة الفرعية: "${sub}"؟`)) {
      const newSubs = subs.filter((_, i) => i !== index);
      const newMap = { ...categoryMap, [top]: newSubs };
      updateCategoryMap(newMap);
      if (form.category === sub) setForm(f => ({ ...f, category: newSubs[0] || "" }));
    }
  };

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const subcats = categoryMap[form.topCategory] || [];

  // ── Form handlers ──────────────────────────────────────────────────────────
  const setField = (key: string, val: unknown) => setForm(f => ({
    ...f,
    [key]: val,
    ...(key === "topCategory" ? { 
      category: categoryMap[val as string]?.[0] || "",
      brand: (val === "misc" || val === "fasteners") ? "بدون ماركة" : "SKF"
    } : {}),
    ...(key === "modelNumber" ? { slug: toSlug(val as string) } : {}),
  }));

  const setSpec = (i: number, key: string, val: string) => setForm(f => {
    const specs = [...f.specs];
    specs[i] = { ...specs[i], [key]: val };
    return { ...f, specs };
  });

  const addSpec = () => setForm(f => ({ ...f, specs: [...f.specs, { ...EMPTY_SPEC }] }));
  const removeSpec = (i: number) => setForm(f => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  const resetForm = () => {
    setForm({ ...EMPTY_PRODUCT, specs: [{ ...EMPTY_SPEC }] });
    setEditingIdx(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    files.forEach(file => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "webp";
      const validExt = ["webp", "jpg", "jpeg", "png", "svg"].includes(ext) ? ext : "webp";
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(f => ({
          ...f,
          imagesList: [...(f.imagesList || []), { preview: ev.target?.result as string, name: file.name, ext: validExt }],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index: number) => setForm(f => ({
    ...f,
    imagesList: (f.imagesList || []).filter((_, i) => i !== index),
  }));

  const setImageExt = (index: number, newExt: string) => setForm(f => {
    const newList = [...(f.imagesList || [])];
    newList[index] = { ...newList[index], ext: newExt };
    return { ...f, imagesList: newList };
  });

  const saveProduct = () => {
    const info = CAT_INFO[form.topCategory] || CAT_INFO.bearings;
    const reqModel = info.modelL.startsWith("*");

    if ((reqModel && !form.modelNumber) || !form.nameAr || !form.category) {
      showToast("⚠ الرجاء ملء الحقول المطلوبة");
      return;
    }
    const finalSlug = form.slug || toSlug(form.modelNumber || form.nameEn || "product-" + Date.now().toString().slice(-4));
    const product = { ...form, slug: finalSlug };
    if (editingIdx !== null) {
      setProducts(p => p.map((x, i) => i === editingIdx ? product : x));
      showToast("✓ تم تعديل المنتج");
    } else {
      setProducts(p => [...p, product]);
      showToast("✓ تم إضافة المنتج");
    }
    resetForm();
    setActiveTab("list");
  };

  const editProduct = (i: number) => {
    setForm({ ...products[i] });
    setEditingIdx(i);
    setActiveTab("form");
  };

  const deleteProduct = (i: number) => {
    setProducts(p => p.filter((_, idx) => idx !== i));
    showToast("✓ تم الحذف");
    if (editingIdx === i) resetForm();
  };

  // ── Output ─────────────────────────────────────────────────────────────────
  const filteredProducts = filterCat === "all" ? products : products.filter(p => p.topCategory === filterCat);
  const allCode = products.length === 0
    ? "// لم تتم إضافة أي منتجات بعد"
    : `// ضع هذا الكود داخل مصفوفة products[] في ملف src/lib/products.ts\n\n${products.map(generateProductCode).join("\n\n")}`;

  const copyCode = () => {
    navigator.clipboard.writeText(allCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const catCounts: Record<string, number> = Object.fromEntries(
    Object.keys(TOP_CATEGORY_MAP).map(k => [k, products.filter(p => p.topCategory === k).length])
  );

  const currentSlug = form.slug || toSlug(form.modelNumber || "slug");

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
            <line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/>
            <line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/>
          </svg>
          AHMED DAWOD — لوحة التحكم
        </div>
        <div className={styles.headerRight}>
          <span className={styles.headerBadge}>{products.length} منتج</span>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ padding: "6px 16px", fontSize: 12 }}
            onClick={() => { resetForm(); setActiveTab("form"); }}>
            + منتج جديد
          </button>
          <a href="/ar" className={`${styles.btn} ${styles.btnSecondary}`} style={{ padding: "6px 14px", fontSize: 12, textDecoration: "none" }}>
            ← الموقع
          </a>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLabel}>التصفح</div>
          {([
            { key: "form", label: editingIdx !== null ? "تعديل المنتج" : "إضافة منتج" },
            { key: "list", label: "قائمة المنتجات", count: products.length },
            { key: "output", label: "الكود الجاهز", count: products.length > 0 ? "✓" : "0" },
          ] as { key: "form"|"list"|"output"; label: string; count?: number|string }[]).map(item => (
            <button key={item.key} className={`${styles.navBtn} ${activeTab === item.key ? styles.navBtnActive : ""}`}
              onClick={() => setActiveTab(item.key)}>
              <span>{item.label}</span>
              {item.count !== undefined && <span className={styles.count}>{item.count}</span>}
            </button>
          ))}

          <div className={styles.sidebarLabel}>الفئات</div>
          <button className={`${styles.navBtn} ${filterCat === "all" ? styles.navBtnActive : ""}`}
            onClick={() => { setFilterCat("all"); setActiveTab("list"); }}>
            <span>الكل</span>
            <span className={styles.count}>{products.length}</span>
          </button>
          {Object.entries(TOP_LABELS).map(([key, label]) => (
            <button key={key}
              className={`${styles.navBtn} ${filterCat === key && activeTab === "list" ? styles.navBtnActive : ""}`}
              onClick={() => { setFilterCat(key); setActiveTab("list"); }}>
              <span>{label}</span>
              <span className={styles.count}>{catCounts[key] || 0}</span>
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className={styles.main}>

          {/* ── FORM TAB ── */}
          {activeTab === "form" && (
            <div>
              <div className={styles.sectionTitle}>
                {editingIdx !== null ? `تعديل: ${form.modelNumber}` : "إضافة منتج جديد"}
              </div>

              {/* Basic Info */}
              <p className={styles.groupLabel}>المعلومات الأساسية</p>
              <div className={`${styles.formGrid} ${styles.three}`}>
                <div className={styles.field}>
                  <label>
                    {(CAT_INFO[form.topCategory] || CAT_INFO.bearings).modelL.startsWith("*") && <span className={styles.req}>*</span>}
                    {(CAT_INFO[form.topCategory] || CAT_INFO.bearings).modelL.replace("*", "")}
                  </label>
                  <input value={form.modelNumber} onChange={e => setField("modelNumber", e.target.value)} placeholder={(CAT_INFO[form.topCategory] || CAT_INFO.bearings).modelP} />
                  {form.slug && <span className={styles.slugPreview}>/{form.slug}</span>}
                </div>
                <div className={styles.field}>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>
                      {(CAT_INFO[form.topCategory] || CAT_INFO.bearings).brandL.startsWith("*") && <span className={styles.req}>*</span>}
                      {(CAT_INFO[form.topCategory] || CAT_INFO.bearings).brandL.replace("*", "")}
                    </span>
                    <button type="button" onClick={() => setShowBrandManager(!showBrandManager)} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: 12 }}>
                      {showBrandManager ? "إخفاء القائمة" : "تعديل الماركات ⚙️"}
                    </button>
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select 
                      value={brands.includes(form.brand) && form.brand !== "Other" ? form.brand : "Other"} 
                      onChange={e => setField("brand", e.target.value)}
                      style={{ flex: brands.includes(form.brand) && form.brand !== "Other" ? "1" : "0 0 110px" }}
                    >
                      {brands.map(b => <option key={b} value={b}>{b === "Other" ? "أخرى..." : b}</option>)}
                    </select>
                    {(!brands.includes(form.brand) || form.brand === "Other") && (
                      <div style={{ position: "relative", flex: "1" }}>
                        <input 
                          value={form.brand === "Other" ? "" : form.brand} 
                          onChange={e => setField("brand", e.target.value)} 
                          placeholder="الماركة..." 
                          style={{ width: "100%", paddingLeft: 60 }}
                          autoFocus
                        />
                        <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 4 }}>
                          {form.brand !== "Other" && form.brand.trim() !== "" && !brands.includes(form.brand.trim()) && (
                            <button
                              type="button"
                              onClick={() => {
                                updateBrands([...brands.filter(b => b !== "Other"), form.brand.trim(), "Other"]);
                                alert(`تم حفظ الماركة "${form.brand}" بنجاح!`);
                              }}
                              title="حفظ في القائمة الدائمة"
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setField("brand", brands[0])}
                            title="إلغاء الماركة المخصصة"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, display: "flex", alignItems: "center" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M2 2l10 10M12 2L2 12"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {showBrandManager && (
                    <div style={{ marginTop: 8, padding: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}>
                      <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#9ca3af" }}>إدارة الماركات المحفوظة:</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {brands.map((b, i) => b !== "Other" && (
                          <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 4, fontSize: 13 }}>
                            <span>{b}</span>
                            <button type="button" onClick={() => editBrand(i)} title="تعديل" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button type="button" onClick={() => deleteBrand(i)} title="حذف" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.field}>
                  <label>منتج مميز؟</label>
                  <div className={styles.checkboxRow} onClick={() => setField("featured", !form.featured)}>
                    <input type="checkbox" checked={form.featured} onChange={() => {}} />
                    <label>يظهر في المنتجات المميزة</label>
                  </div>
                </div>
              </div>

              <div className={styles.formGrid} style={{ marginTop: 16 }}>
                <div className={styles.field}>
                  <label><span className={styles.req}>*</span>الفئة الرئيسية</label>
                  <select value={form.topCategory} onChange={e => setField("topCategory", e.target.value)}>
                    {Object.entries(TOP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span><span className={styles.req}>*</span>الفئة الفرعية</span>
                    <button type="button" onClick={() => setShowCatManager(!showCatManager)} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: 12 }}>
                      {showCatManager ? "إخفاء القائمة" : "إدارة الفئات ⚙️"}
                    </button>
                  </label>
                  <select value={form.category} onChange={e => setField("category", e.target.value)}>
                    {subcats.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {showCatManager && (
                    <div style={{ marginTop: 8, padding: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}>
                      <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#9ca3af" }}>الفئات الفرعية لـ ({TOP_LABELS[form.topCategory]}):</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {subcats.map((sub, i) => (
                          <div key={sub} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 4, fontSize: 13 }}>
                            <span>{sub}</span>
                            <button type="button" onClick={() => editSubCategory(i)} title="تعديل" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button type="button" onClick={() => deleteSubCategory(i)} title="حذف" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                          </div>
                        ))}
                        <button type="button" onClick={addSubCategory} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(16, 185, 129, 0.1)", border: "1px dashed rgba(16, 185, 129, 0.4)", color: "#10b981", padding: "4px 8px", borderRadius: 4, fontSize: 13, cursor: "pointer" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          إضافة فئة
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Names & Descriptions */}
              <p className={styles.groupLabel} style={{ marginTop: 24 }}>الأسماء والوصف</p>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label><span className={styles.req}>*</span>الاسم بالعربي</label>
                  <input value={form.nameAr} onChange={e => setField("nameAr", e.target.value)} placeholder={(CAT_INFO[form.topCategory] || CAT_INFO.bearings).nameArP} />
                </div>
                <div className={styles.field}>
                  <label>الاسم بالإنجليزي</label>
                  <input value={form.nameEn} onChange={e => setField("nameEn", e.target.value)} placeholder={(CAT_INFO[form.topCategory] || CAT_INFO.bearings).nameEnP} />
                </div>
              </div>
              <div className={styles.formGrid} style={{ marginTop: 16 }}>
                <div className={styles.field}>
                  <label>الوصف بالعربي</label>
                  <textarea value={form.descriptionAr} onChange={e => setField("descriptionAr", e.target.value)} placeholder="وصف المنتج بالعربي..." />
                </div>
                <div className={styles.field}>
                  <label>الوصف بالإنجليزي</label>
                  <textarea value={form.descriptionEn} onChange={e => setField("descriptionEn", e.target.value)} placeholder="Product description in English..." />
                </div>
              </div>


              {/* Tags & Sizes */}
              <p className={styles.groupLabel} style={{ marginTop: 24 }}>Tags والمقاسات</p>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Tags (مفصولة بفاصلة)</label>
                  <input value={form.tags} onChange={e => setField("tags", e.target.value)} placeholder="SKF, مختوم, محكم" />
                </div>
                <div className={styles.field}>
                  <label>المقاسات المتاحة (مفصولة بفاصلة)</label>
                  <input value={form.sizes} onChange={e => setField("sizes", e.target.value)} placeholder="6202-2RS, 6203-2RS, 6204-2RS" style={{ direction: "ltr" }} />
                </div>
              </div>

              {/* Image Upload */}
              <p className={styles.groupLabel} style={{ marginTop: 24 }}>صور المنتج (يمكنك رفع أكثر من صورة للمنتج الواحد)</p>
              <div className={styles.formGrid} style={{ gridTemplateColumns: "1fr" }}>
                <div className={`${styles.imgUploadZone} ${(form.imagesList?.length || 0) > 0 ? styles.hasImage : ""}`} style={{ flexDirection: "column", gap: 16, alignItems: "flex-start", padding: 16 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {form.imagesList?.map((img, i) => (
                      <div key={i} className={styles.imgPreviewWrap} style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.preview} alt="preview" className={styles.imgPreview} style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: 8, background: "#1a1b1f" }} />
                        <button type="button" className={styles.imgRemove} onClick={(e) => { e.stopPropagation(); removeImage(i); }} style={{ position: "absolute", top: -8, right: -8, background: "#ef4444", color: "white", borderRadius: "50%", padding: 4, zIndex: 10, cursor: "pointer", border: "2px solid #0f1115", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
                        </button>
                        <div style={{ position: "absolute", bottom: 4, left: 4, right: 4, display: "flex", gap: 2, background: "rgba(0,0,0,0.8)", padding: 4, borderRadius: 4, justifyContent: "center" }}>
                          {["webp", "jpg", "png"].map(ext => (
                            <button type="button" key={ext} onClick={(e) => { e.stopPropagation(); setImageExt(i, ext); }} style={{ fontSize: 11, padding: "2px 4px", border: "none", background: img.ext === ext ? "#60a5fa" : "transparent", color: "white", borderRadius: 3, cursor: "pointer", flex: 1 }}>{ext}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className={styles.imgPlaceholder} style={{ width: 120, height: 120, position: "relative", flexShrink: 0, margin: 0, padding: 0 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      <strong style={{ fontSize: 13, marginTop: 8 }}>+ رفع صور</strong>
                      <input type="file" accept="image/*" multiple className={styles.fileInput} onChange={handleImageUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
                    </div>
                  </div>
                </div>

                {(form.imagesList?.length || 0) > 0 && (
                  <div className={styles.imgHint} style={{ marginTop: 12 }}>
                    <strong>📁 سيتم حفظ هذه الصور في المسارات التالية بعد النسخ:</strong>
                    <ul style={{ margin: "8px 0 0 16px", padding: 0, fontSize: 13, display: "flex", flexDirection: "column", gap: 6, opacity: 0.8 }}>
                      {form.imagesList.map((img, i) => (
                        <li key={i}><code>public/products/{form.topCategory}/{currentSlug}{i === 0 ? "" : "-" + (i + 1)}.{img.ext}</code></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveProduct}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M2 7l4 4 6-6"/></svg>
                  {editingIdx !== null ? "حفظ التعديلات" : "إضافة المنتج"}
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={resetForm}>إلغاء</button>
                {editingIdx !== null && (
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => { deleteProduct(editingIdx!); resetForm(); }}>
                    حذف المنتج
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── LIST TAB ── */}
          {activeTab === "list" && (
            <div>
              <div className={styles.sectionTitle}>
                {filterCat === "all" ? "جميع المنتجات" : TOP_LABELS[filterCat]}
              </div>
              {filteredProducts.length === 0 ? (
                <div className={styles.empty}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>
                  </svg>
                  <p>لا توجد منتجات بعد — ابدأ بإضافة منتجك الأول</p>
                </div>
              ) : (
                <div className={styles.productList}>
                  {filteredProducts.map((p, i) => {
                    const realIdx = products.indexOf(p);
                    return (
                      <div key={i} className={styles.productItem}>
                        {p.imagesList && p.imagesList.length > 0 && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imagesList[0].preview} alt="" className={styles.productThumb} style={{ objectFit: "cover", background: "#1a1b1f" }} />
                        )}
                        <div className={styles.productInfo}>
                          <span className={styles.productModel}>{p.modelNumber}</span>
                          <span className={styles.productName}>{p.nameAr}</span>
                          <span className={styles.productMeta}>{p.brand} · {p.category}{p.featured ? " · ★ مميز" : ""}</span>
                        </div>
                        <div className={styles.productActions}>
                          <button className={`${styles.btn} ${styles.btnSecondary}`} style={{ padding: "6px 14px", fontSize: 12 }}
                            onClick={() => editProduct(realIdx)}>تعديل</button>
                          <button className={`${styles.btn} ${styles.btnDanger}`} style={{ padding: "6px 14px", fontSize: 12 }}
                            onClick={() => deleteProduct(realIdx)}>حذف</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── OUTPUT TAB ── */}
          {activeTab === "output" && (
            <div>
              <div className={styles.sectionTitle}>الكود الجاهز</div>
              <div className={styles.outputHint}>
                <strong>طريقة الاستخدام:</strong> افتح ملف{" "}
                <code>src/lib/products.ts</code> وأضف الكود داخل مصفوفة <code>products[]</code>
              </div>
              <div className={styles.codePanel}>
                <div className={styles.codeHeader}>
                  <span className={styles.codeTitle}>products.ts — {products.length} منتج</span>
                  <button className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ""}`} onClick={copyCode}>
                    {copied ? "✓ تم النسخ" : "نسخ الكود"}
                  </button>
                </div>
                <pre className={styles.codeBody}>{allCode}</pre>
              </div>

              {products.some(p => (p.imagesList?.length || 0) > 0) && (
                <div style={{ marginTop: 28 }}>
                  <div className={styles.sectionTitle}>ملفات الصور — احفظها يدوياً</div>
                  <div className={styles.imagesList}>
                    {products.flatMap(p => (p.imagesList || []).map((img, i) => ({ p, img, i }))).map(({ p, img, i }, index) => {
                      const computedSlug = p.slug || toSlug(p.modelNumber || p.nameEn || "product");
                      return (
                        <div key={index} className={styles.imageItem}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.preview} alt="" className={styles.imageItemThumb} style={{ objectFit: "cover" }} />
                          <div className={styles.imageItemInfo}>
                            <span className={styles.imageItemModel}>{p.modelNumber} {i > 0 ? `(${i+1})` : ""}</span>
                            <code className={styles.imageItemPath}>
                              public/products/{p.topCategory}/{computedSlug}{i === 0 ? "" : "-" + (i + 1)}.{img.ext}
                            </code>
                          </div>
                          <a href={img.preview} download={`${computedSlug}${i === 0 ? "" : "-" + (i + 1)}.${img.ext}`}
                            className={`${styles.btn} ${styles.btnSecondary}`} style={{ padding: "6px 14px", fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}>
                            ⬇ تنزيل
                          </a>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
