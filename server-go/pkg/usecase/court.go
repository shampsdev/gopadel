package usecase

import (
	"context"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Court struct {
	ctx       context.Context
	courtRepo repo.Court
}

func NewCourt(ctx context.Context, courtRepo repo.Court) *Court {
	return &Court{
		ctx:       ctx,
		courtRepo: courtRepo,
	}
}

func (c *Court) Create(ctx Context, court *domain.CreateCourt) (string, error) {
	return c.courtRepo.Create(ctx.Context, court)
}

func (c *Court) Update(ctx Context, id string, court *domain.PatchCourt) error {
	return c.courtRepo.Patch(ctx.Context, id, court)
}

func (c *Court) GetAll(ctx Context, filter *domain.FilterCourt) ([]*domain.Court, error) {
	return c.courtRepo.Filter(ctx.Context, filter)
}

func (c *Court) GetByID(ctx Context, id string) (*domain.Court, error) {
	filter := &domain.FilterCourt{ID: &id}
	courts, err := c.courtRepo.Filter(ctx.Context, filter)
	if err != nil {
		return nil, err
	}

	if len(courts) == 0 {
		return nil, repo.ErrNotFound
	}

	return courts[0], nil
}

func (c *Court) Delete(ctx Context, id string) error {
	return c.courtRepo.Delete(ctx.Context, id)
} 