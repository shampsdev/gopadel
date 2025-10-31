package usecase

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Waitlist struct {
	ctx          context.Context
	waitlistRepo repo.Waitlist
	cases        *Cases
}

func NewWaitlist(ctx context.Context, waitlistRepo repo.Waitlist, cases *Cases) *Waitlist {
	return &Waitlist{
		ctx:          ctx,
		waitlistRepo: waitlistRepo,
		cases:        cases,
	}
}

func (w *Waitlist) Filter(ctx context.Context, filter *domain.FilterWaitlist) ([]*domain.Waitlist, error) {
	return w.waitlistRepo.Filter(ctx, filter)
}

func (w *Waitlist) Create(ctx context.Context, waitlist *domain.CreateWaitlist) (int, error) {
	return w.waitlistRepo.Create(ctx, waitlist)
}

func (w *Waitlist) Delete(ctx context.Context, id int) error {
	return w.waitlistRepo.Delete(ctx, id)
}

func (w *Waitlist) GetEventWaitlist(ctx context.Context, eventID string) ([]*domain.Waitlist, error) {
	filter := &domain.FilterWaitlist{
		EventID: &eventID,
	}
	return w.waitlistRepo.Filter(ctx, filter)
}

func (w *Waitlist) GetEventWaitlistUsers(ctx context.Context, eventID string) ([]*domain.WaitlistUser, error) {
	waitlists, err := w.GetEventWaitlist(ctx, eventID)
	if err != nil {
		return nil, err
	}

	waitlistUsers := make([]*domain.WaitlistUser, len(waitlists))
	for i, waitlist := range waitlists {
		waitlistUsers[i] = &domain.WaitlistUser{
			User: waitlist.User,
			Date: waitlist.Date,
		}
	}

	return waitlistUsers, nil
}

func (w *Waitlist) AddToWaitlist(ctx context.Context, userID, eventID string) (*domain.Waitlist, error) {
	slog.Info("User attempting to join waitlist",
		"user_id", userID,
		"event_id", eventID)

	filter := &domain.FilterEvent{ID: &eventID}
	events, err := w.cases.Event.Filter(ctx, filter)
	if err != nil {
		slog.Error("Failed to get event for waitlist",
			"user_id", userID,
			"event_id", eventID,
			"error", err)
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	if len(events) == 0 {
		slog.Error("Event not found for waitlist",
			"user_id", userID,
			"event_id", eventID)
		return nil, fmt.Errorf("event not found")
	}
	
	event := events[0]
	slog.Info("Event details for waitlist",
		"event_id", eventID,
		"event_name", event.Name,
		"event_type", event.Type,
		"event_status", event.Status,
		"max_users", event.MaxUsers)

	if !event.EndTime.IsZero() && event.EndTime.Before(time.Now()) {
		slog.Warn("Cannot join waitlist - event has ended",
			"user_id", userID,
			"event_id", eventID,
			"event_end_time", event.EndTime)
		return nil, fmt.Errorf("event has already ended")
	}

	existingFilter := &domain.FilterWaitlist{
		UserID:  &userID,
		EventID: &eventID,
	}
	existing, err := w.waitlistRepo.Filter(ctx, existingFilter)
	if err != nil {
		slog.Error("Failed to check existing waitlist entry",
			"user_id", userID,
			"event_id", eventID,
			"error", err)
		return nil, fmt.Errorf("failed to check existing waitlist: %w", err)
	}
	
	if len(existing) > 0 {
		slog.Warn("User is already in waitlist",
			"user_id", userID,
			"event_id", eventID,
			"existing_entry_date", existing[0].Date)
		return nil, fmt.Errorf("user is already in the waitlist for this event")
	}

	createWaitlist := &domain.CreateWaitlist{
		UserID:  userID,
		EventID: eventID,
	}
	
	slog.Info("Creating waitlist entry",
		"user_id", userID,
		"event_id", eventID)
	
	waitlistID, err := w.waitlistRepo.Create(ctx, createWaitlist)
	if err != nil {
		slog.Error("Failed to create waitlist entry",
			"user_id", userID,
			"event_id", eventID,
			"error", err)
		return nil, fmt.Errorf("failed to add to waitlist: %w", err)
	}

	slog.Info("Successfully added user to waitlist",
		"user_id", userID,
		"event_id", eventID,
		"waitlist_id", waitlistID)

	waitlistFilter := &domain.FilterWaitlist{
		ID: &waitlistID,
	}
	
	waitlists, err := w.waitlistRepo.Filter(ctx, waitlistFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to get created waitlist entry: %w", err)
	}
	
	if len(waitlists) == 0 {
		return nil, fmt.Errorf("created waitlist entry not found")
	}
	
	return waitlists[0], nil
}

func (w *Waitlist) RemoveFromWaitlist(ctx context.Context, userID, eventID string) error {
	slog.Info("User attempting to leave waitlist",
		"user_id", userID,
		"event_id", eventID)

	filter := &domain.FilterEvent{ID: &eventID}
	events, err := w.cases.Event.Filter(ctx, filter)
	if err != nil {
		slog.Error("Failed to get event for waitlist removal",
			"user_id", userID,
			"event_id", eventID,
			"error", err)
		return fmt.Errorf("failed to get event: %w", err)
	}

	if len(events) == 0 {
		slog.Error("Event not found for waitlist removal",
			"user_id", userID,
			"event_id", eventID)
		return fmt.Errorf("event not found")
	}

	event := events[0]
	slog.Info("Event details for waitlist removal",
		"event_id", eventID,
		"event_name", event.Name,
		"event_type", event.Type)

	waitlistFilter := &domain.FilterWaitlist{
		UserID:  &userID,
		EventID: &eventID,
	}
	
	waitlists, err := w.waitlistRepo.Filter(ctx, waitlistFilter)
	if err != nil {
		slog.Error("Failed to find waitlist entry for removal",
			"user_id", userID,
			"event_id", eventID,
			"error", err)
		return fmt.Errorf("failed to find waitlist entry: %w", err)
	}
	
	if len(waitlists) == 0 {
		slog.Warn("User not found in waitlist",
			"user_id", userID,
			"event_id", eventID)
		return fmt.Errorf("user is not in the waitlist for this event")
	}

	slog.Info("Removing user from waitlist",
		"user_id", userID,
		"event_id", eventID,
		"waitlist_id", waitlists[0].ID,
		"waitlist_date", waitlists[0].Date)

	err = w.waitlistRepo.Delete(ctx, waitlists[0].ID)
	if err != nil {
		slog.Error("Failed to delete waitlist entry",
			"user_id", userID,
			"event_id", eventID,
			"waitlist_id", waitlists[0].ID,
			"error", err)
		return fmt.Errorf("failed to remove from waitlist: %w", err)
	}

	slog.Info("Successfully removed user from waitlist",
		"user_id", userID,
		"event_id", eventID,
		"waitlist_id", waitlists[0].ID)

	return nil
} 