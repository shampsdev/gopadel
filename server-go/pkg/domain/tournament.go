package domain

import "time"

type Tournament struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	StartTime      time.Time `json:"start_time"`
	EndTime        time.Time `json:"end_time"`
	Price          int       `json:"price"`
	RankMin        float64   `json:"rank_min"`
	RankMax        float64   `json:"rank_max"`
	MaxUsers       int       `json:"max_users"`
	Description    string    `json:"description"`
	Club           Club      `json:"club"`
	TournamentType string    `json:"tournament_type"`
	Organizator    User      `json:"organizator"`
}

type FilterTournament struct {
}
