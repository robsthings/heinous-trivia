/**
 * Dynamic character sprite loader utility
 * Loads PNG files from /public/heinous and /public/chupacabra directories
 * Uses Vite's import.meta.glob for dynamic asset discovery
 */

// Dynamically import all PNG files from character directories
const heinousFiles = import.meta.glob('/public/heinous/*.png', { 
  eager: true, 
  as: 'url' 
});

const chupacabraFiles = import.meta.glob('/public/chupacabra/*.png', { 
  eager: true, 
  as: 'url' 
});

/**
 * Transform file paths into sprite objects with filename keys
 */
function createSpriteObject(files: Record<string, string>): Record<string, string> {
  const sprites: Record<string, string> = {};
  
  Object.keys(files).forEach(path => {
    // Extract filename without extension from full path
    // Example: "/public/heinous/charming.png" -> "charming"
    const filename = path.split('/').pop()?.replace('.png', '') || '';
    
    // Convert to relative path for use in components
    // Example: "/public/heinous/charming.png" -> "/heinous/charming.png"
    const relativePath = path.replace('/public', '');
    
    if (filename) {
      sprites[filename] = relativePath;
    }
  });
  
  return sprites;
}

// Export sprite objects for each character
export const heinousSprites = createSpriteObject(heinousFiles);
export const chupacabraSprites = createSpriteObject(chupacabraFiles);

// Character sprite registry for easy expansion
const characterRegistry: Record<string, Record<string, string>> = {
  heinous: heinousSprites,
  chupacabra: chupacabraSprites,
};

/**
 * Get character sprites by folder name
 * @param characterName - The character folder name (e.g., "heinous", "chupacabra")
 * @returns Object with sprite filenames as keys and paths as values
 */
export function getCharacterSprites(characterName: string): Record<string, string> {
  const sprites = characterRegistry[characterName.toLowerCase()];
  
  if (!sprites) {
    console.warn(`Character sprites not found for: ${characterName}`);
    return {};
  }
  
  return sprites;
}

/**
 * Get all available character names
 * @returns Array of character folder names
 */
export function getAvailableCharacters(): string[] {
  return Object.keys(characterRegistry);
}

/**
 * Get a specific sprite path by character and sprite name
 * @param characterName - The character folder name
 * @param spriteName - The sprite filename (without extension)
 * @returns The sprite path or null if not found
 */
export function getSpritePath(characterName: string, spriteName: string): string | null {
  const sprites = getCharacterSprites(characterName);
  return sprites[spriteName] || null;
}

// Development helper: Log loaded sprites in development mode
if (import.meta.env.DEV) {
  console.log('🎭 Character Loader initialized:', {
    heinous: Object.keys(heinousSprites),
    chupacabra: Object.keys(chupacabraSprites),
    totalSprites: Object.keys(heinousSprites).length + Object.keys(chupacabraSprites).length
  });
}