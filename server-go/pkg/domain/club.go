package domain

import "time"

// Club представляет клуб-сообщество
type Club struct {
	ID          string    `json:"id"`
	Url         string    `json:"url"`
	Name        string    `json:"name"`
	IsPrivate   bool      `json:"isPrivate"`
	Description *string   `json:"description,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// ClubUser представляет связь пользователя с клубом
type ClubUser struct {
	ID       string    `json:"id"`
	ClubID   string    `json:"clubId"`
	UserID   string    `json:"userId"`
	JoinedAt time.Time `json:"joinedAt"`
}

// ClubWithUsers представляет клуб с информацией о пользователях
type ClubWithUsers struct {
	Club
	UserCount int     `json:"userCount"`
	Users     []*User `json:"users,omitempty"`
}

// UserWithClubs представляет пользователя с информацией о клубах
type UserWithClubs struct {
	User
	Clubs []*Club `json:"clubs,omitempty"`
}

// CreateClub структура для создания клуба
type CreateClub struct {
	ID          string  `json:"id" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description *string `json:"description,omitempty"`
	Url         *string `json:"url,omitempty"`
	IsPrivate   *bool   `json:"isPrivate,omitempty"`
}

// PatchClub структура для обновления клуба
type PatchClub struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	Url         *string `json:"url,omitempty"`
	IsPrivate   *bool   `json:"isPrivate,omitempty"`
}

// JoinClub структура для вступления в клуб
type JoinClub struct {
	ClubID string `json:"clubId" binding:"required"`
	UserID string `json:"userId" binding:"required"`
}

// FilterClub структура для фильтрации клубов
type FilterClub struct {
	ID        *string `json:"id,omitempty"`
	Name      *string `json:"name,omitempty"`
	Url       *string `json:"url,omitempty"`
	IsPrivate *bool   `json:"isPrivate,omitempty"`
}
