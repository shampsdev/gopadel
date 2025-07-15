import { twMerge } from "tailwind-merge";
import { wrapLinksInText } from "../../utils/links-wrapper";

export const LinksWrapper: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  const elements = wrapLinksInText(text);

  return <span className={twMerge("no-underline", className)}>{elements}</span>;
};
