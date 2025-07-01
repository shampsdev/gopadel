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
	Participants   []*Registration `json:"participants,omitempty"`
}

type FilterTournament struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	IsAvalible bool   `json:"isAvalible"` // true if tournament is not started and not full
}