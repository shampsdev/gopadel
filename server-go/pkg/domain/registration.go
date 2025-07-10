package domain

import (
	"encoding/json"
	"time"
)

type RegistrationStatus string

const (
	RegistrationStatusPending        RegistrationStatus = "PENDING"
	RegistrationStatusActive         RegistrationStatus = "ACTIVE"
	RegistrationStatusCanceled       RegistrationStatus = "CANCELED"
	RegistrationStatusCanceledByUser RegistrationStatus = "CANCELED_BY_USER"
)

type Registration struct {
	ID           string             `json:"id"`
	UserID       string             `json:"userId"`
	TournamentID string             `json:"tournamentId"`
	Date         time.Time          `json:"date"`
	Status       RegistrationStatus `json:"status"`
	User         *User              `json:"user,omitempty"`
}

type RegistrationWithTournament struct {
	ID           string                    `json:"id"`
	UserID       string                    `json:"userId"`
	TournamentID string                    `json:"tournamentId"`
	Date         time.Time                 `json:"date"`
	Status       RegistrationStatus        `json:"status"`
	User         *User                     `json:"user,omitempty"`
	Tournament   *TournamentForRegistration `json:"tournament,omitempty"`
}

// Для админки
type RegistrationWithPayments struct {
	ID           string             `json:"id"`
	UserID       string             `json:"userId"`
	TournamentID string             `json:"tournamentId"`
	Date         time.Time          `json:"date"`
	Status       RegistrationStatus `json:"status"`
	User         *User              `json:"user,omitempty"`
	Tournament   *TournamentForRegistration `json:"tournament,omitempty"`
	Payments     []*Payment         `json:"payments,omitempty"`
}

// без юзеров
type TournamentForRegistration struct {
	ID             string          `json:"id"`
	Name           string          `json:"name"`
	StartTime      time.Time       `json:"startTime"`
	EndTime        time.Time       `json:"endTime"`
	Price          int             `json:"price"`
	RankMin        float64         `json:"rankMin"`
	RankMax        float64         `json:"rankMax"`
	MaxUsers       int             `json:"maxUsers"`
	Description    string          `json:"description"`
	Court          Court           `json:"court"`
	TournamentType string          `json:"tournamentType"`
	Organizator    User            `json:"organizator"`
	Data           json.RawMessage `json:"data,omitempty" swaggertype:"object"`
}

type CreateRegistration struct {
	UserID       string             `json:"userId" binding:"required"`
	TournamentID string             `json:"tournamentId" binding:"required"`
	Status       RegistrationStatus `json:"status"`
}

type PatchRegistration struct {
	Status *RegistrationStatus `json:"status,omitempty"`
}

type FilterRegistration struct {
	ID           *string             `json:"id,omitempty"`
	UserID       *string             `json:"userId,omitempty"`
	TournamentID *string             `json:"tournamentId,omitempty"`
	Status       *RegistrationStatus `json:"status,omitempty"`
}

// Для фильтрации в админке
type AdminFilterRegistration struct {
	ID           *string             `json:"id,omitempty"`
	UserID       *string             `json:"userId,omitempty"`
	TournamentID *string             `json:"tournamentId,omitempty"`
	Status       *RegistrationStatus `json:"status,omitempty"`
	// Дополнительные поля для удобства фильтрации
	UserTelegramID       *int64  `json:"userTelegramId,omitempty"`
	UserTelegramUsername *string `json:"userTelegramUsername,omitempty"`
	UserFirstName        *string `json:"userFirstName,omitempty"`
	TournamentName       *string `json:"tournamentName,omitempty"`
}
