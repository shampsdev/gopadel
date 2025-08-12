package domain

import "time"

type Waitlist struct {
	ID      int       `json:"id"`
	UserID  string    `json:"userId"`
	EventID string    `json:"eventId"`
	Date    time.Time `json:"date"`
	User    *User     `json:"user,omitempty"`
}

type WaitlistUser struct {
	User *User `json:"user"`
	Date time.Time `json:"date"`
}

type CreateWaitlist struct {
	UserID  string `json:"userId" binding:"required"`
	EventID string `json:"eventId" binding:"required"`
}

type FilterWaitlist struct {
	ID      *int    `json:"id,omitempty"`
	UserID  *string `json:"userId,omitempty"`
	EventID *string `json:"eventId,omitempty"`
} 