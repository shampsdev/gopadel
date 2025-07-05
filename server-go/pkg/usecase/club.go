package usecase

import (
	"context"
	"fmt"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Club struct {
	ctx  context.Context
	repo repo.Club
}

func NewClub(ctx context.Context, repo repo.Club) *Club {
	return &Club{
		ctx:  ctx,
		repo: repo,
	}
}

func (uc *Club) Create(ctx *Context, club *domain.CreateClub) error {
	// Проверяем, что пользователь авторизован
	if ctx.User == nil {
		return fmt.Errorf("user not authenticated")
	}

	return uc.repo.Create(ctx, club)
}

func (uc *Club) Filter(ctx *Context, filter *domain.FilterClub) ([]*domain.Club, error) {
	// Проверяем, что пользователь авторизован
	if ctx.User == nil {
		return nil, fmt.Errorf("user not authenticated")
	}

	return uc.repo.Filter(ctx, filter)
}

func (uc *Club) JoinClub(ctx *Context, clubID string) error {
	// Проверяем, что пользователь авторизован
	if ctx.User == nil {
		return fmt.Errorf("user not authenticated")
	}

	return uc.repo.JoinClub(ctx, clubID, ctx.User.ID)
}

func (uc *Club) JoinClubAndGet(ctx *Context, clubID string) (*domain.Club, error) {
	// Проверяем, что пользователь авторизован
	if ctx.User == nil {
		return nil, fmt.Errorf("user not authenticated")
	}

	// Вступаем в клуб
	err := uc.repo.JoinClub(ctx, clubID, ctx.User.ID)
	if err != nil {
		return nil, err
	}

	// Получаем данные клуба
	filter := &domain.FilterClub{ID: &clubID}
	clubs, err := uc.repo.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}

	if len(clubs) == 0 {
		return nil, fmt.Errorf("club not found")
	}

	return clubs[0], nil
}

func (uc *Club) GetUserClubs(ctx *Context) ([]*domain.Club, error) {
	// Проверяем, что пользователь авторизован
	if ctx.User == nil {
		return nil, fmt.Errorf("user not authenticated")
	}

	return uc.repo.GetUserClubs(ctx, ctx.User.ID)
}

// Patch обновляет клуб (админская операция)
func (uc *Club) Patch(ctx *Context, clubID string, patch *domain.PatchClub) error {
	return uc.repo.Patch(ctx.Context, clubID, patch)
}

// Delete удаляет клуб (админская операция)
func (uc *Club) Delete(ctx *Context, clubID string) error {
	return uc.repo.Delete(ctx.Context, clubID)
}

// AdminFilter получает клубы для админов (без проверки аутентификации)
func (uc *Club) AdminFilter(ctx *Context, filter *domain.FilterClub) ([]*domain.Club, error) {
	return uc.repo.Filter(ctx.Context, filter)
}

// AdminCreate создает клуб для админов (без проверки аутентификации)
func (uc *Club) AdminCreate(ctx *Context, club *domain.CreateClub) error {
	return uc.repo.Create(ctx.Context, club)
} 