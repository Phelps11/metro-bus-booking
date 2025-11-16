import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  className,
  disabled = false
}) => {
  return (
    <label className={cn("flex items-center space-x-2 cursor-pointer", className)}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
            checked
              ? "bg-green-600 border-green-600"
              : "border-gray-300 bg-white hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {checked && <Check size={12} className="text-white" />}
        </div>
      </div>
      {label && (
        <span className={cn(
          "text-sm text-gray-700",
          disabled && "opacity-50"
        )}>
          {label}
        </span>
      )}
    </label>
  );
};