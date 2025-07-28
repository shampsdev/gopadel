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
	cases            *Cases
}

func NewRegistration(ctx context.Context, registrationRepo repo.Registration, cases *Cases) *Registration {
	return &Registration{
		registrationRepo: registrationRepo,
		cases:            cases,
	}
}

func (r *Registration) AdminFilter(ctx context.Context, adminFilter *domain.AdminFilterRegistration) ([]*domain.RegistrationWithPayments, error) {
	registrations, err := r.registrationRepo.AdminFilter(ctx, adminFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to filter registrations: %w", err)
	}

	for _, reg := range registrations {
		payments, err := r.cases.Payment.GetPaymentsByUserAndEvent(ctx, reg.UserID, reg.EventID)
		if err == nil {
			reg.Payments = payments
		}
	}

	return registrations, nil
}

func (r *Registration) AdminUpdateRegistrationStatus(ctx context.Context, userID string, eventID string, status domain.RegistrationStatus) (*domain.RegistrationWithPayments, error) {
	// Сначала получаем текущее состояние регистрации
	filter := &domain.AdminFilterRegistration{
		UserID:  &userID,
		EventID: &eventID,
	}

	currentRegistrations, err := r.AdminFilter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get current registration: %w", err)
	}

	if len(currentRegistrations) == 0 {
		return nil, fmt.Errorf("registration not found")
	}

	currentRegistration := currentRegistrations[0]
	oldStatus := currentRegistration.Status

	// Если переводим в статус CONFIRMED, проверяем свободные места
	if status == domain.RegistrationStatusConfirmed && oldStatus != domain.RegistrationStatusConfirmed {
		// Получаем событие для проверки мест
		eventFilter := &domain.FilterEvent{ID: &eventID}
		events, err := r.cases.Event.Filter(ctx, eventFilter)
		if err != nil {
			return nil, fmt.Errorf("failed to get event: %w", err)
		}

		if len(events) == 0 {
			return nil, fmt.Errorf("event not found")
		}

		event := events[0]

		// Для игр проверяем свободные места (так как INVITED не занимает места, а CONFIRMED занимает)
		if event.Type == domain.EventTypeGame {
			if err := r.validateAvailableSlots(ctx, eventID); err != nil {
				return nil, fmt.Errorf("cannot approve registration: %w", err)
			}
		}
	}

	// Обновляем статус
	patch := &domain.PatchRegistration{
		Status: &status,
	}

	err = r.registrationRepo.Patch(ctx, userID, eventID, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to update registration status: %w", err)
	}

	// Обновляем статус события после изменения регистрации
	if status == domain.RegistrationStatusConfirmed {
		if err := r.updateEventStatusAfterRegistration(ctx, eventID); err != nil {
			fmt.Printf("Warning: failed to update event status after approval: %v\n", err)
		}
	} else if oldStatus == domain.RegistrationStatusConfirmed {
		if err := r.updateEventStatusAfterCancellation(ctx, eventID); err != nil {
			fmt.Printf("Warning: failed to update event status after status change: %v\n", err)
		}
	}

	// Получаем обновленную регистрацию
	updatedRegistrations, err := r.AdminFilter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated registration: %w", err)
	}

	if len(updatedRegistrations) == 0 {
		return nil, fmt.Errorf("updated registration not found")
	}

	updatedRegistration := updatedRegistrations[0]

	return updatedRegistration, nil
}

