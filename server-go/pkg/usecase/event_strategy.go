package usecase

import (
	"context"
	"errors"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

// EventStrategy определяет интерфейс для обработки различных операций с событиями в зависимости от их типа
type EventStrategy interface {
	// ValidateRegistration проверяет возможность регистрации на событие
	ValidateRegistration(ctx context.Context, user *domain.User, event *domain.Event) error
	
	// DetermineRegistrationStatus определяет статус регистрации при создании
	DetermineRegistrationStatus(ctx context.Context, event *domain.Event) domain.RegistrationStatus
	
	// DetermineRegistrationStatusForUser определяет статус регистрации с учетом пользователя
	DetermineRegistrationStatusForUser(ctx context.Context, event *domain.Event, user *domain.User) domain.RegistrationStatus
	
	// HandleCancellation обрабатывает отмену регистрации
	HandleCancellation(ctx context.Context, registration *domain.Registration, event *domain.Event, hasPaid bool) domain.RegistrationStatus
	
	// CanCreate проверяет, может ли пользователь создать событие данного типа
	CanCreate(user *domain.User, adminUser *domain.AdminUser) error
	
	// CanDelete проверяет, может ли пользователь удалить событие данного типа
	CanDelete(user *domain.User, adminUser *domain.AdminUser, event *domain.Event) error
}

type BaseEventStrategy struct{}

func (b *BaseEventStrategy) ValidateRegistration(ctx context.Context, user *domain.User, event *domain.Event) error {
	if user.Rank < event.RankMin || user.Rank > event.RankMax {
		return errors.New("user rank does not fit this event")
	}
	
	if event.Status == domain.EventStatusCompleted {
		return errors.New("event is already completed")
	}
	
	if event.Status == domain.EventStatusCancelled {
		return errors.New("event is cancelled")
	}
	
	if event.Status == domain.EventStatusFull {
		return errors.New("all spots for this event are taken")
	}
	
	return nil
}

// GameEventStrategy стратегия для игр
type GameEventStrategy struct {
	BaseEventStrategy
}

// ValidateRegistration для игр - ранг игрока игнорируется
func (g *GameEventStrategy) ValidateRegistration(ctx context.Context, user *domain.User, event *domain.Event) error {
	if event.Status == domain.EventStatusCompleted {
		return errors.New("event is already completed")
	}
	
	if event.Status == domain.EventStatusCancelled {
		return errors.New("event is cancelled")
	}
	
	if event.Status == domain.EventStatusFull {
		return errors.New("all spots for this event are taken")
	}
	
	// Для игр не проверяем ранг - любой может подавать заявки
	return nil
}

func (g *GameEventStrategy) DetermineRegistrationStatus(ctx context.Context, event *domain.Event) domain.RegistrationStatus {
	// Эта функция будет переопределена в RegisterForEvent для проверки организатора
	// Для игр по умолчанию INVITED - приглашение, которое не занимает место до подтверждения
	return domain.RegistrationStatusInvited
}

// DetermineRegistrationStatusForUser определяет статус регистрации с учетом пользователя
func (g *GameEventStrategy) DetermineRegistrationStatusForUser(ctx context.Context, event *domain.Event, user *domain.User) domain.RegistrationStatus {
	// Если пользователь - организатор события, автоматически подтверждаем
	if user.ID == event.Organizer.ID {
		return domain.RegistrationStatusConfirmed
	}
	// Для остальных участников - статус приглашения
	return domain.RegistrationStatusInvited
}

func (g *GameEventStrategy) HandleCancellation(ctx context.Context, registration *domain.Registration, event *domain.Event, hasPaid bool) domain.RegistrationStatus {
	// Для игр используем новую логику
	return g.GetCancelStatus(registration)
}

func (g *GameEventStrategy) CanCreate(user *domain.User, adminUser *domain.AdminUser) error {
	// Любой аутентифицированный пользователь может создавать игры
	if user == nil {
		return errors.New("user authentication required")
	}
	return nil
}

func (g *GameEventStrategy) CanDelete(user *domain.User, adminUser *domain.AdminUser, event *domain.Event) error {
	if user == nil {
		return errors.New("user authentication required")
	}
	
	// Суперюзер может удалять любые игры
	if adminUser != nil && adminUser.IsSuperUser {
		return nil
	}
	
	// Администратор может удалять любые игры
	if adminUser != nil {
		return nil
	}
	
	// Обычный пользователь может удалять только свои игры
	if event.Organizer.ID == user.ID {
		return nil
	}
	
	return errors.New("insufficient permissions to delete this game")
}

func (g *GameEventStrategy) CanRegister(user *domain.User, event *domain.Event) error {
	return g.ValidateRegistration(context.Background(), user, event)
}

func (g *GameEventStrategy) CanCancel(user *domain.User, event *domain.Event, registration *domain.Registration) error {
	// Участник может отменить заявку в любом статусе кроме уже отмененных
	if registration.Status == domain.RegistrationStatusCancelled || 
		registration.Status == domain.RegistrationStatusLeft ||
		registration.Status == domain.RegistrationStatusCancelledBeforePayment ||
		registration.Status == domain.RegistrationStatusCancelledAfterPayment ||
		registration.Status == domain.RegistrationStatusRefunded {
		return errors.New("registration is already cancelled")
	}
	return nil
}

func (g *GameEventStrategy) GetCancelStatus(registration *domain.Registration) domain.RegistrationStatus {
	// Если заявка еще на рассмотрении (PENDING для турниров, INVITED для игр) - статус CANCELLED
	if registration.Status == domain.RegistrationStatusPending || registration.Status == domain.RegistrationStatusInvited {
		return domain.RegistrationStatusCancelled
	}
	// Если уже подтвержден - статус LEFT
	if registration.Status == domain.RegistrationStatusConfirmed {
		return domain.RegistrationStatusLeft
	}
	return registration.Status
}

func (g *GameEventStrategy) CanReapply(registration *domain.Registration) bool {
	// Можно подать новую заявку если статус CANCELLED или LEFT
	return registration.Status == domain.RegistrationStatusCancelled || 
		registration.Status == domain.RegistrationStatusLeft
}

func (g *GameEventStrategy) CanApprove(organizer *domain.User, event *domain.Event, registration *domain.Registration) error {
	if organizer.ID != event.Organizer.ID {
		return errors.New("only event organizer can approve registrations")
	}
	
	if registration.Status != domain.RegistrationStatusInvited {
		return errors.New("can only approve invited registrations")
	}
	
	return nil
}

func (g *GameEventStrategy) CanReject(organizer *domain.User, event *domain.Event, registration *domain.Registration) error {
	if organizer.ID != event.Organizer.ID {
		return errors.New("only event organizer can reject registrations")
	}
	
	if registration.Status != domain.RegistrationStatusInvited {
		return errors.New("can only reject invited registrations")
	}
	
	return nil
}

// TournamentEventStrategy стратегия для турниров
type TournamentEventStrategy struct {
	BaseEventStrategy
}

func (t *TournamentEventStrategy) DetermineRegistrationStatus(ctx context.Context, event *domain.Event) domain.RegistrationStatus {
	// Эта функция будет переопределена в RegisterForEvent для проверки организатора
	// Для турниров по умолчанию PENDING - ожидает оплаты и занимает место
	return domain.RegistrationStatusPending
}

// DetermineRegistrationStatusForUser определяет статус регистрации с учетом пользователя
func (t *TournamentEventStrategy) DetermineRegistrationStatusForUser(ctx context.Context, event *domain.Event, user *domain.User) domain.RegistrationStatus {
	// Если пользователь - организатор события, автоматически подтверждаем
	if user.ID == event.Organizer.ID {
		return domain.RegistrationStatusConfirmed
	}
	// Для остальных участников - статус ожидания оплаты
	return domain.RegistrationStatusPending
}

func (t *TournamentEventStrategy) HandleCancellation(ctx context.Context, registration *domain.Registration, event *domain.Event, hasPaid bool) domain.RegistrationStatus {
	// Для турниров: если оплачено -> AFTER, если нет -> BEFORE
	if hasPaid {
		return domain.RegistrationStatusCancelledAfterPayment
	}
	return domain.RegistrationStatusCancelledBeforePayment
}

func (t *TournamentEventStrategy) CanCreate(user *domain.User, adminUser *domain.AdminUser) error {
	// Только администраторы и суперюзеры могут создавать турниры
	if adminUser == nil {
		return errors.New("only administrators can create tournaments")
	}
	return nil
}

func (t *TournamentEventStrategy) CanDelete(user *domain.User, adminUser *domain.AdminUser, event *domain.Event) error {
	if user == nil {
		return errors.New("user authentication required")
	}
	
	// Суперюзер может удалять любые турниры
	if adminUser != nil && adminUser.IsSuperUser {
		return nil
	}
	
	// Администратор может удалять только свои турниры
	if adminUser != nil && event.Organizer.ID == user.ID {
		return nil
	}
	
	return errors.New("insufficient permissions to delete this tournament")
}

// TrainingEventStrategy стратегия для тренировок
type TrainingEventStrategy struct {
	BaseEventStrategy
}

func (tr *TrainingEventStrategy) ValidateRegistration(ctx context.Context, user *domain.User, event *domain.Event) error {
	if err := tr.BaseEventStrategy.ValidateRegistration(ctx, user, event); err != nil {
		return err
	}
	
	return errors.New("training registration functionality is not ready yet")
}

func (tr *TrainingEventStrategy) DetermineRegistrationStatus(ctx context.Context, event *domain.Event) domain.RegistrationStatus {
	// Этот метод не должен вызываться, так как ValidateRegistration вернет ошибку
	return domain.RegistrationStatusPending
}

func (tr *TrainingEventStrategy) DetermineRegistrationStatusForUser(ctx context.Context, event *domain.Event, user *domain.User) domain.RegistrationStatus {
	// Этот метод не должен вызываться, так как ValidateRegistration вернет ошибку
	return domain.RegistrationStatusPending
}

func (tr *TrainingEventStrategy) HandleCancellation(ctx context.Context, registration *domain.Registration, event *domain.Event, hasPaid bool) domain.RegistrationStatus {
	// Этот метод не должен вызываться для тренировок
	return domain.RegistrationStatusCancelledBeforePayment
}

func (tr *TrainingEventStrategy) CanCreate(user *domain.User, adminUser *domain.AdminUser) error {
	// Функционал тренировок пока не готов
	return errors.New("training creation functionality is not available yet")
}

func (tr *TrainingEventStrategy) CanDelete(user *domain.User, adminUser *domain.AdminUser, event *domain.Event) error {
	// Функционал тренировок пока не готов
	return errors.New("training deletion functionality is not available yet")
}



func GetEventStrategy(eventType domain.EventType) EventStrategy {
	switch eventType {
	case domain.EventTypeGame:
		return &GameEventStrategy{}
	case domain.EventTypeTournament:
		return &TournamentEventStrategy{}
	case domain.EventTypeTraining:
		return &TrainingEventStrategy{}
	default:
		return &TournamentEventStrategy{} // По умолчанию используем турнирную стратегию
	}
} 