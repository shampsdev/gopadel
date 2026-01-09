package event

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest/ginerr"
)

// InitializeTournamentRequest представляет запрос на инициализацию турнира
type InitializeTournamentRequest struct {
	Format      string `json:"format" binding:"required" example:"AMERICANO"`
	Mode        string `json:"mode" binding:"required" example:"SOLO"`
	MatchPoints int    `json:"matchPoints" binding:"required" example:"16"`
	CourtsCount int    `json:"courtsCount" binding:"required" example:"1"`
}

// UpdateMatchScoreRequest представляет запрос на обновление счета матча
type UpdateMatchScoreRequest struct {
	TeamA struct {
		Score int `json:"score" binding:"required" example:"10"`
	} `json:"teamA" binding:"required"`
	TeamB struct {
		Score int `json:"score" binding:"required" example:"6"`
	} `json:"teamB" binding:"required"`
}

// TournamentStateResponse представляет ответ с состоянием турнира
type TournamentStateResponse struct {
	Format       string                     `json:"format" example:"AMERICANO"`
	Mode         string                     `json:"mode" example:"SOLO"`
	CurrentRound int                        `json:"currentRound" example:"2"`
	TotalRounds  int                        `json:"totalRounds" example:"5"`
	MatchPoints  int                        `json:"matchPoints" example:"16"`
	Status       string                     `json:"status" example:"ACTIVE"`
	Participants []domain.TournamentPlayer  `json:"participants"`
	Matches      []domain.TournamentMatch   `json:"matches"`
	Leaderboard  []domain.LeaderboardEntry  `json:"leaderboard"`
}

// NextRoundResponse представляет ответ на генерацию следующего раунда
type NextRoundResponse struct {
	Round   int                      `json:"round" example:"3"`
	Matches []domain.TournamentMatch `json:"matches"`
}

// FinishTournamentResponse представляет ответ на завершение турнира
type FinishTournamentResponse struct {
	FinalLeaderboard []domain.LeaderboardEntry `json:"finalLeaderboard"`
	Winner           *domain.TournamentPlayer  `json:"winner,omitempty"`
}

// initializeCounter инициализирует турнирный счетчик
// @Summary Инициализация турнирного счетчика
// @Description Создает новый турнирный счетчик для события с заданными параметрами
// @Tags counter
// @Accept json
// @Produce json
// @Param event_id path string true "ID события"
// @Param request body InitializeTournamentRequest true "Параметры турнира"
// @Success 200 {object} TournamentStateResponse
// @Failure 400 {object} ginerr.ErrorResponse
// @Failure 404 {object} ginerr.ErrorResponse
// @Failure 500 {object} ginerr.ErrorResponse
// @Router /events/{event_id}/counter/initialize [post]
func (h *Handler) initializeCounter(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	var req InitializeTournamentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// Валидация формата турнира
	var format domain.TournamentFormat
	switch req.Format {
	case "AMERICANO":
		format = domain.TournamentFormatAmericano
	case "MEXICANO":
		format = domain.TournamentFormatMexicano
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tournament format. Must be AMERICANO or MEXICANO"})
		return
	}

	// Валидация режима турнира
	var mode domain.TournamentMode
	switch req.Mode {
	case "SOLO":
		mode = domain.TournamentModeSolo
	case "PAIR":
		mode = domain.TournamentModePair
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tournament mode. Must be SOLO or PAIR"})
		return
	}

	// Валидация параметров
	if req.MatchPoints <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "matchPoints must be positive"})
		return
	}
	if req.CourtsCount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "courtsCount must be positive"})
		return
	}

	config := domain.TournamentConfig{
		MatchPoints: req.MatchPoints,
		CourtsCount: req.CourtsCount,
	}

	// Инициализируем турнир
	err := h.cases.Counter.InitializeTournament(c.Request.Context(), eventID, config, format, mode)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to initialize tournament") {
		return
	}

	// Получаем состояние турнира
	engine, err := h.cases.Counter.GetTournamentState(c.Request.Context(), eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get tournament state") {
		return
	}

	response := TournamentStateResponse{
		Format:       string(format),
		Mode:         string(mode),
		CurrentRound: engine.State.CurrentRound,
		TotalRounds:  engine.Config.RoundsCount,
		MatchPoints:  engine.Config.MatchPoints,
		Status:       string(engine.State.Status),
		Participants: engine.Participants,
		Matches:      engine.Matches,
		Leaderboard:  engine.Leaderboard,
	}

	c.JSON(http.StatusOK, response)
}

// getTournamentState получает текущее состояние турнира
// @Summary Получение состояния турнира
// @Description Возвращает текущее состояние турнирного счетчика
// @Tags counter
// @Produce json
// @Param event_id path string true "ID события"
// @Success 200 {object} TournamentStateResponse
// @Failure 404 {object} ginerr.ErrorResponse
// @Failure 500 {object} ginerr.ErrorResponse
// @Router /events/{event_id}/counter [get]
func (h *Handler) getTournamentState(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	engine, err := h.cases.Counter.GetTournamentState(c.Request.Context(), eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get tournament state") {
		return
	}

	// Получаем информацию о турнире из события
	event, err := h.cases.Event.GetEventByID(c.Request.Context(), eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get event") {
		return
	}

	var eventData domain.EventData
	if err := json.Unmarshal(event.Data, &eventData); err != nil {
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to unmarshal event data")
		return
	}

	var format, mode string
	if eventData.Tournament != nil {
		format = string(eventData.Tournament.Format)
		mode = string(eventData.Tournament.Mode)
	}

	response := TournamentStateResponse{
		Format:       format,
		Mode:         mode,
		CurrentRound: engine.State.CurrentRound,
		TotalRounds:  engine.Config.RoundsCount,
		MatchPoints:  engine.Config.MatchPoints,
		Status:       string(engine.State.Status),
		Participants: engine.Participants,
		Matches:      engine.Matches,
		Leaderboard:  engine.Leaderboard,
	}

	c.JSON(http.StatusOK, response)
}

