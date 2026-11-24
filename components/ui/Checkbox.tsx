import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }
>(({ className, checked, onCheckedChange, ...props }, ref) => {
  const [internalChecked, setInternalChecked] = React.useState(checked || false);
  
  const handleToggle = () => {
    const newState = !internalChecked;
    setInternalChecked(newState);
    if (onCheckedChange) {
      onCheckedChange(newState);
    }
  };

  React.useEffect(() => {
    if (checked !== undefined) {
      setInternalChecked(checked);
    }
  }, [checked]);

  return (
    <button
      ref={ref}
      role="checkbox"
      aria-checked={internalChecked}
      onClick={handleToggle}
      className={`peer h-4 w-4 shrink-0 rounded-sm border border-[--color-primary] ring-offset-[--color-bg-primary] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${internalChecked ? 'bg-[--color-primary] text-white' : 'bg-transparent'} ${className}`}
      {...props}
    >
      {internalChecked && <Check className="h-4 w-4" />}
    </button>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
