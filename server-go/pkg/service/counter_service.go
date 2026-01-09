package service

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"sort"
	"time"

	"github.com/google/uuid"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

// CounterService управляет турнирными счетчиками
type CounterService struct {
	eventRepo domain.EventRepository
}

// NewCounterService создает новый экземпляр CounterService
func NewCounterService(eventRepo domain.EventRepository) *CounterService {
	return &CounterService{
		eventRepo: eventRepo,
	}
}

// InitializeTournament инициализирует турнир с заданными параметрами
func (s *CounterService) InitializeTournament(ctx context.Context, eventID string, config domain.TournamentConfig, format domain.TournamentFormat, mode domain.TournamentMode) error {
	// Получаем событие
	event, err := s.eventRepo.GetByID(ctx, eventID)
	if err != nil {
		return fmt.Errorf("failed to get event: %w", err)
	}

	// Получаем участников
	participants, err := s.eventRepo.GetParticipants(ctx, eventID)
	if err != nil {
		return fmt.Errorf("failed to get participants: %w", err)
	}

	if len(participants) < 4 {
		return fmt.Errorf("minimum 4 participants required, got %d", len(participants))
	}

	// Создаем структуру данных турнира
	tournamentPlayers := make([]domain.TournamentPlayer, len(participants))
	for i, participant := range participants {
		tournamentPlayers[i] = domain.TournamentPlayer{
			ID:   participant.ID,
			Name: fmt.Sprintf("%s %s", participant.FirstName, participant.LastName),
			Rank: participant.Rank,
			Seed: i + 1,
			Stats: domain.TournamentStats{
				Wins:        0,
				Draws:       0,
				Losses:      0,
				Scored:      0,
				Conceded:    0,
				Diff:        0,
				TablePoints: 0,
				WDLPoints:   0,
			},
		}
	}

	// Перемешиваем участников для начального сида
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(tournamentPlayers), func(i, j int) {
		tournamentPlayers[i], tournamentPlayers[j] = tournamentPlayers[j], tournamentPlayers[i]
	})

	// Обновляем сиды после перемешивания
	for i := range tournamentPlayers {
		tournamentPlayers[i].Seed = i + 1
	}

	// Рассчитываем количество раундов
	roundsCount := s.calculateRoundsCount(len(participants), config.CourtsCount, format)
	config.RoundsCount = roundsCount

	// Создаем новую структуру данных события
	eventData := &domain.EventData{
		Domain: domain.EventDomainTournament,
		Tournament: &domain.TournamentData{
			Format: format,
			Mode:   mode,
		},
		TournamentEngine: &domain.TournamentEngine{
			Config:       config,
			State: domain.TournamentState{
				Status:       domain.TournamentEngineStatusNotStarted,
				CurrentRound: 0,
			},
			Participants: tournamentPlayers,
			Matches:      []domain.TournamentMatch{},
			Leaderboard:  []domain.LeaderboardEntry{},
		},
		Result: json.RawMessage("{}"),
	}

	// Автоматически создаем начальные результаты
	s.updateTournamentResults(eventData, eventData.TournamentEngine)

	// Сериализуем данные
	dataBytes, err := json.Marshal(eventData)
	if err != nil {
		return fmt.Errorf("failed to marshal event data: %w", err)
	}

	// Обновляем событие
	event.Data = json.RawMessage(dataBytes)
	event.Status = domain.EventStatusInProgress

	err = s.eventRepo.Update(ctx, event)
	if err != nil {
		return fmt.Errorf("failed to update event: %w", err)
	}

	return nil
}

