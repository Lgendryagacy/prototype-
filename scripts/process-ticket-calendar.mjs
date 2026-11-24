import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processImageToTransparentPNG(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  
  // Get raw RGBA buffer
  const rawBuffer = await image.raw().ensureAlpha().toBuffer();
  
  for (let i = 0; i < rawBuffer.length; i += 4) {
    const r = rawBuffer[i];
    const g = rawBuffer[i + 1];
    const b = rawBuffer[i + 2];
    
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    const diff = maxVal - minVal;
    const brightness = (r + g + b) / 3;
    
    // Check if pixel is white / off-white background
    if (brightness > 232 && diff < 18) {
      if (brightness >= 246) {
        rawBuffer[i + 3] = 0; // Pure Transparent
      } else {
        const factor = (brightness - 232) / 14;
        rawBuffer[i + 3] = Math.round(255 * (1 - factor));
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
  .png({ compressionLevel: 9 })
  .toFile(outputPath);
  
  console.log(`Processed transparent PNG -> ${outputPath}`);
}

async function main() {
  const ticketJpg = path.join(process.cwd(), 'src/assets/images/ticket_and_calendar_3d_1787310110177.jpg');
  const outputDir = path.join(process.cwd(), 'public/images/hero-shapes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await processImageToTransparentPNG(ticketJpg, path.join(outputDir, 'ticket-calendar.png'));
  console.log('Ticket & calendar 3D transparent PNG generated successfully!');
}

main().catch(console.error);
