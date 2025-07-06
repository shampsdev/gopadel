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
	Court          Court           `json:"court"`
	ClubID         string          `json:"clubId"`
	TournamentType string          `json:"tournamentType"`
	Organizator    User            `json:"organizator"`
	Participants   []*Registration `json:"participants"`
}

type CreateTournament struct {
	Name           string    `json:"name" binding:"required"`
	StartTime      time.Time `json:"startTime" binding:"required"`
	EndTime        time.Time `json:"endTime"`
	Price          int       `json:"price"`
	RankMin        float64   `json:"rankMin" binding:"min=0"`
	RankMax        float64   `json:"rankMax" binding:"min=0"`
	MaxUsers       int       `json:"maxUsers" binding:"required"`
	Description    string    `json:"description"`
	CourtID        string    `json:"courtId" binding:"required"`
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
	CourtID        *string    `json:"courtId,omitempty"`
	ClubID         *string    `json:"clubId,omitempty"`
	TournamentType *string    `json:"tournamentType,omitempty"`
}

type FilterTournament struct {
	ID               string  `json:"id"`
	Name             string  `json:"name"`
	NotFull          *bool   `json:"notFull,omitempty"`       // true if tournament is not full
	NotEnded         *bool   `json:"notEnded,omitempty"`      // default true
	OrganizatorID    *string `json:"organizatorId,omitempty"`
	FilterByUserClubs *string `json:"filterByUserClubs,omitempty"` // user ID to filter by user's clubs
}

// AdminPatchTournament структура для админского обновления турнира
type AdminPatchTournament struct {
	Name           *string    `json:"name,omitempty"`
	StartTime      *time.Time `json:"startTime,omitempty"`
	EndTime        *time.Time `json:"endTime,omitempty"`
	Price          *int       `json:"price,omitempty"`
	RankMin        *float64   `json:"rankMin,omitempty"`
	RankMax        *float64   `json:"rankMax,omitempty"`
	MaxUsers       *int       `json:"maxUsers,omitempty"`
	Description    *string    `json:"description,omitempty"`
	CourtID        *string    `json:"courtId,omitempty"`
	ClubID         *string    `json:"clubId,omitempty"`
	TournamentType *string    `json:"tournamentType,omitempty"`
	OrganizatorID  *string    `json:"organizatorId,omitempty"`
}

// AdminFilterTournament структура для админской фильтрации турниров
type AdminFilterTournament struct {
	ID               *string `json:"id,omitempty"`
	Name             *string `json:"name,omitempty"`
	ClubID           *string `json:"clubId,omitempty"`
	OrganizatorID    *string `json:"organizatorId,omitempty"`
	TournamentType   *string `json:"tournamentType,omitempty"`
	// Дополнительные поля для удобства фильтрации
	OrganizatorTelegramID *int64  `json:"organizatorTelegramId,omitempty"`
	OrganizatorFirstName  *string `json:"organizatorFirstName,omitempty"`
	ClubName              *string `json:"clubName,omitempty"`
}