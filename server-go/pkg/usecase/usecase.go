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
	Image        *Image
	Club         *Club
	Tournament   *Tournament
	Loyalty      *Loyalty
	Registration *Registration
	Payment      *Payment
	Waitlist     *Waitlist
}

func Setup(ctx context.Context, cfg *config.Config, db *pgxpool.Pool) Cases {
	userRepo := pg.NewUserRepo(db)
	clubRepo := pg.NewClubRepo(db)
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
	imageCase := NewImage(ctx, storage)
	clubCase := NewClub(ctx, clubRepo)
	tournamentCase := NewTournament(ctx, tournamentRepo, registrationRepo)
	loyaltyCase := NewLoyalty(ctx, loyaltyRepo)
	registrationCase := NewRegistration(ctx, registrationRepo, tournamentRepo)
	paymentCase := NewPayment(ctx, paymentRepo)
	waitlistCase := NewWaitlist(ctx, waitlistRepo, tournamentCase)

	return Cases{
		User:         userCase,
		Image:        imageCase,
		Club:         clubCase,
		Tournament:   tournamentCase,
		Loyalty:      loyaltyCase,
		Registration: registrationCase,
		Payment:      paymentCase,
		Waitlist:     waitlistCase,
	}
}
