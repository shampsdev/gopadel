package usecase

import (
	"context"
	"fmt"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Cat struct {
	catRepo repo.Cat
}

func NewCat(catRepo repo.Cat) *Cat {
	return &Cat{catRepo: catRepo}
}

func (c *Cat) ListOwnedCats(ctx context.Context, userID string) ([]*domain.Cat, error) {
	return c.catRepo.Filter(ctx, &domain.FilterCat{
		OwnerID: &userID,
	})
}

func (c *Cat) ListAllCats(ctx context.Context) ([]*domain.Cat, error) {
	return c.catRepo.Filter(ctx, &domain.FilterCat{
		IncludeOwner: true,
	})
}

func (c *Cat) CreateCat(ctx Context, cat *domain.CreateCat) (*domain.Cat, error) {
	cat.OwnerID = ctx.User.ID
	id, err := c.catRepo.Create(ctx, cat)
	if err != nil {
		return nil, fmt.Errorf("failed to create cat: %w", err)
	}
	return repo.First(c.catRepo.Filter)(ctx, &domain.FilterCat{ID: &id})
}

func (c *Cat) PatchCat(ctx Context, catID string, cat *domain.PatchCat) error {
	if err := c.ensureCatOwnedByUser(ctx, catID); err != nil {
		return err
	}
	return c.catRepo.Patch(ctx, catID, cat)
}

func (c *Cat) ensureCatOwnedByUser(ctx Context, catID string) error {
	_, err := repo.First(c.catRepo.Filter)(ctx, &domain.FilterCat{ID: &catID, OwnerID: &ctx.User.ID})
	if err != nil {
		return fmt.Errorf("failed to ensure cat owned: %w", err)
	}
	return nil
}
