package usecase

import (
	"context"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type AdminUser struct {
	adminUserRepo repo.AdminUser
}

func NewAdminUser(ctx context.Context, adminUserRepo repo.AdminUser) *AdminUser {
	return &AdminUser{
		adminUserRepo: adminUserRepo,
	}
}

func (a *AdminUser) Filter(ctx context.Context, filter *domain.FilterAdminUser) ([]*domain.AdminUser, error) {
	return a.adminUserRepo.Filter(ctx, filter)
}

func (a *AdminUser) GetByUserID(ctx context.Context, userID string) (*domain.AdminUser, error) {
	filter := &domain.FilterAdminUser{
		UserID: &userID,
	}
	
	adminUsers, err := a.adminUserRepo.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}
	
	if len(adminUsers) == 0 {
		return nil, repo.ErrNotFound
	}
	
	return adminUsers[0], nil
} 