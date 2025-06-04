import React from 'react';
import { ratingLevels } from '../utils/ratingUtils';

interface RatingSelectorProps {
  value: number | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  label: string;
  error?: string;
  className?: string;
  type?: 'min' | 'max';
}

const RatingSelector: React.FC<RatingSelectorProps> = ({
  value,
  onChange,
  name,
  label,
  error,
  className = '',
  type = 'min',
}) => {
  // Find the best match for the current value
  const getBestMatchRating = (val: number | undefined): number => {
    if (val === undefined) {
      return type === 'min' ? ratingLevels[0].min : ratingLevels[0].max;
    }
    
    // Find the closest rating level that doesn't exceed the given value
    for (let i = ratingLevels.length - 1; i >= 0; i--) {
      if (val >= ratingLevels[i].min) {
        return type === 'min' ? ratingLevels[i].min : ratingLevels[i].max;
      }
    }
    
    return type === 'min' ? ratingLevels[0].min : ratingLevels[0].max;
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
        {ratingLevels.map((level) => {
          const displayValue = type === 'min' ? level.min : level.max;
          return (
            <option key={level.label} value={displayValue}>
              {level.label} ({type === 'min' ? `от ${level.min}` : `до ${level.max}`})
            </option>
          );
        })}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RatingSelector; 