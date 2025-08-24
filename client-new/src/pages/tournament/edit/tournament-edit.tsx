import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { usePatchEvent } from "../../../api/hooks/mutations/events/usePatchEvent";
import { useGetCourts } from "../../../api/hooks/useGetCourts";
import { useGetEvents } from "../../../api/hooks/useGetEvents";
import { useIsAdmin } from "../../../api/hooks/useIsAdmin";
import { Button } from "../../../components/ui/button";
import { CourtSelector } from "../../../components/ui/froms/court-selector";
import { DateSelector } from "../../../components/ui/froms/date-selector";
import { Input } from "../../../components/ui/froms/input";
import { LevelSelector } from "../../../components/ui/froms/level-selector";
import { Textarea } from "../../../components/ui/froms/textarea";
import { Preloader } from "../../../components/widgets/preloader";
import { useTelegramBackButton } from "../../../shared/hooks/useTelegramBackButton";
import { useTournamentEditStore } from "../../../shared/stores/tournament-edit.store";
import AboutImage from "../../../assets/about.png";
import { Icons } from "../../../assets/icons";
import { TimeSelector } from "../../../components/ui/froms/time-selector";
import { ClubSelector } from "../../../components/ui/froms/club-selector";
import { useGetMyClubs } from "../../../api/hooks/useGetMyClubs";

