import { useNavigate } from "react-router";
import { Icons } from "../../assets/icons";
import { useCreateTournamentStore } from "../../shared/stores/create-tournament.store";
import { useCreateGameStore } from "../../shared/stores/create-game.store";

export const NewEvent = () => {
  const navigate = useNavigate();
  const { resetStore } = useCreateTournamentStore();
  const { resetStore: resetGameStore } = useCreateGameStore();
  return (
    <div className="flex flex-col gap-9">
      <div className="flex flex-col gap-2">
        <p className="text-[24px] font-medium">Новое событие</p>
        <p className="text-[16px] text-[#5D6674]">Выберите тип мероприятия</p>
      </div>

      <div className="flex flex-col gap-4">
        <div
          className="flex w-full flex-row items-center just gap-[18px] px-[16px] py-[16px] rounded-[30px] bg-[#F8F8FA]"
          onClick={() => {
            resetStore();
            navigate("tournament");
          }}
        >
          <div className="flex flex-col bg-[#AFFF3F] w-[42px] h-[42px] rounded-full  items-center justify-center">
            {Icons.Medal("black")}
          </div>
          <div className="flex flex-row items-center flex-1 justify-between flex-grow gap-[10px]">
            <p>Добавить турнир</p>
            <div>{Icons.ArrowRight()}</div>
          </div>
        </div>

        <div
          className="flex w-full flex-row items-center just gap-[18px] px-[16px] py-[16px] rounded-[30px] bg-[#F8F8FA]"
          onClick={() => {
            navigate("game");
            resetGameStore();
          }}
        >
          <div className="flex flex-col bg-[#AFFF3F] w-[42px] h-[42px] rounded-full  items-center justify-center">
            {Icons.Padel("black")}
          </div>
          <div className="flex flex-row items-center flex-1 justify-between flex-grow gap-[10px]">
            <p>Добавить игру</p>
            <div>{Icons.ArrowRight()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
