import React, { useState, useRef, useEffect } from 'react';
import { Tone } from '../types/types';

interface CustomSelectProps {
  value: Tone;
  onChange: (value: Tone) => void;
  options: Tone[];
  disabled?: boolean;
  id?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, disabled = false, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (option: Tone) => {
    onChange(option);
    setIsOpen(false);
  };

  const getToneIcon = (tone: Tone) => {
    const icons: Record<Tone, string> = {
      [Tone.PROFESSIONAL]: '💼',
      [Tone.CASUAL]: '😊',
      [Tone.ENTHUSIASTIC]: '🎉',
      [Tone.INFORMATIVE]: '📚',
      [Tone.HUMOROUS]: '😄',
      [Tone.PERSUASIVE]: '🎯',
    };
    return icons[tone] || '📝';
  };

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full bg-slate-900 border border-slate-600 rounded-lg p-3
          flex items-center justify-between
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500 cursor-pointer'}
          ${isOpen ? 'ring-2 ring-purple-500 border-purple-500' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{getToneIcon(value)}</span>
          <span className="text-slate-200">{value}</span>
        </span>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden animate-fade-in"
          role="listbox"
        >
          <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-full px-4 py-3 text-left flex items-center gap-3
                  transition-colors duration-150
                  ${value === option 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-200 hover:bg-slate-700'
                  }
                `}
                role="option"
                aria-selected={value === option}
              >
                <span className="text-lg">{getToneIcon(option)}</span>
                <span className="flex-grow">{option}</span>
                {value === option && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
