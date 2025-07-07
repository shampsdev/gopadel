import { backButton } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (backButton.isMounted()) {
      const handleBackClick = () => {
        navigate(-1);
      };

      backButton.onClick(handleBackClick);

      // Cleanup при размонтировании
      return () => {
        backButton.offClick(handleBackClick);
      };
    }
  }, [backButton, navigate]);
  return (
    <div className="mx-auto pt-[20px] max-h-screen overflow-y-scroll ">
      {children}
    </div>
    // <motion.div
    //   initial={{ opacity: 0, y: 20 }}
    //   animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
    //   transition={{ duration: 0.3, ease: "easeOut" }}
    //   className="mx-auto pt-[12px] max-h-screen overflow-y-scroll "
    // >
    //   {children}
    // </motion.div>
  );
};
