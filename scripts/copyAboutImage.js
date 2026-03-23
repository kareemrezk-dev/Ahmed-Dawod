const fs = require('fs');
const path = require('path');

const source = 'C:\\Users\\karee\\.gemini\\antigravity\\brain\\c0079beb-c806-4e9a-8e8b-4a5825000857\\media__1774092887554.jpg';
const destDir = path.join(__dirname, '../public/images');
const dest = path.join(destDir, 'about-store.jpg');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

try {
  fs.copyFileSync(source, dest);
  console.log('✅ تم نسخ الصورة بنجاح إلى: public/images/about-store.jpg');
} catch (e) {
  console.error('❌ حدث خطأ أثناء نسخ الصورة:', e.message);
}
