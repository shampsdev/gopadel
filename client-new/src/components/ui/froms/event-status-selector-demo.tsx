import { useState } from "react";
import { EventStatusSelector } from "./event-status-selector";
import { EventStatus } from "../../../types/event-status.type";

export const EventStatusSelectorDemo = () => {
  const [status, setStatus] = useState<EventStatus | null>(null);

  return (
    <div className="p-6 bg-tg min-h-screen">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-tg mb-8">
          Селектор статуса события
        </h1>

        <EventStatusSelector
          title="Статус события"
          value={status}
          onChangeFunction={setStatus}
          hasError={false}
        />

        {status && (
          <div className="p-4 bg-green-back-color rounded-[14px] mt-4">
            <p className="text-center text-black font-medium">
              Выбран статус: <span className="font-bold">{status}</span>
            </p>
          </div>
        )}

        <div className="space-y-2 text-sm text-hint">
          <p>
            <strong>Возможные статусы:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <span className="text-blue-600">●</span> Регистрация - открыта
              регистрация участников
            </li>
            <li>
              <span className="text-yellow-600">●</span> Заполнено - все места
              заняты
            </li>
            <li>
              <span className="text-green-600">●</span> Завершено - событие
              успешно завершено
            </li>
            <li>
              <span className="text-red-600">●</span> Отменено - событие
              отменено
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
