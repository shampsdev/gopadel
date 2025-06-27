package usecase

import (
	"context"

	"github.com/shampsdev/go-telegram-template/pkg/repo"
)

type Image struct {
	ctx     context.Context
	storage repo.ImageStorage
}

func NewImage(ctx context.Context, storage repo.ImageStorage) *Image {
	return &Image{
		ctx:     ctx,
		storage: storage,
	}
}

func (i *Image) GetStorage() repo.ImageStorage {
	return i.storage
} 