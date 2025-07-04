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

type AdminUser interface {
	Filter(ctx context.Context, filter *domain.FilterAdminUser) ([]*domain.AdminUser, error)
	GetByUsername(ctx context.Context, username string) (*domain.AdminUser, error)
	Create(ctx context.Context, adminUser *domain.CreateAdminUser) (string, error)
	Patch(ctx context.Context, id string, adminUser *domain.PatchAdminUser) error
	Delete(ctx context.Context, id string) error
	UpdatePassword(ctx context.Context, id string, passwordHash string) error
}

type Court interface {
	Create(ctx context.Context, court *domain.CreateCourt) (string, error)
	Patch(ctx context.Context, id string, court *domain.PatchCourt) error
	Filter(ctx context.Context, filter *domain.FilterCourt) ([]*domain.Court, error)
	Delete(ctx context.Context, id string) error
}

type Loyalty interface {
	Create(ctx context.Context, loyalty *domain.CreateLoyalty) (string, error)
	Patch(ctx context.Context, id int, loyalty *domain.PatchLoyalty) error
	Filter(ctx context.Context, filter *domain.FilterLoyalty) ([]*domain.Loyalty, error)
	Delete(ctx context.Context, id int) error
}

type Tournament interface {
	Create(ctx context.Context, tournament *domain.CreateTournament) (string, error)
	Patch(ctx context.Context, id string, tournament *domain.PatchTournament) error
	Filter(ctx context.Context, filter *domain.FilterTournament) ([]*domain.Tournament, error)
	GetTournamentsByUserID(ctx context.Context, userID string) ([]*domain.Tournament, error)
	Delete(ctx context.Context, id string) error
}

type Registration interface {
	Create(ctx context.Context, registration *domain.CreateRegistration) (string, error)
	Patch(ctx context.Context, id string, registration *domain.PatchRegistration) error
	Filter(ctx context.Context, filter *domain.FilterRegistration) ([]*domain.Registration, error)
	AdminFilter(ctx context.Context, filter *domain.AdminFilterRegistration) ([]*domain.RegistrationWithPayments, error)
	Delete(ctx context.Context, id string) error
}

type Payment interface {
	Create(ctx context.Context, payment *domain.CreatePayment) (string, error)
	Patch(ctx context.Context, id string, payment *domain.PatchPayment) error
	Filter(ctx context.Context, filter *domain.FilterPayment) ([]*domain.Payment, error)
	Delete(ctx context.Context, id string) error
}

type Waitlist interface {
	Create(ctx context.Context, waitlist *domain.CreateWaitlist) (int, error)
	Filter(ctx context.Context, filter *domain.FilterWaitlist) ([]*domain.Waitlist, error)
	Delete(ctx context.Context, id int) error
}

type ImageStorage interface {
	SaveImageByURL(ctx context.Context, url, key string) (string, error)
	SaveImageByBytes(ctx context.Context, bytes []byte, key string) (string, error)
	SaveImageByReader(ctx context.Context, imageData io.Reader, destDir string) (string, error)
	SaveImageByReaderWithPath(ctx context.Context, imageData io.Reader, destDir string) (string, error)
}
