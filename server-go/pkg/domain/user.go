package domain

type User struct {
	ID string `json:"id"`
	UserTGData
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
	TelegramUsername *string `json:"telegramUsername"`
	FirstName        *string `json:"firstName"`
	LastName         *string `json:"lastName"`
	Avatar           *string `json:"avatar"`
}

type FilterUser struct {
	ID         *string `json:"id"`
	TelegramID *int64  `json:"telegramId"`
}
