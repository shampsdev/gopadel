package domain

type AdminUser struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	PasswordHash string `json:"-"`
	IsSuperUser  bool   `json:"is_superuser"`
	IsActive     bool   `json:"is_active"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	UserID       string `json:"user_id"`
	User         *User  `json:"user,omitempty"`
}

type FilterAdminUser struct {
	ID          *string `json:"id"`
	Username    *string `json:"username"`
	IsSuperUser *bool   `json:"is_superuser"`
	IsActive    *bool   `json:"is_active"`
	FirstName   *string `json:"first_name"`
	LastName    *string `json:"last_name"`
	UserID      *string `json:"user_id"`
}

type CreateAdminUser struct {
	Username    string `json:"username" binding:"required"`
	Password    string `json:"password" binding:"required"`
	IsSuperUser bool   `json:"is_superuser"`
	IsActive    bool   `json:"is_active"`
	FirstName   string `json:"first_name" binding:"required"`
	LastName    string `json:"last_name" binding:"required"`
	UserID      string `json:"user_id" binding:"required"`
}

type PatchAdminUser struct {
	Username    *string `json:"username"`
	Password    *string `json:"password"`
	IsSuperUser *bool   `json:"is_superuser"`
	IsActive    *bool   `json:"is_active"`
	FirstName   *string `json:"first_name"`
	LastName    *string `json:"last_name"`
	UserID      *string `json:"user_id"`
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
	IsActive    bool   `json:"is_active"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
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