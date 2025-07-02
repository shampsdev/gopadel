import { useLocation, useNavigate } from "react-router";
import { twMerge } from "tailwind-merge";
import { Icons } from "../../assets/icons";

interface NavbarItemProps {
  title: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  onClick?: () => void;
  variant?: "active" | "default";
  className?: string;
}

const NavbarItem = ({
  title,
  icon,
  activeIcon,
  onClick,
  className,
  variant = "default",
}: NavbarItemProps) => {
  const variants = {
    active: "bg-[#AFFF3F] text-black",
    default: "bg-[#F8F8FA] text-[#868D98]",
  };

  return (
    <div
      onClick={onClick}
      className={twMerge(
        "flex flex-col gap-[6px] items-center px-3 py-2 rounded-[12px] cursor-pointer",
        variants[variant],
        className
      )}
    >
      {variant === "default" ? icon : activeIcon}
      <p>{title}</p>
    </div>
  );
};

export const HomeNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const categories = [
    {
      title: "Все",
      icon: Icons.Ball(),
      activeIcon: Icons.Ball("#000"),
      link: "../",
    },
    {
      title: "Турниры",
      icon: Icons.Medal(),
      activeIcon: Icons.Medal("#000"),
      link: "../tournaments",
    },
    {
      title: "Игры",
      icon: Icons.Padel(),
      activeIcon: Icons.Padel("#000"),
      link: "../games",
    },
    {
      title: "Тренировки",
      icon: Icons.Target(),
      activeIcon: Icons.Target("#000"),
      link: "../training",
    },
  ];

  const handleFilterChange = (link: string) => {
    navigate(link);
  };

  return (
    <div className="flex flex-row py-[10px] w-full gap-2">
      {categories.map((item) => (
        <NavbarItem
          key={item.title}
          title={item.title}
          icon={item.icon}
          activeIcon={item.activeIcon}
          onClick={() => handleFilterChange(item.link)}
          variant={
            (item.link === "../" && location.pathname === "/") ||
            (item.link === "../tournaments" &&
              location.pathname.endsWith("/tournaments")) ||
            (item.link === "../games" &&
              location.pathname.endsWith("/games")) ||
            (item.link === "../training" &&
              location.pathname.endsWith("/training"))
              ? "active"
              : "default"
          }
          className="flex-grow"
        />
      ))}
    </div>
  );
};
