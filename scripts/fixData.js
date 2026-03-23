const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/lib/scraped-products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let featuredAssigned = 0;
let brandsAssigned = 0;
let tagsCleaned = 0;

// أشهر الماركات في الصناعة
const famousBrands = ['SKF', 'NSK', 'FAG', 'NTN', 'THK', 'HIWIN', 'KOYO', 'IKO', 'TIMKEN', 'SNR'];

for (const p of products) {
  // 1. إعادة ضبط الحالة المميزة
  p.featured = false;

  // 2. استخراج الماركات الأوتوماتيكي
  const textToSearch = [p.nameEn, p.nameAr, p.slug, ...(p.tags || [])].join(' ').toUpperCase();
  for (const b of famousBrands) {
    // التأكد إننا نعدل لو مكانتش الماركة متحددة (لتجنب مسح INA اللي عملناها)
    if (textToSearch.includes(b) && p.brand !== b && p.brand !== 'INA') {
      p.brand = b;
      brandsAssigned++;
      break;
    }
  }

  // 3. تنظيف التاجات (Tags) الجانبية
  if (p.tags) {
    const originalLen = p.tags.length;
    p.tags = p.tags.filter(t => {
      if (!t || typeof t !== 'string') return false;
      const tLower = t.toLowerCase();
      // استبعاد التاجات اللي كلها أرقام فقط مثل "10" 
      if (/^\d+$/.test(tLower)) return false; 
      // استبعاد تاجات الأبعاد الغريبة مثل "10mm" أو "6000" عشان الفلتر ميبقاش قبيح
      if (/^\d+(mm|cm|kg)$/.test(tLower)) return false;
      // استبعاد الكلمات العشوائية
      if (['piece', 'قطعة', 'new', 'جديد', 'pcs', 'default variant'].includes(tLower)) return false;
      return true;
    });
    // Remove duplicates
    p.tags = [...new Set(p.tags)];
    if (p.tags.length < originalLen) tagsCleaned++;
  }
}

// 4. تعيين منتجات مميزة (Featured) للظهور في الصفحة الرئيسية بدلاً من إظهارها فارغة
const targetCategories = [...new Set(products.map(p => p.category))];
for (const cat of targetCategories) {
  // بنجيب المنتجات اللي ليها صور عشان شكلها يبقى حلو في القسم الرئيسي
  const productsInCat = products.filter(p => !p.featured && p.category === cat && p.images && p.images.length > 0);
  if (productsInCat.length > 0 && featuredAssigned < 12) {
    productsInCat[0].featured = true;
    featuredAssigned++;
  }
}

fs.writeFileSync(dataPath, JSON.stringify(products, null, 2), 'utf8');

console.log(`\n✅ تمت معالجة البيانات والموقع بنجاح:`);
console.log(`=========================================`);
console.log(`1. تم تحديد ${featuredAssigned} منتجات ليظهروا كمنتجات مميزة (Featured) لملء الصفحة الرئيسية.`);
console.log(`2. تم استخراج وإضافة الماركات العالمية لعدد ${brandsAssigned} منتج (مثل SKF, NSK...).`);
console.log(`3. تم تنظيف التاجات العشوائية من ${tagsCleaned} منتج لتبدو فلاتر البحث أجمل.`);
console.log(`=========================================\n`);
