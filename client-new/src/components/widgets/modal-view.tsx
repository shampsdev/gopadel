import { useModalStore } from "../../shared/stores/modal.store";
import { Button } from "../ui/button";

export const ModalView = () => {
  const {
    closeModal,
    title,
    subtitle,
    declineButtonText,
    acceptButtonText,
    declineButtonOnClick,
    acceptButtonOnClick,
  } = useModalStore();

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center">
      <div className="flex flex-col bg-white py-[32px] px-[28px] rounded-[30px] items-center justify-center w-[80%] mx-auto gap-[27px]">
        <div className="flex flex-col items-center justify-center text-center gap-[8px]">
          <p className="text-[16px]">{title}</p>
          <p className="text-[#868D98] text-[14px]">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-[16px]">
          <Button
            className="bg-[#FF5053] text-white w-full justify-center text-center "
            onClick={() => {
              acceptButtonOnClick();
              closeModal();
            }}
          >
            {acceptButtonText}
          </Button>
          <Button
            className="bg-[#F8F8FA] text-black w-full justify-center text-center"
            onClick={() => {
              declineButtonOnClick();
              closeModal();
            }}
          >
            {declineButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ModalBackground = () => {
  const { isModalOpened } = useModalStore();

  if (isModalOpened) {
    return (
      <div className="fixed inset-0 z-50 bg-[#041124] bg-opacity-20 flex flex-col items-center justify-center transition-all duration-300"></div>
    );
  }

  return null;
};
