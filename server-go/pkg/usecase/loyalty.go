package usecase

import (
	"context"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Loyalty struct {
	ctx         context.Context
	loyaltyRepo repo.Loyalty
}

func NewLoyalty(ctx context.Context, loyaltyRepo repo.Loyalty) *Loyalty {
	return &Loyalty{
		ctx:         ctx,
		loyaltyRepo: loyaltyRepo,
	}
}

func (l *Loyalty) Create(ctx Context, loyalty *domain.CreateLoyalty) (string, error) {
	return l.loyaltyRepo.Create(ctx.Context, loyalty)
}

func (l *Loyalty) Filter(ctx Context, filter *domain.FilterLoyalty) ([]*domain.Loyalty, error) {
	return l.loyaltyRepo.Filter(ctx.Context, filter)
}

func (l *Loyalty) Patch(ctx Context, id int, loyalty *domain.PatchLoyalty) error {
	return l.loyaltyRepo.Patch(ctx.Context, id, loyalty)
}

func (l *Loyalty) Delete(ctx Context, id int) error {
	return l.loyaltyRepo.Delete(ctx.Context, id)
} 