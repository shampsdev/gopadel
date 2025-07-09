package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/notifications"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Registration struct {
	registrationRepo    repo.Registration
	tournamentRepo      repo.Tournament
	paymentRepo         repo.Payment
	notificationService *notifications.NotificationService
}

func NewRegistration(ctx context.Context, registrationRepo repo.Registration, tournamentRepo repo.Tournament, paymentRepo repo.Payment, notificationService *notifications.NotificationService) *Registration {
	return &Registration{
		registrationRepo:    registrationRepo,
		tournamentRepo:      tournamentRepo,
		paymentRepo:         paymentRepo,
		notificationService: notificationService,
	}
}

func (r *Registration) AdminFilter(ctx context.Context, adminFilter *domain.AdminFilterRegistration) ([]*domain.RegistrationWithPayments, error) {
	registrations, err := r.registrationRepo.AdminFilter(ctx, adminFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to filter registrations: %w", err)
	}

	for _, reg := range registrations {
		paymentFilter := &domain.FilterPayment{
			RegistrationID: &reg.ID,
		}
		payments, err := r.paymentRepo.Filter(ctx, paymentFilter)
		if err == nil {
			reg.Payments = payments
		}
	}

	return registrations, nil
}

func (r *Registration) AdminUpdateRegistrationStatus(ctx context.Context, registrationID string, status domain.RegistrationStatus) (*domain.RegistrationWithPayments, error) {
	patch := &domain.PatchRegistration{
		Status: &status,
	}
	
	err := r.registrationRepo.Patch(ctx, registrationID, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to update registration status: %w", err)
	}

	filter := &domain.AdminFilterRegistration{
		ID: &registrationID,
	}
	
	registrations, err := r.AdminFilter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated registration: %w", err)
	}

	if len(registrations) == 0 {
		return nil, fmt.Errorf("updated registration not found")
	}

	return registrations[0], nil
}

func (r *Registration) GetRegistrationWithPayments(ctx context.Context, registrationID string) (*domain.RegistrationWithPayments, error) {
	filter := &domain.AdminFilterRegistration{
		ID: &registrationID,
	}
	
	registrations, err := r.AdminFilter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get registration: %w", err)
	}

	if len(registrations) == 0 {
		return nil, fmt.Errorf("registration not found")
	}

	return registrations[0], nil
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

			// CANCELED -> PENDING или ACTIVE (для бесплатных турниров)
			var newStatus domain.RegistrationStatus
			if tournament.Price == 0 {
				newStatus = domain.RegistrationStatusActive
			} else {
				newStatus = domain.RegistrationStatusPending
			}
			
			patch := &domain.PatchRegistration{
				Status: &newStatus,
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
	// Для бесплатных турниров (price = 0) сразу устанавливаем статус ACTIVE
	var status domain.RegistrationStatus
	if tournament.Price == 0 {
		status = domain.RegistrationStatusActive
	} else {
		status = domain.RegistrationStatusPending
	}

	createRegistration := &domain.CreateRegistration{
		UserID:       user.ID,
		TournamentID: tournamentID,
		Status:       status,
	}

	id, err := r.registrationRepo.Create(ctx, createRegistration)
	if err != nil {
		return nil, fmt.Errorf("failed to create registration: %w", err)
	}

	// Отправляем уведомление об успешной регистрации
	if r.notificationService != nil {
		err = r.notificationService.SendTournamentRegistrationSuccess(
			user.TelegramID,
			tournamentID,
			tournament.Name,
		)
		if err != nil {
			// Логируем ошибку, но не прерываем процесс регистрации
			fmt.Printf("Failed to send registration success notification: %v\n", err)
		}
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

	// Отправляем уведомление об отмене регистрации
	if r.notificationService != nil {
		err = r.notificationService.SendTournamentRegistrationCanceled(
			user.TelegramID,
			tournamentID,
			tournament.Name,
		)
		if err != nil {
			fmt.Printf("Failed to send registration canceled notification: %v\n", err)
		}
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

	// Отправляем уведомление об отмене регистрации
	if r.notificationService != nil {
		err = r.notificationService.SendTournamentRegistrationCanceled(
			user.TelegramID,
			tournamentID,
			tournament.Name,
		)
		if err != nil {
			fmt.Printf("Failed to send registration canceled notification: %v\n", err)
		}
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

// для эндпоинта /registrations/my
func (r *Registration) GetUserRegistrationsWithTournament(ctx context.Context, userID string) ([]*domain.RegistrationWithTournament, error) {
	filter := &domain.FilterRegistration{
		UserID: &userID,
	}

	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.RegistrationWithTournament, 0, len(registrations))
	for _, reg := range registrations {
		regWithTournament := &domain.RegistrationWithTournament{
			ID:           reg.ID,
			UserID:       reg.UserID,
			TournamentID: reg.TournamentID,
			Date:         reg.Date,
			Status:       reg.Status,
			User:         reg.User,
		}

		tournament, err := r.getTournamentByID(ctx, reg.TournamentID)
		if err != nil {
			continue
		}

		tournamentForReg := domain.TournamentForRegistration{
			ID:             tournament.ID,
			Name:           tournament.Name,
			StartTime:      tournament.StartTime,
			EndTime:        tournament.EndTime,
			Price:          tournament.Price,
			RankMin:        tournament.RankMin,
			RankMax:        tournament.RankMax,
			MaxUsers:       tournament.MaxUsers,
			Description:    tournament.Description,
			Court:          tournament.Court,
			TournamentType: tournament.TournamentType,
			Organizator:    tournament.Organizator,
			Data:           tournament.Data,
		}

		regWithTournament.Tournament = &tournamentForReg

		result = append(result, regWithTournament)
	}

	return result, nil
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

// UpdateRegistrationStatus обновляет статус регистрации по ID
func (r *Registration) UpdateRegistrationStatus(ctx context.Context, registrationID string, status domain.RegistrationStatus) error {
	patch := &domain.PatchRegistration{
		Status: &status,
	}

	return r.registrationRepo.Patch(ctx, registrationID, patch)
} 