func (r *Registration) GetRegistrationWithPayments(ctx context.Context, userID string, eventID string) (*domain.RegistrationWithPayments, error) {
	filter := &domain.AdminFilterRegistration{
		UserID:  &userID,
		EventID: &eventID,
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

// RegisterForEvent - регистрация на событие с использованием стратегий
func (r *Registration) RegisterForEvent(ctx context.Context, user *domain.User, eventID string) (*domain.Registration, error) {
	// Получаем событие напрямую через репозиторий
	eventFilter := &domain.FilterEvent{ID: &eventID}
	events, err := r.cases.Event.Filter(ctx, eventFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	if len(events) == 0 {
		return nil, fmt.Errorf("event not found")
	}

	event := events[0]

	// Получаем стратегию для данного типа события
	strategy := GetEventStrategy(event.Type)

	// Проверяем существующие регистрации
	registrationFilter := &domain.FilterRegistration{
		UserID:  &user.ID,
		EventID: &eventID,
	}

	existingRegistrations, err := r.registrationRepo.Filter(ctx, registrationFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing registrations: %w", err)
	}

	// Если есть регистрация, обрабатываем её
	for _, reg := range existingRegistrations {
		// Для игр проверяем возможность повторной подачи заявки
		if event.Type == domain.EventTypeGame {
			gameStrategy := strategy.(*GameEventStrategy)
			if !gameStrategy.CanReapply(reg) {
				switch reg.Status {
				case domain.RegistrationStatusInvited:
					return nil, fmt.Errorf("user already has an invited registration for this event")
				case domain.RegistrationStatusConfirmed:
					return nil, fmt.Errorf("user is already registered for this event")
				default:
					return nil, fmt.Errorf("user cannot reapply for this event")
				}
			}

			// Для игр НЕ проверяем доступные слоты при повторной подаче заявки,
			// так как INVITED статус не занимает места (если это не организатор)

			// Если можно подать заявку повторно, переиспользуем существующую регистрацию
			// Определяем статус через стратегию с учетом пользователя
			newStatus := gameStrategy.DetermineRegistrationStatusForUser(ctx, event, user)
			patch := &domain.PatchRegistration{
				Status: &newStatus,
			}

			err := r.registrationRepo.Patch(ctx, reg.UserID, reg.EventID, patch)
			if err != nil {
				return nil, fmt.Errorf("failed to update registration status: %w", err)
			}

			// Обновляем статус события после обновления регистрации
			if err := r.updateEventStatusAfterRegistration(ctx, eventID); err != nil {
				fmt.Printf("Warning: failed to update event status after registration update: %v\n", err)
			}

			return r.getRegistrationByID(ctx, reg.UserID, reg.EventID)
		} else {
			// Старая логика для турниров и тренировок
			switch reg.Status {
			case domain.RegistrationStatusPending:
				return nil, fmt.Errorf("user already has a pending registration for this event")
			case domain.RegistrationStatusConfirmed:
				return nil, fmt.Errorf("user is already registered for this event")
			case domain.RegistrationStatusCancelledAfterPayment:
				return nil, fmt.Errorf("user cancelled registration after payment. Use reactivation endpoint")
			case domain.RegistrationStatusCancelledBeforePayment, domain.RegistrationStatusRefunded:
				// Можем восстановить регистрацию
				if err := r.validateAvailableSlots(ctx, eventID); err != nil {
					return nil, err
				}

				// Определяем новый статус с использованием стратегии с учетом пользователя
				newStatus := strategy.DetermineRegistrationStatusForUser(ctx, event, user)

				patch := &domain.PatchRegistration{
					Status: &newStatus,
				}

				err := r.registrationRepo.Patch(ctx, reg.UserID, reg.EventID, patch)
				if err != nil {
					return nil, fmt.Errorf("failed to update registration status: %w", err)
				}

				// Обновляем статус события после восстановления регистрации
				if err := r.updateEventStatusAfterRegistration(ctx, eventID); err != nil {
					fmt.Printf("Warning: failed to update event status after registration restore: %v\n", err)
				}

				return r.getRegistrationByID(ctx, reg.UserID, reg.EventID)
			}
		}
	}

	// Валидируем регистрацию через стратегию
	if err := strategy.ValidateRegistration(ctx, user, event); err != nil {
		return nil, err
	}

	// Определяем статус регистрации через стратегию с учетом пользователя
	status := strategy.DetermineRegistrationStatusForUser(ctx, event, user)

	// Проверяем доступные слоты только если статус регистрации занимает место
	// Для игр INVITED статус не занимает места, поэтому проверка не нужна
	// Для организаторов статус CONFIRMED занимает место, но они имеют приоритет
	if status == domain.RegistrationStatusPending || (status == domain.RegistrationStatusConfirmed && user.ID != event.Organizer.ID) {
		if err := r.validateAvailableSlots(ctx, eventID); err != nil {
			return nil, err
		}
	}

	// Создаем регистрацию
	createReg := &domain.CreateRegistration{
		UserID:  user.ID,
		EventID: eventID,
		Status:  status,
	}

	err = r.registrationRepo.Create(ctx, createReg)
	if err != nil {
		return nil, fmt.Errorf("failed to create registration: %w", err)
	}

	// Обновляем статус события после создания регистрации
	if err := r.updateEventStatusAfterRegistration(ctx, eventID); err != nil {
		fmt.Printf("Warning: failed to update event status after registration: %v\n", err)
	}

	// Возвращаем созданную регистрацию
	return r.getRegistrationByID(ctx, user.ID, eventID)
}

// CancelEventRegistration - отмена регистрации на событие
func (r *Registration) CancelEventRegistration(ctx context.Context, user *domain.User, eventID string) (*domain.Registration, error) {
	eventFilter := &domain.FilterEvent{ID: &eventID}
	events, err := r.cases.Event.Filter(ctx, eventFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	if len(events) == 0 {
		return nil, fmt.Errorf("event not found")
	}

	event := events[0]

	registration, err := r.findActiveRegistration(ctx, user.ID, eventID)
	if err != nil {
		return nil, err
	}

	if registration.Status == domain.RegistrationStatusCancelledBeforePayment ||
		registration.Status == domain.RegistrationStatusCancelledAfterPayment ||
		registration.Status == domain.RegistrationStatusRefunded {
		return nil, fmt.Errorf("registration is already cancelled")
	}

	// Проверяем, есть ли оплата
	hasPaid := false
	if registration.Status == domain.RegistrationStatusConfirmed {
		// Для подтвержденных регистраций проверяем наличие успешных платежей
		payments, err := r.cases.Payment.GetPaymentsByUserAndEvent(ctx, user.ID, eventID)
		if err == nil {
			for _, payment := range payments {
				if payment.Status == domain.PaymentStatusSucceeded {
					hasPaid = true
					break
				}
			}
		}
	}

	// Определяем новый статус с использованием стратегии
	strategy := GetEventStrategy(event.Type)
	newStatus := strategy.HandleCancellation(ctx, registration, event, hasPaid)

	patch := &domain.PatchRegistration{
		Status: &newStatus,
	}

	err = r.registrationRepo.Patch(ctx, registration.UserID, registration.EventID, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to cancel registration: %w", err)
	}

	// Обновляем статус события после отмены регистрации
	if err := r.updateEventStatusAfterCancellation(ctx, eventID); err != nil {
		fmt.Printf("Warning: failed to update event status after cancellation: %v\n", err)
	}

	return r.getRegistrationByID(ctx, registration.UserID, registration.EventID)
}

// ReactivateRegistration - реактивация отмененной регистрации
func (r *Registration) ReactivateRegistration(ctx context.Context, user *domain.User, eventID string) (*domain.Registration, error) {
	// Получаем событие напрямую через репозиторий
	eventFilter := &domain.FilterEvent{ID: &eventID}
	events, err := r.cases.Event.Filter(ctx, eventFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	if len(events) == 0 {
		return nil, fmt.Errorf("event not found")
	}

	event := events[0]

	if err := r.validateEventNotEnded(event); err != nil {
		return nil, err
	}

	if err := r.validateUserRank(user, event); err != nil {
		return nil, err
	}

	registration, err := r.findActiveRegistration(ctx, user.ID, eventID)
	if err != nil {
		return nil, err
	}

	if registration.Status != domain.RegistrationStatusCancelledAfterPayment {
		return nil, fmt.Errorf("can only reactivate registrations cancelled after payment")
	}

	if err := r.validateAvailableSlots(ctx, eventID); err != nil {
		return nil, err
	}

	confirmedStatus := domain.RegistrationStatusConfirmed
	patch := &domain.PatchRegistration{
		Status: &confirmedStatus,
	}

	err = r.registrationRepo.Patch(ctx, registration.UserID, registration.EventID, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to reactivate registration: %w", err)
	}

	// Обновляем статус события после реактивации регистрации
	if err := r.updateEventStatusAfterRegistration(ctx, eventID); err != nil {
		fmt.Printf("Warning: failed to update event status after reactivation: %v\n", err)
	}

	return r.getRegistrationByID(ctx, registration.UserID, registration.EventID)
}

// ActivateRegistration - активация регистрации (PENDING -> CONFIRMED)
func (r *Registration) ActivateRegistration(ctx context.Context, user *domain.User, eventID string) (*domain.Registration, error) {
	// Получаем событие напрямую через репозиторий
	eventFilter := &domain.FilterEvent{ID: &eventID}
	events, err := r.cases.Event.Filter(ctx, eventFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	if len(events) == 0 {
		return nil, fmt.Errorf("event not found")
	}

	event := events[0]

	// Проверяем, что событие еще не закончилось
	if err := r.validateEventNotEnded(event); err != nil {
		return nil, err
	}

	registration, err := r.findActiveRegistration(ctx, user.ID, eventID)
	if err != nil {
		return nil, err
	}

	if registration.Status != domain.RegistrationStatusPending && registration.Status != domain.RegistrationStatusInvited {
		return nil, fmt.Errorf("can only activate pending or invited registrations")
	}

	// Проверяем свободные места при переходе в CONFIRMED
	// Для турниров PENDING уже занимает место, поэтому проверка не нужна
	// Для игр INVITED не занимает место, поэтому нужна проверка
	if registration.Status == domain.RegistrationStatusInvited {
		if err := r.validateAvailableSlots(ctx, eventID); err != nil {
			return nil, fmt.Errorf("cannot activate registration: %w", err)
		}
	}

	confirmedStatus := domain.RegistrationStatusConfirmed
	patch := &domain.PatchRegistration{
		Status: &confirmedStatus,
	}

	err = r.registrationRepo.Patch(ctx, registration.UserID, registration.EventID, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to activate registration: %w", err)
	}

	// Обновляем статус события после активации регистрации
	if err := r.updateEventStatusAfterRegistration(ctx, eventID); err != nil {
		fmt.Printf("Warning: failed to update event status after activation: %v\n", err)
	}

	return r.getRegistrationByID(ctx, registration.UserID, registration.EventID)
}

// GetUserRegistrations - получение всех регистраций пользователя
func (r *Registration) GetUserRegistrations(ctx context.Context, userID string) ([]*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		UserID: &userID,
	}

	return r.registrationRepo.Filter(ctx, filter)
}

// GetUserRegistrationsWithEvent - получение регистраций пользователя с событиями
func (r *Registration) GetUserRegistrationsWithEvent(ctx context.Context, userID string) ([]*domain.RegistrationWithEvent, error) {
	filter := &domain.FilterRegistration{
		UserID: &userID,
	}

	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.RegistrationWithEvent, 0, len(registrations))
	for _, reg := range registrations {
		regWithEvent := &domain.RegistrationWithEvent{
			UserID:    reg.UserID,
			EventID:   reg.EventID,
			Status:    reg.Status,
			CreatedAt: reg.CreatedAt,
			UpdatedAt: reg.UpdatedAt,
			User:      reg.User,
		}

		// Получаем событие напрямую через репозиторий
		eventFilter := &domain.FilterEvent{ID: &reg.EventID}
		events, err := r.cases.Event.Filter(ctx, eventFilter)
		if err != nil || len(events) == 0 {
			continue
		}

		event := events[0]

		eventForReg := domain.EventForRegistration{
			ID:          event.ID,
			Name:        event.Name,
			Description: event.Description,
			StartTime:   event.StartTime,
			EndTime:     event.EndTime,
			RankMin:     event.RankMin,
			RankMax:     event.RankMax,
			Price:       event.Price,
			MaxUsers:    event.MaxUsers,
			Status:      event.Status,
			Type:        event.Type,
			Court:       event.Court,
			Organizer:   event.Organizer,
			ClubID:      event.ClubID,
			Data:        event.Data,
		}

		regWithEvent.Event = &eventForReg
		result = append(result, regWithEvent)
	}

	return result, nil
}

// GetEventRegistrations - получение всех регистраций на событие
func (r *Registration) GetEventRegistrations(ctx context.Context, eventID string) ([]*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		EventID: &eventID,
	}

	return r.registrationRepo.Filter(ctx, filter)
}

// Вспомогательные методы

func (r *Registration) findActiveRegistration(ctx context.Context, userID, eventID string) (*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		UserID:  &userID,
		EventID: &eventID,
	}

	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to find registration: %w", err)
	}

	// Ищем любую регистрацию (не только активную)
	for _, reg := range registrations {
		return reg, nil
	}

	return nil, fmt.Errorf("no registration found for this event")
}

func (r *Registration) getRegistrationByID(ctx context.Context, userID, eventID string) (*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		UserID:  &userID,
		EventID: &eventID,
	}
	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get registration: %w", err)
	}

	if len(registrations) == 0 {
		return nil, fmt.Errorf("registration not found")
	}

	return registrations[0], nil
}

