package domain

import (
	"encoding/json"
	"time"
)

type EventStatus string

const (
	EventStatusRegistration EventStatus = "registration" // Регистрация открыта
	EventStatusFull         EventStatus = "full"         // Набор закрыт (все места заняты)
	EventStatusCompleted    EventStatus = "completed"    // Событие завершено
	EventStatusCancelled    EventStatus = "cancelled"    // Событие отменено
)

type EventType string

const (
	EventTypeGame       EventType = "game"       // Обычная игра
	EventTypeTournament EventType = "tournament" // Турнир
	EventTypeTraining   EventType = "training"   // Тренировка
)

type Event struct {
	ID           string          `json:"id"`
	Name         string          `json:"name"`
	Description  *string         `json:"description,omitempty"`
	StartTime    time.Time       `json:"startTime"`
	EndTime      time.Time       `json:"endTime"`
	RankMin      float64         `json:"rankMin"`
	RankMax      float64         `json:"rankMax"`
	Price        int             `json:"price"`
	MaxUsers     int             `json:"maxUsers"`
	Status       EventStatus     `json:"status"`
	Type         EventType       `json:"type"`
	Court        Court           `json:"court"`
	Organizer    User            `json:"organizer"`
	ClubID       *string         `json:"clubId,omitempty"`
	Data         json.RawMessage `json:"data,omitempty" swaggertype:"object"`
	Participants []*Registration `json:"participants,omitempty"`
	CreatedAt    time.Time       `json:"createdAt"`
	UpdatedAt    time.Time       `json:"updatedAt"`
}

type CreateEvent struct {
	Name        string          `json:"name" binding:"required"`
	Description *string         `json:"description,omitempty"`
	StartTime   time.Time       `json:"startTime" binding:"required"`
	EndTime     time.Time       `json:"endTime" binding:"required"`
	RankMin     float64         `json:"rankMin" binding:"min=0"`
	RankMax     float64         `json:"rankMax" binding:"min=0"`
	Price       int             `json:"price" binding:"min=0"`
	MaxUsers    int             `json:"maxUsers" binding:"required,min=2"`
	Type        EventType       `json:"type" binding:"required"`
	CourtID     string          `json:"courtId" binding:"required"`
	OrganizerID string          `json:"organizerId,omitempty"`
	ClubID      *string         `json:"clubId,omitempty"`
	Data        json.RawMessage `json:"data,omitempty" swaggertype:"object"`
}

type PatchEvent struct {
	Name        *string         `json:"name,omitempty"`
	Description *string         `json:"description,omitempty"`
	StartTime   *time.Time      `json:"startTime,omitempty"`
	EndTime     *time.Time      `json:"endTime,omitempty"`
	RankMin     *float64        `json:"rankMin,omitempty"`
	RankMax     *float64        `json:"rankMax,omitempty"`
	Price       *int            `json:"price,omitempty"`
	MaxUsers    *int            `json:"maxUsers,omitempty"`
	Status      *EventStatus    `json:"status,omitempty"`
	Type        *EventType      `json:"type,omitempty"`
	CourtID     *string         `json:"courtId,omitempty"`
	ClubID      *string         `json:"clubId,omitempty"`
	Data        json.RawMessage `json:"data,omitempty" swaggertype:"object"`
}

type FilterEvent struct {
	ID                *string        `json:"id,omitempty"`
	Name              *string        `json:"name,omitempty"`
	Statuses          *[]EventStatus `json:"statuses,omitempty"`
	Type              *EventType     `json:"type,omitempty"`
	NotFull           *bool          `json:"notFull,omitempty"`      // true если событие не заполнено
	NotCompleted      *bool          `json:"notCompleted,omitempty"` // true если событие не завершено
	OrganizerID       *string        `json:"organizerId,omitempty"`
	ClubID            *string        `json:"clubId,omitempty"`
	FilterByUserClubs *string        `json:"filterByUserClubs,omitempty"` // user ID для фильтрации по клубам пользователя
}

// Админские события
type AdminPatchEvent struct {
	Name        *string         `json:"name,omitempty"`
	Description *string         `json:"description,omitempty"`
	StartTime   *time.Time      `json:"startTime,omitempty"`
	EndTime     *time.Time      `json:"endTime,omitempty"`
	RankMin     *float64        `json:"rankMin,omitempty"`
	RankMax     *float64        `json:"rankMax,omitempty"`
	Price       *int            `json:"price,omitempty"`
	MaxUsers    *int            `json:"maxUsers,omitempty"`
	Status      *EventStatus    `json:"status,omitempty"`
	Type        *EventType      `json:"type,omitempty"`
	CourtID     *string         `json:"courtId,omitempty"`
	OrganizerID *string         `json:"organizerId,omitempty"`
	ClubID      *string         `json:"clubId,omitempty"`
	Data        json.RawMessage `json:"data,omitempty" swaggertype:"object"`
}

type AdminFilterEvent struct {
	ID          *string        `json:"id,omitempty"`
	Name        *string        `json:"name,omitempty"`
	Statuses    *[]EventStatus `json:"statuses,omitempty"`
	Type        *EventType     `json:"type,omitempty"`
	ClubID      *string        `json:"clubId,omitempty"`
	OrganizerID *string        `json:"organizerId,omitempty"`
	// Дополнительные поля для удобства фильтрации
	OrganizerTelegramID *int64  `json:"organizerTelegramId,omitempty"`
	OrganizerFirstName  *string `json:"organizerFirstName,omitempty"`
	ClubName            *string `json:"clubName,omitempty"`
}

type EventForRegistration struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	Description *string         `json:"description,omitempty"`
	StartTime   time.Time       `json:"startTime"`
	EndTime     time.Time       `json:"endTime"`
	RankMin     float64         `json:"rankMin"`
	RankMax     float64         `json:"rankMax"`
	Price       int             `json:"price"`
	MaxUsers    int             `json:"maxUsers"`
	Status      EventStatus     `json:"status"`
	Type        EventType       `json:"type"`
	Court       Court           `json:"court"`
	Organizer   User            `json:"organizer"`
	ClubID      *string         `json:"clubId,omitempty"`
	Data        json.RawMessage `json:"data,omitempty" swaggertype:"object"`
}
