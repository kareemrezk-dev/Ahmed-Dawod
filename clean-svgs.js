const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.svg')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove hardcoded text labels
      content = content.replace(/<text[\s\S]*?<\/text>/g, '');
      
      // Remove the solid white background to make it transparent
      content = content.replace(/<rect width="1000" height="1000" fill="white"\/>/g, '');
      
      fs.writeFileSync(fullPath, content);
      console.log('Cleaned:', fullPath);
    }
  }
}

walk('./public/products');;