func (r *Registration) validateEventNotEnded(event *domain.Event) error {
	now := time.Now()
	if !event.EndTime.IsZero() && event.EndTime.Before(now) {
		return fmt.Errorf("event has already ended")
	}
	if event.EndTime.IsZero() && event.StartTime.Add(24*time.Hour).Before(now) {
		return fmt.Errorf("event has already ended")
	}
	return nil
}

func (r *Registration) validateUserRank(user *domain.User, event *domain.Event) error {
	if user.Rank < event.RankMin || user.Rank > event.RankMax {
		return fmt.Errorf("user rank %.1f does not fit event range %.1f-%.1f",
			user.Rank, event.RankMin, event.RankMax)
	}
	return nil
}

func (r *Registration) validateAvailableSlots(ctx context.Context, eventID string) error {
	eventFilter := &domain.FilterEvent{ID: &eventID}
	events, err := r.cases.Event.Filter(ctx, eventFilter)
	if err != nil {
		return fmt.Errorf("failed to get event: %w", err)
	}

	if len(events) == 0 {
		return fmt.Errorf("event not found")
	}

	event := events[0]

	filter := &domain.FilterRegistration{
		EventID: &eventID,
	}

	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to get event registrations: %w", err)
	}

	activeCount := 0
	for _, reg := range registrations {
		// Для турниров: PENDING и CONFIRMED занимают места
		// Для игр: только CONFIRMED занимает место, INVITED не занимает место
		if event.Type == domain.EventTypeTournament {
			if reg.Status == domain.RegistrationStatusPending || reg.Status == domain.RegistrationStatusConfirmed {
				activeCount++
			}
		} else if event.Type == domain.EventTypeGame {
			if reg.Status == domain.RegistrationStatusConfirmed {
				activeCount++
			}
			// INVITED статус НЕ занимает место
		} else {
			// Для других типов используем старую логику
			if reg.Status == domain.RegistrationStatusPending || reg.Status == domain.RegistrationStatusConfirmed {
				activeCount++
			}
		}
	}

	if activeCount >= event.MaxUsers {
		return fmt.Errorf("event is full (maximum %d users)", event.MaxUsers)
	}

	return nil
}

