import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";

export const CreateGame = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });
  return <div>Coming soon</div>;
};
