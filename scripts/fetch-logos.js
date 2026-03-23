const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, 'public', 'brands', 'alhutaib');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const urls = [
  "https://alhutaibcompany.com/cdn/shop/files/Hiwin-Logo.png",
  "https://alhutaibcompany.com/cdn/shop/files/16c9d2a5-a210-474f-a0fa-d41eeaa39acc.png",
  "https://alhutaibcompany.com/cdn/shop/files/2_37c3a8c8-ddad-4925-a0e7-520e2f4aff72.png",
  "https://alhutaibcompany.com/cdn/shop/files/4.png",
  "https://alhutaibcompany.com/cdn/shop/files/FAG-logo-FA049C1ECA-seeklogo.com.png",
  "https://alhutaibcompany.com/cdn/shop/files/1_5575153f-7a52-4b87-a604-5b99673483a2.png",
  "https://alhutaibcompany.com/cdn/shop/files/3_e646aaea-1899-4f1b-bbcb-0356147a3ce4.png",
  "https://alhutaibcompany.com/cdn/shop/files/8.png",
  "https://alhutaibcompany.com/cdn/shop/files/Untitled_design_6.png",
  "https://alhutaibcompany.com/cdn/shop/files/ABBA-Logo.jpg",
  "https://alhutaibcompany.com/cdn/shop/files/Untitled_design_1_a8fa3b60-20b8-44f2-8b55-20d037fa1dea.png",
  "https://alhutaibcompany.com/cdn/shop/files/PMI.png",
  "https://alhutaibcompany.com/cdn/shop/files/Untitled_design_3.png",
  "https://alhutaibcompany.com/cdn/shop/files/68063af9-a94d-440d-8be0-3b544d90ba33.png",
  "https://alhutaibcompany.com/cdn/shop/files/ENC.jpg",
  "https://alhutaibcompany.com/cdn/shop/files/htb_logo_8_063f4a87-b70b-4cee-990f-7c456fa84b07.jpg",
  "https://alhutaibcompany.com/cdn/shop/files/rhp-larger-1.png",
  "https://alhutaibcompany.com/cdn/shop/files/download.jpg"
];

urls.forEach((url, i) => {
  const ext = url.split('?')[0].split('.').pop();
  const dest = path.join(dir, `logo_${i}.${ext}`);
  console.log(`Downloading ${url} -> ${dest}`);
  https.get(url, (res) => {
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Finished ${dest}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${url}:`, err.message);
  });
});
