import { useParams } from "react-router";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { useGetTournamentWaitlist } from "../../api/hooks/useGetEventWaitlist";
import { getRankTitle } from "../../utils/rank-title";
import { Link } from "react-router";
import { Preloader } from "../../components/widgets/preloader";

export const TournamentWaitlist = () => {
  useTelegramBackButton({ showOnMount: true });
  const { id } = useParams();

  const { data: waitlist, isLoading } = useGetTournamentWaitlist(id!);

  if (isLoading) return <Preloader />;

  if (waitlist) {
    return (
      <div className="flex flex-col gap-9 pb-[100px]">
        <div className="flex flex-col gap-4">
          <p>Список ожидания</p>
          <div className="flex flex-col gap-[6px] text-[#5D6674] text-[16px] font-medium">
            <p>В списке ожидания: {waitlist.length}</p>
          </div>
        </div>

        <div className="flex flex-col gap-[20px] justify-around">
          {waitlist.map((waitlistItem) => {
            return (
              <Link to={`/profile/${waitlistItem.user.id}`}>
                <div
                  key={waitlistItem.user.id}
                  className="flex flex-row items-center gap-[21px]"
                >
                  <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                    <img
                      className="object-cover w-full h-full"
                      src={waitlistItem.user.avatar}
                      alt="avatar"
                    />
                  </div>

                  <div className="flex flex-row gap-[21px] flex-1 flex-grow ">
                    <div className="flex flex-row flex-grow flex-1 ">
                      <div className="flex flex-col gap-[2px]">
                        <p className="text-[14px]">
                          {waitlistItem.user.firstName}{" "}
                          {waitlistItem.user.lastName}
                        </p>
                        <p className="text-[#868D98] text-[14px]">
                          {getRankTitle(waitlistItem.user.rank)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }
};
