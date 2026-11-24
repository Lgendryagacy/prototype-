import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processImageToTransparentPNG(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  
  // Get raw RGBA buffer
  const rawBuffer = await image.raw().ensureAlpha().toBuffer();
  
  // Convert background (near white, e.g. R > 245, G > 245, B > 245) to transparent
  // For soft shadows (grayish pixels), smoothly scale alpha
  for (let i = 0; i < rawBuffer.length; i += 4) {
    const r = rawBuffer[i];
    const g = rawBuffer[i + 1];
    const b = rawBuffer[i + 2];
    
    // Check brightness
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    const diff = maxVal - minVal;
    
    // Pure or near pure white background (neutral color and high brightness)
    if (r > 242 && g > 242 && b > 242 && diff < 10) {
      const brightness = (r + g + b) / 3;
      if (brightness >= 252) {
        rawBuffer[i + 3] = 0; // Completely transparent
      } else {
        // Smooth transition for shadow edges
        const alphaFactor = (252 - brightness) / 10;
        rawBuffer[i + 3] = Math.min(255, Math.floor(rawBuffer[i + 3] * alphaFactor));
      }
    }
  }
  
  await sharp(rawBuffer, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .png({ quality: 100 })
  .toFile(outputPath);
  
  console.log(`Processed ${inputPath} -> ${outputPath}`);
}

async function main() {
  const chairJpg = path.join(process.cwd(), 'src/assets/images/blue_office_chair_png_1787161731868.jpg');
  const micJpg = path.join(process.cwd(), 'src/assets/images/purple_mic_png_1787161747981.jpg');
  const briefcaseJpg = path.join(process.cwd(), 'src/assets/images/blue_briefcase_3d_1787161392507.jpg');
  const calendarJpg = path.join(process.cwd(), 'src/assets/images/purple_calendar_3d_1787161410974.jpg');

  const outputDir = path.join(process.cwd(), 'public/images/quick-actions');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await processImageToTransparentPNG(chairJpg, path.join(outputDir, 'blue-chair.png'));
  await processImageToTransparentPNG(micJpg, path.join(outputDir, 'purple-mic.png'));
  await processImageToTransparentPNG(briefcaseJpg, path.join(outputDir, 'blue-briefcase.png'));
  await processImageToTransparentPNG(calendarJpg, path.join(outputDir, 'purple-calendar.png'));

  console.log('All images converted to PNG successfully!');
}

main().catch(console.error);
