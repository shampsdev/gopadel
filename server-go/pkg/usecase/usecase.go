package usecase

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/repo/pg"
	"github.com/shampsdev/go-telegram-template/pkg/repo/s3"
)

type Cases struct {
	User         *User
	AdminUser    *AdminUser
	Image        *Image
	Court        *Court
	Tournament   *Tournament
	Loyalty      *Loyalty
	Registration *Registration
	Payment      *Payment
	Waitlist     *Waitlist
}

func Setup(ctx context.Context, cfg *config.Config, db *pgxpool.Pool) Cases {
	userRepo := pg.NewUserRepo(db)
	adminUserRepo := pg.NewAdminUserRepo(db)
	courtRepo := pg.NewCourtRepo(db)
	tournamentRepo := pg.NewTournamentRepo(db)
	loyaltyRepo := pg.NewLoyaltyRepo(db)
	registrationRepo := pg.NewRegistrationRepo(db)
	paymentRepo := pg.NewPaymentRepo(db)
	waitlistRepo := pg.NewWaitlistRepo(db)

	storage, err := s3.NewStorage(cfg.S3)
	if err != nil {
		panic(err)
	}

	userCase := NewUser(ctx, userRepo, storage)
	adminUserCase := NewAdminUser(ctx, adminUserRepo, cfg)
	imageCase := NewImage(ctx, storage)
	courtCase := NewCourt(ctx, courtRepo)
	tournamentCase := NewTournament(ctx, tournamentRepo, registrationRepo)
	loyaltyCase := NewLoyalty(ctx, loyaltyRepo)
	registrationCase := NewRegistration(ctx, registrationRepo, tournamentRepo, paymentRepo)
	paymentCase := NewPayment(ctx, paymentRepo, registrationRepo, tournamentRepo, cfg)
	waitlistCase := NewWaitlist(ctx, waitlistRepo, tournamentCase)

	return Cases{
		User:         userCase,
		AdminUser:    adminUserCase,
		Image:        imageCase,
		Court:        courtCase,
		Tournament:   tournamentCase,
		Loyalty:      loyaltyCase,
		Registration: registrationCase,
		Payment:      paymentCase,
		Waitlist:     waitlistCase,
	}
}
