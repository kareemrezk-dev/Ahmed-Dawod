const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/lib/scraped-products.json');
const imgDir = path.join(__dirname, '../public/products/scraped');

// إنشاء مجلد الصور إذا لم يكن موجوداً
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// دالة تحميل الصورة
async function downloadImage(url, dest) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    return true;
  } catch (err) {
    console.error(`❌ فشل تحميل الصورة: ${url}`, err.message);
    return false;
  }
}

async function main() {
  console.log('⏳ جاري قراءة ملف المنتجات...');
  const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let totalSaved = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    if (!product.images || product.images.length === 0) continue;

    const newImages = [];
    for (let j = 0; j < product.images.length; j++) {
      const originalUrl = product.images[j];
      
      // تجاوز الصورة إذا كانت محملة مسبقاً (تبدأ برابط داخلي)
      if (!originalUrl.startsWith('http')) {
        newImages.push(originalUrl);
        continue;
      }

      // استخراج امتداد الصورة (jpg, png, webp)
      const urlWithoutQuery = originalUrl.split('?')[0];
      const extMatch = urlWithoutQuery.match(/\.(jpg|jpeg|png|webp|gif)$/i);
      const ext = extMatch ? extMatch[0].toLowerCase() : '.jpg';
      
      // اسم ملف الصورة الجديد
      const fileName = `${product.slug}-${j}${ext}`;
      const localFilePath = path.join(imgDir, fileName);
      const publicPath = `/products/scraped/${fileName}`;

      console.log(`[${i + 1}/${products.length}] 📥 جاري تحميل صورة المنتج: ${product.slug} ...`);
      
      const success = await downloadImage(originalUrl, localFilePath);
      if (success) {
        newImages.push(publicPath); // استخدم المسار الداخلي الجديد
        totalSaved++;
      } else {
        newImages.push(originalUrl); // احتفظ بالرابط الخارجي إذا فشل التحميل
      }
      
      // انتظار بسيط لتجنب حظر الخادم (Shopify protection rate limit)
      await new Promise(r => setTimeout(r, 100));
    }
    
    // تحديث مسارات الصور للمنتج
    product.images = newImages;
  }

  // حفظ مسارات الصور الجديدة بداخل ملف JSON
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`\n✅ تمت العملية بنجاح! تم تحميل ${totalSaved} صورة وتحديث روابط المنتجات.`);
}

main().catch(console.error);
