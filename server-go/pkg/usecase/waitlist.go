package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Waitlist struct {
	ctx           context.Context
	WaitlistRepo  repo.Waitlist
	TournamentCase *Tournament
}

func NewWaitlist(ctx context.Context, WaitlistRepo repo.Waitlist, TournamentCase *Tournament) *Waitlist {
	return &Waitlist{
		ctx:           ctx,
		WaitlistRepo:  WaitlistRepo,
		TournamentCase: TournamentCase,
	}
}

func (w *Waitlist) Filter(ctx context.Context, filter *domain.FilterWaitlist) ([]*domain.Waitlist, error) {
	return w.WaitlistRepo.Filter(ctx, filter)
}

func (w *Waitlist) Create(ctx context.Context, waitlist *domain.CreateWaitlist) (int, error) {
	return w.WaitlistRepo.Create(ctx, waitlist)
}

func (w *Waitlist) Delete(ctx context.Context, id int) error {
	return w.WaitlistRepo.Delete(ctx, id)
}

func (w *Waitlist) GetTournamentWaitlist(ctx context.Context, tournamentID string) ([]*domain.Waitlist, error) {
	filter := &domain.FilterWaitlist{
		TournamentID: &tournamentID,
	}
	return w.WaitlistRepo.Filter(ctx, filter)
}

func (w *Waitlist) AddToWaitlist(ctx context.Context, userID, tournamentID string) (*domain.Waitlist, error) {
	tournament, err := w.TournamentCase.GetTournamentByID(ctx, tournamentID)
	if err != nil {
		return nil, err
	}

	if !tournament.EndTime.IsZero() && tournament.EndTime.Before(time.Now()) {
		return nil, fmt.Errorf("tournament has already ended")
	}

	existingFilter := &domain.FilterWaitlist{
		UserID:       &userID,
		TournamentID: &tournamentID,
	}
	existing, err := w.WaitlistRepo.Filter(ctx, existingFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing waitlist: %w", err)
	}
	
	if len(existing) > 0 {
		return nil, fmt.Errorf("user is already in the waitlist for this tournament")
	}

	createWaitlist := &domain.CreateWaitlist{
		UserID:       userID,
		TournamentID: tournamentID,
	}
	
	waitlistID, err := w.WaitlistRepo.Create(ctx, createWaitlist)
	if err != nil {
		return nil, fmt.Errorf("failed to add to waitlist: %w", err)
	}

	filter := &domain.FilterWaitlist{
		ID: &waitlistID,
	}
	
	waitlists, err := w.WaitlistRepo.Filter(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get created waitlist entry: %w", err)
	}
	
	if len(waitlists) == 0 {
		return nil, fmt.Errorf("created waitlist entry not found")
	}
	
	return waitlists[0], nil
}

func (w *Waitlist) RemoveFromWaitlist(ctx context.Context, userID, tournamentID string) error {
	_, err := w.TournamentCase.GetTournamentByID(ctx, tournamentID)
	if err != nil {
		return err
	}

	filter := &domain.FilterWaitlist{
		UserID:       &userID,
		TournamentID: &tournamentID,
	}
	
	waitlists, err := w.WaitlistRepo.Filter(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to find waitlist entry: %w", err)
	}
	
	if len(waitlists) == 0 {
		return fmt.Errorf("user is not in the waitlist for this tournament")
	}

	err = w.WaitlistRepo.Delete(ctx, waitlists[0].ID)
	if err != nil {
		return fmt.Errorf("failed to remove from waitlist: %w", err)
	}

	return nil
} 