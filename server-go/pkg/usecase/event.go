package usecase

import (
	"context"
	"fmt"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Event struct {
	ctx       context.Context
	eventRepo repo.Event
	cases     *Cases
}

func NewEvent(ctx context.Context, eventRepo repo.Event, cases *Cases) *Event {
	return &Event{
		ctx:       ctx,
		eventRepo: eventRepo,
		cases:     cases,
	}
}

// Создает новое событие
func (e *Event) Create(ctx context.Context, createEvent *domain.CreateEvent) (*domain.Event, error) {
	id, err := e.eventRepo.Create(ctx, createEvent)
	if err != nil {
		return nil, fmt.Errorf("failed to create event: %w", err)
	}
	
	filter := &domain.FilterEvent{ID: &id}
	events, err := e.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get created event: %w", err)
	}
	
	if len(events) == 0 {
		return nil, fmt.Errorf("created event not found")
	}
	
	return events[0], nil
}

// Filter получает события с фильтрацией
func (e *Event) Filter(ctx context.Context, filter *domain.FilterEvent) ([]*domain.Event, error) {
	events, err := e.eventRepo.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}

	// Добавляем участников для каждого события
	for _, event := range events {
		participants, err := e.GetEventParticipants(ctx, event.ID)
		if err != nil {
			return nil, err
		}
		event.Participants = participants
	}

	return events, nil
}

// FilterForUser получает события для пользователя с учетом его клубов
func (e *Event) FilterForUser(ctx *Context, filter *domain.FilterEvent) ([]*domain.Event, error) {
	// Автоматически добавляем фильтрацию по клубам пользователя
	if ctx.User != nil && filter.FilterByUserClubs == nil {
		filter.FilterByUserClubs = &ctx.User.ID
	}

	return e.Filter(ctx.Context, filter)
}

// Обновляет событие
func (e *Event) Patch(ctx context.Context, id string, patch *domain.PatchEvent) (*domain.Event, error) {
	err := e.eventRepo.Patch(ctx, id, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to patch event: %w", err)
	}
	
	filter := &domain.FilterEvent{ID: &id}
	events, err := e.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated event: %w", err)
	}
	
	if len(events) == 0 {
		return nil, fmt.Errorf("updated event not found")
	}
	
	return events[0], nil
}

// Удаляет событие
func (e *Event) Delete(ctx context.Context, id string) error {
	return e.eventRepo.Delete(ctx, id)
}

// Получает событие по ID
func (e *Event) GetEventByID(ctx context.Context, eventID string) (*domain.Event, error) {
	filter := &domain.FilterEvent{
		ID: &eventID,
	}
	
	events, err := e.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}
	
	if len(events) == 0 {
		return nil, fmt.Errorf("event not found")
	}
	
	return events[0], nil
}

// Проверяет принадлежность события организатору
func (e *Event) CheckOwnership(ctx context.Context, eventID string, adminUserID string) error {
	event, err := e.GetEventByID(ctx, eventID)
	if err != nil {
		return err
	}
	
	if event.Organizer.ID != adminUserID {
		return fmt.Errorf("event belongs to a different organizer")
	}
	
	return nil
}

// GetEventsByUserID получает события по ID пользователя (через регистрации)
func (e *Event) GetEventsByUserID(ctx Context, userID string) ([]*domain.Event, error) {
	events, err := e.eventRepo.GetEventsByUserID(ctx.Context, userID)
	if err != nil {
		return nil, err
	}

	// Добавляем участников для каждого события
	for _, event := range events {
		participants, err := e.GetEventParticipants(ctx.Context, event.ID)
		if err != nil {
			return nil, err
		}
		event.Participants = participants
	}

	return events, nil
}

// GetEventParticipants получает участников события
func (e *Event) GetEventParticipants(ctx context.Context, eventID string) ([]*domain.Registration, error) {
	if e.cases.Registration == nil {
		// Если Registration не инициализирован, возвращаем пустой список
		return []*domain.Registration{}, nil
	}
	
	return e.cases.Registration.GetEventParticipants(ctx, eventID)
}

// AdminFilter получает события для админов с расширенной фильтрацией
func (e *Event) AdminFilter(ctx *Context, filter *domain.AdminFilterEvent) ([]*domain.Event, error) {
	events, err := e.eventRepo.AdminFilter(ctx.Context, filter)
	if err != nil {
		return nil, err
	}

	// Добавляем участников для каждого события
	for _, event := range events {
		participants, err := e.GetEventParticipants(ctx.Context, event.ID)
		if err != nil {
			return nil, err
		}
		event.Participants = participants
	}

	return events, nil
}

// AdminCreate создает событие для админов
func (e *Event) AdminCreate(ctx *Context, createEvent *domain.CreateEvent) (*domain.Event, error) {
	id, err := e.eventRepo.Create(ctx.Context, createEvent)
	if err != nil {
		return nil, fmt.Errorf("failed to create event: %w", err)
	}
	
	filter := &domain.AdminFilterEvent{ID: &id}
	events, err := e.AdminFilter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get created event: %w", err)
	}
	
	if len(events) == 0 {
		return nil, fmt.Errorf("created event not found")
	}
	
	return events[0], nil
}

// Обновляет событие для админов
func (e *Event) AdminPatch(ctx *Context, id string, patch *domain.AdminPatchEvent) (*domain.Event, error) {
	err := e.eventRepo.AdminPatch(ctx.Context, id, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to patch event: %w", err)
	}
	
	filter := &domain.AdminFilterEvent{ID: &id}
	events, err := e.AdminFilter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated event: %w", err)
	}
	
	if len(events) == 0 {
		return nil, fmt.Errorf("updated event not found")
	}
	
	return events[0], nil
}

// Удаляет событие для админов
func (e *Event) AdminDelete(ctx *Context, id string) error {
	return e.eventRepo.AdminDelete(ctx.Context, id)
}

// Получает стратегию для типа события
func (e *Event) GetRegistrationStrategy(eventType domain.EventType) EventRegistrationStrategy {
	return GetEventStrategy(eventType)
}

// Проверяет возможность регистрации пользователя на событие
func (e *Event) ValidateEventRegistration(ctx context.Context, user *domain.User, event *domain.Event) error {
	strategy := e.GetRegistrationStrategy(event.Type)
	return strategy.ValidateRegistration(ctx, user, event)
}

// Определяет статус регистрации для события
func (e *Event) DetermineRegistrationStatus(ctx context.Context, event *domain.Event) domain.RegistrationStatus {
	strategy := e.GetRegistrationStrategy(event.Type)
	return strategy.DetermineRegistrationStatus(ctx, event)
}

// Обрабатывает отмену регистрации
func (e *Event) HandleRegistrationCancellation(ctx context.Context, registration *domain.Registration, event *domain.Event, hasPaid bool) domain.RegistrationStatus {
	strategy := e.GetRegistrationStrategy(event.Type)
	return strategy.HandleCancellation(ctx, registration, event, hasPaid)
} 