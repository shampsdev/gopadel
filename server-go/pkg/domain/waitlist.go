package domain

import "time"

type Waitlist struct {
	ID           int       `json:"id"`
	UserID       string    `json:"userId"`
	TournamentID string    `json:"tournamentId"`
	Date         time.Time `json:"date"`
	User         *User     `json:"user,omitempty"`
	Tournament   *Tournament `json:"tournament,omitempty"`
}

type CreateWaitlist struct {
	UserID       string `json:"userId" binding:"required"`
	TournamentID string `json:"tournamentId" binding:"required"`
}

type FilterWaitlist struct {
	ID           *int    `json:"id,omitempty"`
	UserID       *string `json:"userId,omitempty"`
	TournamentID *string `json:"tournamentId,omitempty"`
} 