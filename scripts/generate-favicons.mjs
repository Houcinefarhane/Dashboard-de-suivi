import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const svgPath = join(projectRoot, 'public', 'icon.svg');
const publicDir = join(projectRoot, 'public');

async function generateFavicons() {
  try {
    const svgBuffer = readFileSync(svgPath);

    // Générer favicon.ico (16x16 et 32x32)
    console.log('📦 Génération de favicon.ico...');
    const favicon16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
    const favicon32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
    
    // Pour ICO, on crée un PNG 32x32 (les navigateurs modernes acceptent PNG pour .ico)
    writeFileSync(join(publicDir, 'favicon.ico'), favicon32);
    console.log('✅ favicon.ico créé (32x32)');

    // Générer icon-192.png
    console.log('📦 Génération de icon-192.png...');
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(join(publicDir, 'icon-192.png'));
    console.log('✅ icon-192.png créé');

    // Générer icon-512.png
    console.log('📦 Génération de icon-512.png...');
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(join(publicDir, 'icon-512.png'));
    console.log('✅ icon-512.png créé');

    // Générer apple-touch-icon.png (180x180)
    console.log('📦 Génération de apple-touch-icon.png...');
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ apple-touch-icon.png créé');

    console.log('\n🎉 Tous les favicons ont été générés avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la génération des favicons:', error);
    process.exit(1);
  }
}

generateFavicons();

