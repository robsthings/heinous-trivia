/**
 * Dynamic character sprite loader utility
 * Loads PNG files from /public/heinous and /public/chupacabra directories
 * Uses Vite's import.meta.glob for dynamic asset discovery
 */

// Dynamically import all PNG files from character directories
const heinousFiles = import.meta.glob('/public/heinous/*.png', { 
  eager: true, 
  query: '?url',
  import: 'default'
}) as Record<string, string>;

const chupacabraFiles = import.meta.glob('/public/chupacabra/*.png', { 
  eager: true, 
  query: '?url',
  import: 'default'
}) as Record<string, string>;

/**
 * Transform file paths into sprite objects with filename keys
 */
function createSpriteObject(files: Record<string, string>): Record<string, string> {
  const sprites: Record<string, string> = {};
  
  Object.entries(files).forEach(([path, url]) => {
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

/**
 * Load all character sprites and return organized by character
 * @returns Promise that resolves to character sprites object
 */
export async function loadCharacterSprites(): Promise<Record<string, Record<string, string>>> {
  return characterRegistry;
}

// Character loader initialized - debug logging removed for production performance