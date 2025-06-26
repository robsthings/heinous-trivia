/**
 * Fix Wretched Wiring Asset Mappings
 * Add missing terminal node assets to both asset mapping locations in server/routes.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixAssetMappings() {
  const routesPath = path.join(__dirname, 'server', 'routes.ts');
  let content = fs.readFileSync(routesPath, 'utf8');
  
  // Terminal node assets to add
  const terminalAssets = `          'node-red-left': '/sidequests/wretched-wiring/node-red-left.png',
          'node-red-right': '/sidequests/wretched-wiring/node-red-right.png',
          'node-blue-left': '/sidequests/wretched-wiring/node-blue-left.png',
          'node-blue-right': '/sidequests/wretched-wiring/node-blue-right.png',`;

  // Find and replace both wretched-wiring asset mappings
  const regex = /('wire-blue-4': '\/sidequests\/wretched-wiring\/wire-blue-4\.png',)\s*('wretched-wiring-bg')/g;
  
  content = content.replace(regex, `$1\n${terminalAssets}\n          $2`);
  
  fs.writeFileSync(routesPath, content, 'utf8');
  console.log('✅ Added terminal node assets to both wretched-wiring asset mappings');
}

fixAssetMappings();