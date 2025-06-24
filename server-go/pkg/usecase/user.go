package usecase

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/shampsdev/go-telegram-template/pkg/domain"
	"github.com/shampsdev/go-telegram-template/pkg/repo"
	"github.com/shampsdev/go-telegram-template/pkg/usecase/names"
	"github.com/shampsdev/go-telegram-template/pkg/utils/slogx"
)

type User struct {
	userRepo repo.User
	storage  repo.ImageStorage

	tgDataCache sync.Map
}

func NewUser(
	ctx context.Context,
	userRepo repo.User,
	storage repo.ImageStorage,
) *User {
	u := &User{
		userRepo: userRepo,
		storage:  storage,
	}

	go u.cacheCleaner(ctx)
	return u
}

func (u *User) Create(ctx context.Context, userTGData *domain.UserTGData) (*domain.User, error) {
	user := &domain.CreateUser{
		UserTGData: *userTGData,
	}

	var err error
	user.Avatar, err = u.storage.SaveImageByURL(ctx, user.Avatar, names.ForUserAvatar(user.TelegramID, user.Avatar))
	if err != nil {
		return nil, fmt.Errorf("failed to upload user avatar: %w", err)
	}

	id, err := u.userRepo.Create(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}
	return repo.First(u.userRepo.Filter)(ctx, &domain.FilterUser{ID: &id})
}

func (u *User) GetByTelegramID(ctx context.Context, id int64) (*domain.User, error) {
	return repo.First(u.userRepo.Filter)(ctx, &domain.FilterUser{TelegramID: &id})
}

func (u *User) GetMe(ctx Context) (*domain.User, error) {
	return ctx.User, nil
}

func (u *User) GetByTGData(ctx context.Context, tgData *domain.UserTGData) (*domain.User, error) {
	if u, ok := u.tgDataCache.Load(tgData.TelegramID); ok {
		//nolint:errcheck// because sure
		return u.(*domain.User), nil
	}

	user, err := repo.First(u.userRepo.Filter)(ctx, &domain.FilterUser{
		TelegramID: &tgData.TelegramID,
	})
	if err != nil {
		return nil, err
	}

	tgData.Avatar, err = u.telegramAvatarLocation(tgData.Avatar)
	if err != nil {
		return nil, fmt.Errorf("failed to get user avatar: %w", err)
	}

	needUpdate := false
	if tgData.TelegramUsername != user.TelegramUsername {
		needUpdate = true
	}

	// if avatar changed
	if !strings.Contains(user.Avatar, names.ForUserAvatar(user.TelegramID, tgData.Avatar)) {
		var err error
		tgData.Avatar, err = u.storage.SaveImageByURL(ctx, tgData.Avatar, names.ForUserAvatar(user.TelegramID, tgData.Avatar))
		user.Avatar = tgData.Avatar
		slogx.FromCtx(ctx).Debug("user avatar changed", "user", user.ID, "old_avatar", user.Avatar, "new_avatar", tgData.Avatar)
		if err != nil {
			return nil, fmt.Errorf("failed to upload user avatar: %w", err)
		}
		needUpdate = true
	}

	if needUpdate {
		err = u.userRepo.Patch(ctx, user.ID, &domain.PatchUser{
			FirstName:        &tgData.FirstName,
			LastName:         &tgData.LastName,
			Avatar:           &user.Avatar,
			TelegramUsername: &tgData.TelegramUsername,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to update user: %w", err)
		}
	}

	u.tgDataCache.Store(tgData.TelegramID, user)
	return user, nil
}

func (u *User) telegramAvatarLocation(userpicURL string) (string, error) {
	httpCli := &http.Client{
		CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	resp, err := httpCli.Head(userpicURL)
	if err != nil {
		return "", fmt.Errorf("failed to get userpic: %w", err)
	}
	defer resp.Body.Close()

	location := resp.Header.Get("Location")
	if location == "" {
		return userpicURL, nil
	}
	return location, nil
}

func (u *User) cacheCleaner(ctx context.Context) {
	log := slogx.FromCtx(ctx)
	log.Info("userTGData cache cleaner started")
	ticker := time.NewTicker(2 * time.Minute)
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			deleted := atomic.Int64{}
			u.tgDataCache.Range(func(key, _ any) bool {
				u.tgDataCache.Delete(key)
				deleted.Add(1)
				return true
			})
			log.Info("userTGData cache cleaned", "deleted", deleted.Load())
		}
	}
}
