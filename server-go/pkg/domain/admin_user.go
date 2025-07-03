package domain

type AdminUser struct {
	ID           string `json:"id"`
	IsSuperUser  bool   `json:"is_superuser"`
	UserID       string `json:"user_id"`
	Username     string `json:"username"`
	PasswordHash string `json:"-"`
}

type FilterAdminUser struct {
	ID          *string `json:"id"`
	IsSuperUser *bool   `json:"is_superuser"`
	UserID      *string `json:"user_id"`
	Username    *string `json:"username"`
}

type AdminLogin struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AdminToken struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
}

type AdminMe struct {
	Username    string `json:"username"`
	IsSuperUser bool   `json:"is_superuser"`
}

type AdminPasswordChange struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type MessageResponse struct {
	Message string `json:"message"`
} 