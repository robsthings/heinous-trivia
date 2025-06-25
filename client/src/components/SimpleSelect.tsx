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
        className="w-full  border border-gray-600 rounded px-3 py-2 text-left text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500" className="bg-gray-800"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1  border border-gray-600 rounded shadow-lg" style={{backgroundColor: "#111827"}}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              style={{ 
                width: '100%',
                padding: '0.5rem 0.75rem',
                textAlign: 'left',
                color: '#ffffff',
                backgroundColor: 'rgb(17, 24, 39)',
                border: 'none',
                borderBottom: '1px solid rgb(55, 65, 81)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(17, 24, 39)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(17, 24, 39)';
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