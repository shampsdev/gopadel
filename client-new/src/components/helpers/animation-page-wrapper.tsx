import { backButton } from "@telegram-apps/sdk-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  if (backButton.isMounted()) {
    backButton.onClick(() => {
      navigate(-1);
    });
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.15 } }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="max-w-[90%] mx-auto pt-[12px] h-screen overflow-y-scroll"
    >
      {children}
    </motion.div>
  );
};
