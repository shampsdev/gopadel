package usecase

import (
	"context"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/service"
)

// Counter представляет usecase для работы с турнирным счетчиком
type Counter struct {
	ctx     context.Context
	service *service.CounterService
}

// NewCounter создает новый экземпляр Counter usecase
func NewCounter(ctx context.Context, eventRepo domain.EventRepository) *Counter {
	counterService := service.NewCounterService(eventRepo)

	return &Counter{
		ctx:     ctx,
		service: counterService,
	}
}

// InitializeTournament инициализирует турнир с заданными параметрами
func (uc *Counter) InitializeTournament(ctx context.Context, eventID string, config domain.TournamentConfig, format domain.TournamentFormat, mode domain.TournamentMode) error {
	return uc.service.InitializeTournament(ctx, eventID, config, format, mode)
}

// GetTournamentState возвращает текущее состояние турнира
func (uc *Counter) GetTournamentState(ctx context.Context, eventID string) (*domain.TournamentEngine, error) {
	return uc.service.GetTournamentState(ctx, eventID)
}

// UpdateMatchScore обновляет счет матча и пересчитывает статистику
func (uc *Counter) UpdateMatchScore(ctx context.Context, eventID, matchID string, teamAScore, teamBScore int) error {
	return uc.service.UpdateMatchScore(ctx, eventID, matchID, teamAScore, teamBScore)
}

// StartNextRound генерирует матчи для следующего раунда
func (uc *Counter) StartNextRound(ctx context.Context, eventID string) (*domain.TournamentEngine, error) {
	return uc.service.StartNextRound(ctx, eventID)
}

// FinishTournament завершает турнир
func (uc *Counter) FinishTournament(ctx context.Context, eventID string) (*domain.TournamentEngine, error) {
	return uc.service.FinishTournament(ctx, eventID)
}