// UpdateRegistrationStatus обновляет статус регистрации по составному ключу
func (r *Registration) UpdateRegistrationStatus(ctx context.Context, userID, eventID string, status domain.RegistrationStatus) error {
	patch := &domain.PatchRegistration{
		Status: &status,
	}

	return r.registrationRepo.Patch(ctx, userID, eventID, patch)
}

// FindPendingRegistration находит ожидающую регистрацию пользователя на событие
func (r *Registration) FindPendingRegistration(ctx context.Context, userID, eventID string) (*domain.Registration, error) {
	pendingStatus := domain.RegistrationStatusPending
	filter := &domain.FilterRegistration{
		UserID:  &userID,
		EventID: &eventID,
		Status:  &pendingStatus,
	}

	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to find registration: %w", err)
	}

	if len(registrations) == 0 {
		return nil, fmt.Errorf("no pending registration found for this event")
	}

	return registrations[0], nil
}

// FindAwaitingRegistration находит регистрацию в статусе ожидания (PENDING для турниров, INVITED для игр)
func (r *Registration) FindAwaitingRegistration(ctx context.Context, userID, eventID string) (*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		UserID:  &userID,
		EventID: &eventID,
	}

	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to find registration: %w", err)
	}

	// Ищем регистрацию в статусе ожидания
	for _, reg := range registrations {
		if reg.Status == domain.RegistrationStatusPending || reg.Status == domain.RegistrationStatusInvited {
			return reg, nil
		}
	}

	return nil, fmt.Errorf("no awaiting registration found for this event")
}

