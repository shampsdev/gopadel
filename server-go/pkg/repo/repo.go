package repo

import (
	"context"
	"errors"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

var (
	ErrNotFound = errors.New("not found")
)

type User interface {
	Create(ctx context.Context, user *domain.CreateUser) (string, error)
	Patch(ctx context.Context, id string, user *domain.PatchUser) error
	Filter(ctx context.Context, filter *domain.FilterUser) ([]*domain.User, error)
	Delete(ctx context.Context, id string) error
}

type Cat interface {
	Create(ctx context.Context, cat *domain.CreateCat) (string, error)
	Patch(ctx context.Context, id string, cat *domain.PatchCat) error
	Filter(ctx context.Context, filter *domain.FilterCat) ([]*domain.Cat, error)
	Delete(ctx context.Context, id string) error
}

type ImageStorage interface {
	SaveImageByURL(ctx context.Context, url, key string) (string, error)
	SaveImageByBytes(ctx context.Context, bytes []byte, key string) (string, error)
}
