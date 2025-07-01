package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Registration struct {
	registrationRepo repo.Registration
	tournamentRepo   repo.Tournament
}

func NewRegistration(ctx context.Context, registrationRepo repo.Registration, tournamentRepo repo.Tournament) *Registration {
	return &Registration{
		registrationRepo: registrationRepo,
		tournamentRepo:   tournamentRepo,
	}
}

// Новая рега или обновление существующую CANCELED -> PENDING
func (r *Registration) RegisterForTournament(ctx context.Context, user *domain.User, tournamentID string) (*domain.Registration, error) {
	tournament, err := r.getTournamentByID(ctx, tournamentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tournament: %w", err)
	}

	if err := r.validateTournamentNotEnded(tournament); err != nil {
		return nil, err
	}

	if err := r.validateUserRank(user, tournament); err != nil {
		return nil, err
	}

	filter := &domain.FilterRegistration{
		UserID:       &user.ID,
		TournamentID: &tournamentID,
	}
	
	existingRegistrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing registrations: %w", err)
	}

	// Если есть рега, то обновить статус
	for _, reg := range existingRegistrations {
		switch reg.Status {
		case domain.RegistrationStatusPending:
			return nil, fmt.Errorf("user already has a pending registration for this tournament")
		case domain.RegistrationStatusActive:
			return nil, fmt.Errorf("user already has an active registration for this tournament")
		case domain.RegistrationStatusCanceledByUser:
			return nil, fmt.Errorf("user has a canceled registration. Use reactivate endpoint to restore it")
		case domain.RegistrationStatusCanceled:
			if err := r.validateAvailableSlots(ctx, tournamentID); err != nil {
				return nil, err
			}

			// CANCELED -> PENDING
			pendingStatus := domain.RegistrationStatusPending
			patch := &domain.PatchRegistration{
				Status: &pendingStatus,
			}
			
			err := r.registrationRepo.Patch(ctx, reg.ID, patch)
			if err != nil {
				return nil, fmt.Errorf("failed to update registration status: %w", err)
			}
			
			return r.getRegistrationByID(ctx, reg.ID)
		}
	}

	if err := r.validateAvailableSlots(ctx, tournamentID); err != nil {
		return nil, err
	}

	// Создаем новую регистрацию
	createRegistration := &domain.CreateRegistration{
		UserID:       user.ID,
		TournamentID: tournamentID,
		Status:       domain.RegistrationStatusPending,
	}

	id, err := r.registrationRepo.Create(ctx, createRegistration)
	if err != nil {
		return nil, fmt.Errorf("failed to create registration: %w", err)
	}

	return r.getRegistrationByID(ctx, id)
}

// PENDING -> CANCELED
func (r *Registration) CancelBeforePayment(ctx context.Context, user *domain.User, tournamentID string) (*domain.Registration, error) {
	tournament, err := r.getTournamentByID(ctx, tournamentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tournament: %w", err)
	}

	if err := r.validateTournamentNotEnded(tournament); err != nil {
		return nil, err
	}

	registration, err := r.findActiveRegistration(ctx, user.ID, tournamentID)
	if err != nil {
		return nil, err
	}

	if registration.Status != domain.RegistrationStatusPending {
		return nil, fmt.Errorf("can only cancel pending registrations before payment")
	}

	canceledStatus := domain.RegistrationStatusCanceled
	patch := &domain.PatchRegistration{
		Status: &canceledStatus,
	}

	err = r.registrationRepo.Patch(ctx, registration.ID, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to cancel registration: %w", err)
	}

	return r.getRegistrationByID(ctx, registration.ID)
}

// ACTIVE -> CANCELED_BY_USER
func (r *Registration) CancelAfterPayment(ctx context.Context, user *domain.User, tournamentID string) (*domain.Registration, error) {
	tournament, err := r.getTournamentByID(ctx, tournamentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tournament: %w", err)
	}

	if err := r.validateTournamentNotEnded(tournament); err != nil {
		return nil, err
	}

	registration, err := r.findActiveRegistration(ctx, user.ID, tournamentID)
	if err != nil {
		return nil, err
	}

	if registration.Status != domain.RegistrationStatusActive {
		return nil, fmt.Errorf("can only cancel active (paid) registrations")
	}

	canceledByUserStatus := domain.RegistrationStatusCanceledByUser
	patch := &domain.PatchRegistration{
		Status: &canceledByUserStatus,
	}

	err = r.registrationRepo.Patch(ctx, registration.ID, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to cancel registration: %w", err)
	}

	return r.getRegistrationByID(ctx, registration.ID)
}

