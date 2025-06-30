package repo

import (
	"context"
	"errors"
	"io"

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

type Club interface {
	Create(ctx context.Context, club *domain.CreateClub) (string, error)
	Patch(ctx context.Context, id string, club *domain.PatchClub) error
	Filter(ctx context.Context, filter *domain.FilterClub) ([]*domain.Club, error)
	Delete(ctx context.Context, id string) error
}

type Loyalty interface {
	Create(ctx context.Context, loyalty *domain.CreateLoyalty) (string, error)
	Filter(ctx context.Context, filter *domain.FilterLoyalty) ([]*domain.Loyalty, error)
}

type Tournament interface {
	Filter(ctx context.Context, filter *domain.FilterTournament) ([]*domain.Tournament, error)
	GetTournamentsByUserID(ctx context.Context, userID string) ([]*domain.Tournament, error)
}

type Registration interface {
	Create(ctx context.Context, registration *domain.CreateRegistration) (string, error)
	Patch(ctx context.Context, id string, registration *domain.PatchRegistration) error
	Filter(ctx context.Context, filter *domain.FilterRegistration) ([]*domain.Registration, error)
	Delete(ctx context.Context, id string) error
}

type Payment interface {
	Create(ctx context.Context, payment *domain.CreatePayment) (string, error)
	Patch(ctx context.Context, id string, payment *domain.PatchPayment) error
	Filter(ctx context.Context, filter *domain.FilterPayment) ([]*domain.Payment, error)
	Delete(ctx context.Context, id string) error
}

type ImageStorage interface {
	SaveImageByURL(ctx context.Context, url, key string) (string, error)
	SaveImageByBytes(ctx context.Context, bytes []byte, key string) (string, error)
	SaveImageByReader(ctx context.Context, imageData io.Reader, destDir string) (string, error)
	SaveImageByReaderWithPath(ctx context.Context, imageData io.Reader, destDir string) (string, error)
}
