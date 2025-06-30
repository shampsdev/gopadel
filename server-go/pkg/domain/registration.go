package domain

import "time"

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
	Tournament   *Tournament        `json:"tournament,omitempty"`
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