export const TournamentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const {
    title,
    setTitle,
    description,
    setDescription,
    selectedDate,
    setDateFromCalendar,
    time,
    timeError,
    setTime,
    type,
    setType,
    courtId,
    setCourtId,
    clubId,
    setClubId,
    rankMin,
    rankMax,
    rankMinError,
    rankMaxError,
    setRankMinValue,
    setRankMaxValue,
    price,
    priceInput,
    setPriceInput,
    handlePriceBlur,
    maxUsers,
    maxUsersInput,
    setMaxUsersInput,
    handleMaxUsersBlur,
    isFormValid,
    getTournamentData,
    loadFromEvent,
    resetStore,
    loadedFromEvent,
    typeFieldOpen,
    setTypeFieldOpen,
  } = useTournamentEditStore();

  const { data: courts = [], isLoading: courtsLoading } = useGetCourts();
  const { data: myClubs = [], isLoading: clubsLoading } = useGetMyClubs();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const { mutateAsync: patchEvent, isPending: isUpdatingEvent } = usePatchEvent(
    id!
  );

  const { data: events, isLoading: eventLoading } = useGetEvents({ id: id! });
  const event = events?.[0];

  useEffect(() => {
    if (event && !loadedFromEvent) {
      loadFromEvent(event);
    }
  }, [event, loadFromEvent, resetStore]);

  const handleUpdateTournament = async () => {
    const tournamentData = getTournamentData();

    if (!tournamentData) {
      return;
    }

    try {
      await patchEvent(tournamentData);
      navigate(-1);
    } catch (error) {
      alert("Ошибка при обновлении турнира");
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(selectedDate);
  }, []);

  if (isAdminLoading || courtsLoading || eventLoading || clubsLoading)
    return <Preloader />;

  if (!isAdmin?.admin) {
    return (
      <div className="flex flex-col h-screen w-full">
        <div className="flex-1 flex flex-col text-center items-center justify-center gap-11">
          <img src={AboutImage} className="object-cover w-[70%]" />
          <div className="flex flex-col gap-4">
            <div className="font-semibold text-[20px]">Функция недоступна</div>
            <div className="text-[#868D98]">
              Редактирование турниров доступно только администраторам
            </div>
          </div>
        </div>
        <div className="mt-auto pb-10">
          <Button className="mx-auto" onClick={() => navigate("/")}>
            Назад
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col h-screen w-full">
        <div className="flex-1 flex flex-col text-center items-center justify-center gap-11">
          <img src={AboutImage} className="object-cover w-[70%]" />
          <div className="flex flex-col gap-4">
            <div className="font-semibold text-[20px]">Турнир не найден</div>
            <div className="text-[#868D98]">
              Запрашиваемый турнир не существует
            </div>
          </div>
        </div>
        <div className="mt-auto pb-10">
          <Button className="mx-auto" onClick={() => navigate("/")}>
            Назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[40px] pb-[200px]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 px-[12px]">
          <p className="text-[24px] font-medium">Редактирование турнира</p>
          <p className="text-[##56674] text-[16px]">
            Добавьте информацию о событии
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Input
            onChangeFunction={setTitle}
            title={"Название"}
            value={title}
            maxLength={100}
            hasError={!title}
          />
          <Textarea
            onChangeFunction={setDescription}
            title={"Описание"}
            value={description}
            maxLength={500}
            placeholder={""}
            hasError={false}
          />

          <div className="flex flex-row px-[16px] justify-between">
            <div className="flex flex-row gap-[2px]">
              <p className="text-[#868D98] font-medium">Дата</p>
              <div className="mt-[4px]">{Icons.RequiredFieldStar()}</div>
            </div>
            <div
              className="flex flex-row gap-[8px] items-center text-[#868D98]"
              onClick={() => navigate(`calendar`)}
            >
              <p>открыть календарь</p>
              <div>{Icons.Calendar("#868D98", "16", "16")}</div>
            </div>
          </div>

          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setDateFromCalendar}
            className=""
          />

          <div className="flex flex-row justify-between gap-[16px]">
            <TimeSelector
              title={"Начало"}
              value={time.split("-")[0] || ""}
              onChangeFunction={(startTime: string) => {
                const endTime = time.split("-")[1] || "";
                const newTime = endTime ? `${startTime}-${endTime}` : startTime;
                setTime(newTime);
              }}
              hasError={timeError}
            />
            <TimeSelector
              title={"Окончание"}
              value={time.split("-")[1] || ""}
              onChangeFunction={(endTime: string) => {
                const startTime = time.split("-")[0] || "";
                const newTime = startTime ? `${startTime}-${endTime}` : endTime;
                setTime(newTime);
              }}
              hasError={timeError}
            />
          </div>

          <ClubSelector
            title="Сообщество"
            value={clubId ?? ""}
            onChangeFunction={(id) => {
              setClubId(id);
            }}
            hasError={!clubId}
            clubs={myClubs ?? []}
          />

          <CourtSelector
            title="Клуб"
            value={courtId}
            onChangeFunction={(id) => {
              setCourtId(id);
            }}
            hasError={!courtId}
            courts={courts ?? []}
          />

          <div className="flex flex-col gap-[8px] mt-[16px]">
            <div className="text-[#868D98] text-[15px] px-[16px] font-medium ">
              Тип
            </div>
            <div className="flex flex-row gap-[4px] text-center">
              <div
                className={
                  "w-full  py-[12px] rounded-[12px] text-[14px] cursor-pointer " +
                  (typeFieldOpen || type !== "американо"
                    ? "bg-[#F8F8FA]"
                    : "bg-[#AFFF3F]")
                }
                onClick={() => {
                  setTypeFieldOpen(false);
                  setType("американо");
                }}
              >
                американо
              </div>
              <div
                className={
                  "w-full  py-[12px] rounded-[12px] text-[14px] cursor-pointer " +
                  (typeFieldOpen || type !== "мексикано"
                    ? "bg-[#F8F8FA]"
                    : "bg-[#AFFF3F]")
                }
                onClick={() => {
                  setTypeFieldOpen(false);
                  setType("мексикано");
                }}
              >
                мексикано
              </div>
            </div>
            <div className="flex flex-row gap-[4px] text-center">
              <div
                className={
                  "w-full  py-[12px] text-[14px] cursor-pointer " +
                  (typeFieldOpen
                    ? "bg-[#AFFF3F] rounded-[12px]"
                    : "bg-[#F8F8FA] rounded-[12px]")
                }
                onClick={() => setTypeFieldOpen(true)}
              >
                свой тип
              </div>
              <div className="w-full bg-white py-[12px]"></div>
            </div>
          </div>

          {typeFieldOpen && (
            <Input
              onChangeFunction={setType}
              title={"Тип"}
              value={type}
              maxLength={100}
              hasError={!type}
            />
          )}

          <LevelSelector
            title="Уровень игроков"
            minValue={rankMin}
            maxValue={rankMax}
            onChangeMinValue={setRankMinValue}
            onChangeMaxValue={setRankMaxValue}
            hasError={
              rankMin === null ||
              rankMinError ||
              rankMax === null ||
              rankMaxError
            }
          />

          <div className="flex flex-col gap-[8px] mt-[16px]"></div>
          <Input
            title={"Стоимость участия"}
            value={priceInput}
            maxLength={10}
            placeholder={"0"}
            hasError={price === null}
            onChangeFunction={setPriceInput}
            onBlur={handlePriceBlur}
          />
          <Input
            title={"Максимальное количество участников"}
            value={maxUsersInput}
            maxLength={3}
            placeholder={"0"}
            hasError={maxUsers === null}
            onChangeFunction={setMaxUsersInput}
            onBlur={handleMaxUsersBlur}
          />
        </div>

        <div className="flex flex-row gap-[4px]">
          <div
            className="px-[24px] py-[16px] rounded-[12px] font-medium text-[18px] bg-[#F8F8FA]"
            onClick={() => setMaxUsersInput("2")}
          >
            2
          </div>
          <div
            className="px-[24px] py-[16px] rounded-[12px] font-medium text-[18px] bg-[#F8F8FA]"
            onClick={() => setMaxUsersInput("4")}
          >
            4
          </div>
          <div
            className="px-[24px] py-[16px] rounded-[12px] font-medium text-[18px] bg-[#F8F8FA]"
            onClick={() => setMaxUsersInput("8")}
          >
            8
          </div>
        </div>
      </div>

      <div className="flex flex-col fixed bottom-[80px]  right-0 left-0 gap-4 w-full">
        <Button
          disabled={isUpdatingEvent}
          onClick={() => {
            if (isFormValid()) {
              handleUpdateTournament();
            }
          }}
          className={
            !isFormValid() ? "bg-[#F8F8FA] text-[#A4A9B4] mx-auto" : " mx-auto"
          }
        >
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};
