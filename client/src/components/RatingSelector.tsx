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
  const isEmpty = !value;

  const getBorderColor = () => {
    if (isEmpty) return "border-[#E53935] text-[#E53935]"
    return "border-gray-300 text-gray-400 focus-within:border-[#20C86E] focus-within:text-[#20C86E]"
  };

  return (
    <section className={className}>
      <fieldset
        className={`border-2 rounded-xl px-3 relative transition-all duration-100 
          ${getBorderColor()} 
          `}
      >
        <legend className="px-2 text-[15px] font-semibold transition-all duration-100">
          {title}
        </legend>
        <div className="relative">
          <select
            className="w-full text-main outline-none pb-[12px] py-[3px] px-[16px] bg-transparent appearance-none cursor-pointer pr-8"
            value={currentOption.value}
            onChange={handleChange}
          >
            {ratingOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label} (от {option.min})
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </fieldset>
    </section>
  );
};

export default RatingSelector;