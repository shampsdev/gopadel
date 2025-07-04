/**
 * Converts numerical rating value to word representation
 * @param rating Numerical rating value
 * @returns String representation of the rating with original value in parentheses
 */
export function getRatingWord(rating: number): string {
  if (rating >= 0 && rating < 1.7) {
    return `Beginner (${rating})`;
  } else if (rating >= 1.7 && rating < 2.7) {
    return `Upper Beginner (${rating})`;
  } else if (rating >= 2.7 && rating < 3.5) {
    return `Intermediate (${rating})`;
  } else if (rating >= 3.5 && rating < 4.5) {
    return `Upper Intermediate (${rating})`;
  } else if (rating >= 4.5 && rating < 6.0) {
    return `Advanced (${rating})`;
  } else if (rating >= 6.0) {
    return `Pro (${rating})`;
  } else {
    return `${rating}`;
  }
}

/**
 * Gets the rating level name without the numerical value
 * @param rating Numerical rating value
 * @returns String representation of the rating level only
 */
export function getRatingLevelName(rating: number): string {
  if (rating >= 0 && rating < 1.7) {
    return "Beginner";
  } else if (rating >= 1.7 && rating < 2.7) {
    return "Upper Beginner";
  } else if (rating >= 2.7 && rating < 3.5) {
    return "Intermediate";
  } else if (rating >= 3.5 && rating < 4.5) {
    return "Upper Intermediate";
  } else if (rating >= 4.5 && rating < 6.0) {
    return "Advanced";
  } else if (rating >= 6.0) {
    return "Pro";
  } else {
    return `${rating}`;
  }
}

/**
 * Gets a description of a rating range for tournaments
 * @param minRating Minimum rating value
 * @param maxRating Maximum rating value
 * @returns String description of the rating range
 */
export function getRatingRangeDescription(minRating: number, maxRating: number): string {
  const minLevel = getRatingLevelName(minRating);
  const maxLevel = getRatingLevelName(maxRating);
  
  if (minLevel === maxLevel) {
    return `${minLevel}`;
  }
  
  return `${minLevel} - ${maxLevel}`;
}

/**
 * Rating level definitions with min and max values
 */
export const ratingLevels = [
  { label: "Beginner", value: 0.85, min: 0, max: 1.69 },
  { label: "Upper Beginner", value: 2.2, min: 1.7, max: 2.69 },
  { label: "Intermediate", value: 3.1, min: 2.7, max: 3.49 },
  { label: "Upper Intermediate", value: 4.0, min: 3.5, max: 4.49 },
  { label: "Advanced", value: 5.25, min: 4.5, max: 5.99 },
  { label: "Pro", value: 6.5, min: 6.0, max: 7.0 }
];

/**
 * Converts playing position to Russian text
 * @param position Playing position value
 * @returns String representation of the playing position in Russian
 */
export function getPlayingPositionText(position: string): string {
  switch (position) {
    case 'right':
      return 'В правом';
    case 'left':
      return 'В левом';
    case 'both':
      return 'В обоих';
    default:
      return position;
  }
}

/**
 * Finds the rating level by its value
 * @param value Rating value
 * @returns Rating level object or null if not found
 */
export function getRatingLevelByValue(value: number) {
  return ratingLevels.find(level => 
    value >= level.min && value <= level.max
  );
} 