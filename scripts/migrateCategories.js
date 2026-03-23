const fs = require("fs");
const path = require("path");

const productsPath = path.join(__dirname, "../src/lib/scraped-products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

products.forEach((p) => {
  const name = p.nameAr.toLowerCase();
  
  if (p.topCategory === "bearings") {
    if (name.includes("ابري") || name.includes("إبري") || name.includes("طقم ابر")) {
      p.category = "بلي إبري";
    } else if (name.includes("اتجاه واحد") || name.includes("csk") || name.includes("stieber")) {
      p.category = "بلي اتجاه واحد";
    } else if (name.includes("كامه") || name.includes("كامة") || name.includes("cam")) {
      p.category = "بلي كامه";
    } else if (name.includes("مسمار") || name.includes("rod end")) {
      p.category = "بلي مسمار";
    } else if (name.includes("حراري") || name.includes("استانلس") || name.includes("ستانلس")) {
      p.category = "بلي حراري واستانلس";
    } else if (name.includes("اسطمبات") || name.includes("ball cage")) {
      p.category = "بلي اسطمبات";
    } else if (name.includes("سبندل") || name.includes("سرعات") || name.includes("spindle")) {
      p.category = "بلي سرعات اسبندل";
    } else if (name.includes("miniature") || name.includes("صغير")) {
      p.category = "بلي Miniature";
    } else if (name.includes("ستة الافات") || name.includes("600") || name.includes("620") || name.includes("630")) {
      p.category = "بلي 6000";
    } else {
      p.category = "بلي متنوع";
    }
  } else if (p.topCategory === "linear") {
    if (name.includes("عمود") || name.includes("عواميد")) p.category = "عواميد لينير";
    else p.category = "بلي لينير";
  } else if (p.topCategory === "ball-screw") {
    if (name.includes("عمود") || name.includes("عواميد")) p.category = "بول سكرو عواميد";
    else if (name.includes("مخروط")) p.category = "مخروط جاهز";
    else p.category = "بول سكرو بلي";
  } else if (p.topCategory === "hard-chrome") {
    if (name.includes("قعدة") || name.includes("قعده") || name.includes("base")) p.category = "عواميد هارد كروم بالقعدة";
    else if (name.includes("عمود")) p.category = "عواميد هارد كروم";
    else p.category = "بلي هارد كروم";
  } else if (p.topCategory === "lead-screw") {
    p.category = "ليد سكرو";
  } else if (p.topCategory === "housings") {
    if (name.includes("بلاستيك") || name.includes("plastic")) p.category = "كراسي بلاستيك";
    else if (name.includes("ستانلس") || name.includes("stainless")) p.category = "كراسي ستانلس ستيل";
    else if (name.includes("زهر") || name.includes("صلب") || name.match(/uc[pf]/i)) p.category = "كراسي صلب وزهر";
    else p.category = "كراسي متنوعة";
  } else if (p.topCategory === "fasteners") {
    if (name.match(/bk|bf|fk|ff/i)) p.category = "تثبيتات بول سكرو";
    else if (name.match(/sk|sh/i)) p.category = "تثبيتات كروم بدون قعدة";
    else p.category = "صواميل وملحقات";
  } else if (p.topCategory === "pulleys") {
    if (name.includes("adapter") || name.includes("h3") || name.includes("h2")) p.category = "جلب Adapter Sleeves";
    else if (name.includes("سبيكة") || name.includes("سبيكه") || name.includes("مشلوقة") || name.includes("مشقوقة")) p.category = "جلب سبيكة مشقوقة";
    else p.category = "جلب مسننة وعادية";
  }
});

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log("Migration completed successfully.");
