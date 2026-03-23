const fs = require('fs');
const http = require('https');

const API_URL = 'https://alhutaibcompany.com/products.json?limit=250';

async function fetchProducts(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

function stripHtml(html) {
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
}

function categorize(title, tags) {
  const t = (title + ' ' + tags.join(' ')).toLowerCase();
  
  if (t.includes('linear') || t.includes('لينير') || t.includes('lmk') || t.includes('lmh') || t.includes('csk') || t.includes('sbr')) {
    return { topCategory: 'linear', category: 'بلي لينير' };
  }
  if (t.includes('ball screw') || t.includes('nut') || t.includes('بول سكرو')) {
    return { topCategory: 'ball-screw', category: 'بول سكرو بلي' };
  }
  if (t.includes('grease') || t.includes('شحم') || t.includes('lithium')) {
    return { topCategory: 'misc', category: 'زيوت تشحيم' };
  }
  if (t.includes('pulley') || t.includes('ترس') || t.includes('gear') || t.includes('gt2') || t.includes('timing')) {
    return { topCategory: 'pulleys', category: 'جلب مسننة' };
  }
  if (t.includes('pillow block') || t.includes('كرسي') || t.includes('kp') || t.includes('kfl') || t.includes('ucp')) {
    return { topCategory: 'housings', category: 'كراسي بيلو بلوك' };
  }
  if (t.includes('hard chrome') || t.includes('هارد كروم') || t.includes('shaft') || t.includes('rod') || t.includes('عمود')) {
    return { topCategory: 'hard-chrome', category: 'عواميد هارد كروم' };
  }
  if (t.includes('screw') || t.includes('مسمار') || t.includes('sil')) {
    return { topCategory: 'fasteners', category: 'مسامير تثبيت' };
  }
  
  // Default to bearings
  return { topCategory: 'bearings', category: 'بلي كروي' };
}

async function main() {
  console.log('Fetching products from Alhutaib...');
  let allProducts = [];
  let page = 1;

  while (true) {
    const url = `${API_URL}&page=${page}`;
    console.log(`Fetching page ${page}...`);
    const data = await fetchProducts(url);
    if (!data.products || data.products.length === 0) {
      break;
    }
    allProducts = allProducts.concat(data.products);
    page++;
    
    // Safety break
    if (page > 10) break;
  }

  console.log(`Fetched ${allProducts.length} products total.`);

  const mappedProducts = allProducts.map(p => {
    const cats = categorize(p.title, p.tags);
    const desc = stripHtml(p.body_html || '');
    
    let modelNumber = p.title.split('||').pop().trim();
    if (!modelNumber || modelNumber.length < 2) {
      modelNumber = p.variants[0]?.title || p.title;
    }

    // Attempt to extract Arabic name from between ||
    let nameAr = p.title;
    const arMatch = p.title.match(/\|\|(.*?)\|\|/);
    if (arMatch) {
      nameAr = arMatch[1].trim();
    }

    return {
      slug: p.handle,
      modelNumber: modelNumber,
      topCategory: cats.topCategory,
      category: cats.category,
      brand: p.vendor || 'Generic',
      nameAr: nameAr,
      nameEn: p.title.replace(/\|\|(.*?)\|\|/g, '').trim() || p.title,
      descriptionAr: desc,
      descriptionEn: desc, // Often descriptions are mixed or English
      specs: [
        { labelAr: "الشركة المصنعة", labelEn: "Manufacturer", value: p.vendor || 'Unknown' },
        ...(p.tags.length > 0 ? [{ labelAr: "العلامات", labelEn: "Tags", value: p.tags.filter(t => t !== 'hide').join(', ') }] : [])
      ],
      tags: p.tags.filter(t => t !== 'hide'),
      sizes: p.variants.map(v => v.title).filter(t => t && t !== 'Default Title'),
      images: p.images.map(img => img.src)
    };
  });

  const outputPath = './src/lib/scraped-products.json';
  fs.writeFileSync(outputPath, JSON.stringify(mappedProducts, null, 2), 'utf-8');
  console.log(`Saved ${mappedProducts.length} products to ${outputPath}`);
}

main().catch(console.error);
