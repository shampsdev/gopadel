import { initDataStartParam } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { parseStartParam } from "../../utils/start-data-parse";

export const StartDataChecker = () => {
  const initData = initDataStartParam();
  const navigate = useNavigate();

  useEffect(() => {
    if (initData && initData.length > 0) {
      // Парсим startParam
      const parsedData = parseStartParam(initData);

      if (parsedData.tournamentId) {
        navigate(`/tournament/${parsedData.tournamentId}`);
      }
    }
  }, [initData, navigate]);

  return (
    <>
      <Outlet />
    </>
  );
};
