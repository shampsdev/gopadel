package usecase

import (
	"context"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Tournament struct {
	ctx            context.Context
	TournamentRepo repo.Tournament
}

func NewTournament(ctx context.Context, TournamentRepo repo.Tournament) *Tournament {
	return &Tournament{
		ctx:            ctx,
		TournamentRepo: TournamentRepo,
	}
}

func (t *Tournament) Filter(ctx context.Context, filter *domain.FilterTournament) ([]*domain.Tournament, error) {
	return t.TournamentRepo.Filter(ctx, filter)
}

func (t *Tournament) GetTournamentsByUserID(ctx Context, userID string) ([]*domain.Tournament, error) {
	return t.TournamentRepo.GetTournamentsByUserID(ctx.Context, userID)
}
