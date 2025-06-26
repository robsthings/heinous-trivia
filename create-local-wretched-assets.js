/**
 * Create Local Wretched Wiring Assets
 * Creates missing SVG assets as PNG files in the local public directory
 */

import fs from 'fs';
import path from 'path';

const assetsDir = 'client/public/sidequests/wretched-wiring';

// Ensure directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// SVG content for different assets
const wireRedStraight = `<svg width="100" height="20" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ef4444;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="0" y="6" width="100" height="8" fill="url(#redGradient)" rx="4"/>
  <rect x="0" y="8" width="100" height="4" fill="#fca5a5" opacity="0.6" rx="2"/>
</svg>`;

const wireBlueStraight = `<svg width="100" height="20" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="0" y="6" width="100" height="8" fill="url(#blueGradient)" rx="4"/>
  <rect x="0" y="8" width="100" height="4" fill="#93c5fd" opacity="0.6" rx="2"/>
</svg>`;

const wireRedCurved = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="redCurvedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M 10 50 Q 50 10 90 50" stroke="url(#redCurvedGradient)" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M 10 50 Q 50 10 90 50" stroke="#fca5a5" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6"/>
</svg>`;

const wireBlueCurved = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blueCurvedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="M 10 50 Q 50 10 90 50" stroke="url(#blueCurvedGradient)" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M 10 50 Q 50 10 90 50" stroke="#93c5fd" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6"/>
</svg>`;

const nodeRedLeft = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="redTerminal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="48" height="48" fill="url(#redTerminal)" rx="4" stroke="#6b7280" stroke-width="2"/>
  <circle cx="32" cy="32" r="12" fill="#dc2626" opacity="0.8"/>
  <circle cx="32" cy="32" r="6" fill="#fca5a5"/>
  <text x="32" y="37" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">R</text>
</svg>`;

const nodeBlueLeft = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blueTerminal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#374151;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="48" height="48" fill="url(#blueTerminal)" rx="4" stroke="#6b7280" stroke-width="2"/>
  <circle cx="32" cy="32" r="12" fill="#2563eb" opacity="0.8"/>
  <circle cx="32" cy="32" r="6" fill="#93c5fd"/>
  <text x="32" y="37" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">B</text>
</svg>`;

const pullChain = `<svg width="32" height="80" viewBox="0 0 32 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="chainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="14" y="0" width="4" height="60" fill="url(#chainGradient)"/>
  <circle cx="16" cy="70" r="8" fill="url(#chainGradient)" stroke="#92400e" stroke-width="2"/>
  <text x="16" y="75" text-anchor="middle" fill="#1f2937" font-size="6" font-weight="bold">PULL</text>
</svg>`;

const certificate = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="certGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="380" height="280" fill="url(#certGradient)" rx="10" stroke="#92400e" stroke-width="3"/>
  <text x="200" y="50" text-anchor="middle" fill="#92400e" font-size="20" font-weight="bold">CERTIFICATE OF FAILURE</text>
  <text x="200" y="100" text-anchor="middle" fill="#1f2937" font-size="14">Awarded to:</text>
  <text x="200" y="130" text-anchor="middle" fill="#1f2937" font-size="16" font-weight="bold">WRETCHED WIRE WARRIOR</text>
  <text x="200" y="170" text-anchor="middle" fill="#1f2937" font-size="12">For outstanding achievement in</text>
  <text x="200" y="190" text-anchor="middle" fill="#1f2937" font-size="12">Making Everything Worse</text>
  <text x="200" y="240" text-anchor="middle" fill="#92400e" font-size="10">Dr. Heinous, Chief of Chaos</text>
</svg>`;

// Asset mapping
const assets = {
  'wire-red-straight.png': wireRedStraight,
  'wire-blue-straight.png': wireBlueStraight,
  'wire-red-curved.png': wireRedCurved,
  'wire-blue-curved.png': wireBlueCurved,
  'node-red-left.png': nodeRedLeft,
  'node-blue-left.png': nodeBlueLeft,
  'node-red-right.png': nodeRedLeft, // Same as left for now
  'node-blue-right.png': nodeBlueLeft, // Same as left for now
  'Pull-Chain.png': pullChain,
  'Certificate-of-Failure.png': certificate
};

// Create assets
console.log('Creating local Wretched Wiring assets...');

Object.entries(assets).forEach(([filename, svgContent]) => {
  const filePath = path.join(assetsDir, filename);
  fs.writeFileSync(filePath, svgContent);
  console.log(`✓ Created: ${filePath}`);
});

console.log(`\nCreated ${Object.keys(assets).length} asset files in ${assetsDir}`);