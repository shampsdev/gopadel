package usecase

import (
	"context"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Club struct {
	ctx      context.Context
	clubRepo repo.Club
}

func NewClub(ctx context.Context, clubRepo repo.Club) *Club {
	return &Club{
		ctx:      ctx,
		clubRepo: clubRepo,
	}
}

func (c *Club) Create(ctx Context, club *domain.CreateClub) (string, error) {
	return c.clubRepo.Create(ctx.Context, club)
}

func (c *Club) Update(ctx Context, id string, club *domain.PatchClub) error {
	return c.clubRepo.Patch(ctx.Context, id, club)
}

func (c *Club) GetAll(ctx Context, filter *domain.FilterClub) ([]*domain.Club, error) {
	return c.clubRepo.Filter(ctx.Context, filter)
}

func (c *Club) GetByID(ctx Context, id string) (*domain.Club, error) {
	filter := &domain.FilterClub{ID: &id}
	clubs, err := c.clubRepo.Filter(ctx.Context, filter)
	if err != nil {
		return nil, err
	}

	if len(clubs) == 0 {
		return nil, repo.ErrNotFound
	}

	return clubs[0], nil
}

func (c *Club) Delete(ctx Context, id string) error {
	return c.clubRepo.Delete(ctx.Context, id)
} 