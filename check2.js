const fs = require('fs');
const d = JSON.parse(fs.readFileSync('src/lib/scraped-products.json', 'utf8'));

console.log('--- 600 candidates ---');
const s6000Any = d.filter(p => (p.nameAr && p.nameAr.includes('600')) || (p.modelNumber && p.modelNumber.includes('600')));
s6000Any.forEach(p => console.log(`[${p.category}] ${p.modelNumber} | ${p.nameAr} | ${p.nameEn}`));

console.log('\n--- OneWay candidates ---');
const oneWayAny = d.filter(p => (p.nameAr && p.nameAr.includes('واحد')) || (p.nameEn && p.nameEn.includes('واحد')));
oneWayAny.forEach(p => console.log(`[${p.category}] ${p.modelNumber} | ${p.nameAr} | ${p.nameEn}`));