// StartNextRound генерирует матчи для следующего раунда
func (s *CounterService) StartNextRound(ctx context.Context, eventID string) (*domain.TournamentEngine, error) {
	event, err := s.eventRepo.GetByID(ctx, eventID)
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	var eventData domain.EventData
	if err := json.Unmarshal(event.Data, &eventData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal event data: %w", err)
	}

	if !eventData.IsTournament() {
		return nil, fmt.Errorf("event is not a tournament")
	}

	engine := eventData.TournamentEngine
	if engine.State.Status == domain.TournamentEngineStatusFinished {
		return nil, fmt.Errorf("tournament is already finished")
	}

	// Проверяем, завершены ли все матчи текущего раунда
	if engine.State.CurrentRound > 0 {
		currentRoundMatches := s.getMatchesByRound(engine.Matches, engine.State.CurrentRound)
		for _, match := range currentRoundMatches {
			if match.Status != domain.MatchStatusCompleted {
				return nil, fmt.Errorf("current round is not completed yet")
			}
		}
	}

	// Переходим к следующему раунду
	engine.State.CurrentRound++

	// Генерируем матчи для нового раунда
	var newMatches []domain.TournamentMatch
	if eventData.Tournament.Format == domain.TournamentFormatAmericano {
		newMatches = s.generateAmericanoMatches(engine.Participants, engine.State.CurrentRound, engine.Config.CourtsCount)
	} else {
		newMatches = s.generateMexicanoMatches(engine.Participants, engine.State.CurrentRound, engine.Config.CourtsCount)
	}

	engine.Matches = append(engine.Matches, newMatches...)
	engine.State.Status = domain.TournamentEngineStatusActive

	// Автоматически обновляем результаты
	s.updateTournamentResults(&eventData, engine)

	// Сохраняем обновленные данные
	dataBytes, err := json.Marshal(&eventData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal event data: %w", err)
	}

	event.Data = json.RawMessage(dataBytes)
	if err := s.eventRepo.Update(ctx, event); err != nil {
		return nil, fmt.Errorf("failed to update event: %w", err)
	}

	return engine, nil
}

// UpdateMatchScore обновляет счет матча и пересчитывает статистику
func (s *CounterService) UpdateMatchScore(ctx context.Context, eventID, matchID string, teamAScore, teamBScore int) error {
	event, err := s.eventRepo.GetByID(ctx, eventID)
	if err != nil {
		return fmt.Errorf("failed to get event: %w", err)
	}

	var eventData domain.EventData
	if err := json.Unmarshal(event.Data, &eventData); err != nil {
		return fmt.Errorf("failed to unmarshal event data: %w", err)
	}

	if !eventData.IsTournament() {
		return fmt.Errorf("event is not a tournament")
	}

	engine := eventData.TournamentEngine

	// Валидация счета
	totalScore := teamAScore + teamBScore
	if totalScore != engine.Config.MatchPoints {
		return fmt.Errorf("invalid score: %d + %d = %d, expected %d", 
			teamAScore, teamBScore, totalScore, engine.Config.MatchPoints)
	}

	// Находим матч
	var matchIndex = -1
	for i, match := range engine.Matches {
		if match.ID == matchID {
			matchIndex = i
			break
		}
	}

	if matchIndex == -1 {
		return fmt.Errorf("match not found")
	}

	match := &engine.Matches[matchIndex]
	
	// Сохраняем старые счета для отката статистики
	oldTeamAScore := match.TeamA.Score
	oldTeamBScore := match.TeamB.Score
	wasCompleted := match.Status == domain.MatchStatusCompleted

	// Обновляем счет
	match.TeamA.Score = teamAScore
	match.TeamB.Score = teamBScore
	match.Status = domain.MatchStatusCompleted
	now := time.Now()
	match.EndTime = &now

	// Пересчитываем статистику участников
	if err := s.updatePlayerStats(engine, match, oldTeamAScore, oldTeamBScore, wasCompleted); err != nil {
		return fmt.Errorf("failed to update player stats: %w", err)
	}

	// Обновляем лидерборд
	s.updateLeaderboard(engine)

	// Автоматически обновляем промежуточные результаты
	s.updateTournamentResults(&eventData, engine)

	// Сохраняем данные
	dataBytes, err := json.Marshal(&eventData)
	if err != nil {
		return fmt.Errorf("failed to marshal event data: %w", err)
	}

	event.Data = json.RawMessage(dataBytes)
	if err := s.eventRepo.Update(ctx, event); err != nil {
		return fmt.Errorf("failed to update event: %w", err)
	}

	return nil
}

