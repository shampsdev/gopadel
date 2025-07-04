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
	BirthDate       string          `json:"birthDate"`
	PlayingPosition PlayingPosition `json:"playingPosition"`
	PadelProfiles   string          `json:"padelProfiles"`
	Loyalty         *Loyalty        `json:"loyalty,omitempty"`
	IsRegistered    bool            `json:"isRegistered"`
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
	BirthDate        *string          `json:"birthDate"`
	PlayingPosition  *PlayingPosition `json:"playingPosition"`
	PadelProfiles    *string          `json:"padelProfiles"`
	IsRegistered     *bool            `json:"isRegistered"`
	LoyaltyID        *int             `json:"loyaltyId"`
}

type FilterUser struct {
	ID         *string `json:"id"`
	TelegramID *int64  `json:"telegramId"`
	FirstName  *string `json:"firstName"`
	LastName   *string `json:"lastName"`
}

type AdminPatchUser struct {
	FirstName        *string          `json:"firstName"`
	LastName         *string          `json:"lastName"`
	Avatar           *string          `json:"avatar"`
	Bio              *string          `json:"bio"`
	Rank             *float64         `json:"rank"`
	City             *string          `json:"city"`
	BirthDate        *string          `json:"birthDate"`
	PlayingPosition  *PlayingPosition `json:"playingPosition"`
	PadelProfiles    *string          `json:"padelProfiles"`
	IsRegistered     *bool            `json:"isRegistered"`
	LoyaltyID        *int             `json:"loyaltyId"`
}
