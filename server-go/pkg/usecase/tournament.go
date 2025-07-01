package usecase

import (
	"context"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Tournament struct {
	ctx            context.Context
	TournamentRepo repo.Tournament
	RegistrationRepo repo.Registration
}

func NewTournament(ctx context.Context, TournamentRepo repo.Tournament, RegistrationRepo repo.Registration) *Tournament {
	return &Tournament{
		ctx:            ctx,
		TournamentRepo: TournamentRepo,
		RegistrationRepo: RegistrationRepo,
	}
}

func (t *Tournament) Filter(ctx context.Context, filter *domain.FilterTournament) ([]*domain.Tournament, error) {
	tournaments, err := t.TournamentRepo.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}

	for _, tournament := range tournaments {
		participants, err := t.GetTournamentParticipants(ctx, tournament.ID)
		if err != nil {
			return nil, err
		}
		tournament.Participants = participants
	}

	return tournaments, nil
}

func (t *Tournament) GetTournamentsByUserID(ctx Context, userID string) ([]*domain.Tournament, error) {
	tournaments, err := t.TournamentRepo.GetTournamentsByUserID(ctx.Context, userID)
	if err != nil {
		return nil, err
	}

	for _, tournament := range tournaments {
		participants, err := t.GetTournamentParticipants(ctx.Context, tournament.ID)
		if err != nil {
			return nil, err
		}
		tournament.Participants = participants
	}

	return tournaments, nil
}

func (t *Tournament) GetTournamentParticipants(ctx context.Context, tournamentID string) ([]*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		TournamentID: &tournamentID,
	}
	
	registrations, err := t.RegistrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}

	// Фильтруем только нужные статусы: ACTIVE, PENDING, CANCELED_BY_USER
	var participants []*domain.Registration
	for _, reg := range registrations {
		if reg.Status == domain.RegistrationStatusActive || 
		   reg.Status == domain.RegistrationStatusPending || 
		   reg.Status == domain.RegistrationStatusCanceledByUser {
			participants = append(participants, reg)
		}
	}

	return participants, nil
}
