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
 * Rating level definitions with min values
 */
export const ratingLevels = [
  { label: "Beginner", value: 1.0, min: 0 },
  { label: "Upper Beginner", value: 2.0, min: 1.7 },
  { label: "Intermediate", value: 3.0, min: 2.7 },
  { label: "Upper Intermediate", value: 4.0, min: 3.5 },
  { label: "Advanced", value: 5.5, min: 4.5 },
  { label: "Pro", value: 6.5, min: 6.0 }
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