export const stripHtmlTags = (input: string): string => {
  return input.replace(/<[^>]*>/g, "");
};