// FinishTournament завершает турнир
func (s *CounterService) FinishTournament(ctx context.Context, eventID string) (*domain.TournamentEngine, error) {
	event, err := s.eventRepo.GetByID(ctx, eventID)
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	var eventData domain.EventData
	if err := json.Unmarshal(event.Data, &eventData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal event data: %w", err)
	}

	if !eventData.IsTournament() {
		return nil, fmt.Errorf("event is not a tournament")
	}

	engine := eventData.TournamentEngine
	engine.State.Status = domain.TournamentEngineStatusFinished

	// Обновляем финальный лидерборд
	s.updateLeaderboard(engine)

	// Автоматически формируем финальные результаты
	s.updateTournamentResults(&eventData, engine)

	// Обновляем статус события
	event.Status = domain.EventStatusCompleted

	// Сохраняем данные
	dataBytes, err := json.Marshal(&eventData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal event data: %w", err)
	}

	event.Data = json.RawMessage(dataBytes)
	if err := s.eventRepo.Update(ctx, event); err != nil {
		return nil, fmt.Errorf("failed to update event: %w", err)
	}

	return engine, nil
}

// GetTournamentState возвращает текущее состояние турнира
func (s *CounterService) GetTournamentState(ctx context.Context, eventID string) (*domain.TournamentEngine, error) {
	event, err := s.eventRepo.GetByID(ctx, eventID)
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	// Проверяем, что это турнир по типу события
	if event.Type != domain.EventTypeTournament {
		return nil, fmt.Errorf("event is not a tournament")
	}

	// Если данные пустые или не содержат структуру турнира, возвращаем nil
	if len(event.Data) == 0 {
		return nil, fmt.Errorf("tournament not initialized")
	}

	var eventData domain.EventData
	if err := json.Unmarshal(event.Data, &eventData); err != nil {
		return nil, fmt.Errorf("tournament not initialized")
	}

	// Если это не турнир или нет турнирного движка, значит не инициализирован
	if !eventData.IsTournament() || eventData.TournamentEngine == nil {
		return nil, fmt.Errorf("tournament not initialized")
	}

	return eventData.TournamentEngine, nil
}

// Вспомогательные методы

func (s *CounterService) calculateRoundsCount(participantsCount, courtsCount int, format domain.TournamentFormat) int {
	if format == domain.TournamentFormatAmericano {
		// Для Americano количество раундов фиксированное
		return participantsCount - 1
	} else {
		// Для Mexicano количество раундов может быть гибким
		return participantsCount / 2
	}
}

func (s *CounterService) getMatchesByRound(matches []domain.TournamentMatch, round int) []domain.TournamentMatch {
	var roundMatches []domain.TournamentMatch
	for _, match := range matches {
		if match.Round == round {
			roundMatches = append(roundMatches, match)
		}
	}
	return roundMatches
}

func (s *CounterService) generateAmericanoMatches(participants []domain.TournamentPlayer, round, courtsCount int) []domain.TournamentMatch {
	var matches []domain.TournamentMatch
	
	// Простая реализация round-robin для Americano
	participantCount := len(participants)
	matchesPerRound := participantCount / 4 * courtsCount
	
	for court := 1; court <= courtsCount && len(matches) < matchesPerRound; court++ {
		// Генерируем пары для корта
		baseIndex := (court - 1) * 4
		if baseIndex+3 < participantCount {
			match := domain.TournamentMatch{
				ID:     uuid.New().String(),
				Round:  round,
				Court:  court,
				Status: domain.MatchStatusPending,
				TeamA: domain.MatchTeam{
					Player1: participants[baseIndex].ID,
					Player2: participants[baseIndex+1].ID,
					Score:   0,
				},
				TeamB: domain.MatchTeam{
					Player1: participants[baseIndex+2].ID,
					Player2: participants[baseIndex+3].ID,
					Score:   0,
				},
			}
			matches = append(matches, match)
		}
	}

	return matches
}

