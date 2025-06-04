import { useState, useEffect } from 'react';
import { ratingLevels } from '../utils/ratingUtils';

interface RatingLevelSelectorProps {
  minRating: number;
  maxRating: number;
  onChange: (minRating: number, maxRating: number) => void;
  error?: string;
}

const RatingLevelSelector = ({ minRating, maxRating, onChange, error }: RatingLevelSelectorProps) => {
  const [selectedLevels, setSelectedLevels] = useState<boolean[]>([]);

  // Initialize selected levels based on min/max rating
  useEffect(() => {
    const newSelectedLevels = ratingLevels.map(level => {
      // A level is selected if it overlaps with the min-max range
      return level.max >= minRating && level.min <= maxRating;
    });
    setSelectedLevels(newSelectedLevels);
  }, [minRating, maxRating]);

  const handleLevelToggle = (index: number) => {
    const newSelectedLevels = [...selectedLevels];
    newSelectedLevels[index] = !newSelectedLevels[index];
    setSelectedLevels(newSelectedLevels);

    // Calculate new min and max ratings based on selected levels
    const selectedIndices = newSelectedLevels
      .map((selected, idx) => selected ? idx : -1)
      .filter(idx => idx !== -1);

    if (selectedIndices.length === 0) {
      // If nothing selected, default to Beginner
      onChange(0, 1.69);
      return;
    }

    const minIndex = Math.min(...selectedIndices);
    const maxIndex = Math.max(...selectedIndices);
    
    const newMinRating = ratingLevels[minIndex].min;
    const newMaxRating = ratingLevels[maxIndex].max;
    
    onChange(newMinRating, newMaxRating);
  };

  const getSelectedLevelsDescription = () => {
    const selectedLevelNames = ratingLevels
      .filter((_, index) => selectedLevels[index])
      .map(level => level.label);
    
    if (selectedLevelNames.length === 0) {
      return 'Не выбрано';
    }
    
    if (selectedLevelNames.length === 1) {
      return selectedLevelNames[0];
    }
    
    return `${selectedLevelNames[0]} - ${selectedLevelNames[selectedLevelNames.length - 1]}`;
  };

  return (
    <div>
      <label className="block text-gray-700 mb-2">Допустимые уровни игроков</label>
      <div className="space-y-2 p-3 border border-gray-300 rounded">
        {ratingLevels.map((level, index) => (
          <label key={index} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedLevels[index] || false}
              onChange={() => handleLevelToggle(index)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm">
              {level.label} ({level.min} - {level.max})
            </span>
          </label>
        ))}
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-gray-600">
          Выбранный диапазон: <span className="font-medium">{getSelectedLevelsDescription()}</span>
        </p>
        <p className="text-xs text-gray-500">
          Числовой диапазон: {minRating} - {maxRating}
        </p>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RatingLevelSelector; 