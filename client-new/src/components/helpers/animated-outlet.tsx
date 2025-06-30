import { AnimatePresence } from "framer-motion";
import { Outlet, useLocation } from "react-router";
import { PageWrapper } from "./animation-page-wrapper";

export const AnimatedOutlet = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageWrapper key={location.pathname}>
        <Outlet />
      </PageWrapper>
    </AnimatePresence>
  );
};
