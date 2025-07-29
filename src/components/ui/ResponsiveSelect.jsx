import React from 'react';

function ResponsiveSelect({ label, value, onChange, options, placeholder = 'Pilih...', className = '', ...props }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000476] max-w-full truncate ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label.length > 60 ? `${opt.label.slice(0, 60)}...` : opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ResponsiveSelect;
