import { EventCard } from "../../components/widgets/event-card";
import { useGetEvents } from "../../api/hooks/useGetEvents";
import type { FilterEvent } from "../../types/filter.type";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { HomeNavbar } from "../../components/widgets/home-navbar";
import { Preloader } from "../../components/widgets/preloader";
import { getEventType } from "../../utils/get-event-type";
import { EventStatus } from "../../types/event-status.type";
import { CourtFilter } from "../../components/widgets/court-filter";
import { useGetCourts } from "../../api/hooks/useGetCourts";

export const Events = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const urlCourtId = searchParams.get("courtId");

  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(
    urlCourtId || null
  );

  const { data: courts, isLoading: isLoadingCourts } = useGetCourts();

  useEffect(() => {
    setSelectedCourtId(urlCourtId || null);
  }, [urlCourtId]);

  const handleCourtChange = (courtId: string | null) => {
    setSelectedCourtId(courtId);

    const newSearchParams = new URLSearchParams(location.search);
    if (courtId) {
      newSearchParams.set("courtId", courtId);
    } else {
      newSearchParams.delete("courtId");
    }
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const filter: FilterEvent = {
    notCompleted: true,
    statuses: [EventStatus.registration, EventStatus.full],
    courtId: selectedCourtId || undefined,
  };

  const { data: events, isLoading } = useGetEvents(filter);

  if (isLoading || isLoadingCourts) return <Preloader />;

  return (
    <div className="pb-[100px]">
      <HomeNavbar />
      {courts && courts.length > 0 && (
        <div className="mb-4">
          <CourtFilter
            courts={courts}
            selectedCourtId={selectedCourtId}
            onCourtChange={handleCourtChange}
            placeholder="Начните вводить название клуба"
          />
        </div>
      )}

      <div className="flex flex-col gap-4 mt-4">
        {events?.map((event) => (
          <EventCard
            status={event.status}
            eventType={event.type}
            key={event.id}
            id={event.id}
            title={event.name}
            rankMin={event.rankMin}
            rankMax={event.rankMax}
            organizerName={
              event.organizer.firstName + " " + event.organizer.lastName
            }
            date={(() => {
              const d = new Date(event.startTime);
              const day = d.toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                timeZone: "Europe/Moscow",
              });
              const time = d.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Europe/Moscow",
              });
              return `${day} ${time}`;
            })()}
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
