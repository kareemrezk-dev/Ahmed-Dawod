const fs = require('fs');
const path = require('path');

const BRAIN_DIR = 'C:\\Users\\karee\\.gemini\\antigravity\\brain\\c0079beb-c806-4e9a-8e8b-4a5825000857';
const sourceImage = 'hero_composition_1774095125177.png'; // The cinematic composition
const DEST_DIR = path.join(__dirname, '../public/images');
const destPath = path.join(DEST_DIR, 'hero.png');

if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

try {
  fs.copyFileSync(path.join(BRAIN_DIR, sourceImage), destPath);
  console.log('✅ تم تركيب صورة الـ Hero السينمائية بنجاح!');
} catch (e) {
  console.error('❌ حدث خطأ:', e.message);
}
