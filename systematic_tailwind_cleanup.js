#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// System to convert most common Tailwind classes to inline styles
const classMap = {
  // Layout
  'flex': 'display: "flex"',
  'flex-col': 'flexDirection: "column"',
  'flex-row': 'flexDirection: "row"',
  'grid': 'display: "grid"',
  'block': 'display: "block"',
  'hidden': 'display: "none"',
  'inline': 'display: "inline"',
  'inline-block': 'display: "inline-block"',
  
  // Positioning
  'absolute': 'position: "absolute"',
  'relative': 'position: "relative"',
  'fixed': 'position: "fixed"',
  'static': 'position: "static"',
  'sticky': 'position: "sticky"',
  
  // Flex alignment
  'items-center': 'alignItems: "center"',
  'items-start': 'alignItems: "flex-start"',
  'items-end': 'alignItems: "flex-end"',
  'justify-center': 'justifyContent: "center"',
  'justify-between': 'justifyContent: "space-between"',
  'justify-start': 'justifyContent: "flex-start"',
  'justify-end': 'justifyContent: "flex-end"',
  
  // Text alignment
  'text-center': 'textAlign: "center"',
  'text-left': 'textAlign: "left"',
  'text-right': 'textAlign: "right"',
  
  // Colors
  'text-white': 'color: "white"',
  'text-black': 'color: "black"',
  'text-gray-100': 'color: "#f3f4f6"',
  'text-gray-200': 'color: "#e5e7eb"',
  'text-gray-300': 'color: "#d1d5db"',
  'text-gray-400': 'color: "#9ca3af"',
  'text-gray-500': 'color: "#6b7280"',
  'text-gray-600': 'color: "#4b5563"',
  'text-gray-700': 'color: "#374151"',
  'text-gray-800': 'color: "#1f2937"',
  'text-gray-900': 'color: "#111827"',
  'text-red-400': 'color: "#f87171"',
  'text-red-500': 'color: "#ef4444"',
  'text-orange-400': 'color: "#fb923c"',
  'text-orange-500': 'color: "#f97316"',
  'text-purple-300': 'color: "#d8b4fe"',
  'text-purple-400': 'color: "#c084fc"',
  
  // Background colors
  'bg-white': 'backgroundColor: "white"',
  'bg-black': 'backgroundColor: "black"',
  'bg-gray-800': 'backgroundColor: "#1f2937"',
  'bg-gray-900': 'backgroundColor: "#111827"',
  'bg-purple-900': 'backgroundColor: "#581c87"',
  'bg-red-500': 'backgroundColor: "#ef4444"',
  
  // Sizing
  'w-full': 'width: "100%"',
  'w-auto': 'width: "auto"',
  'h-full': 'height: "100%"',
  'h-auto': 'height: "auto"',
  'min-h-screen': 'minHeight: "100vh"',
  'max-w-sm': 'maxWidth: "24rem"',
  'max-w-md': 'maxWidth: "28rem"',
  'max-w-lg': 'maxWidth: "32rem"',
  'max-w-xl': 'maxWidth: "36rem"',
  
  // Spacing
  'p-2': 'padding: "0.5rem"',
  'p-3': 'padding: "0.75rem"',
  'p-4': 'padding: "1rem"',
  'p-6': 'padding: "1.5rem"',
  'p-8': 'padding: "2rem"',
  'px-4': 'paddingLeft: "1rem", paddingRight: "1rem"',
  'py-4': 'paddingTop: "1rem", paddingBottom: "1rem"',
  'm-2': 'margin: "0.5rem"',
  'm-4': 'margin: "1rem"',
  'mb-2': 'marginBottom: "0.5rem"',
  'mb-4': 'marginBottom: "1rem"',
  'mb-6': 'marginBottom: "1.5rem"',
  'mt-2': 'marginTop: "0.5rem"',
  'mt-4': 'marginTop: "1rem"',
  'mx-auto': 'marginLeft: "auto", marginRight: "auto"',
  
  // Borders
  'border': 'border: "1px solid #e5e7eb"',
  'border-gray-700': 'borderColor: "#374151"',
  'border-purple-300': 'borderColor: "#d8b4fe"',
  'rounded': 'borderRadius: "0.25rem"',
  'rounded-lg': 'borderRadius: "0.5rem"',
  'rounded-xl': 'borderRadius: "0.75rem"',
  'rounded-full': 'borderRadius: "50%"',
  
  // Font sizes
  'text-xs': 'fontSize: "0.75rem"',
  'text-sm': 'fontSize: "0.875rem"',
  'text-base': 'fontSize: "1rem"',
  'text-lg': 'fontSize: "1.125rem"',
  'text-xl': 'fontSize: "1.25rem"',
  'text-2xl': 'fontSize: "1.5rem"',
  'text-3xl': 'fontSize: "1.875rem"',
  'text-4xl': 'fontSize: "2.25rem"',
  
  // Font weights
  'font-medium': 'fontWeight: "500"',
  'font-bold': 'fontWeight: "bold"',
  
  // Opacity
  'opacity-50': 'opacity: 0.5',
  'opacity-75': 'opacity: 0.75',
  
  // Z-index
  'z-50': 'zIndex: 50'
};

function convertClassesToInlineStyles(content) {
  // Extract all className attributes
  const classNameRegex = /className="([^"]*)"/g;
  
  return content.replace(classNameRegex, (match, classes) => {
    const classList = classes.split(/\s+/).filter(Boolean);
    const preservedClasses = [];
    const styleProps = [];
    
    classList.forEach(cls => {
      if (classMap[cls]) {
        styleProps.push(classMap[cls]);
      } else if (cls.includes('creepster') || cls.includes('nosifer') || cls.includes('glass-card') || 
                 cls.includes('animate-') || cls.includes('eater')) {
        // Preserve custom classes
        preservedClasses.push(cls);
      }
      // Skip unrecognized Tailwind classes
    });
    
    let result = '';
    if (preservedClasses.length > 0) {
      result += `className="${preservedClasses.join(' ')}"`;
    }
    if (styleProps.length > 0) {
      if (result) result += ' ';
      result += `style={{${styleProps.join(', ')}}}`;
    }
    
    return result || '';
  });
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = convertClassesToInlineStyles(content);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`Updated: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && file.name !== 'node_modules' && file.name !== '.git') {
      processDirectory(fullPath);
    } else if (file.isFile() && file.name.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

// Start processing
processDirectory('./client/src');
console.log('Systematic Tailwind cleanup complete!');