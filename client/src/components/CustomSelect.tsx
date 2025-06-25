import React, { useState, useRef, useEffect } from 'react';
import { Crown, Zap, Gem, ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onValueChange, options, placeholder, className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={selectRef} style={{ position: 'relative' }} className={className}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          backgroundColor: '#1f2937',
          border: '1px solid #4b5563',
          color: '#ffffff',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#374151';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1f2937';
        }}
      >
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown style={{
          height: '1rem',
          width: '1rem',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1  border border-gray-600 rounded-md shadow-lg z-50 overflow-hidden" className="bg-gray-800">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 transition-colors   gap-2" style={{alignItems: "center"}} style={{display: "flex"}}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Predefined tier options
export const tierOptions: SelectOption[] = [
  {
    value: 'basic',
    label: 'Basic (5 questions, 3 ads)',
    icon: <Crown className="h-4 w-4" />
  },
  {
    value: 'pro',
    label: 'Pro (15 questions, 5 ads)',
    icon: <Zap className="h-4 w-4" />
  },
  {
    value: 'premium',
    label: 'Premium (50 questions, 10 ads)',
    icon: <Gem className="h-4 w-4" />
  }
];