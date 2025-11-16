import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from './input';
import { cn } from '../../lib/utils';

interface Suggestion {
  value: string;
  label: string;
}

interface InputWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions: Suggestion[];
  className?: string;
}

export const InputWithSuggestions: React.FC<InputWithSuggestionsProps> = ({
  value,
  onChange,
  placeholder,
  suggestions,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.value.toLowerCase().includes(value.toLowerCase()) ||
        suggestion.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(suggestions);
    }
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleWindowResize = () => {
      // Recalculate dropdown position on resize
      if (isOpen && containerRef.current) {
        const inputRect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = Math.min(192, filteredSuggestions.length * 40 + 8);

        const spaceBelow = viewportHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;
        const hasSpaceBelow = spaceBelow >= dropdownHeight + 8;
        const hasSpaceAbove = spaceAbove >= dropdownHeight + 8;

        let top: number;
        if (hasSpaceAbove) {
          top = inputRect.top + window.scrollY - dropdownHeight - 4;
        } else if (hasSpaceBelow) {
          top = inputRect.bottom + window.scrollY + 4;
        } else {
          top = inputRect.top + window.scrollY - dropdownHeight - 4;
        }

        setDropdownStyle({
          top: `${top}px`,
          left: `${inputRect.left + window.scrollX}px`,
          width: `${inputRect.width}px`
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('scroll', handleWindowResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('scroll', handleWindowResize);
    };
  }, [isOpen, filteredSuggestions.length]);

  useEffect(() => {
    if (isOpen && containerRef.current && dropdownRef.current) {
      const inputRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = Math.min(192, filteredSuggestions.length * 40 + 8); // max-h-48 = 192px, ~40px per item + padding

      // Check if there's enough space below
      const spaceBelow = viewportHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;
      const hasSpaceBelow = spaceBelow >= dropdownHeight + 8;
      const hasSpaceAbove = spaceAbove >= dropdownHeight + 8;

      // Calculate position - prefer above if there's space, otherwise go below
      let top: number;
      if (hasSpaceAbove) {
        // Position above the input
        top = inputRect.top + window.scrollY - dropdownHeight - 4;
      } else if (hasSpaceBelow) {
        // Position below the input
        top = inputRect.bottom + window.scrollY + 4;
      } else {
        // If no space either way, position above anyway
        top = inputRect.top + window.scrollY - dropdownHeight - 4;
      }

      setDropdownStyle({
        top: `${top}px`,
        left: `${inputRect.left + window.scrollX}px`,
        width: `${inputRect.width}px`
      });
    }
  }, [isOpen, filteredSuggestions.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.value);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (!value) {
      setFilteredSuggestions(suggestions);
    }
    setIsOpen(true);
  };

  const dropdown = isOpen && filteredSuggestions.length > 0 && (
    <>
      {/* Backdrop to prevent interaction with elements behind */}
      <div
        className="fixed inset-0 z-[9998] bg-transparent"
        onClick={() => setIsOpen(false)}
      />

      {/* Dropdown rendered via portal - outside parent container to prevent clipping */}
      <div
        ref={dropdownRef}
        className="fixed bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-[9999]"
        style={dropdownStyle}
      >
        {filteredSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
          >
            <div className="font-medium text-sm text-gray-900">
              {suggestion.value}
            </div>
            <div className="text-xs text-gray-500">
              {suggestion.label}
            </div>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className={className}
      />

      {createPortal(dropdown, document.body)}
    </div>
  );
};