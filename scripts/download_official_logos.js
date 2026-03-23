const fs = require('fs');
const path = require('path');

const logos = {
  "abba": "https://it-it.taiwantrade.com/static/brand/abba-logo.png",
  "pmi": "https://www.pmi-amt.com/img/logo.png",
  "enc": "https://img.directindustry.com/images_di/brands/enc-bearings-184515.jpg",
  "htb": "https://www.htbsrl.com/wp-content/uploads/2021/05/logo_official.png",
  "rhp": "https://vwimpex.com/wp-content/uploads/2021/03/rhp-logo.png",
  "thk": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Thk.svg",
  "iko": "https://www.ikont.co.jp/common/images/header/logo.png",
  "rexroth": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Logo_of_Bosch_Rexroth_AG.svg",
  "skf": "https://upload.wikimedia.org/wikipedia/commons/5/5e/SKF_logo.svg",
  "koyo": "https://seeklogo.com/images/K/Koyo-logo-0AEEF3-seeklogo.com.png",
  "tbi": "https://www.tbimotion.com.tw/images/logo.png",
  "nachi": "https://upload.wikimedia.org/wikipedia/commons/5/5d/Nachi-Fujikoshi_Corp._Logo.svg",
  "stieber": "https://www.stieberclutch.com/~/media/Images/AltraMotion/Brands/Stieber-Clutch/stieber-logo.png"
};

const dir = path.join(process.cwd(), 'public', 'brands');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

async function download() {
  for (const [name, url] of Object.entries(logos)) {
    console.log(`Starting download: ${name}...`);
    try {
      const ext = url.split('.').pop().split('?')[0];
      let finalExt = ext;
      if (finalExt.length > 4) finalExt = url.includes('.svg') ? 'svg' : 'png';
      
      const filename = `${name}.${finalExt}`;
      const filepath = path.join(dir, filename);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 seconds timeout

      const res = await fetch(url, { 
        signal: controller.signal,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*,*/*;q=0.8'
        } 
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filepath, buffer);
      console.log(`✅ Downloaded ${filename}`);
    } catch (e) {
      console.error(`❌ Failed ${name}: ${e.message}`);
    }
  }
  console.log("All done!");
}

download();