// updateTournamentResults автоматически обновляет результаты турнира
func (s *CounterService) updateTournamentResults(eventData *domain.EventData, engine *domain.TournamentEngine) {
	// Создаем структуру результатов на основе текущего лидерборда
	leaderboardEntries := make([]map[string]interface{}, len(engine.Leaderboard))
	
	for i, entry := range engine.Leaderboard {
		// Находим участника по ID
		var participant *domain.TournamentPlayer
		for j := range engine.Participants {
			if engine.Participants[j].ID == entry.UserID {
				participant = &engine.Participants[j]
				break
			}
		}
		
		if participant != nil {
			leaderboardEntries[i] = map[string]interface{}{
				"place":  entry.Position,
				"userId": entry.UserID,
				"name":   participant.Name,
				"stats": map[string]interface{}{
					"wins":        participant.Stats.Wins,
					"draws":       participant.Stats.Draws,
					"losses":      participant.Stats.Losses,
					"scored":      participant.Stats.Scored,
					"conceded":    participant.Stats.Conceded,
					"diff":        participant.Stats.Diff,
					"tablePoints": participant.Stats.TablePoints,
					"wdlPoints":   participant.Stats.WDLPoints,
				},
			}
		}
	}

	// Формируем результаты турнира
	resultData := map[string]interface{}{
		"leaderboard": leaderboardEntries,
		"updatedAt":   time.Now(),
	}

	// Если турнир завершен, добавляем информацию о завершении
	if engine.State.Status == domain.TournamentEngineStatusFinished {
		resultData["completedAt"] = time.Now()
		resultData["status"] = "completed"
		
		// Определяем победителя
		if len(leaderboardEntries) > 0 {
			resultData["winner"] = leaderboardEntries[0]
		}
	} else {
		resultData["status"] = "in_progress"
	}

	// Сериализуем и сохраняем результаты
	resultBytes, err := json.Marshal(resultData)
	if err == nil {
		eventData.Result = json.RawMessage(resultBytes)
	}
}

func (s *CounterService) generateMexicanoMatches(participants []domain.TournamentPlayer, round, courtsCount int) []domain.TournamentMatch {
	// Для Mexicano сортируем участников по текущему рейтингу
	sortedParticipants := make([]domain.TournamentPlayer, len(participants))
	copy(sortedParticipants, participants)
	
	sort.Slice(sortedParticipants, func(i, j int) bool {
		if sortedParticipants[i].Stats.WDLPoints != sortedParticipants[j].Stats.WDLPoints {
			return sortedParticipants[i].Stats.WDLPoints > sortedParticipants[j].Stats.WDLPoints
		}
		if sortedParticipants[i].Stats.Diff != sortedParticipants[j].Stats.Diff {
			return sortedParticipants[i].Stats.Diff > sortedParticipants[j].Stats.Diff
		}
		return sortedParticipants[i].Stats.TablePoints > sortedParticipants[j].Stats.TablePoints
	})
	
	var matches []domain.TournamentMatch
	
	// Формула Mexicano: 1+4 vs 2+3
	for court := 1; court <= courtsCount && (court-1)*4+3 < len(sortedParticipants); court++ {
		baseIndex := (court - 1) * 4
		match := domain.TournamentMatch{
			ID:     uuid.New().String(),
			Round:  round,
			Court:  court,
			Status: domain.MatchStatusPending,
			TeamA: domain.MatchTeam{
				Player1: sortedParticipants[baseIndex].ID,     // 1-й
				Player2: sortedParticipants[baseIndex+3].ID,   // 4-й
				Score:   0,
			},
			TeamB: domain.MatchTeam{
				Player1: sortedParticipants[baseIndex+1].ID,   // 2-й
				Player2: sortedParticipants[baseIndex+2].ID,   // 3-й
				Score:   0,
			},
		}
		matches = append(matches, match)
	}
	
	return matches
}

func (s *CounterService) updatePlayerStats(engine *domain.TournamentEngine, match *domain.TournamentMatch, oldTeamAScore, oldTeamBScore int, wasCompleted bool) error {
	// Находим игроков
	var teamAPlayers, teamBPlayers []*domain.TournamentPlayer
	
	for i := range engine.Participants {
		player := &engine.Participants[i]
		if player.ID == match.TeamA.Player1 || player.ID == match.TeamA.Player2 {
			teamAPlayers = append(teamAPlayers, player)
		}
		if player.ID == match.TeamB.Player1 || player.ID == match.TeamB.Player2 {
			teamBPlayers = append(teamBPlayers, player)
		}
	}
	
	// Откатываем старую статистику если матч уже был завершен
	if wasCompleted {
		s.revertPlayerStats(teamAPlayers, teamBPlayers, oldTeamAScore, oldTeamBScore)
	}
	
	// Применяем новую статистику
	s.applyPlayerStats(teamAPlayers, teamBPlayers, match.TeamA.Score, match.TeamB.Score)
	
	return nil
}

