/**
 * Development Environment Select Override
 * 
 * Forces white text on Radix UI Select dropdowns in development environment
 * where CSS layer specificity conflicts prevent proper styling
 */

export function forceSelectStyling() {
  if (typeof window === 'undefined') return;
  
  // Create a style element for development overrides
  const styleId = 'dev-select-override';
  
  // Remove existing override if present
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    /* Development Environment Select Override */
    [data-radix-select-content] {
      background-color: rgb(31, 41, 55) !important;
      border: 1px solid rgb(75, 85, 99) !important;
    }
    
    [data-radix-select-item] {
      color: white !important;
      background-color: transparent !important;
    }
    
    [data-radix-select-item]:hover {
      background-color: rgb(55, 65, 81) !important;
      color: white !important;
    }
    
    [data-radix-select-item][data-highlighted] {
      background-color: rgb(55, 65, 81) !important;
      color: white !important;
    }
    
    [data-radix-select-item] * {
      color: white !important;
    }
    
    [data-radix-select-item-text] {
      color: white !important;
    }
  `;
  
  document.head.appendChild(style);
  
  // Also apply styles directly to any existing elements
  const applyDirectStyling = () => {
    const selectItems = document.querySelectorAll('[data-radix-select-item]');
    selectItems.forEach((item: any) => {
      item.style.color = 'white';
      item.style.setProperty('color', 'white', 'important');
      
      // Style child elements
      const children = item.querySelectorAll('*');
      children.forEach((child: any) => {
        child.style.color = 'white';
        child.style.setProperty('color', 'white', 'important');
      });
    });
    
    const selectContent = document.querySelectorAll('[data-radix-select-content]');
    selectContent.forEach((content: any) => {
      content.style.backgroundColor = 'rgb(31, 41, 55)';
      content.style.border = '1px solid rgb(75, 85, 99)';
    });
  };
  
  // Apply immediately
  applyDirectStyling();
  
  // Also apply when DOM changes
  const observer = new MutationObserver(() => {
    applyDirectStyling();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-radix-select-item', 'data-radix-select-content']
  });
  
  return () => observer.disconnect();
}