// GetRegistrationsByUserAndEvent получает регистрации по пользователю и событию
func (r *Registration) GetRegistrationsByUserAndEvent(ctx context.Context, userID, eventID string) ([]*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		UserID:  &userID,
		EventID: &eventID,
	}

	return r.registrationRepo.Filter(ctx, filter)
}

// GetEventParticipants получает участников события (активные регистрации)
func (r *Registration) GetEventParticipants(ctx context.Context, eventID string) ([]*domain.Registration, error) {
	filter := &domain.FilterRegistration{
		EventID: &eventID,
	}

	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}

	// Фильтруем только активные статусы
	participants := make([]*domain.Registration, 0)
	for _, reg := range registrations {
		if reg.Status == domain.RegistrationStatusConfirmed ||
			reg.Status == domain.RegistrationStatusPending ||
			reg.Status == domain.RegistrationStatusInvited ||
			reg.Status == domain.RegistrationStatusCancelledAfterPayment {
			participants = append(participants, reg)
		}
	}

	return participants, nil
}

// updateEventStatusAfterRegistration обновляет статус события после создания/активации регистрации
func (r *Registration) updateEventStatusAfterRegistration(ctx context.Context, eventID string) error {
	// Получаем событие
	eventFilter := &domain.FilterEvent{ID: &eventID}
	events, err := r.cases.Event.Filter(ctx, eventFilter)
	if err != nil {
		return fmt.Errorf("failed to get event: %w", err)
	}

	if len(events) == 0 {
		return fmt.Errorf("event not found")
	}

	event := events[0]

	// Только для событий в статусе registration или full
	if event.Status != domain.EventStatusRegistration && event.Status != domain.EventStatusFull {
		return nil
	}

	// Подсчитываем активные регистрации
	activeCount, err := r.getActiveRegistrationsCount(ctx, eventID)
	if err != nil {
		return err
	}

	// Определяем нужный статус
	var needStatus domain.EventStatus
	if activeCount >= event.MaxUsers {
		needStatus = domain.EventStatusFull
	} else {
		needStatus = domain.EventStatusRegistration
	}

	// Обновляем статус события только если он должен измениться
	if event.Status != needStatus {
		patch := &domain.PatchEvent{
			Status: &needStatus,
		}

		err = r.cases.Event.eventRepo.Patch(ctx, eventID, patch)
		if err != nil {
			return fmt.Errorf("failed to update event status: %w", err)
		}
	}

	return nil
}

