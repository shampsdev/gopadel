package usecase

import (
	"context"
	"errors"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

// EventRegistrationStrategy определяет интерфейс для обработки регистрации на разные типы событий
type EventRegistrationStrategy interface {
	// ValidateRegistration проверяет возможность регистрации на событие
	ValidateRegistration(ctx context.Context, user *domain.User, event *domain.Event) error
	
	// DetermineRegistrationStatus определяет статус регистрации при создании
	DetermineRegistrationStatus(ctx context.Context, event *domain.Event) domain.RegistrationStatus
	
	// HandleCancellation обрабатывает отмену регистрации
	HandleCancellation(ctx context.Context, registration *domain.Registration, event *domain.Event, hasPaid bool) domain.RegistrationStatus
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

func GetEventStrategy(eventType domain.EventType) EventRegistrationStrategy {
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