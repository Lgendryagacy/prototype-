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
    if (brightness > 230 && diff < 20) {
      if (brightness >= 245) {
        rawBuffer[i + 3] = 0; // Pure Transparent
      } else {
        // Smooth linear falloff
        const factor = (brightness - 230) / 15; // 0 to 1
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
  const torusJpg = path.join(process.cwd(), 'src/assets/images/iridescent_3d_torus_1787307193709.jpg');
  const cubeJpg = path.join(process.cwd(), 'src/assets/images/frosted_glass_cube_1787307208936.jpg');
  const sphereJpg = path.join(process.cwd(), 'src/assets/images/pink_glossy_sphere_1787307220956.jpg');
  const cylinderJpg = path.join(process.cwd(), 'src/assets/images/pink_3d_cylinder_1787307237888.jpg');

  const outputDir = path.join(process.cwd(), 'public/images/hero-shapes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await processImageToTransparentPNG(torusJpg, path.join(outputDir, 'torus.png'));
  await processImageToTransparentPNG(cubeJpg, path.join(outputDir, 'frosted-cube.png'));
  await processImageToTransparentPNG(sphereJpg, path.join(outputDir, 'sphere.png'));
  await processImageToTransparentPNG(cylinderJpg, path.join(outputDir, 'cylinder.png'));

  console.log('All hero 3D shapes converted to transparent PNG successfully!');
}

main().catch(console.error);