// updateMatchScore обновляет счет матча
// @Summary Обновление счета матча
// @Description Обновляет счет матча и пересчитывает статистику участников
// @Tags counter
// @Accept json
// @Produce json
// @Param event_id path string true "ID события"
// @Param match_id path string true "ID матча"
// @Param request body UpdateMatchScoreRequest true "Счет матча"
// @Success 200 {object} TournamentStateResponse
// @Failure 400 {object} ginerr.ErrorResponse
// @Failure 404 {object} ginerr.ErrorResponse
// @Failure 500 {object} ginerr.ErrorResponse
// @Router /events/{event_id}/counter/matches/{match_id}/score [put]
func (h *Handler) updateMatchScore(c *gin.Context) {
	eventID := c.Param("event_id")
	matchID := c.Param("match_id")
	
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}
	if matchID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "match_id is required"})
		return
	}

	var req UpdateMatchScoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// Валидация счета
	if req.TeamA.Score < 0 || req.TeamB.Score < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Scores cannot be negative"})
		return
	}

	// Обновляем счет матча
	err := h.cases.Counter.UpdateMatchScore(c.Request.Context(), eventID, matchID, req.TeamA.Score, req.TeamB.Score)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to update match score") {
		return
	}

	// Получаем обновленное состояние турнира
	engine, err := h.cases.Counter.GetTournamentState(c.Request.Context(), eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get tournament state") {
		return
	}

	// Получаем информацию о турнире
	event, err := h.cases.Event.GetEventByID(c.Request.Context(), eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to get event") {
		return
	}

	var eventData domain.EventData
	if err := json.Unmarshal(event.Data, &eventData); err != nil {
		ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to unmarshal event data")
		return
	}

	var format, mode string
	if eventData.Tournament != nil {
		format = string(eventData.Tournament.Format)
		mode = string(eventData.Tournament.Mode)
	}

	response := TournamentStateResponse{
		Format:       format,
		Mode:         mode,
		CurrentRound: engine.State.CurrentRound,
		TotalRounds:  engine.Config.RoundsCount,
		MatchPoints:  engine.Config.MatchPoints,
		Status:       string(engine.State.Status),
		Participants: engine.Participants,
		Matches:      engine.Matches,
		Leaderboard:  engine.Leaderboard,
	}

	c.JSON(http.StatusOK, response)
}

// nextRound генерирует следующий раунд
// @Summary Генерация следующего раунда
// @Description Генерирует матчи для следующего раунда турнира
// @Tags counter
// @Produce json
// @Param event_id path string true "ID события"
// @Success 200 {object} NextRoundResponse
// @Failure 400 {object} ginerr.ErrorResponse
// @Failure 404 {object} ginerr.ErrorResponse
// @Failure 500 {object} ginerr.ErrorResponse
// @Router /events/{event_id}/counter/next-round [post]
func (h *Handler) nextRound(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	engine, err := h.cases.Counter.StartNextRound(c.Request.Context(), eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to start next round") {
		return
	}

	// Получаем матчи текущего раунда
	var currentRoundMatches []domain.TournamentMatch
	for _, match := range engine.Matches {
		if match.Round == engine.State.CurrentRound {
			currentRoundMatches = append(currentRoundMatches, match)
		}
	}

	response := NextRoundResponse{
		Round:   engine.State.CurrentRound,
		Matches: currentRoundMatches,
	}

	c.JSON(http.StatusOK, response)
}

// finishTournament завершает турнир
// @Summary Завершение турнира
// @Description Завершает турнир и формирует финальные результаты
// @Tags counter
// @Produce json
// @Param event_id path string true "ID события"
// @Success 200 {object} FinishTournamentResponse
// @Failure 404 {object} ginerr.ErrorResponse
// @Failure 500 {object} ginerr.ErrorResponse
// @Router /events/{event_id}/counter/finish [post]
func (h *Handler) finishTournament(c *gin.Context) {
	eventID := c.Param("event_id")
	if eventID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "event_id is required"})
		return
	}

	engine, err := h.cases.Counter.FinishTournament(c.Request.Context(), eventID)
	if ginerr.AbortIfErr(c, err, http.StatusInternalServerError, "Failed to finish tournament") {
		return
	}

	response := FinishTournamentResponse{
		FinalLeaderboard: engine.Leaderboard,
	}

	// Находим победителя (первое место в лидерборде)
	if len(engine.Leaderboard) > 0 {
		winnerID := engine.Leaderboard[0].UserID
		for _, participant := range engine.Participants {
			if participant.ID == winnerID {
				response.Winner = &participant
				break
			}
		}
	}

	c.JSON(http.StatusOK, response)
}
