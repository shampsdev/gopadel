import React from "react";

type RatingSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  title: string;
  className?: string;
};

interface RatingOption {
  label: string;
  value: string;
  min: number;
}

// Rating options with their minimum values
const ratingOptions: RatingOption[] = [
  { label: "Beginner", value: "1.0", min: 0 },
  { label: "Upper Beginner", value: "2.0", min: 1.7 },
  { label: "Intermediate", value: "3.0", min: 2.7 },
  { label: "Upper Intermediate", value: "4.0", min: 3.5 },
  { label: "Advanced", value: "5.0", min: 4.5 },
  { label: "Pro", value: "6.5", min: 6.0 }
];

const RatingSelector: React.FC<RatingSelectorProps> = ({
  value,
  onChange,
  title,
  className = "",
}) => {
  // Find the appropriate rating option based on numerical value
  const getCurrentRatingOption = (numValue: number): RatingOption => {
    for (let i = ratingOptions.length - 1; i >= 0; i--) {
      if (numValue >= ratingOptions[i].min) {
        return ratingOptions[i];
      }
    }
    return ratingOptions[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const numValue = parseFloat(value) || 0;
  const currentOption = getCurrentRatingOption(numValue);

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">{title}</label>
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        value={currentOption.value}
        onChange={handleChange}
      >
        {ratingOptions.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label} (от {option.min})
          </option>
        ))}
      </select>
    </div>
  );
};

export default RatingSelector; 