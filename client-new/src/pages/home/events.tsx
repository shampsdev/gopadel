import { EventCard } from "../../components/widgets/event-card";
import { useGetEvents } from "../../api/hooks/useGetEvents";
import type { FilterEvent } from "../../types/filter.type";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { HomeNavbar } from "../../components/widgets/home-navbar";
import { Preloader } from "../../components/widgets/preloader";
import { getEventType } from "../../utils/get-event-type";

export const Events = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const urlShowOnlyAvailable = searchParams.get("available") === "true";

  const [showOnlyAvailable, setShowOnlyAvailable] =
    useState(urlShowOnlyAvailable);

  useEffect(() => {
    setShowOnlyAvailable(urlShowOnlyAvailable);
  }, [urlShowOnlyAvailable]);

  const toggleSwitch = () => {
    const newValue = !showOnlyAvailable;
    setShowOnlyAvailable(newValue);

    const newSearchParams = new URLSearchParams(location.search);
    if (newValue) {
      newSearchParams.set("available", "true");
    } else {
      newSearchParams.delete("available");
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const filter: FilterEvent = {
    notFull: showOnlyAvailable || undefined,
    notCompleted: true,
  };

  const { data: events, isLoading } = useGetEvents(filter);

  if (isLoading) return <Preloader />;

  return (
    <div className="pb-[100px]">
      <HomeNavbar />
      <div className="flex flex-row items-center py-6 px-5 border-[#EBEDF0] justify-between border-[1px] gap-6 rounded-[24px] bg-white">
        <p className="flex-1 flex-grow text-[14px] text-[#5D6674]">
          Только со свободными местами
        </p>
        <motion.div
          className="h-[28px] w-[60px] rounded-[16px] flex items-center cursor-pointer relative"
          onClick={toggleSwitch}
          animate={{
            backgroundColor: showOnlyAvailable ? "#AFFF3F" : "#F8F8FA",
          }}
          transition={{ duration: 0.3 }}
          style={{ zIndex: 0 }}
        >
          <motion.div
            className="h-[20px] w-[20px] rounded-full bg-white shadow-sm absolute z-10 left-1"
            animate={{ x: showOnlyAvailable ? 32 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ zIndex: 0 }}
          />
        </motion.div>
      </div>

      <div className="flex flex-col gap-4  mt-4">
        {events?.map((event) => (
          <EventCard
            eventType={event.type}
            key={event.id}
            id={event.id}
            title={event.name}
            rankMin={event.rankMin}
            rankMax={event.rankMax}
            organizerName={
              event.organizer.firstName + " " + event.organizer.lastName
            }
            date={event.startTime}
            locationTitle={event.court.name}
            address={event.court.address}
            type={getEventType(event)}
            cost={event.price}
            playersCapacity={event.maxUsers}
            playersAmount={event.participants?.length || 0}
            participating={false}
          />
        ))}
      </div>
    </div>
  );
};
