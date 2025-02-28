import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Generating placeholder PWA icons...');

const iconsDir = path.join(__dirname, '../public/pwa-icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

try {
  const sourcePath = path.join(__dirname, '../public/lovable-uploads/b5f6463e-7844-4ccb-833d-09de10a588c8.png');

  if (fs.existsSync(sourcePath)) {
    const iconSizes = [192, 512];

    iconSizes.forEach(size => {
      fs.copyFileSync(
        sourcePath,
        path.join(iconsDir, `pwa-${size}x${size}.png`)
      );
      console.log(`Created placeholder icon: pwa-${size}x${size}.png`);
    });

    console.log('PWA icons generated successfully!');
  } else {
    console.error('Source logo not found. Please create proper PWA icons manually.');
  }
} catch (error) {
  console.error('Error generating PWA icons:', error);
}