import { initDataStartParam } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export const StartDataChecker = () => {
  const initData = initDataStartParam();
  const navigate = useNavigate();

  useEffect(() => {
    if (initData && initData.length > 0) {
      console.log("initData", initData);
      navigate(`/tournament/${initData}`);
    }
  }, [initData]);

  return <Outlet />;
};