// updateEventStatusAfterCancellation обновляет статус события после отмены регистрации
func (r *Registration) updateEventStatusAfterCancellation(ctx context.Context, eventID string) error {
	// Получаем событие
	eventFilter := &domain.FilterEvent{ID: &eventID}
	events, err := r.cases.Event.Filter(ctx, eventFilter)
	if err != nil {
		return fmt.Errorf("failed to get event: %w", err)
	}

	if len(events) == 0 {
		return fmt.Errorf("event not found")
	}

	event := events[0]

	// Только если событие полное - можем освободить места
	if event.Status != domain.EventStatusFull {
		return nil
	}

	// Подсчитываем активные регистрации
	activeCount, err := r.getActiveRegistrationsCount(ctx, eventID)
	if err != nil {
		return err
	}

	// Если появились места - открываем регистрацию
	if activeCount < event.MaxUsers {
		newStatus := domain.EventStatusRegistration
		patch := &domain.PatchEvent{
			Status: &newStatus,
		}

		err = r.cases.Event.eventRepo.Patch(ctx, eventID, patch)
		if err != nil {
			return fmt.Errorf("failed to update event status: %w", err)
		}
	}

	return nil
}

// getActiveRegistrationsCount подсчитывает количество активных регистраций
func (r *Registration) getActiveRegistrationsCount(ctx context.Context, eventID string) (int, error) {
	// Получаем событие для определения типа
	eventFilter := &domain.FilterEvent{ID: &eventID}
	events, err := r.cases.Event.Filter(ctx, eventFilter)
	if err != nil {
		return 0, fmt.Errorf("failed to get event: %w", err)
	}

	if len(events) == 0 {
		return 0, fmt.Errorf("event not found")
	}

	event := events[0]

	filter := &domain.FilterRegistration{
		EventID: &eventID,
	}

	registrations, err := r.registrationRepo.Filter(ctx, filter)
	if err != nil {
		return 0, fmt.Errorf("failed to get event registrations: %w", err)
	}

	activeCount := 0
	for _, reg := range registrations {
		// Для турниров: PENDING и CONFIRMED занимают места
		// Для игр: только CONFIRMED занимает место, INVITED не занимает место
		if event.Type == domain.EventTypeTournament {
			if reg.Status == domain.RegistrationStatusPending || reg.Status == domain.RegistrationStatusConfirmed {
				activeCount++
			}
		} else if event.Type == domain.EventTypeGame {
			if reg.Status == domain.RegistrationStatusConfirmed {
				activeCount++
			}
			// INVITED статус НЕ занимает место
		} else {
			// Для других типов используем старую логику
			if reg.Status == domain.RegistrationStatusPending || reg.Status == domain.RegistrationStatusConfirmed {
				activeCount++
			}
		}
	}

	return activeCount, nil
}
