import * as THREE from 'three';

// Procedural Canvas Texture Generators (Zero 404 dependencies)
export function createTrackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base turquoise/teal background
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(0, 0, 512, 512);

  // 3-lane division with checkered colorful tiles matching reference image
  const laneW = 512 / 3;
  const tileH = 64;

  for (let y = 0; y < 512; y += tileH) {
    const row = Math.floor(y / tileH);

    // Left Lane
    ctx.fillStyle = (row % 2 === 0) ? '#f97316' : '#ea580c'; // Warm orange
    ctx.fillRect(8, y + 2, laneW - 16, tileH - 4);

    // Center Lane (Checkered red & yellow/orange)
    ctx.fillStyle = (row % 2 === 0) ? '#e11d48' : '#eab308'; // Vibrant rose red & golden yellow
    ctx.fillRect(laneW + 8, y + 2, laneW - 16, tileH - 4);

    // Right Lane
    ctx.fillStyle = (row % 2 === 0) ? '#0284c7' : '#0ea5e9'; // Cyan & sky blue
    ctx.fillRect(laneW * 2 + 8, y + 2, laneW - 16, tileH - 4);
  }

  // Border curb stripes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(laneW - 3, 0, 6, 512);
  ctx.fillRect(laneW * 2 - 3, 0, 6, 512);

  // Outer glowing borders
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 0, 6, 512);
  ctx.fillRect(506, 0, 6, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createTechCrateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Tech crate base orange/gold
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(0, 0, 256, 256);

  // Metallic rim
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 242, 242);

  // Inner beveled plate
  ctx.fillStyle = '#c2410c';
  ctx.fillRect(20, 20, 216, 216);

  // Glowing neon cyan tech slits (like the reference image)
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 12;

  ctx.fillRect(40, 80, 176, 24);
  ctx.fillRect(40, 150, 176, 24);

  // Center hazard icon or caution stripes
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(128, 128, 18, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createCoinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Outer golden coin rim
  const gradient = ctx.createRadialGradient(128, 128, 40, 128, 128, 120);
  gradient.addColorStop(0, '#fef08a');
  gradient.addColorStop(0.5, '#eab308');
  gradient.addColorStop(1, '#ca8a04');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  // Inner beveled circle
  ctx.strokeStyle = '#fef9c3';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(128, 128, 96, 0, Math.PI * 2);
  ctx.stroke();

  // Center 5-pointed star emblem
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 8;
  drawStar(ctx, 128, 128, 5, 52, 24);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

export function createCosmicGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark reflective space grid floor
  ctx.fillStyle = '#060515';
  ctx.fillRect(0, 0, 512, 512);

  // 3 Lanes division
  const laneW = 512 / 3;

  // Longitudinal glowing neon grid lines
  // Magenta left lane line
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 8;
  ctx.strokeRect(10, 0, laneW - 20, 512);

  // Cyan center lane line
  ctx.strokeStyle = '#06b6d4';
  ctx.shadowColor = '#00f0ff';
  ctx.strokeRect(laneW + 10, 0, laneW - 20, 512);

  // Lime green right lane line
  ctx.strokeStyle = '#22c55e';
  ctx.shadowColor = '#4ade80';
  ctx.strokeRect(laneW * 2 + 10, 0, laneW - 20, 512);

  // Horizontal cyber grid lines
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 2;
  for (let y = 0; y < 512; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Outer neon rails
  ctx.fillStyle = '#f43f5e'; // Left rail
  ctx.fillRect(0, 0, 6, 512);
  ctx.fillStyle = '#06b6d4'; // Right rail
  ctx.fillRect(506, 0, 6, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates dynamic canvas texture for the math gate header
 */
export function createGateHeaderTexture(equation: string, arabicQuestion: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 240;
  const ctx = canvas.getContext('2d')!;

  // Translucent glowing dark glass background
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
  grad.addColorStop(0.5, 'rgba(30, 27, 75, 0.95)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 240);

  // Sleek cyan cyber frame
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 1012, 228);

  // Arabic prompt line
  ctx.font = 'bold 36px "Cairo", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fde047';
  ctx.shadowColor = '#eab308';
  ctx.shadowBlur = 8;
  ctx.fillText(arabicQuestion, 512, 72);

  // Crisp mathematical equation
  ctx.font = '900 85px "Outfit", "Cairo", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 18;
  ctx.fillText(`${equation} = ؟`, 512, 175);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates 3D portal answer badge texture with clean transparent background
 */
export function createOptionBadgeTexture(
  numberValue: number, 
  borderColor: string = '#38bdf8',
  isSelected?: boolean, 
  isCorrect?: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  let frameColor = borderColor;
  let textColor = '#ffffff';

  if (isSelected !== undefined) {
    if (isCorrect) {
      frameColor = '#10b981';
      textColor = '#ecfdf5';
    } else {
      frameColor = '#f43f5e';
      textColor = '#fff1f2';
    }
  }

  // Clear background with soft translucent neon dark glass
  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = 'rgba(10, 15, 30, 0.75)';
  ctx.beginPath();
  ctx.roundRect(16, 16, 224, 224, 28);
  ctx.fill();

  // Glowing neon frame
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 10;
  ctx.shadowColor = frameColor;
  ctx.shadowBlur = 16;
  ctx.stroke();

  // Clear centered bold digit
  ctx.font = '900 96px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;
  ctx.shadowColor = frameColor;
  ctx.shadowBlur = 12;
  ctx.fillText(String(numberValue), 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

