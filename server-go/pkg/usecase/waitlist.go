package usecase

import (
	"context"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Waitlist struct {
	ctx         context.Context
	WaitlistRepo repo.Waitlist
}

func NewWaitlist(ctx context.Context, WaitlistRepo repo.Waitlist) *Waitlist {
	return &Waitlist{
		ctx:         ctx,
		WaitlistRepo: WaitlistRepo,
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