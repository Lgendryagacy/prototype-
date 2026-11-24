import React from 'react';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, setEnabled }) => {
  return (
    <div className="flex items-center space-x-4">
        <button 
            onClick={() => setEnabled(false)} 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${!enabled ? 'bg-slate-700 text-white' : 'bg-transparent text-gray-400 hover:bg-slate-700/50'}`}
        >
            Enabled
        </button>
        <button
            type="button"
            className={`${
                enabled ? 'bg-blue-600' : 'bg-slate-600'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            >
            <span
                aria-hidden="true"
                className={`${
                enabled ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
         <button 
            onClick={() => setEnabled(true)} 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${enabled ? 'bg-slate-700 text-white' : 'bg-transparent text-gray-400 hover:bg-slate-700/50'}`}
        >
            Disabled
        </button>
    </div>
  );
};

export default ToggleSwitch;
