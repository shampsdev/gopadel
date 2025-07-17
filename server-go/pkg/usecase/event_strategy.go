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
		return errors.New("пользователь не подходит по рангу для этого события")
	}
	
	if event.Status == domain.EventStatusCompleted {
		return errors.New("событие уже завершено")
	}
	
	if event.Status == domain.EventStatusCancelled {
		return errors.New("событие отменено")
	}
	
	if event.Status == domain.EventStatusFull {
		return errors.New("все места на событие заняты")
	}
	
	return nil
}

// GameEventStrategy стратегия для игр
type GameEventStrategy struct {
	BaseEventStrategy
}

func (g *GameEventStrategy) DetermineRegistrationStatus(ctx context.Context, event *domain.Event) domain.RegistrationStatus {
	// Для игр всегда CONFIRMED, независимо от цены
	return domain.RegistrationStatusConfirmed
}

func (g *GameEventStrategy) HandleCancellation(ctx context.Context, registration *domain.Registration, event *domain.Event, hasPaid bool) domain.RegistrationStatus {
	// Для игр всегда CANCELLED_BEFORE_PAYMENT
	return domain.RegistrationStatusCancelledBeforePayment
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

// TournamentEventStrategy стратегия для турниров
type TournamentEventStrategy struct {
	BaseEventStrategy
}

func (t *TournamentEventStrategy) DetermineRegistrationStatus(ctx context.Context, event *domain.Event) domain.RegistrationStatus {
	// Для турниров: бесплатные -> CONFIRMED, платные -> PENDING
	if event.Price == 0 {
		return domain.RegistrationStatusConfirmed
	}
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
	
	return errors.New("функционал регистрации на тренировки пока не готов")
}

func (tr *TrainingEventStrategy) DetermineRegistrationStatus(ctx context.Context, event *domain.Event) domain.RegistrationStatus {
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
		return &TournamentEventStrategy{}
	}
} 