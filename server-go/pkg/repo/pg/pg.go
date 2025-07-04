package pg

import "github.com/shampsdev/go-telegram-template/pkg/repo"

// to ensure pg implement the repo interfaces
var (
	_ repo.User         = &UserRepo{}
	_ repo.AdminUser    = &AdminUserRepo{}
	_ repo.Club         = &ClubRepo{}
	_ repo.Tournament   = &TournamentRepo{}
	_ repo.Loyalty      = &LoyaltyRepo{}
	_ repo.Registration = &RegistrationRepo{}
	_ repo.Payment      = &PaymentRepo{}
	_ repo.Waitlist     = &WaitlistRepo{}
	_ repo.AdminUser    = &AdminUserRepo{}
)
