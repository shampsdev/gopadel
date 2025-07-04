import { Button } from "../components/ui/button";
import videoFile from "../assets/IMG_8675.MP4?url";
import { useTelegramBackButton } from "../shared/hooks/useTelegramBackButton";

export const League = () => {
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  return (
    <div className="flex flex-col justify-between h-full w-full gap-[27px] pb-[100px]">
      <div className="flex flex-col justify-between h-[70%] w-full">
        <video
          className="h-auto rounded-[20px] shadow-md flex-grow flex-1"
          preload="metadata"
          autoPlay
          muted
          playsInline
          loop
        >
          <source src={videoFile} type="video/mp4" />
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
      </div>
      <div className="mt-auto pb-10">
        <a href="https://www.russianpadel.ru">
          <Button className="mx-auto flex flex-row items-center">
            <p>Перейти на сайт лиги</p>
          </Button>
        </a>
      </div>
    </div>
  );
};
