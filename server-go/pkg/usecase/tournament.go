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
	// Если обновляется поле Data (результаты турнира), то автоматически устанавливаем is_finished = true
	if len(tournament.Data) > 0 {
		// Создаем AdminPatchTournament для обновления is_finished
		adminPatch := &domain.AdminPatchTournament{
			Name:           tournament.Name,
			StartTime:      tournament.StartTime,
			EndTime:        tournament.EndTime,
			Price:          tournament.Price,
			RankMin:        tournament.RankMin,
			RankMax:        tournament.RankMax,
			MaxUsers:       tournament.MaxUsers,
			Description:    tournament.Description,
			CourtID:        tournament.CourtID,
			ClubID:         tournament.ClubID,
			TournamentType: tournament.TournamentType,
			Data:           tournament.Data,
			IsFinished:     &[]bool{true}[0], // Устанавливаем is_finished = true
		}
		
		err := t.TournamentRepo.AdminPatch(ctx, id, adminPatch)
		if err != nil {
			return nil, fmt.Errorf("failed to patch tournament: %w", err)
		}
	} else {
		err := t.TournamentRepo.Patch(ctx, id, tournament)
		if err != nil {
			return nil, fmt.Errorf("failed to patch tournament: %w", err)
		}
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

func (t *Tournament) FilterForUser(ctx *Context, filter *domain.FilterTournament) ([]*domain.Tournament, error) {
	// Автоматически добавляем фильтрацию по клубам пользователя
	if ctx.User != nil && filter.FilterByUserClubs == nil {
		filter.FilterByUserClubs = &ctx.User.ID
	}

	return t.Filter(ctx.Context, filter)
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

// AdminFilter получает турниры для админов с расширенной фильтрацией
func (t *Tournament) AdminFilter(ctx *Context, filter *domain.AdminFilterTournament) ([]*domain.Tournament, error) {
	tournaments, err := t.TournamentRepo.AdminFilter(ctx.Context, filter)
	if err != nil {
		return nil, err
	}

	// Добавляем участников для каждого турнира
	for _, tournament := range tournaments {
		participants, err := t.GetTournamentParticipants(ctx.Context, tournament.ID)
		if err != nil {
			return nil, err
		}
		tournament.Participants = participants
	}

	return tournaments, nil
}

// AdminCreate создает турнир для админов
func (t *Tournament) AdminCreate(ctx *Context, tournament *domain.CreateTournament) (*domain.Tournament, error) {
	id, err := t.TournamentRepo.Create(ctx.Context, tournament)
	if err != nil {
		return nil, fmt.Errorf("failed to create tournament: %w", err)
	}
	
	// Получаем созданный турнир
	filter := &domain.AdminFilterTournament{ID: &id}
	tournaments, err := t.AdminFilter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get created tournament: %w", err)
	}
	
	if len(tournaments) == 0 {
		return nil, fmt.Errorf("created tournament not found")
	}
	
	return tournaments[0], nil
}

// AdminPatch обновляет турнир для админов
func (t *Tournament) AdminPatch(ctx *Context, id string, tournament *domain.AdminPatchTournament) (*domain.Tournament, error) {
	err := t.TournamentRepo.AdminPatch(ctx.Context, id, tournament)
	if err != nil {
		return nil, fmt.Errorf("failed to patch tournament: %w", err)
	}
	
	// Получаем обновленный турнир
	filter := &domain.AdminFilterTournament{ID: &id}
	tournaments, err := t.AdminFilter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated tournament: %w", err)
	}
	
	if len(tournaments) == 0 {
		return nil, fmt.Errorf("updated tournament not found")
	}
	
	return tournaments[0], nil
}

// AdminDelete удаляет турнир для админов
func (t *Tournament) AdminDelete(ctx *Context, id string) error {
	return t.TournamentRepo.AdminDelete(ctx.Context, id)
}
