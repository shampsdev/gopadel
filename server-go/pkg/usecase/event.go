package usecase

import (
	"context"
	"fmt"
	"log/slog"
	"slices"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
	"github.com/shampsdev/go-telegram-template/pkg/utils"
)

type Event struct {
	ctx       context.Context
	eventRepo repo.Event
	bot       *bot.Bot
	cfg       *config.Config
	cases     *Cases
}

func NewEvent(ctx context.Context, eventRepo repo.Event, cfg *config.Config, bot *bot.Bot, cases *Cases) *Event {
	return &Event{
		ctx:       ctx,
		bot:       bot,
		cfg:       cfg,
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
	if ctx.User != nil && filter.FilterByUserClubs == nil {
		filter.FilterByUserClubs = &ctx.User.ID
	}

	return e.Filter(ctx.Context, filter)
}

// Обновляет событие
func (e *Event) Patch(ctx context.Context, id string, patch *domain.PatchEvent) (*domain.Event, error) {
	var hasValidResult bool
	if len(patch.Data) > 0 {
		userID := "unknown"
		if ctxUser, ok := ctx.Value("user").(*domain.User); ok && ctxUser != nil {
			userID = ctxUser.ID
		}

		hasResult, err := utils.ValidateEventDataJSON(patch.Data, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to validate event data: %w", err)
		}
		hasValidResult = hasResult
	}

	// Если изменяется MaxUsers, проверяем необходимость обновления статуса
	var needsStatusCheck bool
	if patch.MaxUsers != nil {
		needsStatusCheck = true
	}

	err := e.eventRepo.Patch(ctx, id, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to patch event: %w", err)
	}

	if hasValidResult {
		completedStatus := domain.EventStatusCompleted
		statusPatch := &domain.PatchEvent{
			Status: &completedStatus,
		}

		err = e.eventRepo.Patch(ctx, id, statusPatch)
		if err != nil {
			return nil, fmt.Errorf("failed to update event status to completed: %w", err)
		}
	}

	// Проверяем статус события после изменения MaxUsers
	if needsStatusCheck && e.cases.Registration != nil {
		err = e.updateEventStatusAfterCapacityChange(ctx, id)
		if err != nil {
			return nil, fmt.Errorf("failed to update event status after capacity change: %w", err)
		}
	}

	err = e.cases.Event.TryRegisterFromWaitlist(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to try register from waitlist: %w", err)
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

// GetStrategy возвращает стратегию для события определенного типа
func (e *Event) GetStrategy(eventType domain.EventType) EventStrategy {
	return GetEventStrategy(eventType)
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
	// Проверяем и валидируем JSON данные если они переданы
	var hasValidResult bool
	if len(patch.Data) > 0 {
		// Получаем информацию об админе для логирования
		userID := "admin-unknown"
		if ctx.User != nil {
			userID = "admin-" + ctx.User.ID
		}

		// Проверяем наличие поля result и безопасность
		hasResult, err := utils.ValidateEventDataJSON(patch.Data, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to validate event data: %w", err)
		}
		hasValidResult = hasResult
	}

	// Если изменяется MaxUsers, проверяем необходимость обновления статуса
	var needsStatusCheck bool
	if patch.MaxUsers != nil {
		needsStatusCheck = true
	}

	err := e.eventRepo.AdminPatch(ctx.Context, id, patch)
	if err != nil {
		return nil, fmt.Errorf("failed to patch event: %w", err)
	}

	// Если в JSON данных есть поле result, автоматически устанавливаем статус completed
	if hasValidResult {
		completedStatus := domain.EventStatusCompleted
		statusPatch := &domain.AdminPatchEvent{
			Status: &completedStatus,
		}

		err = e.eventRepo.AdminPatch(ctx.Context, id, statusPatch)
		if err != nil {
			return nil, fmt.Errorf("failed to update event status to completed: %w", err)
		}
	}

	// Проверяем статус события после изменения MaxUsers
	if needsStatusCheck && e.cases.Registration != nil {
		err = e.updateEventStatusAfterCapacityChange(ctx.Context, id)
		if err != nil {
			return nil, fmt.Errorf("failed to update event status after capacity change: %w", err)
		}
	}

	err = e.cases.Event.TryRegisterFromWaitlist(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to try register from waitlist: %w", err)
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
func (e *Event) GetRegistrationStrategy(eventType domain.EventType) EventStrategy {
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

// CreateEventWithPermissionCheck создает событие с проверкой прав доступа по типу
func (e *Event) CreateEventWithPermissionCheck(ctx context.Context, createEvent *domain.CreateEvent, user *domain.User) (*domain.Event, error) {
	createEvent.OrganizerID = user.ID

	// Проверяем права доступа в зависимости от типа события
	switch createEvent.Type {
	case domain.EventTypeGame:
		return e.Create(ctx, createEvent)

	case domain.EventTypeTournament:
		adminCtx := NewContext(ctx, user)
		return e.AdminCreate(&adminCtx, createEvent)

	case domain.EventTypeTraining:
		strategy := GetEventStrategy(createEvent.Type)
		if err := strategy.ValidateRegistration(ctx, user, &domain.Event{Type: createEvent.Type}); err != nil {
			return nil, err
		}
		return e.Create(ctx, createEvent)

	default:
		return nil, fmt.Errorf("invalid event type: %s", createEvent.Type)
	}
}

func (e *Event) TryRegisterFromWaitlist(ctx context.Context, eventID string) error {
	slog.Info("Attempting to register users from waitlist",
		"event_id", eventID)

	event, err := e.GetEventByID(ctx, eventID)
	if err != nil {
		slog.Error("Failed to get event for waitlist registration",
			"event_id", eventID,
			"error", err)
		return fmt.Errorf("failed to get event: %w", err)
	}

	slog.Info("Event details for waitlist registration",
		"event_id", eventID,
		"event_name", event.Name,
		"event_type", event.Type,
		"max_users", event.MaxUsers)

	waitlist, err := e.cases.Waitlist.GetEventWaitlist(ctx, eventID)
	if err != nil {
		slog.Error("Failed to get waitlist for registration",
			"event_id", eventID,
			"error", err)
		return fmt.Errorf("failed to get waitlist: %w", err)
	}

	if len(waitlist) == 0 {
		slog.Info("No users in waitlist",
			"event_id", eventID)
		return nil
	}

	slog.Info("Found users in waitlist",
		"event_id", eventID,
		"waitlist_count", len(waitlist))

	slices.SortFunc(waitlist, func(a, b *domain.Waitlist) int {
		return a.Date.Compare(b.Date)
	})

	registeredCount := 0
	for i, waitlistUser := range waitlist {
		slog.Info("Attempting to register user from waitlist",
			"event_id", eventID,
			"user_id", waitlistUser.User.ID,
			"user_telegram_id", waitlistUser.User.TelegramID,
			"user_name", waitlistUser.User.FirstName+" "+waitlistUser.User.LastName,
			"user_rank", waitlistUser.User.Rank,
			"waitlist_position", i+1,
			"waitlist_date", waitlistUser.Date)

		_, err := e.cases.Registration.RegisterForEvent(ctx, waitlistUser.User, eventID)
		if err != nil {
			slog.Warn("Failed to register user from waitlist",
				"event_id", eventID,
				"user_id", waitlistUser.User.ID,
				"user_telegram_id", waitlistUser.User.TelegramID,
				"waitlist_position", i+1,
				"error", err)
			continue
		}

		slog.Info("Successfully registered user from waitlist",
			"event_id", eventID,
			"user_id", waitlistUser.User.ID,
			"user_telegram_id", waitlistUser.User.TelegramID,
			"waitlist_position", i+1)

		err = e.cases.Waitlist.Delete(ctx, waitlistUser.ID)
		if err != nil {
			slog.Error("Failed to delete user from waitlist after successful registration",
				"event_id", eventID,
				"user_id", waitlistUser.User.ID,
				"waitlist_id", waitlistUser.ID,
				"error", err)
			return fmt.Errorf("failed to delete from waitlist")
		}

		registeredCount++

		_, err = e.bot.SendMessage(ctx, &bot.SendMessageParams{
			ChatID: waitlistUser.User.TelegramID,
			Text: fmt.Sprintf(`Вы были успешно перемещены из листа ожидания и зарегистрированы на событие "%s"!
Перейдите на <a href="https://t.me/%s/app?startapp=%s">страницу события</a> и проверьте, требуется ли оплата.`,
				event.Name, e.cfg.TG.BotUsername, event.ID),
			ParseMode: models.ParseModeHTML,
		})
		if err != nil {
			slog.Warn("Failed to send notification to user registered from waitlist",
				"event_id", eventID,
				"user_id", waitlistUser.User.ID,
				"user_telegram_id", waitlistUser.User.TelegramID,
				"error", err)
		}
	}

	slog.Info("Completed waitlist registration process",
		"event_id", eventID,
		"total_in_waitlist", len(waitlist),
		"successfully_registered", registeredCount)

	return nil
}

// updateEventStatusAfterCapacityChange обновляет статус события после изменения его ёмкости (MaxUsers)
func (e *Event) updateEventStatusAfterCapacityChange(ctx context.Context, eventID string) error {
	// Получаем событие
	eventFilter := &domain.FilterEvent{ID: &eventID}
	events, err := e.Filter(ctx, eventFilter)
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
	activeCount, err := e.cases.Registration.GetActiveRegistrationsCount(ctx, eventID)
	if err != nil {
		return fmt.Errorf("failed to get active registrations count: %w", err)
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

		err = e.eventRepo.Patch(ctx, eventID, patch)
		if err != nil {
			return fmt.Errorf("failed to update event status: %w", err)
		}
	}

	return nil
}
