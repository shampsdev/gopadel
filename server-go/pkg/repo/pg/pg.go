package pg

import "github.com/shampsdev/go-telegram-template/pkg/repo"

// to ensure pg implement the repo interfaces
var (
	_ repo.User = &UserRepo{}
)
