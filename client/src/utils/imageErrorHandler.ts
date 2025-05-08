import DevImage from "../assets/dev.png";
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>
) => {
  const target = event.currentTarget;
  if (target.src !== DevImage) {
    target.src = DevImage;
  }
};
