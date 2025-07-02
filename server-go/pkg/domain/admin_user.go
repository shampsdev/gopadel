package domain

type AdminUser struct {
	ID          string `json:"id"`
	IsSuperUser bool   `json:"is_super_user"`
	UserID      string `json:"user_id"`
	Username    string `json:"username"`
}

type FilterAdminUser struct {
	ID          *string `json:"id"`
	IsSuperUser *bool   `json:"is_super_user"`
	UserID      *string `json:"user_id"`
	Username    *string `json:"username"`
} 