import { useState } from 'react';

interface SimpleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export function SimpleSelect({ 
  value, 
  onValueChange, 
  options, 
  placeholder = "Select...", 
  className = "" 
}: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-left text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-600 rounded shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 first:rounded-t last:rounded-b border-b border-gray-700 last:border-b-0"
              style={{ 
                backgroundColor: 'rgb(17, 24, 39)', 
                color: 'white',
                borderColor: 'rgb(55, 65, 81)'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}