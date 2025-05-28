import React from 'react';
import { ratingLevels } from '../utils/ratingUtils';

interface RatingSelectorProps {
  value: number | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  label: string;
  error?: string;
  className?: string;
}

const RatingSelector: React.FC<RatingSelectorProps> = ({
  value,
  onChange,
  name,
  label,
  error,
  className = '',
}) => {
  // Find the best match for the current value
  const getBestMatchRating = (val: number | undefined): number => {
    if (val === undefined) return 1.0;
    
    // Find the closest rating level that doesn't exceed the given value
    for (let i = ratingLevels.length - 1; i >= 0; i--) {
      if (val >= ratingLevels[i].min) {
        return ratingLevels[i].value;
      }
    }
    
    return ratingLevels[0].value;
  };

  const bestMatchValue = getBestMatchRating(value);

  return (
    <div className={className}>
      <label className="block text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={bestMatchValue}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        {ratingLevels.map((level) => (
          <option key={level.label} value={level.value}>
            {level.label} (от {level.min})
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RatingSelector; 