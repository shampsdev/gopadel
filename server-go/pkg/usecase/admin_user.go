package usecase

import (
	"context"
	"fmt"

	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
	"github.com/shampsdev/go-telegram-template/pkg/utils"
)

type AdminUser struct {
	adminUserRepo repo.AdminUser
	cfg           *config.Config
}

func NewAdminUser(ctx context.Context, adminUserRepo repo.AdminUser, cfg *config.Config) *AdminUser {
	return &AdminUser{
		adminUserRepo: adminUserRepo,
		cfg:           cfg,
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

// Authenticate проверяет логин и пароль админа
func (a *AdminUser) Authenticate(ctx context.Context, username, password string) (*domain.AdminUser, error) {
	admin, err := a.adminUserRepo.GetByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	if !utils.VerifyPassword(password, admin.PasswordHash) {
		return nil, fmt.Errorf("invalid password")
	}

	return admin, nil
}

// Login выполняет аутентификацию и возвращает JWT токен
func (a *AdminUser) Login(ctx context.Context, loginData *domain.AdminLogin) (*domain.AdminToken, error) {
	admin, err := a.Authenticate(ctx, loginData.Username, loginData.Password)
	if err != nil {
		return nil, err
	}

	token, err := utils.CreateAccessToken(admin, a.cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create token: %w", err)
	}

	return &domain.AdminToken{
		AccessToken: token,
		TokenType:   "bearer",
	}, nil
}

// GetCurrentAdmin получает админа по токену
func (a *AdminUser) GetCurrentAdmin(ctx context.Context, token string) (*domain.AdminUser, error) {
	claims, err := utils.ValidateToken(token, a.cfg)
	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	admin, err := a.adminUserRepo.GetByUsername(ctx, claims.Username)
	if err != nil {
		return nil, err
	}

	return admin, nil
}

// ChangePassword изменяет пароль админа
func (a *AdminUser) ChangePassword(ctx context.Context, admin *domain.AdminUser, oldPassword, newPassword string) error {
	if !utils.VerifyPassword(oldPassword, admin.PasswordHash) {
		return fmt.Errorf("incorrect current password")
	}

	newPasswordHash, err := utils.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("failed to hash new password: %w", err)
	}

	return a.adminUserRepo.UpdatePassword(ctx, admin.ID, newPasswordHash)
} 