// CANCELED_BY_USER -> ACTIVE
func (r *Registration) ReactivateRegistration(ctx context.Context, user *domain.User, tournamentID string) (*domain.Registration, error) {
	tournament, err := r.getTournamentByID(ctx, tournamentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tournament: %w", err)
	}

	if err := r.validateTournamentNotEnded(tournament); err != nil {
		return nil, err
	}

	if err := r.validateUserRank(user, tournament); err != nil {
		return nil, err
	}

	registration, err := r.findActiveRegistration(ctx, user.ID, tournamentID)
	if err != nil {
		return nil, err
	}

	if registration.Status != domain.RegistrationStatusCanceledByUser {
		return nil, fmt.Errorf("can only reactivate registrations that were canceled by user after payment")
	}

	if err := r.validateAvailableSlots(ctx, tournamentID); err != nil {
		return nil, err
	}

	activeStatus := domain.RegistrationStatusActive
	patch := &domain.PatchRegistration{
		Status: &activeStatus,
	}

	err = r.registrationRepo.Patch(ctx, registration.ID, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to reactivate registration: %w", err)
	}

	return r.getRegistrationByID(ctx, registration.ID)
}

// PENDING -> ACTIVE
func (r *Registration) ActivateRegistration(ctx context.Context, user *domain.User, tournamentID string) (*domain.Registration, error) {
	// Получаем информацию о турнире
	tournament, err := r.getTournamentByID(ctx, tournamentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tournament: %w", err)
	}

	// Проверяем, что турнир еще не закончился
	if err := r.validateTournamentNotEnded(tournament); err != nil {
		return nil, err
	}

	registration, err := r.findActiveRegistration(ctx, user.ID, tournamentID)
	if err != nil {
		return nil, err
	}

	if registration.Status != domain.RegistrationStatusPending {
		return nil, fmt.Errorf("can only activate pending registrations")
	}

	activeStatus := domain.RegistrationStatusActive
	patch := &domain.PatchRegistration{
		Status: &activeStatus,
	}

	err = r.registrationRepo.Patch(ctx, registration.ID, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to activate registration: %w", err)
	}

	return r.getRegistrationByID(ctx, registration.ID)
}

// Все реги пользователя
func (r *Registration) GetUserRegistrations(ctx context.Context, userID string) ([]*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		UserID: &userID,
	}

	return r.registrationRepo.Filter(ctx, filter)
}

// Все реги турнира
func (r *Registration) GetTournamentRegistrations(ctx context.Context, tournamentID string) ([]*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		TournamentID: &tournamentID,
	}

	return r.registrationRepo.Filter(ctx, filter)
}

// Вспомогательные методы

func (r *Registration) findActiveRegistration(ctx context.Context, userID, tournamentID string) (*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		UserID:       &userID,
		TournamentID: &tournamentID,
	}

	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to find registration: %w", err)
	}

	// Ищем любую регистрацию (не только активную)
	for _, reg := range registrations {
		return reg, nil
	}

	return nil, fmt.Errorf("no registration found for this tournament")
}

func (r *Registration) getRegistrationByID(ctx context.Context, id string) (*domain.Registration, error) {
	filter := &domain.FilterRegistration{ID: &id}
	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get registration: %w", err)
	}

	if len(registrations) == 0 {
		return nil, fmt.Errorf("registration not found")
	}

	return registrations[0], nil
}

func (r *Registration) getTournamentByID(ctx context.Context, tournamentID string) (*domain.Tournament, error) {
	filter := &domain.FilterTournament{ID: tournamentID}
	tournaments, err := r.tournamentRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get tournament: %w", err)
	}

	if len(tournaments) == 0 {
		return nil, fmt.Errorf("tournament not found")
	}

	return tournaments[0], nil
}

func (r *Registration) validateTournamentNotEnded(tournament *domain.Tournament) error {
	now := time.Now()
	if !tournament.EndTime.IsZero() && tournament.EndTime.Before(now) {
		return fmt.Errorf("tournament has already ended")
	}
	if tournament.EndTime.IsZero() && tournament.StartTime.Add(24*time.Hour).Before(now) {
		return fmt.Errorf("tournament has already ended")
	}
	return nil
}

func (r *Registration) validateUserRank(user *domain.User, tournament *domain.Tournament) error {
	if user.Rank < tournament.RankMin || user.Rank > tournament.RankMax {
		return fmt.Errorf("user rank %.1f is not within tournament range %.1f-%.1f", 
			user.Rank, tournament.RankMin, tournament.RankMax)
	}
	return nil
}

func (r *Registration) validateAvailableSlots(ctx context.Context, tournamentID string) error {
	tournament, err := r.getTournamentByID(ctx, tournamentID)
	if err != nil {
		return err
	}

	filter := &domain.FilterRegistration{
		TournamentID: &tournamentID,
	}
	
	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to get tournament registrations: %w", err)
	}

	activeCount := 0
	for _, reg := range registrations {
		if reg.Status == domain.RegistrationStatusPending || reg.Status == domain.RegistrationStatusActive {
			activeCount++
		}
	}

	if activeCount >= tournament.MaxUsers {
		return fmt.Errorf("tournament is full (max %d users)", tournament.MaxUsers)
	}

	return nil
} 