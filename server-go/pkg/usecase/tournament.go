package usecase

import (
	"context"
	"fmt"

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

func (t *Tournament) Create(ctx context.Context, tournament *domain.CreateTournament) (*domain.Tournament, error) {
	id, err := t.TournamentRepo.Create(ctx, tournament)
	if err != nil {
		return nil, fmt.Errorf("failed to create tournament: %w", err)
	}
	
	filter := &domain.FilterTournament{ID: id}
	tournaments, err := t.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get created tournament: %w", err)
	}
	
	if len(tournaments) == 0 {
		return nil, fmt.Errorf("created tournament not found")
	}
	
	return tournaments[0], nil
}

func (t *Tournament) Patch(ctx context.Context, id string, tournament *domain.PatchTournament) (*domain.Tournament, error) {
	err := t.TournamentRepo.Patch(ctx, id, tournament)
	if err != nil {
		return nil, fmt.Errorf("failed to patch tournament: %w", err)
	}
	
	filter := &domain.FilterTournament{ID: id}
	tournaments, err := t.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated tournament: %w", err)
	}
	
	if len(tournaments) == 0 {
		return nil, fmt.Errorf("updated tournament not found")
	}
	
	return tournaments[0], nil
}

func (t *Tournament) Delete(ctx context.Context, id string) error {
	return t.TournamentRepo.Delete(ctx, id)
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

func (t *Tournament) GetTournamentByID(ctx context.Context, tournamentID string) (*domain.Tournament, error) {
	filter := &domain.FilterTournament{
		ID: tournamentID,
	}
	
	tournaments, err := t.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}
	
	if len(tournaments) == 0 {
		return nil, fmt.Errorf("tournament not found")
	}
	
	return tournaments[0], nil
}

func (t *Tournament) CheckOwnership(ctx context.Context, tournamentID string, adminUserID string) error {
	tournament, err := t.GetTournamentByID(ctx, tournamentID)
	if err != nil {
		return err
	}
	
	if tournament.Organizator.ID != adminUserID {
		return fmt.Errorf("tournament belongs to a different organizer")
	}
	
	return nil
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
	participants := make([]*domain.Registration, 0)
	for _, reg := range registrations {
		if reg.Status == domain.RegistrationStatusActive || 
		   reg.Status == domain.RegistrationStatusPending || 
		   reg.Status == domain.RegistrationStatusCanceledByUser {
			participants = append(participants, reg)
		}
	}

	return participants, nil
}
