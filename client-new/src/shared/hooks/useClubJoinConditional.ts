import { useEffect } from "react";
import { useGetMyClubs } from "../../api/hooks/useGetMyClubs";
import { useJoinClub } from "../../api/hooks/mutations/clubs/useJoinClub";
import { initDataStartParam } from "@telegram-apps/sdk-react";
import { parseStartParam } from "../../utils/start-data-parse";
import type { User } from "../../types/user.type";

interface UseClubJoinConditionalProps {
  enabled: boolean;
  user: User | null | undefined;
}

export const useClubJoinConditional = ({
  enabled,
  user,
}: UseClubJoinConditionalProps) => {
  const { data: myClubs, isLoading: clubsLoading } = useGetMyClubs();
  const joinClubMutation = useJoinClub();
  const initData = initDataStartParam();

  useEffect(() => {
    const handleClubJoin = async () => {
      if (
        enabled &&
        user !== undefined &&
        user !== null &&
        !clubsLoading &&
        myClubs &&
        initData &&
        initData.length > 0 &&
        !joinClubMutation.isPending
      ) {
        try {
          const parsedData = parseStartParam(initData);

          if (parsedData.courtId) {
            const clubExists = myClubs.some(
              (club) => club.id === parsedData.courtId
            );

            if (!clubExists) {
              await joinClubMutation.mutateAsync(parsedData.courtId);
            }
          } else {
            const globalClubExists = myClubs.some(
              (club) => club.id === "global"
            );

            if (!globalClubExists) {
              await joinClubMutation.mutateAsync("global");
            }
          }
        } catch (error) {
          console.error("Ошибка при присоединении к клубу:", error);
        }
      }
    };

    handleClubJoin();
  }, [
    enabled,
    user,
    clubsLoading,
    myClubs,
    initData,
    joinClubMutation.isPending,
  ]);

  return {
    isLoading: clubsLoading || joinClubMutation.isPending,
    error: joinClubMutation.error,
  };
};
