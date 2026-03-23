const fs = require('fs');
const d = JSON.parse(fs.readFileSync('src/lib/scraped-products.json', 'utf8'));
console.log('Total items:', d.length);

const s6000 = d.filter(p => p.category === 'بلي 6000');
console.log('Category "بلي 6000":', s6000.length);

const oneWay = d.filter(p => p.category === 'بلي اتجاه واحد');
console.log('Category "بلي اتجاه واحد":', oneWay.length);

// Also look for items that might be mis-categorized but contain these words:
const s6000Any = d.filter(p => (p.nameAr && p.nameAr.includes('6000')) || (p.modelNumber && p.modelNumber.includes('600')) || (p.nameEn && p.nameEn.includes('600')));
console.log('Items containing "600" in name/model:', s6000Any.length);

const oneWayAny = d.filter(p => (p.nameAr && p.nameAr.includes('واحد')) || (p.nameEn && p.nameEn.includes('واحد')));
console.log('Items containing "واحد" in name:', oneWayAny.length);

// Look for items explicitly filtered by products.ts logic
const catFiltered = d.filter(p => p.nameAr.includes("كتالوج") || p.nameEn.toLowerCase().includes("catalog"));
console.log('Items filtered due to "catalog":', catFiltered.length);
