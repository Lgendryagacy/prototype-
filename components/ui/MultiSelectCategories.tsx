import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Plus } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';
import { BRAND_CATEGORIES } from '../../constants/brandCategories';

interface MultiSelectCategoriesProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
  className?: string;
}

export const MultiSelectCategories: React.FC<MultiSelectCategoriesProps> = ({
  selectedCategories,
  onCategoriesChange,
  maxSelections = 3,
  placeholder = "Select categories",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      // Remove category
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else if (selectedCategories.length < maxSelections) {
      // Add category if under limit
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const removeCategory = (category: string) => {
    onCategoriesChange(selectedCategories.filter(c => c !== category));
  };

  const handleAddCustomCategory = () => {
    const trimmedCategory = customCategory.trim();
    
    if (!trimmedCategory) return;
    
    if (selectedCategories.length >= maxSelections) {
      return;
    }
    
    // Check if category already exists (case-insensitive)
    const categoryExists = selectedCategories.some(
      cat => cat.toLowerCase() === trimmedCategory.toLowerCase()
    ) || BRAND_CATEGORIES.some(
      cat => cat.toLowerCase() === trimmedCategory.toLowerCase()
    );
    
    if (categoryExists) {
      // Category already exists, just add it if not selected
      if (!selectedCategories.includes(trimmedCategory)) {
        onCategoriesChange([...selectedCategories, trimmedCategory]);
      }
    } else {
      // Add new custom category
      onCategoriesChange([...selectedCategories, trimmedCategory]);
    }
    
    setCustomCategory('');
    setShowCustomInput(false);
  };

  const availableCategories = BRAND_CATEGORIES.filter(cat => !selectedCategories.includes(cat));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Categories Display */}
      {selectedCategories.length > 0 && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-[--color-text] mb-2">
            Selected Categories ({selectedCategories.length}/{maxSelections})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="flex items-center gap-1 bg-[--color-primary]/20 text-[--color-primary] border-[--color-primary]/30"
              >
                {category}
                <button
                  onClick={() => removeCategory(category)}
                  className="ml-1 hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                  type="button"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Dropdown Trigger */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          disabled={selectedCategories.length >= maxSelections}
          className="w-full justify-between bg-[--color-card] border-[--color-border] text-[--color-text] hover:bg-[--color-card-hover] disabled:opacity-50"
        >
          <span className="text-left">
            {selectedCategories.length === 0 
              ? placeholder 
              : selectedCategories.length >= maxSelections 
              ? `Maximum ${maxSelections} categories selected`
              : `Add more categories (${maxSelections - selectedCategories.length} remaining)`
            }
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[--color-card] border border-[--color-border] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-[--color-text-secondary] mb-2 px-2">
                Select up to {maxSelections} categories for your brand
              </div>
              
              {/* Custom Category Input */}
              {showCustomInput ? (
                <div className="mb-2 p-2 border border-[--color-border] rounded-md">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomCategory();
                        }
                      }}
                      placeholder="Enter custom category..."
                      className="flex-1 h-8 text-sm"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomCategory}
                      disabled={!customCategory.trim()}
                      className="h-8 px-3"
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomCategory('');
                      }}
                      className="h-8 px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-[--color-text-secondary] mt-1">
                    Press Enter or click Add to create custom category
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  disabled={selectedCategories.length >= maxSelections}
                  className="w-full text-left px-3 py-2 text-sm text-[--color-primary] hover:bg-[--color-hover] rounded-md transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Category
                </button>
              )}
              
              {/* Predefined Categories */}
              {availableCategories.length > 0 && (
                <>
                  <div className="text-xs text-[--color-text-secondary] mt-3 mb-2 px-2">
                    Or select from predefined categories:
                  </div>
                  {availableCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className="w-full text-left px-3 py-2 text-sm text-[--color-text] hover:bg-[--color-hover] rounded-md transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </>
              )}
              
              {availableCategories.length === 0 && !showCustomInput && (
                <div className="text-center py-2 text-xs text-[--color-text-secondary]">
                  All predefined categories selected
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="mt-1 text-xs text-[--color-text-secondary]">
        {selectedCategories.length === 0 && "Choose categories that best describe your brand's services"}
        {selectedCategories.length > 0 && selectedCategories.length < maxSelections && 
          `You can select ${maxSelections - selectedCategories.length} more categor${maxSelections - selectedCategories.length === 1 ? 'y' : 'ies'}`
        }
        {selectedCategories.length >= maxSelections && "Maximum categories selected"}
      </div>
    </div>
  );
};

export default MultiSelectCategories;