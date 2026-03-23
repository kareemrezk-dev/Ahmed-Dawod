const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/lib/scraped-products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let count = 0;
for (const p of products) {
  const textToSearch = [p.nameEn, p.nameAr, p.slug, ...(p.tags || [])].join(' ').toLowerCase();
  
  // نبحث عن كلمة ina بداخل الاسم أو الرابط أو التاجات
  // استخدام regex للتأكد من أنها كلمة منفصلة أو جزء من الكود
  if (/\bina\b/i.test(textToSearch) || textToSearch.includes('ina-')) {
    p.brand = 'INA';
    count++;
  }
}

fs.writeFileSync(dataPath, JSON.stringify(products, null, 2), 'utf8');
console.log(`تم بنجاح تحديث ${count} منتج وتعيين الماركة الخاصة بهم إلى INA!`);
