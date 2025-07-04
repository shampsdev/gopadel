import { Icons } from "../../assets/icons";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export const Preloader = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      rotate: [0, 360],
      transition: { repeat: Infinity, duration: 1.2, ease: "linear" },
    });
  }, [controls]);

  // параметры круга
  const radius = 40;
  const stroke = 8;
  const size = 2 * (radius + stroke);
  const center = radius + stroke;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div style={{ position: "relative", width: size, height: size }}>
        <motion.svg
          width={size}
          height={size}
          style={{ display: "block" }}
          animate={controls}
          initial={{ rotate: 0 }}
        >
          {/* Серый фон */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#F8F8FA"
            strokeWidth={stroke}
            fill="none"
          />
          {/* ОДИН анимированный сегмент */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            stroke="black"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference * 0.2}
            animate={{
              strokeDasharray: [circumference * 1, circumference * 0.99],
              strokeDashoffset: [0, -circumference * 0.99999],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
          />
        </motion.svg>
        {/* Мяч по центру */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          {Icons.Ball("black", "28", "28")}
        </div>
      </div>
    </div>
  );
};
