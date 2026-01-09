package domain

import (
	"context"
	"encoding/json"
	"time"
)

// EventDomain определяет тип события
type EventDomain string

const (
	EventDomainTournament EventDomain = "tournament"
	EventDomainGame       EventDomain = "game"
	EventDomainTraining   EventDomain = "training"
)

// TournamentFormat определяет формат турнира
type TournamentFormat string

const (
	TournamentFormatAmericano TournamentFormat = "AMERICANO"
	TournamentFormatMexicano  TournamentFormat = "MEXICANO"
)

// TournamentMode определяет режим турнира
type TournamentMode string

const (
	TournamentModeSolo TournamentMode = "SOLO"
	TournamentModePair TournamentMode = "PAIR"
)

// TournamentEngineStatus определяет статус турнирного движка (внутренний статус)
type TournamentEngineStatus string

const (
	TournamentEngineStatusNotStarted TournamentEngineStatus = "NOT_STARTED" // Турнир не начат
	TournamentEngineStatusActive     TournamentEngineStatus = "ACTIVE"      // Турнир активен
	TournamentEngineStatusPaused     TournamentEngineStatus = "PAUSED"      // Турнир приостановлен
	TournamentEngineStatusFinished   TournamentEngineStatus = "FINISHED"    // Турнир завершен
)

// MatchStatus определяет статус матча
type MatchStatus string

const (
	MatchStatusPending    MatchStatus = "pending"
	MatchStatusInProgress MatchStatus = "in_progress"
	MatchStatusCompleted  MatchStatus = "completed"
)

// EventData представляет общую структуру данных события
type EventData struct {
	Domain           EventDomain       `json:"domain"`
	Tournament       *TournamentData   `json:"tournament,omitempty"`
	Game             *GameData         `json:"game,omitempty"`
	Training         *TrainingData     `json:"training,omitempty"`
	TournamentEngine *TournamentEngine `json:"tournamentEngine,omitempty"`
	MatchEngine      *MatchEngine      `json:"matchEngine,omitempty"`
	SessionEngine    *SessionEngine    `json:"sessionEngine,omitempty"`
	Result           json.RawMessage   `json:"result,omitempty"`
}

// TournamentData содержит базовую информацию о турнире
type TournamentData struct {
	Format TournamentFormat `json:"format"`
	Mode   TournamentMode   `json:"mode"`
}

// GameData содержит информацию об игре
type GameData struct {
	Type   string `json:"type"`
	Format string `json:"format"`
}

// TrainingData содержит информацию о тренировке
type TrainingData struct {
	Type  string `json:"type"`
	Level string `json:"level"`
}

// TournamentEngine управляет логикой турнира
type TournamentEngine struct {
	Config       TournamentConfig   `json:"config"`
	State        TournamentState    `json:"state"`
	Participants []TournamentPlayer `json:"participants"`
	Matches      []TournamentMatch  `json:"matches"`
	Leaderboard  []LeaderboardEntry `json:"leaderboard"`
}

// TournamentConfig содержит конфигурацию турнира
type TournamentConfig struct {
	MatchPoints int `json:"matchPoints"`
	CourtsCount int `json:"courtsCount"`
	RoundsCount int `json:"roundsCount"`
}

// TournamentState содержит текущее состояние турнира
type TournamentState struct {
	Status       TournamentEngineStatus `json:"status"`
	CurrentRound int                    `json:"currentRound"`
}

// TournamentPlayer представляет участника турнира
type TournamentPlayer struct {
	ID    string          `json:"id"`
	Name  string          `json:"name"`
	Rank  float64         `json:"rank"`
	Seed  int             `json:"seed"`
	Stats TournamentStats `json:"stats"`
}

// TournamentStats содержит статистику игрока в турнире
type TournamentStats struct {
	Wins        int `json:"wins"`
	Draws       int `json:"draws"`
	Losses      int `json:"losses"`
	Scored      int `json:"scored"`
	Conceded    int `json:"conceded"`
	Diff        int `json:"diff"`
	TablePoints int `json:"tablePoints"`
	WDLPoints   int `json:"wdlPoints"`
}

// TournamentMatch представляет матч в турнире
type TournamentMatch struct {
	ID        string      `json:"id"`
	Round     int         `json:"round"`
	Court     int         `json:"court"`
	TeamA     MatchTeam   `json:"teamA"`
	TeamB     MatchTeam   `json:"teamB"`
	Status    MatchStatus `json:"status"`
	StartTime *time.Time  `json:"startTime,omitempty"`
	EndTime   *time.Time  `json:"endTime,omitempty"`
}

// MatchTeam представляет команду в матче
type MatchTeam struct {
	Player1 string `json:"player1"`
	Player2 string `json:"player2,omitempty"` // Опционально для режима PAIR
	Score   int    `json:"score"`
}

// LeaderboardEntry представляет запись в таблице лидеров
type LeaderboardEntry struct {
	Position int             `json:"position"`
	UserID   string          `json:"userId"`
	Stats    TournamentStats `json:"stats"`
}

// MatchEngine управляет логикой отдельного матча
type MatchEngine struct {
	Config MatchConfig `json:"config"`
	State  MatchState  `json:"state"`
	Score  MatchScore  `json:"score"`
}

// MatchConfig содержит конфигурацию матча
type MatchConfig struct {
	MatchPoints int `json:"matchPoints"`
	Sets        int `json:"sets"`
}

// MatchState содержит состояние матча
type MatchState struct {
	Status MatchStatus `json:"status"`
}

// MatchScore содержит счет матча
type MatchScore struct {
	TeamA int `json:"teamA"`
	TeamB int `json:"teamB"`
}

// SessionEngine управляет тренировочной сессией
type SessionEngine struct {
	Config SessionConfig `json:"config"`
	State  SessionState  `json:"state"`
}

// SessionConfig содержит конфигурацию тренировки
type SessionConfig struct {
	Duration  int             `json:"duration"` // в минутах
	Exercises json.RawMessage `json:"exercises"`
}

// SessionState содержит состояние тренировки
type SessionState struct {
	Status string `json:"status"`
}

// Методы для работы с EventData

// IsTournament проверяет, является ли событие турниром
func (ed *EventData) IsTournament() bool {
	return ed.Domain == EventDomainTournament
}

// IsGame проверяет, является ли событие игрой
func (ed *EventData) IsGame() bool {
	return ed.Domain == EventDomainGame
}

// IsTraining проверяет, является ли событие тренировкой
func (ed *EventData) IsTraining() bool {
	return ed.Domain == EventDomainTraining
}

// GetTournamentEngine возвращает турнирный движок или nil
func (ed *EventData) GetTournamentEngine() *TournamentEngine {
	if ed.IsTournament() {
		return ed.TournamentEngine
	}
	return nil
}

// GetMatchEngine возвращает игровой движок или nil
func (ed *EventData) GetMatchEngine() *MatchEngine {
	if ed.IsGame() {
		return ed.MatchEngine
	}
	return nil
}

// GetSessionEngine возвращает тренировочный движок или nil
func (ed *EventData) GetSessionEngine() *SessionEngine {
	if ed.IsTraining() {
		return ed.SessionEngine
	}
	return nil
}

// EventRepository определяет интерфейс для работы с событиями
type EventRepository interface {
	GetByID(ctx context.Context, id string) (*Event, error)
	GetParticipants(ctx context.Context, eventID string) ([]*User, error)
	Update(ctx context.Context, event *Event) error
}
