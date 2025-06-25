package domain

type PlayingPosition string

const (
	PlayingPositionRight PlayingPosition = "right"
	PlayingPositionLeft  PlayingPosition = "left"
	PlayingPositionBoth  PlayingPosition = "both"
)

type User struct {
	ID string `json:"id"`
	UserTGData
	Bio             string          `json:"bio"`
	Rank            float64         `json:"rank"`
	City            string          `json:"city"`
	BirthDate       string          `json:"birth_date"`
	PlayingPosition PlayingPosition `json:"playing_position"`
	PadelProfiles   string          `json:"padel_profiles"`
	Loyalty         *Loyalty        `json:"loyalty,omitempty"`
	IsRegistered    bool            `json:"is_registered"`
}

type UserTGData struct {
	TelegramID       int64  `json:"telegramId"`
	TelegramUsername string `json:"telegramUsername"`
	FirstName        string `json:"firstName"`
	LastName         string `json:"lastName"`
	Avatar           string `json:"avatar"`
}

type CreateUser struct {
	UserTGData
}

type PatchUser struct {
	TelegramUsername *string          `json:"telegramUsername"`
	FirstName        *string          `json:"firstName"`
	LastName         *string          `json:"lastName"`
	Avatar           *string          `json:"avatar"`
	Bio              *string          `json:"bio"`
	Rank             *float64         `json:"rank"`
	City             *string          `json:"city"`
	BirthDate        *string          `json:"birth_date"`
	PlayingPosition  *PlayingPosition `json:"playing_position"`
	PadelProfiles    *string          `json:"padel_profiles"`
}

type FilterUser struct {
	ID         *string `json:"id"`
	TelegramID *int64  `json:"telegramId"`
}