func (s *CounterService) revertPlayerStats(teamAPlayers, teamBPlayers []*domain.TournamentPlayer, teamAScore, teamBScore int) {
	// Откатываем статистику команды A
	for _, player := range teamAPlayers {
		player.Stats.Scored -= teamAScore
		player.Stats.Conceded -= teamBScore
		player.Stats.Diff = player.Stats.Scored - player.Stats.Conceded
		player.Stats.TablePoints = player.Stats.Scored
		
		if teamAScore > teamBScore {
			player.Stats.Wins--
			player.Stats.WDLPoints -= 2
		} else if teamAScore == teamBScore {
			player.Stats.Draws--
			player.Stats.WDLPoints -= 1
		} else {
			player.Stats.Losses--
		}
	}
	
	// Откатываем статистику команды B
	for _, player := range teamBPlayers {
		player.Stats.Scored -= teamBScore
		player.Stats.Conceded -= teamAScore
		player.Stats.Diff = player.Stats.Scored - player.Stats.Conceded
		player.Stats.TablePoints = player.Stats.Scored
		
		if teamBScore > teamAScore {
			player.Stats.Wins--
			player.Stats.WDLPoints -= 2
		} else if teamBScore == teamAScore {
			player.Stats.Draws--
			player.Stats.WDLPoints -= 1
		} else {
			player.Stats.Losses--
		}
	}
}

func (s *CounterService) applyPlayerStats(teamAPlayers, teamBPlayers []*domain.TournamentPlayer, teamAScore, teamBScore int) {
	// Обновляем статистику команды A
	for _, player := range teamAPlayers {
		player.Stats.Scored += teamAScore
		player.Stats.Conceded += teamBScore
		player.Stats.Diff = player.Stats.Scored - player.Stats.Conceded
		player.Stats.TablePoints = player.Stats.Scored
		
		if teamAScore > teamBScore {
			player.Stats.Wins++
			player.Stats.WDLPoints += 2
		} else if teamAScore == teamBScore {
			player.Stats.Draws++
			player.Stats.WDLPoints += 1
		} else {
			player.Stats.Losses++
		}
	}
	
	// Обновляем статистику команды B
	for _, player := range teamBPlayers {
		player.Stats.Scored += teamBScore
		player.Stats.Conceded += teamAScore
		player.Stats.Diff = player.Stats.Scored - player.Stats.Conceded
		player.Stats.TablePoints = player.Stats.Scored
		
		if teamBScore > teamAScore {
			player.Stats.Wins++
			player.Stats.WDLPoints += 2
		} else if teamBScore == teamAScore {
			player.Stats.Draws++
			player.Stats.WDLPoints += 1
		} else {
			player.Stats.Losses++
		}
	}
}

func (s *CounterService) updateLeaderboard(engine *domain.TournamentEngine) {
	// Создаем копию участников для сортировки
	sortedParticipants := make([]domain.TournamentPlayer, len(engine.Participants))
	copy(sortedParticipants, engine.Participants)
	
	// Сортируем по правилам лидерборда
	sort.Slice(sortedParticipants, func(i, j int) bool {
		a, b := sortedParticipants[i].Stats, sortedParticipants[j].Stats
		
		if a.WDLPoints != b.WDLPoints {
			return a.WDLPoints > b.WDLPoints
		}
		if a.Diff != b.Diff {
			return a.Diff > b.Diff
		}
		if a.TablePoints != b.TablePoints {
			return a.TablePoints > b.TablePoints
		}
		return sortedParticipants[i].Seed < sortedParticipants[j].Seed
	})
	
	// Создаем лидерборд
	engine.Leaderboard = make([]domain.LeaderboardEntry, len(sortedParticipants))
	for i, participant := range sortedParticipants {
		engine.Leaderboard[i] = domain.LeaderboardEntry{
			Position: i + 1,
			UserID:   participant.ID,
			Stats:    participant.Stats,
		}
	}
}
