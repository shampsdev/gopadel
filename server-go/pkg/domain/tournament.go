package domain

import "time"

type Tournament struct {
	ID             string          `json:"id"`
	Name           string          `json:"name"`
	StartTime      time.Time       `json:"startTime"`
	EndTime        time.Time       `json:"endTime"`
	Price          int             `json:"price"`
	RankMin        float64         `json:"rankMin"`
	RankMax        float64         `json:"rankMax"`
	MaxUsers       int             `json:"maxUsers"`
	Description    string          `json:"description"`
	Club           Club            `json:"club"`
	TournamentType string          `json:"tournamentType"`
	Organizator    User            `json:"organizator"`
	Participants   []*Registration `json:"participants"`
}

type CreateTournament struct {
	Name           string    `json:"name" binding:"required"`
	StartTime      time.Time `json:"startTime" binding:"required"`
	EndTime        time.Time `json:"endTime"`
	Price          int       `json:"price" binding:"required"`
	RankMin        float64   `json:"rankMin" binding:"required"`
	RankMax        float64   `json:"rankMax" binding:"required"`
	MaxUsers       int       `json:"maxUsers" binding:"required"`
	Description    string    `json:"description"`
	ClubID         string    `json:"clubId" binding:"required"`
	TournamentType string    `json:"tournamentType" binding:"required"`
	OrganizatorID  string    `json:"organizatorId" binding:"required"`
}

type PatchTournament struct {
	Name           *string    `json:"name,omitempty"`
	StartTime      *time.Time `json:"startTime,omitempty"`
	EndTime        *time.Time `json:"endTime,omitempty"`
	Price          *int       `json:"price,omitempty"`
	RankMin        *float64   `json:"rankMin,omitempty"`
	RankMax        *float64   `json:"rankMax,omitempty"`
	MaxUsers       *int       `json:"maxUsers,omitempty"`
	Description    *string    `json:"description,omitempty"`
	ClubID         *string    `json:"clubId,omitempty"`
	TournamentType *string    `json:"tournamentType,omitempty"`
}

type FilterTournament struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	NotFull       *bool   `json:"notFull,omitempty"`       // true if tournament is not full
	NotEnded      *bool   `json:"notEnded,omitempty"`      // default true
	OrganizatorID *string `json:"organizatorId,omitempty"`
}